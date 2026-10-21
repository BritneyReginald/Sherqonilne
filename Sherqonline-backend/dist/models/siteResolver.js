"use strict";
// models/siteResolver.ts
//
// Turns whatever the frontend sends (a site id, or a site NAME from
// older forms) into a real sites row. Everything that stores a site
// goes through here so site_id and the display name never drift.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteResolutionError = void 0;
exports.getSiteById = getSiteById;
exports.resolveSite = resolveSite;
const db_1 = __importDefault(require("../config/db"));
class SiteResolutionError extends Error {
    constructor() {
        super(...arguments);
        this.status = 400;
    }
}
exports.SiteResolutionError = SiteResolutionError;
async function getSiteById(id, db = db_1.default) {
    const result = await db.query("SELECT id, name FROM sites WHERE id = $1", [
        id,
    ]);
    return result.rows[0];
}
async function resolveSite(input, db = db_1.default) {
    const rawId = input.siteId;
    if (rawId !== undefined && rawId !== null && rawId !== "") {
        const id = Number(rawId);
        if (!Number.isInteger(id) || id <= 0) {
            throw new SiteResolutionError("Invalid site");
        }
        const site = await getSiteById(id, db);
        if (!site)
            throw new SiteResolutionError("Site not found");
        return { id: site.id, name: site.name };
    }
    const name = typeof input.siteLocation === "string" ? input.siteLocation.trim() : "";
    if (!name)
        return { id: null, name: null };
    const result = await db.query("SELECT id, name FROM sites WHERE LOWER(TRIM(name)) = LOWER($1)", [name]);
    if (result.rows.length === 0) {
        throw new SiteResolutionError(`No site named "${name}"`);
    }
    if (result.rows.length > 1) {
        throw new SiteResolutionError(`More than one site is named "${name}". Please pick the site by id.`);
    }
    return { id: result.rows[0].id, name: result.rows[0].name };
}
