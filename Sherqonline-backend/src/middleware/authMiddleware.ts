// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, AuthTokenPayload } from "../services/authService";
import {
  findUserById,
  getClientCompanyId,
  getInspectorSiteIds,
  UserRole,
} from "../models/user";

// Extend Express's Request type so req.user is typed everywhere downstream
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
        companyId?: number;
        siteIds?: number[];
      };
    }
  }
}

// --- 1. authenticate: verifies the JWT AND re-checks live status in the DB ---
// This matters because a 7-day token stays cryptographically valid even after
// RSS disables the account — so we don't just trust the token, we check the
// user still exists and is 'active' on every request.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload: AuthTokenPayload = verifyToken(token);

    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    if (user.status === "disabled") {
      return res.status(403).json({ error: "Account has been disabled" });
    }
    // 'invited' shouldn't really reach here since login flips it to 'active',
    // but guard against edge cases (e.g. manually reset in DB)
    if (user.status !== "active") {
      return res.status(403).json({ error: "Account is not active" });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// --- 2. authorize: restricts a route to specific roles ---
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// --- 3. scopeClient: attaches the client's companyId fresh from the DB ---
// Fetched per-request (not trusted from the JWT) so that if RSS ever needs to
// relink a client to a different company, it takes effect immediately.
export async function scopeClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "client") return next();

  const companyId = await getClientCompanyId(req.user.id);
  if (!companyId) {
    return res.status(403).json({ error: "No company linked to this account" });
  }
  req.user.companyId = companyId;
  next();
}

// --- 4. scopeInspector: attaches the inspector's assigned siteIds fresh from the DB ---
export async function scopeInspector(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "inspector") return next();

  const siteIds = await getInspectorSiteIds(req.user.id);
  req.user.siteIds = siteIds;
  next();
}

// --- 5. requireSiteAccess: guards a specific :siteId route param ---
// Use on any Fire Equipment route that operates on a single site, to make sure
// an inspector can't just change the URL and hit a site they weren't assigned.
export function requireSiteAccess(siteIdParam: string = "siteId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedSiteId = Number(req.params[siteIdParam]);

    if (req.user?.role === "rss_staff") return next(); // full access

    if (req.user?.role === "inspector") {
      if (req.user.siteIds?.includes(requestedSiteId)) return next();
      return res.status(403).json({ error: "Not assigned to this site" });
    }

    // clients accessing site-level data are scoped by company, not site directly —
    // enforce that at the query level (WHERE company_id = req.user.companyId)
    // rather than here, since a client should see all their company's sites.
    if (req.user?.role === "client") return next();

    return res.status(403).json({ error: "Access denied" });
  };
}