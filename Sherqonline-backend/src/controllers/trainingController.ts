import { Request, Response } from "express";

import {
  createTrainingRecord,
  getTrainingRecords,
  getTrainingRecordById,
  updateTrainingRecord,
  deleteTrainingRecord,
  TrainingRecordInput,
} from "../models/trainingRecord";

import {
  uploadTrainingCertificate as uploadToAzure,
  getTrainingCertificateSasUrl,
  deleteTrainingCertificate,
} from "../services/azureBlobTraining";

function parseTrainingBody(body: any): TrainingRecordInput {
  return {
    employeeId: Number(body.employeeId),
    trainingType: body.trainingType || null,
    trainingName: body.trainingName,
    certificateName: body.certificateName,
    provider: body.provider,
    trainingCategory: body.trainingCategory || "Safety",
    isLegallyRequired:
      body.isLegallyRequired === true || body.isLegallyRequired === "true",
    completionDate: body.completionDate,
    expiryDate: body.expiryDate,
  };
}

export const addTrainingRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = parseTrainingBody(req.body);

    if (
      !data.employeeId ||
      !data.trainingName ||
      !data.certificateName ||
      !data.provider ||
      !data.completionDate ||
      !data.expiryDate
    ) {
      res.status(400).json({
        error:
          "employeeId, trainingName, certificateName, provider, completionDate, and expiryDate are required",
      });
      return;
    }

    let fileMeta = null;

    if (req.file) {
      fileMeta = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        data.employeeId,
      );
    }

    const newRecord = await createTrainingRecord(data, fileMeta);
    res.status(201).json(newRecord);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
  }
};

export const getAllTrainingRecords = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const records = await getTrainingRecords({
      employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
      siteLocation: req.query.site as string | undefined,
    });

    res.json(records);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTrainingRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await getTrainingRecordById(Number(req.params.id));
    if (!record) {
      res.status(404).json({ message: "Training record not found" });
      return;
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editTrainingRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await updateTrainingRecord(
      Number(req.params.id),
      parseTrainingBody(req.body),
    );
    if (!record) {
      res.status(404).json({ message: "Training record not found" });
      return;
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTrainingRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await deleteTrainingRecord(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: "Training record not found" });
      return;
    }

    if (deleted.file_blob_name) {
      await deleteTrainingCertificate(deleted.file_blob_name);
    }

    res.json({ message: "Training record permanently deleted", id: deleted.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTrainingRecordFileUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await getTrainingRecordById(Number(req.params.id));

    if (!record || !record.file_blob_name) {
      res.status(404).json({ message: "No certificate attached to this record" });
      return;
    }

    const url = getTrainingCertificateSasUrl(record.file_blob_name);
    res.json({ url, fileName: record.file_name, expiresInMinutes: 10 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};