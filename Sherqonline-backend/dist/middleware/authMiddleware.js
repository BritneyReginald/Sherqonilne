"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.scopeClient = scopeClient;
exports.scopeInspector = scopeInspector;
exports.requireSiteAccess = requireSiteAccess;
const authService_1 = require("../services/authService");
const user_1 = require("../models/user");
// --- 1. authenticate: verifies the JWT AND re-checks live status in the DB ---
// This matters because a 7-day token stays cryptographically valid even after
// RSS disables the account — so we don't just trust the token, we check the
// user still exists and is 'active' on every request.
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid authorization header" });
        }
        const token = authHeader.split(" ")[1];
        const payload = (0, authService_1.verifyToken)(token);
        const user = await (0, user_1.findUserById)(payload.userId);
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
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
// --- 2. authorize: restricts a route to specific roles ---
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
}
// --- 3. scopeClient: attaches the client's companyId fresh from the DB ---
// Fetched per-request (not trusted from the JWT) so that if RSS ever needs to
// relink a client to a different company, it takes effect immediately.
async function scopeClient(req, res, next) {
    if (req.user?.role !== "client")
        return next();
    const companyId = await (0, user_1.getClientCompanyId)(req.user.id);
    if (!companyId) {
        return res.status(403).json({ error: "No company linked to this account" });
    }
    req.user.companyId = companyId;
    next();
}
// --- 4. scopeInspector: attaches the inspector's assigned siteIds fresh from the DB ---
async function scopeInspector(req, res, next) {
    if (req.user?.role !== "inspector")
        return next();
    const siteIds = await (0, user_1.getInspectorSiteIds)(req.user.id);
    req.user.siteIds = siteIds;
    next();
}
// --- 5. requireSiteAccess: guards a specific :siteId route param ---
// Use on any Fire Equipment route that operates on a single site, to make sure
// an inspector can't just change the URL and hit a site they weren't assigned.
function requireSiteAccess(siteIdParam = "siteId") {
    return (req, res, next) => {
        const requestedSiteId = Number(req.params[siteIdParam]);
        if (req.user?.role === "rss_staff")
            return next(); // full access
        if (req.user?.role === "inspector") {
            if (req.user.siteIds?.includes(requestedSiteId))
                return next();
            return res.status(403).json({ error: "Not assigned to this site" });
        }
        // clients accessing site-level data are scoped by company, not site directly —
        // enforce that at the query level (WHERE company_id = req.user.companyId)
        // rather than here, since a client should see all their company's sites.
        if (req.user?.role === "client")
            return next();
        return res.status(403).json({ error: "Access denied" });
    };
}
