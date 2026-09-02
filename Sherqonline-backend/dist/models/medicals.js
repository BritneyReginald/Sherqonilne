"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicalRecord = createMedicalRecord;
exports.getMedicalRecords = getMedicalRecords;
exports.getMedicalRecordById = getMedicalRecordById;
exports.updateMedicalRecord = updateMedicalRecord;
exports.attachFileToRecord = attachFileToRecord;
exports.deleteMedicalRecord = deleteMedicalRecord;
const db_1 = __importDefault(require("../config/db"));
// Every SELECT joins employees so the register always reflects the
// employee's CURRENT name/department/site, same relational approach
// as the rest of the compliance module.
const SELECT_BASE = `
  SELECT
    mr.id,
    mr.employee_id,
    e.employee_number,
    e.full_name        AS employee_name,
    e.department,
    e.site_location,
    mr.exam_type,
    mr.practitioner_name,
    mr.practitioner_type,
    mr.exam_date,
    mr.expiry_date,
    (mr.expiry_date IS NOT NULL AND mr.expiry_date < CURRENT_DATE) AS is_expired,
    mr.fitness_status,
    mr.restrictions,
    mr.restriction_type,
    mr.file_blob_name,
    mr.file_name,
    mr.file_size,
    mr.file_mime_type,
    mr.created_at,
    mr.updated_at
  FROM medical_records mr
  JOIN employees e ON e.id = mr.employee_id
`;
async function createMedicalRecord(data, file) {
    const result = await db_1.default.query(`
    INSERT INTO medical_records (
      employee_id, exam_type, practitioner_name, practitioner_type,
      exam_date, expiry_date, fitness_status, restrictions, restriction_type,
      file_blob_name, file_name, file_size, file_mime_type
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING id
    `, [
        data.employeeId,
        data.examType,
        data.practitionerName,
        data.practitionerType,
        data.examDate,
        data.expiryDate || null,
        data.fitnessStatus,
        data.restrictions || null,
        data.restrictionType || null,
        file?.blobName || null,
        file?.fileName || null,
        file?.fileSize || null,
        file?.mimeType || null,
    ]);
    return getMedicalRecordById(result.rows[0].id);
}
async function getMedicalRecords(filters) {
    const conditions = [];
    const values = [];
    if (filters.employeeId) {
        values.push(filters.employeeId);
        conditions.push(`mr.employee_id = $${values.length}`);
    }
    if (filters.siteLocation && filters.siteLocation !== "All Sites") {
        values.push(filters.siteLocation);
        conditions.push(`e.site_location = $${values.length}`);
    }
    if (filters.fitnessStatus && filters.fitnessStatus !== "all") {
        values.push(filters.fitnessStatus);
        conditions.push(`mr.fitness_status = $${values.length}`);
    }
    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
    const result = await db_1.default.query(`${SELECT_BASE} ${whereClause} ORDER BY mr.exam_date DESC`, values);
    return result.rows;
}
async function getMedicalRecordById(id) {
    const result = await db_1.default.query(`${SELECT_BASE} WHERE mr.id = $1`, [id]);
    return result.rows[0] || null;
}
async function updateMedicalRecord(id, data) {
    const fields = [];
    const values = [];
    const fieldMap = {
        examType: "exam_type",
        practitionerName: "practitioner_name",
        practitionerType: "practitioner_type",
        examDate: "exam_date",
        expiryDate: "expiry_date",
        fitnessStatus: "fitness_status",
        restrictions: "restrictions",
        restrictionType: "restriction_type",
    };
    for (const [key, column] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length === 0) {
        return getMedicalRecordById(id);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    await db_1.default.query(`UPDATE medical_records SET ${fields.join(", ")} WHERE id = $${values.length}`, values);
    return getMedicalRecordById(id);
}
async function attachFileToRecord(id, file) {
    await db_1.default.query(`
    UPDATE medical_records
    SET file_blob_name = $1, file_name = $2, file_size = $3,
        file_mime_type = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    `, [file.blobName, file.fileName, file.fileSize, file.mimeType, id]);
    return getMedicalRecordById(id);
}
async function deleteMedicalRecord(id) {
    const result = await db_1.default.query(`DELETE FROM medical_records WHERE id = $1 RETURNING id, file_blob_name`, [id]);
    return result.rows[0] || null;
}
