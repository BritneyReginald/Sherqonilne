import { Request, Response } from "express";

import {
  createIncidentRecord,
  getIncidentRecords,
  getIncidentRecordById,
  updateIncidentRecord,
  updateIncidentStatus,
  deleteIncidentRecord,
  IncidentRecordInput,
} from "../models/incidentRecords";

import {
  getInvestigationByRecordId,
  upsertInvestigation,
  InvestigationInput,
} from "../models/investigations";

import {
  addEvidenceFile,
  getEvidenceForRecord,
  deleteEvidenceFile,
} from "../models/incidentEvidence";

import {
  createFirstAidEntries,
  getFirstAidEntriesForRecord,
  replaceFirstAidEntries,
} from "../models/firstAidEntries";

import {
  uploadIncidentEvidence as uploadToAzure,
  getIncidentEvidenceSasUrl,
  deleteIncidentEvidence,
} from "../services/azureBlobIncidents";

function parseIncidentBody(body: any): IncidentRecordInput {
  return {
    type: body.type,
    employeeId: body.employeeId ? Number(body.employeeId) : null,

    division: body.division || null,
    site: body.site || null,
    incidentDate: body.incidentDate || null,
    incidentTime: body.incidentTime || null,

    category: body.category || null,
    title: body.title || "",
    description: body.description || "",

    status: body.status || undefined,

    injuryType: body.injuryType || null,

    ncrType: body.ncrType || null,
    identifiedBy: body.identifiedBy || null,
    department: body.department || null,

    bodyPart: body.bodyPart || null,
    effect: body.effect || null,
    disablement: body.disablement || null,
  };
}

// Maps one incoming first-aid entry (camelCase, matching
// FirstAidEntry on the frontend) onto the model's input shape.
function parseFirstAidEntry(entry: any) {
  return {
    employeeId: entry.employeeId ? Number(entry.employeeId) : null,
    employeeName: entry.employeeName || null,
    employeeNumber: entry.employeeNumber || null,
    date: entry.date || null,
    time: entry.time || null,
    injury: entry.injury || null,
    treatment: entry.treatment || null,
    comments: entry.comments || null,
    firstAider: entry.firstAider || null,
    firstAiderSignature: entry.firstAiderSignature || null,
    furtherMedicalAttention: !!entry.furtherMedicalAttention,
    status: entry.status || "draft",
  };
}

// Assembles the response shape the frontend expects: the record,
// with `investigation` nested (correctiveActions as an array,
// evidence as [{id, name}] — no URLs here, those are fetched
// on demand via getEvidenceFileUrl so a stale SAS token never
// ends up sitting in a list the user loaded 20 minutes ago), and
// `firstAidEntries` attached whenever the record is a First Aid log.
async function buildFullRecord(id: number) {
  const record = await getIncidentRecordById(id);
  if (!record) return null;

  const investigationRow = await getInvestigationByRecordId(id);
  const evidenceRows = await getEvidenceForRecord(id);

  const evidence = evidenceRows.map((f) => ({ id: f.id, name: f.file_name }));

  const investigation =
    investigationRow || evidence.length
      ? {
          investigator: investigationRow?.investigator ?? undefined,
          investigationDate: investigationRow?.investigation_date ?? undefined,
          location: investigationRow?.location ?? undefined,
          department: investigationRow?.department ?? undefined,
          immediateCause: investigationRow?.immediate_cause ?? undefined,
          rootCause: investigationRow?.root_cause ?? undefined,
          contributingFactors:
            investigationRow?.contributing_factors ?? undefined,
          correctiveActions: investigationRow?.corrective_actions ?? [],
          responsiblePerson: investigationRow?.responsible_person ?? undefined,
          dueDate: investigationRow?.due_date ?? undefined,
          preventiveActions: investigationRow?.preventive_actions ?? undefined,
          evidence,
        }
      : undefined;

  let firstAidEntries;
  if (
    record.type === "injury" &&
    String(record.injury_type).toLowerCase().replace(/[_-]/g, "") === "firstaid"
  ) {
    const rows = await getFirstAidEntriesForRecord(id);

    console.log("FIRST AID ROWS FROM DATABASE:", rows);
    
    firstAidEntries = rows.map((r) => ({
      id: String(r.id),
      employeeId: r.employee_id ? String(r.employee_id) : undefined,
      employeeName: r.employee_name ?? "",
      employeeNumber: r.employee_number ?? "",
      date: r.entry_date ?? "",
      time: r.entry_time ?? "",
      injury: r.injury ?? "",
      treatment: r.treatment ?? "",
      comments: r.comments ?? "",
      firstAider: r.first_aider ?? "",
      firstAiderSignature: r.first_aider_signature ?? undefined,
      furtherMedicalAttention: r.further_medical_attention,
      status: r.status,
    }));
  }

  return { ...record, investigation, firstAidEntries };
}

