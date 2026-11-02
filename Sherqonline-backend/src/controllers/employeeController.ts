import { Request, Response } from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  activateEmployee,
  deleteEmployee,
} from "../models/employee";

import {
  uploadEmployeeIdDocument,
  getEmployeeIdDocumentSasUrl,
  deleteEmployeeIdDocument,
  uploadEmployeeProfilePicture,
  getEmployeeProfilePictureSasUrl,
  deleteEmployeeProfilePicture,
} from "../config/employeeBlob";

/**
 * Attaches short-lived SAS URLs for any uploaded documents/photos
 * so the frontend never has to know about blob names directly.
 */
function withFileUrls(row: any) {
  return {
    ...row,
    id_document_url: row.id_document_blob_name
      ? getEmployeeIdDocumentSasUrl(row.id_document_blob_name)
      : null,
    profile_picture_url: row.profile_picture_blob_name
      ? getEmployeeProfilePictureSasUrl(row.profile_picture_blob_name)
      : null,
  };
}

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const saved = await createEmployee(req.body);
    res.status(201).json(withFileUrls(saved));
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    res.status(500).json({ message: error.message || "Failed to create employee" });
  }
};

export const getAllEmployees = async (_req: Request, res: Response) => {
  try {
    const rows = await getEmployees();
    res.json(rows.map(withFileUrls));
  } catch (error: any) {
    console.error("Failed to fetch employees:", error);
    res.status(500).json({ message: error.message || "Failed to fetch employees" });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const row = await getEmployeeById(Number(req.params.id));
    if (!row) return res.status(404).json({ message: "Employee not found" });
    res.json(withFileUrls(row));
  } catch (error: any) {
    console.error("Failed to fetch employee:", error);
    res.status(500).json({ message: error.message || "Failed to fetch employee" });
  }
};

export const editEmployee = async (req: Request, res: Response) => {
  try {
    const updated = await updateEmployee(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to update employee:", error);
    res.status(500).json({ message: error.message || "Failed to update employee" });
  }
};

export const deactivateEmployeeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const updated = await deactivateEmployee(Number(req.params.id));
    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to deactivate employee:", error);
    res.status(500).json({ message: error.message || "Failed to deactivate employee" });
  }
};

export const activateEmployeeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const updated = await activateEmployee(Number(req.params.id));
    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to activate employee:", error);
    res.status(500).json({ message: error.message || "Failed to activate employee" });
  }
};

export const deleteEmployeeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const deleted = await deleteEmployee(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Employee not found" });

    // Clean up any uploaded blobs so we don't orphan files in storage
    if (deleted.id_document_blob_name) {
      await deleteEmployeeIdDocument(deleted.id_document_blob_name).catch((err) =>
        console.error("Failed to delete ID document blob:", err),
      );
    }
    if (deleted.profile_picture_blob_name) {
      await deleteEmployeeProfilePicture(deleted.profile_picture_blob_name).catch(
        (err) => console.error("Failed to delete profile picture blob:", err),
      );
    }

    res.json({ id: deleted.id });
  } catch (error: any) {
    console.error("Failed to delete employee:", error);
    res.status(500).json({ message: error.message || "Failed to delete employee" });
  }
};

export const uploadIdDocumentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const employeeId = Number(req.params.id);

    const existing = await getEmployeeById(employeeId);
    if (!existing) return res.status(404).json({ message: "Employee not found" });

    // Replace old document if one exists
    if (existing.id_document_blob_name) {
      await deleteEmployeeIdDocument(existing.id_document_blob_name).catch(
        (err) => console.error("Failed to delete previous ID document:", err),
      );
    }

    const uploaded = await uploadEmployeeIdDocument(
      file.buffer,
      file.originalname,
      file.mimetype,
      employeeId,
    );

    const updated = await updateEmployee(employeeId, {
      idDocumentBlobName: uploaded.blobName,
      idDocumentFileName: uploaded.fileName,
      idDocumentSize: uploaded.fileSize,
      idDocumentMimeType: uploaded.mimeType,
    });

    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to upload ID document:", error);
    res.status(500).json({ message: error.message || "Failed to upload ID document" });
  }
};

export const uploadProfilePictureController = async (
  req: Request,
  res: Response,
) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const employeeId = Number(req.params.id);

    const existing = await getEmployeeById(employeeId);
    if (!existing) return res.status(404).json({ message: "Employee not found" });

    if (existing.profile_picture_blob_name) {
      await deleteEmployeeProfilePicture(existing.profile_picture_blob_name).catch(
        (err) => console.error("Failed to delete previous profile picture:", err),
      );
    }

    const uploaded = await uploadEmployeeProfilePicture(
      file.buffer,
      file.originalname,
      file.mimetype,
      employeeId,
    );

    const updated = await updateEmployee(employeeId, {
      profilePictureBlobName: uploaded.blobName,
      profilePictureFileName: uploaded.fileName,
      profilePictureSize: uploaded.fileSize,
      profilePictureMimeType: uploaded.mimeType,
    });

    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to upload profile picture:", error);
    res.status(500).json({ message: error.message || "Failed to upload profile picture" });
  }
};