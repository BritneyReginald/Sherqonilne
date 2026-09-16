"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRiskAssessment = exports.updateRiskAssessment = exports.getRiskAssessmentById = exports.getRiskAssessments = exports.createRiskAssessment = void 0;
const db_1 = __importDefault(require("../config/db"));
const createRiskAssessment = async (data) => {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        const idResult = await client.query(`SELECT nextval('risk_assessments_id_seq') AS id`);
        const newId = Number(idResult.rows[0].id);
        const referenceNo = `RA-${newId.toString().padStart(3, "0")}`;
        const result = await client.query(`
      INSERT INTO risk_assessments (
        id,
        reference_no,
        assessment_name,
        linked_site,
        linked_dept,
        revision,
        review_date,
        expiry_date,
        status,
        assigned_employees,
        signed_employees,
        sign_off_rate,
        category,
        company_name,
        task_description,
        assessors,
        assessment_date,
        before_controls,
        after_controls
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING *
      `, [
            newId,
            referenceNo,
            data.assessmentName || data.taskDescription,
            data.linkedSite || "TBD",
            data.linkedDept || "TBD",
            data.revision || "v1.0",
            data.reviewDate || null,
            data.expiryDate || null,
            data.status || "draft",
            data.assignedEmployees ?? data.assessors.filter(Boolean).length,
            data.signedEmployees ?? 0,
            data.signOffRate ?? 0,
            data.category || "task-based",
            data.companyName,
            data.taskDescription,
            data.assessors,
            data.assessmentDate,
            data.beforeControls,
            data.afterControls ?? null,
        ]);
        await client.query("COMMIT");
        return result.rows[0];
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.createRiskAssessment = createRiskAssessment;
const getRiskAssessments = async () => {
    const result = await db_1.default.query("SELECT * FROM risk_assessments ORDER BY saved_date DESC, id DESC");
    return result.rows;
};
exports.getRiskAssessments = getRiskAssessments;
const getRiskAssessmentById = async (id) => {
    const result = await db_1.default.query("SELECT * FROM risk_assessments WHERE id = $1", [id]);
    return result.rows[0];
};
exports.getRiskAssessmentById = getRiskAssessmentById;
const updateRiskAssessment = async (id, data) => {
    const fieldMap = {
        assessmentName: "assessment_name",
        linkedSite: "linked_site",
        linkedDept: "linked_dept",
        revision: "revision",
        reviewDate: "review_date",
        expiryDate: "expiry_date",
        status: "status",
        signOffRate: "sign_off_rate",
        assignedEmployees: "assigned_employees",
        signedEmployees: "signed_employees",
        category: "category",
        companyName: "company_name",
        taskDescription: "task_description",
        assessors: "assessors",
        assessmentDate: "assessment_date",
        beforeControls: "before_controls",
        afterControls: "after_controls",
        companyLogoBlobName: "company_logo_blob_name",
        companyLogoFileName: "company_logo_file_name",
        companyLogoSize: "company_logo_size",
        companyLogoMimeType: "company_logo_mime_type",
        pdfBlobName: "pdf_blob_name",
        pdfFileName: "pdf_file_name",
        pdfSize: "pdf_size",
        pdfMimeType: "pdf_mime_type",
    };
    const updates = ["updated_at = CURRENT_TIMESTAMP"];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && fieldMap[key]) {
            updates.push(`${fieldMap[key]} = $${index}`);
            values.push(value);
            index++;
        }
    }
    if (updates.length === 1) {
        throw new Error("No fields supplied for update.");
    }
    values.push(id);
    const result = await db_1.default.query(`
    UPDATE risk_assessments
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `, values);
    return result.rows[0];
};
exports.updateRiskAssessment = updateRiskAssessment;
const deleteRiskAssessment = async (id) => {
    const result = await db_1.default.query(`
    DELETE FROM risk_assessments
    WHERE id = $1
    RETURNING id, company_logo_blob_name, pdf_blob_name
    `, [id]);
    return result.rows[0];
};
exports.deleteRiskAssessment = deleteRiskAssessment;
