import { Request, Response } from "express";

import {
  createRiskAssessment,
  getRiskAssessments,
  getRiskAssessmentById,
  updateRiskAssessment,
  deleteRiskAssessment,
} from "../models/riskAssessment";

import {
  uploadRiskAssessmentLogo,
  uploadRiskAssessmentPdf,
  getRiskAssessmentFileSasUrl,
  deleteRiskAssessmentFile,
} from "../config/riskAssessmentBlob";

function withFileUrls(row: any) {
  return {
    ...row,
    company_logo_url: row.company_logo_blob_name
      ? getRiskAssessmentFileSasUrl(row.company_logo_blob_name)
      : null,
    pdf_url: row.pdf_blob_name
      ? getRiskAssessmentFileSasUrl(row.pdf_blob_name)
      : null,
  };
}

export const addRiskAssessment = async (req: Request, res: Response) => {
  try {
    const saved = await createRiskAssessment(req.body);
    res.status(201).json(withFileUrls(saved));
  } catch (error: any) {
    console.error("Failed to create risk assessment:", error);
    res.status(500).json({ message: error.message || "Failed to create risk assessment" });
  }
};

export const getAllRiskAssessments = async (_req: Request, res: Response) => {
  try {
    const rows = await getRiskAssessments();
    res.json(rows.map(withFileUrls));
  } catch (error: any) {
    console.error("Failed to fetch risk assessments:", error);
    res.status(500).json({ message: error.message || "Failed to fetch risk assessments" });
  }
};

export const getRiskAssessment = async (req: Request, res: Response) => {
  try {
    const row = await getRiskAssessmentById(Number(req.params.id));
    if (!row) return res.status(404).json({ message: "Risk assessment not found" });
    res.json(withFileUrls(row));
  } catch (error: any) {
    console.error("Failed to fetch risk assessment:", error);
    res.status(500).json({ message: error.message || "Failed to fetch risk assessment" });
  }
};

export const editRiskAssessment = async (req: Request, res: Response) => {
  try {
    const updated = await updateRiskAssessment(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Risk assessment not found" });
    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to update risk assessment:", error);
    res.status(500).json({ message: error.message || "Failed to update risk assessment" });
  }
};

export const deleteRiskAssessmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const deleted = await deleteRiskAssessment(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Risk assessment not found" });

    if (deleted.company_logo_blob_name) {
      await deleteRiskAssessmentFile(deleted.company_logo_blob_name).catch((err) =>
        console.error("Failed to delete logo blob:", err),
      );
    }
    if (deleted.pdf_blob_name) {
      await deleteRiskAssessmentFile(deleted.pdf_blob_name).catch((err) =>
        console.error("Failed to delete PDF blob:", err),
      );
    }

    res.json({ id: deleted.id });
  } catch (error: any) {
    console.error("Failed to delete risk assessment:", error);
    res.status(500).json({ message: error.message || "Failed to delete risk assessment" });
  }
};

export const uploadLogoController = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const raId = Number(req.params.id);
    const existing = await getRiskAssessmentById(raId);
    if (!existing) return res.status(404).json({ message: "Risk assessment not found" });

    if (existing.company_logo_blob_name) {
      await deleteRiskAssessmentFile(existing.company_logo_blob_name).catch((err) =>
        console.error("Failed to delete previous logo:", err),
      );
    }

    const uploaded = await uploadRiskAssessmentLogo(
      file.buffer,
      file.originalname,
      file.mimetype,
      raId,
    );

    const updated = await updateRiskAssessment(raId, {
      companyLogoBlobName: uploaded.blobName,
      companyLogoFileName: uploaded.fileName,
      companyLogoSize: uploaded.fileSize,
      companyLogoMimeType: uploaded.mimeType,
    });

    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to upload logo:", error);
    res.status(500).json({ message: error.message || "Failed to upload logo" });
  }
};

export const uploadPdfController = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const raId = Number(req.params.id);
    const existing = await getRiskAssessmentById(raId);
    if (!existing) return res.status(404).json({ message: "Risk assessment not found" });

    if (existing.pdf_blob_name) {
      await deleteRiskAssessmentFile(existing.pdf_blob_name).catch((err) =>
        console.error("Failed to delete previous PDF:", err),
      );
    }

    const uploaded = await uploadRiskAssessmentPdf(
      file.buffer,
      file.originalname,
      file.mimetype,
      raId,
    );

    const updated = await updateRiskAssessment(raId, {
      pdfBlobName: uploaded.blobName,
      pdfFileName: uploaded.fileName,
      pdfSize: uploaded.fileSize,
      pdfMimeType: uploaded.mimeType,
    });

    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to upload PDF:", error);
    res.status(500).json({ message: error.message || "Failed to upload PDF" });
  }
};