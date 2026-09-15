"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIncidentRecord = createIncidentRecord;
exports.getIncidentRecords = getIncidentRecords;
exports.getIncidentRecordById = getIncidentRecordById;
exports.updateIncidentRecord = updateIncidentRecord;
exports.updateIncidentStatus = updateIncidentStatus;
exports.deleteIncidentRecord = deleteIncidentRecord;
const db_1 = __importDefault(require("../config/db"));
// Live-joins employees for current name/work ID/site, same approach
// as medical_records/appointments. LEFT JOIN because employee_id is
// nullable (an NCR is often raised without a specific employee).
// entry_count is a scalar subquery rather than a GROUP BY join so a
// record with zero first_aid_entries rows still returns 0, not a
// dropped row — it's cheap since first_aid_entries is tiny per record.
const SELECT_BASE = `
  SELECT
    r.id,
    r.type,
    r.employee_id,
    e.employee_number    AS employee_number,
    e.full_name           AS employee_name,
    e.site_location       AS employee_site_location,

    r.division,
    r.site,
    r.incident_date,
    r.incident_time,

    r.category,
    r.title,
    r.description,
    r.status,

    r.injury_type,

    r.ncr_type,
    r.identified_by,
    r.department,

    r.body_part,
    r.effect,
    r.disablement,

    (
      SELECT COUNT(*)::int FROM first_aid_entries fa WHERE fa.record_id = r.id
    ) AS first_aid_entry_count,

    r.created_at,
    r.updated_at
  FROM incident_records r
  LEFT JOIN employees e ON e.id = r.employee_id
`;
const FIELD_MAP = {
    employeeId: "employee_id",
    division: "division",
    site: "site",
    incidentDate: "incident_date",
    incidentTime: "incident_time",
    category: "category",
    title: "title",
    description: "description",
    status: "status",
    injuryType: "injury_type",
    ncrType: "ncr_type",
    identifiedBy: "identified_by",
    department: "department",
    bodyPart: "body_part",
    effect: "effect",
    disablement: "disablement",
};
async function createIncidentRecord(data) {
    const result = await db_1.default.query(`
    INSERT INTO incident_records (
      type, employee_id, division, site, incident_date, incident_time,
      category, title, description, status, injury_type,
      ncr_type, identified_by, department,
      body_part, effect, disablement
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING id
    `, [
        data.type,
        data.employeeId || null,
        data.division || null,
        data.site || null,
        data.incidentDate || null,
        data.incidentTime || null,
        data.category || null,
        data.title || "",
        data.description || "",
        data.status || "Created",
        data.injuryType || null,
        data.ncrType || null,
        data.identifiedBy || null,
        data.department || null,
        data.bodyPart || null,
        data.effect || null,
        data.disablement || null,
    ]);
    return getIncidentRecordById(result.rows[0].id);
}
async function getIncidentRecords(filters) {
    const conditions = [];
    const values = [];
    if (filters.type && filters.type !== "all") {
        values.push(filters.type);
        conditions.push(`r.type = $${values.length}`);
    }
    if (filters.status && filters.status !== "all") {
        values.push(filters.status);
        conditions.push(`r.status = $${values.length}`);
    }
    if (filters.siteLocation && filters.siteLocation !== "All Sites") {
        values.push(filters.siteLocation);
        conditions.push(`r.site = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await db_1.default.query(`${SELECT_BASE} ${whereClause} ORDER BY r.created_at DESC`, values);
    return result.rows;
}
async function getIncidentRecordById(id) {
    const result = await db_1.default.query(`${SELECT_BASE} WHERE r.id = $1`, [id]);
    return result.rows[0] || null;
}
async function updateIncidentRecord(id, data) {
    const fields = [];
    const values = [];
    for (const [key, column] of Object.entries(FIELD_MAP)) {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length === 0) {
        return getIncidentRecordById(id);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    await db_1.default.query(`UPDATE incident_records SET ${fields.join(", ")} WHERE id = $${values.length}`, values);
    return getIncidentRecordById(id);
}
async function updateIncidentStatus(id, status) {
    await db_1.default.query(`UPDATE incident_records SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [status, id]);
    return getIncidentRecordById(id);
}
async function deleteIncidentRecord(id) {
    const result = await db_1.default.query(`DELETE FROM incident_records WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
}
