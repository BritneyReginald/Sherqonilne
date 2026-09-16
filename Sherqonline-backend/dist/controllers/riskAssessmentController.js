"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPdfController = exports.uploadLogoController = exports.deleteRiskAssessmentController = exports.editRiskAssessment = exports.getRiskAssessment = exports.getAllRiskAssessments = exports.addRiskAssessment = void 0;
const riskAssessment_1 = require("../models/riskAssessment");
const riskAssessmentBlob_1 = require("../config/riskAssessmentBlob");
function withFileUrls(row) {
    return {
        ...row,
        company_logo_url: row.company_logo_blob_name
            ? (0, riskAssessmentBlob_1.getRiskAssessmentFileSasUrl)(row.company_logo_blob_name)
            : null,
        pdf_url: row.pdf_blob_name
            ? (0, riskAssessmentBlob_1.getRiskAssessmentFileSasUrl)(row.pdf_blob_name)
            : null,
    };
}
const addRiskAssessment = async (req, res) => {
    try {
        const saved = await (0, riskAssessment_1.createRiskAssessment)(req.body);
        res.status(201).json(withFileUrls(saved));
    }
    catch (error) {
        console.error("Failed to create risk assessment:", error);
        res.status(500).json({ message: error.message || "Failed to create risk assessment" });
    }
};
exports.addRiskAssessment = addRiskAssessment;
const getAllRiskAssessments = async (_req, res) => {
    try {
        const rows = await (0, riskAssessment_1.getRiskAssessments)();
        res.json(rows.map(withFileUrls));
    }
    catch (error) {
        console.error("Failed to fetch risk assessments:", error);
        res.status(500).json({ message: error.message || "Failed to fetch risk assessments" });
    }
};
exports.getAllRiskAssessments = getAllRiskAssessments;
const getRiskAssessment = async (req, res) => {
    try {
        const row = await (0, riskAssessment_1.getRiskAssessmentById)(Number(req.params.id));
        if (!row)
            return res.status(404).json({ message: "Risk assessment not found" });
        res.json(withFileUrls(row));
    }
    catch (error) {
        console.error("Failed to fetch risk assessment:", error);
        res.status(500).json({ message: error.message || "Failed to fetch risk assessment" });
    }
};
exports.getRiskAssessment = getRiskAssessment;
const editRiskAssessment = async (req, res) => {
    try {
        const updated = await (0, riskAssessment_1.updateRiskAssessment)(Number(req.params.id), req.body);
        if (!updated)
            return res.status(404).json({ message: "Risk assessment not found" });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to update risk assessment:", error);
        res.status(500).json({ message: error.message || "Failed to update risk assessment" });
    }
};
exports.editRiskAssessment = editRiskAssessment;
const deleteRiskAssessmentController = async (req, res) => {
    try {
        const deleted = await (0, riskAssessment_1.deleteRiskAssessment)(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ message: "Risk assessment not found" });
        if (deleted.company_logo_blob_name) {
            await (0, riskAssessmentBlob_1.deleteRiskAssessmentFile)(deleted.company_logo_blob_name).catch((err) => console.error("Failed to delete logo blob:", err));
        }
        if (deleted.pdf_blob_name) {
            await (0, riskAssessmentBlob_1.deleteRiskAssessmentFile)(deleted.pdf_blob_name).catch((err) => console.error("Failed to delete PDF blob:", err));
        }
        res.json({ id: deleted.id });
    }
    catch (error) {
        console.error("Failed to delete risk assessment:", error);
        res.status(500).json({ message: error.message || "Failed to delete risk assessment" });
    }
};
exports.deleteRiskAssessmentController = deleteRiskAssessmentController;
const uploadLogoController = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const raId = Number(req.params.id);
        const existing = await (0, riskAssessment_1.getRiskAssessmentById)(raId);
        if (!existing)
            return res.status(404).json({ message: "Risk assessment not found" });
        if (existing.company_logo_blob_name) {
            await (0, riskAssessmentBlob_1.deleteRiskAssessmentFile)(existing.company_logo_blob_name).catch((err) => console.error("Failed to delete previous logo:", err));
        }
        const uploaded = await (0, riskAssessmentBlob_1.uploadRiskAssessmentLogo)(file.buffer, file.originalname, file.mimetype, raId);
        const updated = await (0, riskAssessment_1.updateRiskAssessment)(raId, {
            companyLogoBlobName: uploaded.blobName,
            companyLogoFileName: uploaded.fileName,
            companyLogoSize: uploaded.fileSize,
            companyLogoMimeType: uploaded.mimeType,
        });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to upload logo:", error);
        res.status(500).json({ message: error.message || "Failed to upload logo" });
    }
};
exports.uploadLogoController = uploadLogoController;
const uploadPdfController = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const raId = Number(req.params.id);
        const existing = await (0, riskAssessment_1.getRiskAssessmentById)(raId);
        if (!existing)
            return res.status(404).json({ message: "Risk assessment not found" });
        if (existing.pdf_blob_name) {
            await (0, riskAssessmentBlob_1.deleteRiskAssessmentFile)(existing.pdf_blob_name).catch((err) => console.error("Failed to delete previous PDF:", err));
        }
        const uploaded = await (0, riskAssessmentBlob_1.uploadRiskAssessmentPdf)(file.buffer, file.originalname, file.mimetype, raId);
        const updated = await (0, riskAssessment_1.updateRiskAssessment)(raId, {
            pdfBlobName: uploaded.blobName,
            pdfFileName: uploaded.fileName,
            pdfSize: uploaded.fileSize,
            pdfMimeType: uploaded.mimeType,
        });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to upload PDF:", error);
        res.status(500).json({ message: error.message || "Failed to upload PDF" });
    }
};
exports.uploadPdfController = uploadPdfController;
