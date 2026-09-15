"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvestigationByRecordId = getInvestigationByRecordId;
exports.upsertInvestigation = upsertInvestigation;
const db_1 = __importDefault(require("../config/db"));
const FIELD_MAP = {
    investigator: "investigator",
    investigationDate: "investigation_date",
    location: "location",
    department: "department",
    immediateCause: "immediate_cause",
    rootCause: "root_cause",
    contributingFactors: "contributing_factors",
    correctiveActions: "corrective_actions",
    responsiblePerson: "responsible_person",
    dueDate: "due_date",
    preventiveActions: "preventive_actions",
};
async function getInvestigationByRecordId(recordId) {
    const result = await db_1.default.query(`SELECT * FROM investigations WHERE record_id = $1`, [recordId]);
    return result.rows[0] || null;
}
// Creates the investigation row on first write, otherwise patches
// only the fields provided — same partial-update shape as
// updateMedicalRecord/updateAppointment, but as an upsert since the
// row may not exist yet (investigations start empty).
async function upsertInvestigation(recordId, data) {
    const existing = await getInvestigationByRecordId(recordId);
    if (!existing) {
        const columns = ["record_id"];
        const placeholders = ["$1"];
        const values = [recordId];
        for (const [key, column] of Object.entries(FIELD_MAP)) {
            const value = data[key];
            if (value !== undefined) {
                values.push(value);
                columns.push(column);
                placeholders.push(`$${values.length}`);
            }
        }
        await db_1.default.query(`INSERT INTO investigations (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`, values);
        return getInvestigationByRecordId(recordId);
    }
    const fields = [];
    const values = [];
    for (const [key, column] of Object.entries(FIELD_MAP)) {
        const value = data[key];
        if (value !== undefined) {
            values.push(value);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length === 0) {
        return existing;
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(recordId);
    await db_1.default.query(`UPDATE investigations SET ${fields.join(", ")} WHERE record_id = $${values.length}`, values);
    return getInvestigationByRecordId(recordId);
}
