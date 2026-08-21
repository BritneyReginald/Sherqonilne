"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSite = exports.updateSite = exports.getSiteById = exports.getSites = exports.createSite = void 0;
const db_1 = __importDefault(require("../config/db"));
/*
 * ============================================================
 * CREATE SITE
 * ============================================================
 *
 * A site represents the client/company in SHERQ Online.
 *
 * There is NO companyId.
 */
const createSite = async (site) => {
    const result = await db_1.default.query(`
    INSERT INTO sites (
      name,
      logo,
      email,
      contact_person,
      contact_number
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `, [
        site.name,
        site.logo ?? null,
        site.email ?? null,
        site.contactPerson ?? null,
        site.contactNumber ?? null,
    ]);
    return result.rows[0];
};
exports.createSite = createSite;
/*
 * ============================================================
 * GET ALL SITES
 * ============================================================
 *
 * RSS staff can see all client sites they are responsible
 * for inspecting.
 */
const getSites = async () => {
    const result = await db_1.default.query(`
    SELECT
      id,
      name,
      logo,
      email,
      contact_person,
      contact_number,
      created_at
    FROM sites
    ORDER BY name;
    `);
    return result.rows;
};
exports.getSites = getSites;
/*
 * ============================================================
 * GET SITE BY ID
 * ============================================================
 */
const getSiteById = async (id) => {
    const result = await db_1.default.query(`
    SELECT
      id,
      name,
      logo,
      email,
      contact_person,
      contact_number,
      created_at
    FROM sites
    WHERE id = $1;
    `, [id]);
    return result.rows[0];
};
exports.getSiteById = getSiteById;
/*
 * ============================================================
 * UPDATE SITE
 * ============================================================
 */
const updateSite = async (id, site) => {
    const fieldMap = {
        name: "name",
        logo: "logo",
        email: "email",
        contactPerson: "contact_person",
        contactNumber: "contact_number",
    };
    const updates = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(site)) {
        if (value !== undefined && fieldMap[key]) {
            updates.push(`${fieldMap[key]} = $${index}`);
            values.push(value);
            index++;
        }
    }
    if (updates.length === 0) {
        throw new Error("No fields supplied.");
    }
    values.push(id);
    const result = await db_1.default.query(`
    UPDATE sites
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `, values);
    return result.rows[0];
};
exports.updateSite = updateSite;
/*
 * ============================================================
 * DELETE SITE
 * ============================================================
 */
const deleteSite = async (id) => {
    const result = await db_1.default.query(`
    DELETE FROM sites
    WHERE id = $1
    RETURNING id;
    `, [id]);
    return result.rows[0];
};
exports.deleteSite = deleteSite;
