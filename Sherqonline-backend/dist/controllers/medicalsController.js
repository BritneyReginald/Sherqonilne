"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicalRecordFileUrl = exports.restoreMedicalRecordController = exports.listArchivedMedicalRecords = exports.deleteMedicalRecordController = exports.editMedicalRecord = exports.getMedicalRecord = exports.getAllMedicalRecords = exports.addMedicalRecord = void 0;
const medicals_1 = require("../models/medicals");
const azureBlob_1 = require("../services/azureBlob");
// Returns the logged-in user's id if an auth middleware attached one,
// otherwise null. Used only to record deleted_by; it is NOT a permission
// check. Adjust if your auth middleware attaches the user under a
// different key.
const currentUserId = (req) => req.user?.id ?? null;
// multipart/form-data arrives with every field as a string, so
// restriction_type comes through as a JSON string if present.
function parseMedicalBody(body) {
    let restrictionType = null;
    if (body.restrictionType) {
        try {
            restrictionType = JSON.parse(body.restrictionType);
        }
        catch {
            throw new Error("restrictionType must be valid JSON");
        }
    }
    return {
        employeeId: Number(body.employeeId),
        examType: body.examType,
        practitionerName: body.practitionerName,
        practitionerType: body.practitionerType,
        examDate: body.examDate,
        expiryDate: body.expiryDate || null,
        fitnessStatus: body.fitnessStatus,
        restrictions: body.restrictions || null,
        restrictionType,
    };
}
const addMedicalRecord = async (req, res) => {
    try {
        const data = parseMedicalBody(req.body);
        if (!data.employeeId ||
            !data.examType ||
            !data.practitionerName ||
            !data.practitionerType ||
            !data.examDate ||
            !data.fitnessStatus) {
            res.status(400).json({
                error: "employeeId, examType, practitionerName, practitionerType, examDate, and fitnessStatus are required",
            });
            return;
        }
        let fileMeta = null;
        try {
            if (req.file) {
                fileMeta = await (0, azureBlob_1.uploadMedicalFile)(req.file.buffer, req.file.originalname, req.file.mimetype, data.employeeId);
            }
            const newRecord = await (0, medicals_1.createMedicalRecord)(data, fileMeta);
            res.status(201).json(newRecord);
        }
        catch (err) {
            if (fileMeta?.blobName) {
                try {
                    await (0, azureBlob_1.deleteMedicalFile)(fileMeta.blobName);
                }
                catch (cleanupError) {
                    console.error("Failed to clean up Azure blob:", cleanupError);
                }
            }
            console.error(err);
            res.status(500).json({
                error: err instanceof Error
                    ? err.message
                    : "Failed to create medical record",
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
            detail: err.detail,
            code: err.code,
        });
    }
};
exports.addMedicalRecord = addMedicalRecord;
const getAllMedicalRecords = async (req, res) => {
    try {
        const records = await (0, medicals_1.getMedicalRecords)({
            siteLocation: req.query.site,
            fitnessStatus: req.query.fitnessStatus,
            employeeId: req.query.employeeId
                ? Number(req.query.employeeId)
                : undefined,
        });
        res.json(records);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.getAllMedicalRecords = getAllMedicalRecords;
const getMedicalRecord = async (req, res) => {
    try {
        const record = await (0, medicals_1.getMedicalRecordById)(Number(req.params.id));
        if (!record) {
            res.status(404).json({ message: "Medical record not found" });
            return;
        }
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMedicalRecord = getMedicalRecord;
const editMedicalRecord = async (req, res) => {
    try {
        const record = await (0, medicals_1.updateMedicalRecord)(Number(req.params.id), parseMedicalBody(req.body));
        if (!record) {
            res.status(404).json({ message: "Medical record not found" });
            return;
        }
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.editMedicalRecord = editMedicalRecord;
/**
 * SOFT delete. The row and its Azure file are KEPT indefinitely
 * (OHS Act 40-year retention). Nothing is removed from Azure here.
 */
const deleteMedicalRecordController = async (req, res) => {
    try {
        const deleted = await (0, medicals_1.softDeleteMedicalRecord)(Number(req.params.id), currentUserId(req));
        if (!deleted) {
            res.status(404).json({ message: "Medical record not found" });
            return;
        }
        res.json({
            message: "Medical record moved to the recycle bin",
            id: deleted.id,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteMedicalRecordController = deleteMedicalRecordController;
const listArchivedMedicalRecords = async (req, res) => {
    try {
        res.json(await (0, medicals_1.getArchivedMedicalRecords)());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listArchivedMedicalRecords = listArchivedMedicalRecords;
const restoreMedicalRecordController = async (req, res) => {
    try {
        const restored = await (0, medicals_1.restoreMedicalRecord)(Number(req.params.id));
        if (!restored) {
            res.status(404).json({ message: "Deleted medical record not found" });
            return;
        }
        res.json({ message: "Medical record restored", id: restored.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.restoreMedicalRecordController = restoreMedicalRecordController;
// Returns a short-lived signed URL so the frontend can open/download
// the file without the blob ever being publicly accessible.
const getMedicalRecordFileUrl = async (req, res) => {
    try {
        const record = await (0, medicals_1.getMedicalRecordById)(Number(req.params.id));
        if (!record || !record.file_blob_name) {
            res.status(404).json({ message: "No file attached to this record" });
            return;
        }
        const url = (0, azureBlob_1.getMedicalFileSasUrl)(record.file_blob_name);
        res.json({ url, fileName: record.file_name, expiresInMinutes: 10 });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMedicalRecordFileUrl = getMedicalRecordFileUrl;
