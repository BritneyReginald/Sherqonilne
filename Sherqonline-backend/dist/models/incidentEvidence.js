"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEvidenceFile = addEvidenceFile;
exports.getEvidenceForRecord = getEvidenceForRecord;
exports.deleteEvidenceFile = deleteEvidenceFile;
const db_1 = __importDefault(require("../config/db"));
async function addEvidenceFile(recordId, file) {
    const result = await db_1.default.query(`
    INSERT INTO incident_evidence_files (record_id, file_blob_name, file_name, file_size, file_mime_type)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, record_id, file_blob_name, file_name, file_size, file_mime_type, uploaded_at
    `, [recordId, file.blobName, file.fileName, file.fileSize, file.mimeType]);
    return result.rows[0];
}
async function getEvidenceForRecord(recordId) {
    const result = await db_1.default.query(`SELECT * FROM incident_evidence_files WHERE record_id = $1 ORDER BY uploaded_at ASC`, [recordId]);
    return result.rows;
}
async function deleteEvidenceFile(id) {
    const result = await db_1.default.query(`DELETE FROM incident_evidence_files WHERE id = $1 RETURNING id, file_blob_name`, [id]);
    return result.rows[0] || null;
}
