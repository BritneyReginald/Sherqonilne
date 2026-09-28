"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLegalAppointmentDocumentController = exports.deleteLegalAppointmentController = exports.editLegalAppointment = exports.getLegalAppointment = exports.getAllLegalAppointments = exports.addLegalAppointment = void 0;
const legalAppointment_1 = require("../models/legalAppointment");
const legalAppointmentBlob_1 = require("../config/legalAppointmentBlob");
/**
 * Attaches a short-lived SAS URL for the signed document, so the
 * frontend never has to know about blob names directly. The site
 * logo (`site_logo`, single-appointment reads only) passes straight
 * through from the sites table.
 */
function withFileUrls(row) {
    return {
        ...row,
        document_url: row.document_blob_name
            ? (0, legalAppointmentBlob_1.getLegalAppointmentDocumentSasUrl)(row.document_blob_name)
            : null,
    };
}
const addLegalAppointment = async (req, res) => {
    try {
        const saved = await (0, legalAppointment_1.createLegalAppointment)(req.body);
        res.status(201).json(withFileUrls(saved));
    }
    catch (error) {
        console.error("Failed to create legal appointment:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to create legal appointment" });
    }
};
exports.addLegalAppointment = addLegalAppointment;
const getAllLegalAppointments = async (_req, res) => {
    try {
        const rows = await (0, legalAppointment_1.getLegalAppointments)();
        res.json(rows.map(withFileUrls));
    }
    catch (error) {
        console.error("Failed to fetch legal appointments:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch legal appointments" });
    }
};
exports.getAllLegalAppointments = getAllLegalAppointments;
const getLegalAppointment = async (req, res) => {
    try {
        const row = await (0, legalAppointment_1.getLegalAppointmentById)(Number(req.params.id));
        if (!row)
            return res.status(404).json({ message: "Appointment not found" });
        res.json(withFileUrls(row));
    }
    catch (error) {
        console.error("Failed to fetch legal appointment:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch legal appointment" });
    }
};
exports.getLegalAppointment = getLegalAppointment;
const editLegalAppointment = async (req, res) => {
    try {
        const updated = await (0, legalAppointment_1.updateLegalAppointment)(Number(req.params.id), req.body);
        if (!updated)
            return res.status(404).json({ message: "Appointment not found" });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to update legal appointment:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to update legal appointment" });
    }
};
exports.editLegalAppointment = editLegalAppointment;
const deleteLegalAppointmentController = async (req, res) => {
    try {
        const deleted = await (0, legalAppointment_1.deleteLegalAppointment)(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ message: "Appointment not found" });
        if (deleted.document_blob_name) {
            await (0, legalAppointmentBlob_1.deleteLegalAppointmentDocument)(deleted.document_blob_name).catch((err) => console.error("Failed to delete document blob:", err));
        }
        res.json({ id: deleted.id });
    }
    catch (error) {
        console.error("Failed to delete legal appointment:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to delete legal appointment" });
    }
};
exports.deleteLegalAppointmentController = deleteLegalAppointmentController;
const uploadLegalAppointmentDocumentController = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const appointmentId = Number(req.params.id);
        const existing = await (0, legalAppointment_1.getLegalAppointmentById)(appointmentId);
        if (!existing)
            return res.status(404).json({ message: "Appointment not found" });
        if (existing.document_blob_name) {
            await (0, legalAppointmentBlob_1.deleteLegalAppointmentDocument)(existing.document_blob_name).catch((err) => console.error("Failed to delete previous document:", err));
        }
        const uploaded = await (0, legalAppointmentBlob_1.uploadLegalAppointmentDocument)(file.buffer, file.originalname, file.mimetype, appointmentId);
        const updated = await (0, legalAppointment_1.updateLegalAppointment)(appointmentId, {
            documentBlobName: uploaded.blobName,
            documentFileName: uploaded.fileName,
            documentSize: uploaded.fileSize,
            documentMimeType: uploaded.mimeType,
            signatureStatus: "Signed",
        });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to upload document:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to upload document" });
    }
};
exports.uploadLegalAppointmentDocumentController = uploadLegalAppointmentDocumentController;
