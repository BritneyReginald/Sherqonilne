"use strict";
// Helpers that turn "who is calling" into "which sites may they see".
// Always mount authenticate + authorize + scopeSites on a router first.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupSite = exports.isStaff = void 0;
exports.siteIdsFor = siteIdsFor;
exports.inScope = inScope;
exports.scopeByIdParam = scopeByIdParam;
const db_1 = __importDefault(require("../config/db"));
const isStaff = (req) => req.user?.role === "rss_staff";
exports.isStaff = isStaff;
/**
 * Sites the caller may see.
 *   undefined  -> unrestricted (RSS staff ONLY)
 *   number[]   -> restricted to these sites (empty = sees nothing)
 *
 * Fail-closed: any other role, or a missing user, gets [] rather
 * than "no filter", so a forgotten middleware can't leak data.
 */
function siteIdsFor(req) {
    const user = req.user;
    if (!user)
        return [];
    if (user.role === "rss_staff")
        return undefined;
    if (user.siteIds)
        return user.siteIds;
    if (user.siteId)
        return [user.siteId];
    return [];
}
/** Can this caller see a row that belongs to rowSiteId? */
function inScope(req, rowSiteId) {
    const ids = siteIdsFor(req);
    if (ids === undefined)
        return true;
    return rowSiteId != null && ids.includes(Number(rowSiteId));
}
/** Builds a lookup from SQL that returns a `site_id` column for `$1 = id`. */
const lookupSite = (sql) => async (id) => {
    const result = await db_1.default.query(sql, [id]);
    return {
        found: result.rows.length > 0,
        siteId: result.rows[0]?.site_id ?? null,
    };
};
exports.lookupSite = lookupSite;
/**
 * router.param("id", scopeByIdParam(lookup))
 *
 * Runs for every route containing :id. Non-staff callers get a 404
 * (not 403) for records outside their sites, so ids of other
 * clients' records can't even be confirmed to exist.
 */
function scopeByIdParam(lookup) {
    return async (req, res, next, value) => {
        try {
            if (siteIdsFor(req) === undefined)
                return next(); // staff
            const id = Number(value);
            if (!Number.isInteger(id)) {
                return res.status(404).json({ message: "Not found" });
            }
            const row = await lookup(id);
            if (!row.found || !inScope(req, row.siteId)) {
                return res.status(404).json({ message: "Not found" });
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
