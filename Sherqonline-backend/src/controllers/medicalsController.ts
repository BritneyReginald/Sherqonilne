import { Request, Response } from "express";

import {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  softDeleteMedicalRecord,
  getArchivedMedicalRecords,
  restoreMedicalRecord,
  MedicalRecordInput,
} from "../models/medicals";

import {
  uploadMedicalFile as uploadToAzure,
  getMedicalFileSasUrl,
  deleteMedicalFile,
} from "../services/azureBlob";

// Returns the logged-in user's id if an auth middleware attached one,
// otherwise null. Used only to record deleted_by; it is NOT a permission
// check. Adjust if your auth middleware attaches the user under a
// different key.
const currentUserId = (req: Request): number | null =>
  ((req as any).user as { id?: number } | undefined)?.id ?? null;

// multipart/form-data arrives with every field as a string, so
// restriction_type comes through as a JSON string if present.
function parseMedicalBody(body: any): MedicalRecordInput {
  let restrictionType = null;

  if (body.restrictionType) {
    try {
      restrictionType = JSON.parse(body.restrictionType);
    } catch {
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

export const addMedicalRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = parseMedicalBody(req.body);

    if (
      !data.employeeId ||
      !data.examType ||
      !data.practitionerName ||
      !data.practitionerType ||
      !data.examDate ||
      !data.fitnessStatus
    ) {
      res.status(400).json({
        error:
          "employeeId, examType, practitionerName, practitionerType, examDate, and fitnessStatus are required",
      });
      return;
    }

    let fileMeta = null;

    try {
      if (req.file) {
        fileMeta = await uploadToAzure(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          data.employeeId,
        );
      }

      const newRecord = await createMedicalRecord(data, fileMeta);

      res.status(201).json(newRecord);
    } catch (err) {
      if (fileMeta?.blobName) {
        try {
          await deleteMedicalFile(fileMeta.blobName);
        } catch (cleanupError) {
          console.error("Failed to clean up Azure blob:", cleanupError);
        }
      }

      console.error(err);

      res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : "Failed to create medical record",
      });
    }
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
      detail: err.detail,
      code: err.code,
    });
  }
};

export const getAllMedicalRecords = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const records = await getMedicalRecords({
      siteLocation: req.query.site as string | undefined,
      fitnessStatus: req.query.fitnessStatus as string | undefined,
      employeeId: req.query.employeeId
        ? Number(req.query.employeeId)
        : undefined,
    });

    res.json(records);
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getMedicalRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await getMedicalRecordById(Number(req.params.id));

    if (!record) {
      res.status(404).json({ message: "Medical record not found" });
      return;
    }

    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editMedicalRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await updateMedicalRecord(
      Number(req.params.id),
      parseMedicalBody(req.body),
    );

    if (!record) {
      res.status(404).json({ message: "Medical record not found" });
      return;
    }

    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SOFT delete. The row and its Azure file are KEPT indefinitely
 * (OHS Act 40-year retention). Nothing is removed from Azure here.
 */
export const deleteMedicalRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await softDeleteMedicalRecord(
      Number(req.params.id),
      currentUserId(req),
    );

    if (!deleted) {
      res.status(404).json({ message: "Medical record not found" });
      return;
    }

    res.json({
      message: "Medical record moved to the recycle bin",
      id: deleted.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listArchivedMedicalRecords = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.json(await getArchivedMedicalRecords());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const restoreMedicalRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restored = await restoreMedicalRecord(Number(req.params.id));

    if (!restored) {
      res.status(404).json({ message: "Deleted medical record not found" });
      return;
    }

    res.json({ message: "Medical record restored", id: restored.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Returns a short-lived signed URL so the frontend can open/download
// the file without the blob ever being publicly accessible.
export const getMedicalRecordFileUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await getMedicalRecordById(Number(req.params.id));

    if (!record || !record.file_blob_name) {
      res.status(404).json({ message: "No file attached to this record" });
      return;
    }

    const url = getMedicalFileSasUrl(record.file_blob_name);

    res.json({ url, fileName: record.file_name, expiresInMinutes: 10 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};