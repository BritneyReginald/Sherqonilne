import { Request, Response } from "express";

import {
  createLegalAppointment,
  getLegalAppointments,
  getLegalAppointmentById,
  updateLegalAppointment,
  deleteLegalAppointment,
} from "../models/legalAppointment";

import { getEmployeeById } from "../models/employee";
import { getSiteById } from "../models/siteResolver";
import { siteIdsFor } from "../middleware/siteScope";

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

/**
 * The appointment's site is ALWAYS the employee's site. It is never
 * taken from the request, so an appointment can't be filed under a
 * different client than the employee actually works for.
 */
async function siteFromEmployee(employeeId: unknown) {
  const id = Number(employeeId);
  const employee = Number.isInteger(id) && id > 0
    ? await getEmployeeById(id)
    : null;

  if (!employee) {
    return { error: "Employee not found" as const };
  }
  if (!employee.site_id) {
    return {
      error:
        "This employee has no site assigned. Assign a site on the Workforce page first." as const,
    };
  }

  const site = await getSiteById(employee.site_id);
  if (!site) return { error: "The employee's site no longer exists" as const };

  return { employee, site };
}

export const addLegalAppointment = async (req: Request, res: Response) => {
  try {
    const found = await siteFromEmployee(req.body.employeeId);
    if ("error" in found) {
      return res.status(400).json({ message: found.error });
    }

    const { employee, site } = found;

    const saved = await createLegalAppointment({
      ...req.body,
      employeeId: employee.id,
      employeeName: req.body.employeeName || employee.full_name,
      employeeNumber: req.body.employeeNumber || employee.employee_number,
      jobTitle: req.body.jobTitle || employee.job_title,
      siteId: site.id,
      siteName: site.name,
    });

    res.status(201).json(withFileUrls(saved));
  } catch (error: any) {
    console.error("Failed to create legal appointment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create legal appointment" });
  }
};

export const getAllLegalAppointments = async (req: Request, res: Response) => {
  try {
    const rows = await getLegalAppointments(siteIdsFor(req));
    res.json(rows.map(withFileUrls));
  } catch (error: any) {
    console.error("Failed to fetch legal appointments:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch legal appointments" });
  }
};

// By-id access is site-checked by router.param("id", ...) in the router.
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
    // Files are only ever set by the upload endpoint, and the site only
    // ever comes from the employee, so none of these are accepted here.
    const {
      documentBlobName,
      documentFileName,
      documentSize,
      documentMimeType,
      siteId,
      siteName,
      ...safe
    } = req.body;

    const updates: Record<string, any> = { ...safe };

    // Re-pointing the appointment at another employee re-derives the site.
    if (safe.employeeId !== undefined) {
      const found = await siteFromEmployee(safe.employeeId);
      if ("error" in found) {
        return res.status(400).json({ message: found.error });
      }
      updates.employeeId = found.employee.id;
      updates.siteId = found.site.id;
      updates.siteName = found.site.name;
    }

    const updated = await updateLegalAppointment(
      Number(req.params.id),
      updates,
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