export const addIncidentRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = parseIncidentBody(req.body);
    console.log("CREATE INCIDENT BODY:", JSON.stringify(req.body, null, 2));
    console.log("FIRST AID ENTRIES:", req.body.entries);

    if (!data.type || !["incident", "ncr", "injury"].includes(data.type)) {
      res
        .status(400)
        .json({ error: "type must be one of incident, ncr, injury" });
      return;
    }

    if (
      data.type === "injury" &&
      data.injuryType &&
      !["firstAid", "hospital"].includes(data.injuryType)
    ) {
      res
        .status(400)
        .json({ error: "injuryType must be firstAid or hospital" });
      return;
    }

    const record = await createIncidentRecord(data);

    // First Aid logs carry their treatment rows in the same submit —
    // create them right after the header row exists.
    if (data.injuryType === "firstAid" && Array.isArray(req.body.entries)) {
      await createFirstAidEntries(
        record.id,
        req.body.entries.map(parseFirstAidEntry),
      );
    }

    res.status(201).json(await buildFullRecord(record.id));
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message, detail: err.detail, code: err.code });
  }
};

export const getAllIncidentRecords = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rows = await getIncidentRecords({
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
      siteLocation: req.query.site as string | undefined,
    });

    // Registry table view doesn't need investigation/evidence/entry
    // detail, so we skip buildFullRecord here for speed — the detail
    // view fetches it per-record via GET /:id.
    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getIncidentRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const record = await buildFullRecord(Number(req.params.id));

    if (!record) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editIncidentRecord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updated = await updateIncidentRecord(
      Number(req.params.id),
      parseIncidentBody(req.body),
    );

    if (!updated) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    if (updated.injury_type === "firstAid" && Array.isArray(req.body.entries)) {
      await replaceFirstAidEntries(
        updated.id,
        req.body.entries.map(parseFirstAidEntry),
      );
    }

    res.json(await buildFullRecord(updated.id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateIncidentStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!["Created", "Under Investigation", "Complete"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const updated = await updateIncidentStatus(Number(req.params.id), status);

    if (!updated) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    res.json(await buildFullRecord(updated.id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteIncidentRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const evidenceRows = await getEvidenceForRecord(id);

    const deleted = await deleteIncidentRecord(id);

    if (!deleted) {
      res.status(404).json({ message: "Record not found" });
      return;
    }

    // Clean up evidence blobs so nothing gets orphaned in Blob
    // Storage once the DB rows referencing them are gone (evidence
    // and first_aid_entries rows themselves cascade-delete via FK).
    for (const file of evidenceRows) {
      try {
        await deleteIncidentEvidence(file.file_blob_name);
      } catch (cleanupError) {
        console.error("Failed to clean up Azure blob:", cleanupError);
      }
    }

    res.json({ message: "Record permanently deleted", id: deleted.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Partial update — only the investigation fields present in the
// body get written. Frontend debounces calls per field while typing.
export const updateInvestigationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const recordId = Number(req.params.id);
    const body = req.body as Partial<InvestigationInput>;

    await upsertInvestigation(recordId, body);
    res.json(await buildFullRecord(recordId));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Accepts multiple files (multer .array("files")).
export const uploadEvidenceController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const recordId = Number(req.params.id);
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length === 0) {
      res.status(400).json({ error: "No files provided" });
      return;
    }

    const uploadedBlobNames: string[] = [];

    try {
      for (const file of files) {
        const meta = await uploadToAzure(
          file.buffer,
          file.originalname,
          file.mimetype,
          recordId,
        );
        uploadedBlobNames.push(meta.blobName);
        await addEvidenceFile(recordId, meta);
      }

      res.status(201).json(await buildFullRecord(recordId));
    } catch (err) {
      for (const blobName of uploadedBlobNames) {
        try {
          await deleteIncidentEvidence(blobName);
        } catch (cleanupError) {
          console.error("Failed to clean up Azure blob:", cleanupError);
        }
      }

      throw err;
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Short-lived signed URL for one evidence file, generated on demand
// (same reasoning as getMedicalRecordFileUrl — never a public link).
export const getEvidenceFileUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const recordId = Number(req.params.id);
    const fileId = Number(req.params.fileId);

    const files = await getEvidenceForRecord(recordId);
    const file = files.find((f) => f.id === fileId);

    if (!file) {
      res.status(404).json({ message: "Evidence file not found" });
      return;
    }

    const url = getIncidentEvidenceSasUrl(file.file_blob_name);
    res.json({ url, fileName: file.file_name, expiresInMinutes: 10 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvidenceFileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const fileId = Number(req.params.fileId);
    const deleted = await deleteEvidenceFile(fileId);

    if (!deleted) {
      res.status(404).json({ message: "Evidence file not found" });
      return;
    }

    await deleteIncidentEvidence(deleted.file_blob_name);

    res.json({ message: "Evidence file deleted", id: deleted.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
