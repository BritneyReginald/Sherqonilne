// middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import {
  verifyToken,
  AuthTokenPayload,
} from "../services/authService";

import {
  findUserById,
  getClientSiteId,
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
  next: NextFunction
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
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

// ============================================================
// 3. SCOPE CLIENT
// ============================================================

export async function scopeClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "client") return next();

  const siteId = await getClientSiteId(req.user.id);

  if (!siteId) {
    return res.status(403).json({
      error: "No site linked to this account",
    });
  }

  req.user.siteId = siteId;

  next();
}

// ============================================================
// 4. SCOPE INSPECTOR
// ============================================================

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

// ============================================================
// 5. REQUIRE SITE ACCESS
// ============================================================

export function requireSiteAccess(
  siteIdParam: string = "siteId"
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const requestedSiteId = Number(req.params[siteIdParam]);

    // RSS staff can access every site
    if (req.user?.role === "rss_staff") {
      return next();
    }

    // Inspectors can only access assigned sites
    if (req.user?.role === "inspector") {
      if (req.user.siteIds?.includes(requestedSiteId)) {
        return next();
      }

      return res.status(403).json({
        error: "Not assigned to this site",
      });
    }

    // Clients can only access their own site
    if (req.user?.role === "client") {
      if (req.user.siteId === requestedSiteId) {
        return next();
      }

      return res.status(403).json({
        error: "You do not have access to this site",
      });
    }

    return res.status(403).json({
      error: "Access denied",
    });
  };
}