"use strict";
// middleware/authMiddleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.scopeSites = scopeSites;
exports.scopeClient = scopeClient;
exports.scopeInspector = scopeInspector;
exports.scopeFirstAider = scopeFirstAider;
exports.requireSiteAccess = requireSiteAccess;
const authService_1 = require("../services/authService");
const user_1 = require("../models/user");
// ============================================================
// 1. AUTHENTICATE
// ============================================================
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing or invalid authorization header",
            });
        }
        const token = authHeader.split(" ")[1];
        const payload = (0, authService_1.verifyToken)(token);
        const user = await (0, user_1.findUserById)(payload.userId);
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
    }
    catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}
// ============================================================
// 2. AUTHORIZE
// ============================================================
function authorize(...allowedRoles) {
    return (req, res, next) => {
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
async function scopeSites(req, res, next) {
    try {
        const user = req.user;
        if (!user || user.role === "rss_staff")
            return next();
        let ids = [];
        if (user.role === "client") {
            const siteId = await (0, user_1.getClientSiteId)(user.id);
            if (siteId) {
                user.siteId = siteId;
                ids = [siteId];
            }
        }
        else if (user.role === "inspector") {
            ids = await (0, user_1.getInspectorSiteIds)(user.id);
        }
        else if (user.role === "first_aider") {
            ids = await (0, user_1.getFirstAiderSiteIds)(user.id);
        }
        if (ids.length === 0) {
            return res.status(403).json({
                error: "No site linked to this account",
            });
        }
        user.siteIds = ids;
        next();
    }
    catch (err) {
        next(err);
    }
}
// ============================================================
// 4. LEGACY PER-ROLE SCOPERS (kept for any routes still using them)
// ============================================================
async function scopeClient(req, res, next) {
    try {
        if (req.user?.role !== "client")
            return next();
        const siteId = await (0, user_1.getClientSiteId)(req.user.id);
        if (!siteId) {
            return res.status(403).json({
                error: "No site linked to this account",
            });
        }
        req.user.siteId = siteId;
        req.user.siteIds = [siteId];
        next();
    }
    catch (err) {
        next(err);
    }
}
async function scopeInspector(req, res, next) {
    try {
        if (req.user?.role !== "inspector")
            return next();
        req.user.siteIds = await (0, user_1.getInspectorSiteIds)(req.user.id);
        next();
    }
    catch (err) {
        next(err);
    }
}
async function scopeFirstAider(req, res, next) {
    try {
        if (req.user?.role !== "first_aider")
            return next();
        req.user.siteIds = await (0, user_1.getFirstAiderSiteIds)(req.user.id);
        next();
    }
    catch (err) {
        next(err);
    }
}
// ============================================================
// 5. REQUIRE SITE ACCESS (only for routes with a :siteId param)
// ============================================================
function requireSiteAccess(siteIdParam = "siteId") {
    return (req, res, next) => {
        const requestedSiteId = Number(req.params[siteIdParam]);
        if (req.user?.role === "rss_staff") {
            return next();
        }
        if (req.user?.role === "inspector" ||
            req.user?.role === "first_aider") {
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
