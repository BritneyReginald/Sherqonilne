"use strict";
// The RSS company profile (name + logo) shown at the top of the
// Company & Sites page. There is exactly ONE of these, so it lives in a
// single-row table (id is forced to 1). The logo is stored as a small
// image data URL in the same way sites.logo is.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMPANY_PROFILE = void 0;
exports.getCompanyProfile = getCompanyProfile;
exports.saveCompanyProfile = saveCompanyProfile;
const db_1 = __importDefault(require("../config/db"));
exports.DEFAULT_COMPANY_PROFILE = {
    name: "RSS",
    logo: null,
};
async function getCompanyProfile() {
    const result = await db_1.default.query(`SELECT name, logo FROM company_profile WHERE id = 1`);
    return result.rows[0] || exports.DEFAULT_COMPANY_PROFILE;
}
/**
 * Creates the row if it doesn't exist yet, otherwise updates only the
 * fields that were supplied (undefined = leave as is).
 */
async function saveCompanyProfile(data) {
    const result = await db_1.default.query(`
    INSERT INTO company_profile (id, name, logo)
    VALUES (1, COALESCE($1::text, 'RSS'), $2::text)
    ON CONFLICT (id) DO UPDATE
      SET name = COALESCE($1::text, company_profile.name),
          logo = COALESCE($2::text, company_profile.logo),
          updated_at = CURRENT_TIMESTAMP
    RETURNING name, logo
    `, [data.name ?? null, data.logo ?? null]);
    return result.rows[0];
}
