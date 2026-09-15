"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirstAidEntries = createFirstAidEntries;
exports.getFirstAidEntriesForRecord = getFirstAidEntriesForRecord;
exports.replaceFirstAidEntries = replaceFirstAidEntries;
exports.deleteFirstAidEntriesForRecord = deleteFirstAidEntriesForRecord;
const db_1 = __importDefault(require("../config/db"));
async function createFirstAidEntries(recordId, entries) {
    const created = [];
    for (const entry of entries) {
        const result = await db_1.default.query(`
      INSERT INTO first_aid_entries (
        record_id, employee_id, employee_name, employee_number,
        entry_date, entry_time,
        injury, treatment, comments,
        first_aider, further_medical_attention, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `, [
            recordId,
            entry.employeeId || null,
            entry.employeeName || null,
            entry.employeeNumber || null,
            entry.date || null,
            entry.time || null,
            entry.injury || null,
            entry.treatment || null,
            entry.comments || null,
            entry.firstAider || null,
            entry.furtherMedicalAttention ?? false,
            entry.status || "draft",
        ]);
        created.push(result.rows[0]);
    }
    return created;
}
async function getFirstAidEntriesForRecord(recordId) {
    const result = await db_1.default.query(`SELECT * FROM first_aid_entries WHERE record_id = $1 ORDER BY id ASC`, [recordId]);
    return result.rows;
}
// Replaces every entry for a record with a fresh set — simplest
// correct approach for a log the user edits as a whole rather than
// per-row (matches how the frontend submits the entire `entries`
// array together, not one entry at a time).
async function replaceFirstAidEntries(recordId, entries) {
    await db_1.default.query(`DELETE FROM first_aid_entries WHERE record_id = $1`, [recordId]);
    return createFirstAidEntries(recordId, entries);
}
async function deleteFirstAidEntriesForRecord(recordId) {
    await db_1.default.query(`DELETE FROM first_aid_entries WHERE record_id = $1`, [recordId]);
}
