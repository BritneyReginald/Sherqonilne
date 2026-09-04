"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrainingRecordFileUrl = exports.deleteTrainingRecordController = exports.editTrainingRecord = exports.getTrainingRecord = exports.getAllTrainingRecords = exports.addTrainingRecord = void 0;
const trainingRecord_1 = require("../models/trainingRecord");
const azureBlobTraining_1 = require("../services/azureBlobTraining");
function parseTrainingBody(body) {
    return {
        employeeId: Number(body.employeeId),
        trainingType: body.trainingType || null,
        trainingName: body.trainingName,
        certificateName: body.certificateName,
        provider: body.provider,
        trainingCategory: body.trainingCategory || "Safety",
        isLegallyRequired: body.isLegallyRequired === true || body.isLegallyRequired === "true",
        completionDate: body.completionDate,
        expiryDate: body.expiryDate,
    };
}
const addTrainingRecord = async (req, res) => {
    try {
        const data = parseTrainingBody(req.body);
        if (!data.employeeId ||
            !data.trainingName ||
            !data.certificateName ||
            !data.provider ||
            !data.completionDate ||
            !data.expiryDate) {
            res.status(400).json({
                error: "employeeId, trainingName, certificateName, provider, completionDate, and expiryDate are required",
            });
            return;
        }
        let fileMeta = null;
        if (req.file) {
            fileMeta = await (0, azureBlobTraining_1.uploadTrainingCertificate)(req.file.buffer, req.file.originalname, req.file.mimetype, data.employeeId);
        }
        const newRecord = await (0, trainingRecord_1.createTrainingRecord)(data, fileMeta);
        res.status(201).json(newRecord);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
    }
};
exports.addTrainingRecord = addTrainingRecord;
const getAllTrainingRecords = async (req, res) => {
    try {
        const records = await (0, trainingRecord_1.getTrainingRecords)({
            employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
            siteLocation: req.query.site,
        });
        res.json(records);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllTrainingRecords = getAllTrainingRecords;
const getTrainingRecord = async (req, res) => {
    try {
        const record = await (0, trainingRecord_1.getTrainingRecordById)(Number(req.params.id));
        if (!record) {
            res.status(404).json({ message: "Training record not found" });
            return;
        }
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getTrainingRecord = getTrainingRecord;
const editTrainingRecord = async (req, res) => {
    try {
        const record = await (0, trainingRecord_1.updateTrainingRecord)(Number(req.params.id), parseTrainingBody(req.body));
        if (!record) {
            res.status(404).json({ message: "Training record not found" });
            return;
        }
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.editTrainingRecord = editTrainingRecord;
const deleteTrainingRecordController = async (req, res) => {
    try {
        const deleted = await (0, trainingRecord_1.deleteTrainingRecord)(Number(req.params.id));
        if (!deleted) {
            res.status(404).json({ message: "Training record not found" });
            return;
        }
        if (deleted.file_blob_name) {
            await (0, azureBlobTraining_1.deleteTrainingCertificate)(deleted.file_blob_name);
        }
        res.json({ message: "Training record permanently deleted", id: deleted.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteTrainingRecordController = deleteTrainingRecordController;
const getTrainingRecordFileUrl = async (req, res) => {
    try {
        const record = await (0, trainingRecord_1.getTrainingRecordById)(Number(req.params.id));
        if (!record || !record.file_blob_name) {
            res.status(404).json({ message: "No certificate attached to this record" });
            return;
        }
        const url = (0, azureBlobTraining_1.getTrainingCertificateSasUrl)(record.file_blob_name);
        res.json({ url, fileName: record.file_name, expiresInMinutes: 10 });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getTrainingRecordFileUrl = getTrainingRecordFileUrl;
