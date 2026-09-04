"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrainingRecord = createTrainingRecord;
exports.getTrainingRecords = getTrainingRecords;
exports.getTrainingRecordById = getTrainingRecordById;
exports.updateTrainingRecord = updateTrainingRecord;
exports.deleteTrainingRecord = deleteTrainingRecord;
const db_1 = __importDefault(require("../config/db"));
const SELECT_BASE = `
  SELECT
    tr.id,
    tr.employee_id,
    e.employee_number    AS work_id,
    e.full_name           AS employee_name,
    e.site_location,
    tr.training_type,
    tr.training_name,
    tr.certificate_name,
    tr.provider,
    tr.training_category,
    tr.is_legally_required,
    tr.completion_date,
    tr.expiry_date,
    tr.file_blob_name,
    tr.file_name,
    tr.file_size,
    tr.file_mime_type,
    tr.created_at,
    tr.updated_at
  FROM training_records tr
  JOIN employees e ON e.id = tr.employee_id
`;
async function createTrainingRecord(data, file) {
    const result = await db_1.default.query(`
    INSERT INTO training_records (
      employee_id, training_type, training_name, certificate_name, provider,
      training_category, is_legally_required, completion_date, expiry_date,
      file_blob_name, file_name, file_size, file_mime_type
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING id
    `, [
        data.employeeId,
        data.trainingType || null,
        data.trainingName,
        data.certificateName,
        data.provider,
        data.trainingCategory || "Safety",
        data.isLegallyRequired,
        data.completionDate,
        data.expiryDate,
        file?.blobName || null,
        file?.fileName || null,
        file?.fileSize || null,
        file?.mimeType || null,
    ]);
    return getTrainingRecordById(result.rows[0].id);
}
async function getTrainingRecords(filters) {
    const conditions = [];
    const values = [];
    if (filters.employeeId) {
        values.push(filters.employeeId);
        conditions.push(`tr.employee_id = $${values.length}`);
    }
    if (filters.siteLocation && filters.siteLocation !== "All Sites") {
        values.push(filters.siteLocation);
        conditions.push(`e.site_location = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await db_1.default.query(`${SELECT_BASE} ${whereClause} ORDER BY tr.expiry_date ASC`, values);
    return result.rows;
}
async function getTrainingRecordById(id) {
    const result = await db_1.default.query(`${SELECT_BASE} WHERE tr.id = $1`, [id]);
    return result.rows[0] || null;
}
async function updateTrainingRecord(id, data) {
    const fields = [];
    const values = [];
    const fieldMap = {
        trainingType: "training_type",
        trainingName: "training_name",
        certificateName: "certificate_name",
        provider: "provider",
        trainingCategory: "training_category",
        isLegallyRequired: "is_legally_required",
        completionDate: "completion_date",
        expiryDate: "expiry_date",
    };
    for (const [key, column] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length === 0) {
        return getTrainingRecordById(id);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    await db_1.default.query(`UPDATE training_records SET ${fields.join(", ")} WHERE id = $${values.length}`, values);
    return getTrainingRecordById(id);
}
async function deleteTrainingRecord(id) {
    const result = await db_1.default.query(`DELETE FROM training_records WHERE id = $1 RETURNING id, file_blob_name`, [id]);
    return result.rows[0] || null;
}
