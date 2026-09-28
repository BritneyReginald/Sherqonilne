import { Request, Response } from "express";

import {
  createLegalAppointment,
  getLegalAppointments,
  getLegalAppointmentById,
  updateLegalAppointment,
  deleteLegalAppointment,
} from "../models/legalAppointment";

import {
  uploadLegalAppointmentDocument,
  getLegalAppointmentDocumentSasUrl,
  deleteLegalAppointmentDocument,
} from "../config/legalAppointmentBlob";

/**
 * Attaches a short-lived SAS URL for the signed document, so the
 * frontend never has to know about blob names directly. The site
 * logo (`site_logo`, single-appointment reads only) passes straight
 * through from the sites table.
 */
function withFileUrls(row: any) {
  return {
    ...row,
    document_url: row.document_blob_name
      ? getLegalAppointmentDocumentSasUrl(row.document_blob_name)
      : null,
  };
}

export const addLegalAppointment = async (req: Request, res: Response) => {
  try {
    const saved = await createLegalAppointment(req.body);
    res.status(201).json(withFileUrls(saved));
  } catch (error: any) {
    console.error("Failed to create legal appointment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create legal appointment" });
  }
};

export const getAllLegalAppointments = async (_req: Request, res: Response) => {
  try {
    const rows = await getLegalAppointments();
    res.json(rows.map(withFileUrls));
  } catch (error: any) {
    console.error("Failed to fetch legal appointments:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch legal appointments" });
  }
};

export const getLegalAppointment = async (req: Request, res: Response) => {
  try {
    const row = await getLegalAppointmentById(Number(req.params.id));
    if (!row) return res.status(404).json({ message: "Appointment not found" });
    res.json(withFileUrls(row));
  } catch (error: any) {
    console.error("Failed to fetch legal appointment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch legal appointment" });
  }
};

export const editLegalAppointment = async (req: Request, res: Response) => {
  try {
    const updated = await updateLegalAppointment(
      Number(req.params.id),
      req.body,
    );
    if (!updated)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to update legal appointment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update legal appointment" });
  }
};

export const deleteLegalAppointmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const deleted = await deleteLegalAppointment(Number(req.params.id));
    if (!deleted)
      return res.status(404).json({ message: "Appointment not found" });

    if (deleted.document_blob_name) {
      await deleteLegalAppointmentDocument(deleted.document_blob_name).catch(
        (err) => console.error("Failed to delete document blob:", err),
      );
    }

    res.json({ id: deleted.id });
  } catch (error: any) {
    console.error("Failed to delete legal appointment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to delete legal appointment" });
  }
};

export const uploadLegalAppointmentDocumentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const appointmentId = Number(req.params.id);

    const existing = await getLegalAppointmentById(appointmentId);
    if (!existing)
      return res.status(404).json({ message: "Appointment not found" });

    if (existing.document_blob_name) {
      await deleteLegalAppointmentDocument(existing.document_blob_name).catch(
        (err) => console.error("Failed to delete previous document:", err),
      );
    }

    const uploaded = await uploadLegalAppointmentDocument(
      file.buffer,
      file.originalname,
      file.mimetype,
      appointmentId,
    );

    const updated = await updateLegalAppointment(appointmentId, {
      documentBlobName: uploaded.blobName,
      documentFileName: uploaded.fileName,
      documentSize: uploaded.fileSize,
      documentMimeType: uploaded.mimeType,
      signatureStatus: "Signed",
    });

    res.json(withFileUrls(updated));
  } catch (error: any) {
    console.error("Failed to upload document:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to upload document" });
  }
};
