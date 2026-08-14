"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSite = exports.updateSite = exports.getSiteById = exports.getSites = exports.createSite = void 0;
const db_1 = __importDefault(require("../config/db"));
const createSite = async (site) => {
    const result = await db_1.default.query(`
    INSERT INTO sites
    (
      company_id,
      name,
      location,
      workers_active,
      incidents_this_month,
      compliance_status,
      has_manager,
      map_image
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
    `, [
        site.companyId,
        site.name,
        site.location,
        site.workersActive ?? 0,
        site.incidentsThisMonth ?? 0,
        site.complianceStatus ?? "compliant",
        site.hasManager ?? false,
        site.mapImage,
    ]);
    return result.rows[0];
};
exports.createSite = createSite;
const getSites = async () => {
    const result = await db_1.default.query(`
    SELECT
      s.*,
      c.name AS company_name
    FROM sites s
    JOIN companies c
      ON s.company_id = c.id
    ORDER BY c.name, s.name;
  `);
    return result.rows;
};
exports.getSites = getSites;
const getSiteById = async (id) => {
    const result = await db_1.default.query(`
    SELECT *
    FROM sites
    WHERE id = $1;
    `, [id]);
    return result.rows[0];
};
exports.getSiteById = getSiteById;
const updateSite = async (id, site) => {
    const fieldMap = {
        companyId: "company_id",
        name: "name",
        location: "location",
        workersActive: "workers_active",
        incidentsThisMonth: "incidents_this_month",
        complianceStatus: "compliance_status",
        hasManager: "has_manager",
        mapImage: "map_image",
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
const deleteSite = async (id) => {
    const result = await db_1.default.query(`
    DELETE FROM sites
    WHERE id = $1
    RETURNING id;
    `, [id]);
    return result.rows[0];
};
exports.deleteSite = deleteSite;
