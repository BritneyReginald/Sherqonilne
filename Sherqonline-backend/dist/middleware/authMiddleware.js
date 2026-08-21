"use strict";
// middleware/authMiddleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.scopeClient = scopeClient;
exports.scopeInspector = scopeInspector;
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
// 3. SCOPE CLIENT
// ============================================================
async function scopeClient(req, res, next) {
    if (req.user?.role !== "client")
        return next();
    const siteId = await (0, user_1.getClientSiteId)(req.user.id);
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
async function scopeInspector(req, res, next) {
    if (req.user?.role !== "inspector")
        return next();
    const siteIds = await (0, user_1.getInspectorSiteIds)(req.user.id);
    req.user.siteIds = siteIds;
    next();
}
// ============================================================
// 5. REQUIRE SITE ACCESS
// ============================================================
function requireSiteAccess(siteIdParam = "siteId") {
    return (req, res, next) => {
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
