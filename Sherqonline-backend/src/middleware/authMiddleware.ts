// middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { verifyToken, AuthTokenPayload } from "../services/authService";

import {
  findUserById,
  getClientSiteId,
  getFirstAiderSiteIds,
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
        siteId?: number;
        siteIds?: number[];
      };
    }
  }
}

// ============================================================
// 1. AUTHENTICATE
// ============================================================

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload: AuthTokenPayload = verifyToken(token);

    const user = await findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({
        error: "User no longer exists",
      });
    }

    if (user.status === "disabled") {
      return res.status(403).json({
        error: "Account has been disabled",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        error: "Account is not active",
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

// ============================================================
// 2. AUTHORIZE
// ============================================================

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

// ============================================================
// 3. SCOPE SITES  (use this on every data router)
// ============================================================
//
// Resolves which sites the caller may see and stores them on
// req.user.siteIds:
//   - rss_staff   -> untouched (unrestricted; see siteScope.ts)
//   - client      -> [their one site]
//   - inspector   -> their assigned sites
//   - first_aider -> their assigned sites
// Anyone with no sites is rejected outright, so a half-configured
// account can never fall through to "no filter".

export async function scopeSites(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;
    if (!user || user.role === "rss_staff") return next();

    let ids: number[] = [];

    if (user.role === "client") {
      const siteId = await getClientSiteId(user.id);
      if (siteId) {
        user.siteId = siteId;
        ids = [siteId];
      }
    } else if (user.role === "inspector") {
      ids = await getInspectorSiteIds(user.id);
    } else if (user.role === "first_aider") {
      ids = await getFirstAiderSiteIds(user.id);
    }

    if (ids.length === 0) {
      return res.status(403).json({
        error: "No site linked to this account",
      });
    }

    user.siteIds = ids;
    next();
  } catch (err) {
    next(err);
  }
}

// ============================================================
// 4. LEGACY PER-ROLE SCOPERS (kept for any routes still using them)
// ============================================================

export async function scopeClient(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user?.role !== "client") return next();

    const siteId = await getClientSiteId(req.user.id);

    if (!siteId) {
      return res.status(403).json({
        error: "No site linked to this account",
      });
    }

    req.user.siteId = siteId;
    req.user.siteIds = [siteId];

    next();
  } catch (err) {
    next(err);
  }
}

export async function scopeInspector(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user?.role !== "inspector") return next();
    req.user.siteIds = await getInspectorSiteIds(req.user.id);
    next();
  } catch (err) {
    next(err);
  }
}

export async function scopeFirstAider(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user?.role !== "first_aider") return next();
    req.user.siteIds = await getFirstAiderSiteIds(req.user.id);
    next();
  } catch (err) {
    next(err);
  }
}

// ============================================================
// 5. REQUIRE SITE ACCESS (only for routes with a :siteId param)
// ============================================================

export function requireSiteAccess(siteIdParam: string = "siteId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedSiteId = Number(req.params[siteIdParam]);

    if (req.user?.role === "rss_staff") {
      return next();
    }

    if (
      req.user?.role === "inspector" ||
      req.user?.role === "first_aider"
    ) {
      if (req.user.siteIds?.includes(requestedSiteId)) {
        return next();
      }
      return res.status(403).json({ error: "Not assigned to this site" });
    }

    if (req.user?.role === "client") {
      if (req.user.siteId === requestedSiteId) {
        return next();
      }
      return res.status(403).json({
        error: "You do not have access to this site",
      });
    }

    return res.status(403).json({ error: "Access denied" });
  };
}