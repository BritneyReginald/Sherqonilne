"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePictureController = exports.uploadIdDocumentController = exports.deleteEmployeeController = exports.activateEmployeeController = exports.deactivateEmployeeController = exports.editEmployee = exports.getEmployee = exports.getAllEmployees = exports.addEmployee = void 0;
const employee_1 = require("../models/employee");
const employeeBlob_1 = require("../config/employeeBlob");
/**
 * Attaches short-lived SAS URLs for any uploaded documents/photos
 * so the frontend never has to know about blob names directly.
 */
function withFileUrls(row) {
    return {
        ...row,
        id_document_url: row.id_document_blob_name
            ? (0, employeeBlob_1.getEmployeeIdDocumentSasUrl)(row.id_document_blob_name)
            : null,
        profile_picture_url: row.profile_picture_blob_name
            ? (0, employeeBlob_1.getEmployeeProfilePictureSasUrl)(row.profile_picture_blob_name)
            : null,
    };
}
const addEmployee = async (req, res) => {
    try {
        const saved = await (0, employee_1.createEmployee)(req.body);
        res.status(201).json(withFileUrls(saved));
    }
    catch (error) {
        console.error("Failed to create employee:", error);
        res.status(500).json({ message: error.message || "Failed to create employee" });
    }
};
exports.addEmployee = addEmployee;
const getAllEmployees = async (_req, res) => {
    try {
        const rows = await (0, employee_1.getEmployees)();
        res.json(rows.map(withFileUrls));
    }
    catch (error) {
        console.error("Failed to fetch employees:", error);
        res.status(500).json({ message: error.message || "Failed to fetch employees" });
    }
};
exports.getAllEmployees = getAllEmployees;
const getEmployee = async (req, res) => {
    try {
        const row = await (0, employee_1.getEmployeeById)(Number(req.params.id));
        if (!row)
            return res.status(404).json({ message: "Employee not found" });
        res.json(withFileUrls(row));
    }
    catch (error) {
        console.error("Failed to fetch employee:", error);
        res.status(500).json({ message: error.message || "Failed to fetch employee" });
    }
};
exports.getEmployee = getEmployee;
const editEmployee = async (req, res) => {
    try {
        const updated = await (0, employee_1.updateEmployee)(Number(req.params.id), req.body);
        if (!updated)
            return res.status(404).json({ message: "Employee not found" });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to update employee:", error);
        res.status(500).json({ message: error.message || "Failed to update employee" });
    }
};
exports.editEmployee = editEmployee;
const deactivateEmployeeController = async (req, res) => {
    try {
        const updated = await (0, employee_1.deactivateEmployee)(Number(req.params.id));
        if (!updated)
            return res.status(404).json({ message: "Employee not found" });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to deactivate employee:", error);
        res.status(500).json({ message: error.message || "Failed to deactivate employee" });
    }
};
exports.deactivateEmployeeController = deactivateEmployeeController;
const activateEmployeeController = async (req, res) => {
    try {
        const updated = await (0, employee_1.activateEmployee)(Number(req.params.id));
        if (!updated)
            return res.status(404).json({ message: "Employee not found" });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to activate employee:", error);
        res.status(500).json({ message: error.message || "Failed to activate employee" });
    }
};
exports.activateEmployeeController = activateEmployeeController;
const deleteEmployeeController = async (req, res) => {
    try {
        const deleted = await (0, employee_1.deleteEmployee)(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ message: "Employee not found" });
        // Clean up any uploaded blobs so we don't orphan files in storage
        if (deleted.id_document_blob_name) {
            await (0, employeeBlob_1.deleteEmployeeIdDocument)(deleted.id_document_blob_name).catch((err) => console.error("Failed to delete ID document blob:", err));
        }
        if (deleted.profile_picture_blob_name) {
            await (0, employeeBlob_1.deleteEmployeeProfilePicture)(deleted.profile_picture_blob_name).catch((err) => console.error("Failed to delete profile picture blob:", err));
        }
        res.json({ id: deleted.id });
    }
    catch (error) {
        console.error("Failed to delete employee:", error);
        res.status(500).json({ message: error.message || "Failed to delete employee" });
    }
};
exports.deleteEmployeeController = deleteEmployeeController;
const uploadIdDocumentController = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const employeeId = Number(req.params.id);
        const existing = await (0, employee_1.getEmployeeById)(employeeId);
        if (!existing)
            return res.status(404).json({ message: "Employee not found" });
        // Replace old document if one exists
        if (existing.id_document_blob_name) {
            await (0, employeeBlob_1.deleteEmployeeIdDocument)(existing.id_document_blob_name).catch((err) => console.error("Failed to delete previous ID document:", err));
        }
        const uploaded = await (0, employeeBlob_1.uploadEmployeeIdDocument)(file.buffer, file.originalname, file.mimetype, employeeId);
        const updated = await (0, employee_1.updateEmployee)(employeeId, {
            idDocumentBlobName: uploaded.blobName,
            idDocumentFileName: uploaded.fileName,
            idDocumentSize: uploaded.fileSize,
            idDocumentMimeType: uploaded.mimeType,
        });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to upload ID document:", error);
        res.status(500).json({ message: error.message || "Failed to upload ID document" });
    }
};
exports.uploadIdDocumentController = uploadIdDocumentController;
const uploadProfilePictureController = async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const employeeId = Number(req.params.id);
        const existing = await (0, employee_1.getEmployeeById)(employeeId);
        if (!existing)
            return res.status(404).json({ message: "Employee not found" });
        if (existing.profile_picture_blob_name) {
            await (0, employeeBlob_1.deleteEmployeeProfilePicture)(existing.profile_picture_blob_name).catch((err) => console.error("Failed to delete previous profile picture:", err));
        }
        const uploaded = await (0, employeeBlob_1.uploadEmployeeProfilePicture)(file.buffer, file.originalname, file.mimetype, employeeId);
        const updated = await (0, employee_1.updateEmployee)(employeeId, {
            profilePictureBlobName: uploaded.blobName,
            profilePictureFileName: uploaded.fileName,
            profilePictureSize: uploaded.fileSize,
            profilePictureMimeType: uploaded.mimeType,
        });
        res.json(withFileUrls(updated));
    }
    catch (error) {
        console.error("Failed to upload profile picture:", error);
        res.status(500).json({ message: error.message || "Failed to upload profile picture" });
    }
};
exports.uploadProfilePictureController = uploadProfilePictureController;
