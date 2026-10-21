"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvidenceFileController = exports.getEvidenceFileUrl = exports.uploadEvidenceController = exports.updateInvestigationController = exports.deleteIncidentRecordController = exports.updateIncidentStatusController = exports.editIncidentRecord = exports.getIncidentRecord = exports.getAllIncidentRecords = exports.addIncidentRecord = void 0;
const incidentRecords_1 = require("../models/incidentRecords");
const investigations_1 = require("../models/investigations");
const incidentEvidence_1 = require("../models/incidentEvidence");
const firstAidEntries_1 = require("../models/firstAidEntries");
const employee_1 = require("../models/employee");
const siteResolver_1 = require("../models/siteResolver");
const siteScope_1 = require("../middleware/siteScope");
const azureBlobIncidents_1 = require("../services/azureBlobIncidents");
function parseIncidentBody(body) {
    return {
        type: body.type,
        employeeId: body.employeeId ? Number(body.employeeId) : null,
        division: body.division || null,
        site: body.site || null,
        // siteId is resolved separately (see resolveIncidentSite)
        siteId: undefined,
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
/**
 * Works out which site an incident belongs to: an explicit siteId,
 * else the site NAME the form sends today, else the employee's site.
 * Returns { id: null } only if none of those exist.
 */
async function resolveIncidentSite(body, employeeId) {
    if (body.siteId || body.site) {
        return (0, siteResolver_1.resolveSite)({ siteId: body.siteId, siteLocation: body.site });
    }
    if (employeeId) {
        const employee = await (0, employee_1.getEmployeeById)(employeeId);
        if (employee?.site_id) {
            return (0, siteResolver_1.resolveSite)({ siteId: employee.site_id });
        }
    }
    return { id: null, name: null };
}
// Maps one incoming first-aid entry (camelCase, matching
// FirstAidEntry on the frontend) onto the model's input shape.
function parseFirstAidEntry(entry) {
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
async function buildFullRecord(id) {
    const record = await (0, incidentRecords_1.getIncidentRecordById)(id);
    if (!record)
        return null;
    const investigationRow = await (0, investigations_1.getInvestigationByRecordId)(id);
    const evidenceRows = await (0, incidentEvidence_1.getEvidenceForRecord)(id);
    const evidence = evidenceRows.map((f) => ({ id: f.id, name: f.file_name }));
    const investigation = investigationRow || evidence.length
        ? {
            investigator: investigationRow?.investigator ?? undefined,
            investigationDate: investigationRow?.investigation_date ?? undefined,
            location: investigationRow?.location ?? undefined,
            department: investigationRow?.department ?? undefined,
            immediateCause: investigationRow?.immediate_cause ?? undefined,
            rootCause: investigationRow?.root_cause ?? undefined,
            contributingFactors: investigationRow?.contributing_factors ?? undefined,
            correctiveActions: investigationRow?.corrective_actions ?? [],
            responsiblePerson: investigationRow?.responsible_person ?? undefined,
            dueDate: investigationRow?.due_date ?? undefined,
            preventiveActions: investigationRow?.preventive_actions ?? undefined,
            evidence,
        }
        : undefined;
    let firstAidEntries;
    if (record.type === "injury" &&
        String(record.injury_type).toLowerCase().replace(/[_-]/g, "") === "firstaid") {
        const rows = await (0, firstAidEntries_1.getFirstAidEntriesForRecord)(id);
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
const addIncidentRecord = async (req, res) => {
    try {
        const data = parseIncidentBody(req.body);
        if (!data.type || !["incident", "ncr", "injury"].includes(data.type)) {
            res
                .status(400)
                .json({ error: "type must be one of incident, ncr, injury" });
            return;
        }
        if (data.type === "injury" &&
            data.injuryType &&
            !["firstAid", "hospital"].includes(data.injuryType)) {
            res
                .status(400)
                .json({ error: "injuryType must be firstAid or hospital" });
            return;
        }
        // Every record must belong to a site, otherwise no client would
        // ever see it.
        const site = await resolveIncidentSite(req.body, data.employeeId ?? null);
        if (!site.id) {
            res.status(400).json({
                error: "A site is required. Select a site (or an employee who has one).",
            });
            return;
        }
        data.siteId = site.id;
        data.site = site.name;
        const record = await (0, incidentRecords_1.createIncidentRecord)(data);
        // First Aid logs carry their treatment rows in the same submit —
        // create them right after the header row exists.
        if (data.injuryType === "firstAid" && Array.isArray(req.body.entries)) {
            await (0, firstAidEntries_1.createFirstAidEntries)(record.id, req.body.entries.map(parseFirstAidEntry));
        }
        res.status(201).json(await buildFullRecord(record.id));
    }
    catch (err) {
        console.error(err);
        res.status(err.status ?? 500).json({
            error: err.message,
            detail: err.detail,
            code: err.code,
        });
    }
};
exports.addIncidentRecord = addIncidentRecord;
const getAllIncidentRecords = async (req, res) => {
    try {
        const rows = await (0, incidentRecords_1.getIncidentRecords)({
            type: req.query.type,
            status: req.query.status,
            siteLocation: req.query.site,
            siteIds: (0, siteScope_1.siteIdsFor)(req),
        });
        // Registry table view doesn't need investigation/evidence/entry
        // detail, so we skip buildFullRecord here for speed — the detail
        // view fetches it per-record via GET /:id.
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllIncidentRecords = getAllIncidentRecords;
// By-id access is site-checked by router.param("id", ...) in the router.
const getIncidentRecord = async (req, res) => {
    try {
        const record = await buildFullRecord(Number(req.params.id));
        if (!record) {
            res.status(404).json({ message: "Record not found" });
            return;
        }
        res.json(record);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getIncidentRecord = getIncidentRecord;
const editIncidentRecord = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const current = await (0, incidentRecords_1.getIncidentRecordById)(id);
        if (!current) {
            res.status(404).json({ message: "Record not found" });
            return;
        }
        const data = parseIncidentBody(req.body);
        // Only touch the site if the request actually changes it. Forms
        // re-send the old site name on every save; resolving it again would
        // fail for old records whose name no longer matches a site.
        const sendsNewSite = !!req.body.siteId || (!!req.body.site && req.body.site !== current.site);
        if (sendsNewSite) {
            const site = await (0, siteResolver_1.resolveSite)({
                siteId: req.body.siteId,
                siteLocation: req.body.site,
            });
            data.siteId = site.id;
            data.site = site.name;
        }
        else {
            data.siteId = undefined;
            data.site = undefined;
        }
        const updated = await (0, incidentRecords_1.updateIncidentRecord)(id, data);
        if (!updated) {
            res.status(404).json({ message: "Record not found" });
            return;
        }
        if (updated.injury_type === "firstAid" && Array.isArray(req.body.entries)) {
            await (0, firstAidEntries_1.replaceFirstAidEntries)(updated.id, req.body.entries.map(parseFirstAidEntry));
        }
        res.json(await buildFullRecord(updated.id));
    }
    catch (err) {
        res.status(err.status ?? 500).json({ error: err.message });
    }
};
exports.editIncidentRecord = editIncidentRecord;
const updateIncidentStatusController = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Created", "Under Investigation", "Complete"].includes(status)) {
            res.status(400).json({ error: "Invalid status" });
            return;
        }
        const updated = await (0, incidentRecords_1.updateIncidentStatus)(Number(req.params.id), status);
        if (!updated) {
            res.status(404).json({ message: "Record not found" });
            return;
        }
        res.json(await buildFullRecord(updated.id));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateIncidentStatusController = updateIncidentStatusController;
const deleteIncidentRecordController = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const evidenceRows = await (0, incidentEvidence_1.getEvidenceForRecord)(id);
        const deleted = await (0, incidentRecords_1.deleteIncidentRecord)(id);
        if (!deleted) {
            res.status(404).json({ message: "Record not found" });
            return;
        }
        // Clean up evidence blobs so nothing gets orphaned in Blob
        // Storage once the DB rows referencing them are gone (evidence
        // and first_aid_entries rows themselves cascade-delete via FK).
        for (const file of evidenceRows) {
            try {
                await (0, azureBlobIncidents_1.deleteIncidentEvidence)(file.file_blob_name);
            }
            catch (cleanupError) {
                console.error("Failed to clean up Azure blob:", cleanupError);
            }
        }
        res.json({ message: "Record permanently deleted", id: deleted.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteIncidentRecordController = deleteIncidentRecordController;
// Partial update — only the investigation fields present in the
// body get written. Frontend debounces calls per field while typing.
const updateInvestigationController = async (req, res) => {
    try {
        const recordId = Number(req.params.id);
        const body = req.body;
        await (0, investigations_1.upsertInvestigation)(recordId, body);
        res.json(await buildFullRecord(recordId));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateInvestigationController = updateInvestigationController;
// Accepts multiple files (multer .array("files")).
const uploadEvidenceController = async (req, res) => {
    try {
        const recordId = Number(req.params.id);
        const files = req.files || [];
        if (files.length === 0) {
            res.status(400).json({ error: "No files provided" });
            return;
        }
        const uploadedBlobNames = [];
        try {
            for (const file of files) {
                const meta = await (0, azureBlobIncidents_1.uploadIncidentEvidence)(file.buffer, file.originalname, file.mimetype, recordId);
                uploadedBlobNames.push(meta.blobName);
                await (0, incidentEvidence_1.addEvidenceFile)(recordId, meta);
            }
            res.status(201).json(await buildFullRecord(recordId));
        }
        catch (err) {
            for (const blobName of uploadedBlobNames) {
                try {
                    await (0, azureBlobIncidents_1.deleteIncidentEvidence)(blobName);
                }
                catch (cleanupError) {
                    console.error("Failed to clean up Azure blob:", cleanupError);
                }
            }
            throw err;
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.uploadEvidenceController = uploadEvidenceController;
// Short-lived signed URL for one evidence file, generated on demand
// (same reasoning as getMedicalRecordFileUrl — never a public link).
const getEvidenceFileUrl = async (req, res) => {
    try {
        const recordId = Number(req.params.id);
        const fileId = Number(req.params.fileId);
        const files = await (0, incidentEvidence_1.getEvidenceForRecord)(recordId);
        const file = files.find((f) => f.id === fileId);
        if (!file) {
            res.status(404).json({ message: "Evidence file not found" });
            return;
        }
        const url = (0, azureBlobIncidents_1.getIncidentEvidenceSasUrl)(file.file_blob_name);
        res.json({ url, fileName: file.file_name, expiresInMinutes: 10 });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getEvidenceFileUrl = getEvidenceFileUrl;
const deleteEvidenceFileController = async (req, res) => {
    try {
        const fileId = Number(req.params.fileId);
        const deleted = await (0, incidentEvidence_1.deleteEvidenceFile)(fileId);
        if (!deleted) {
            res.status(404).json({ message: "Evidence file not found" });
            return;
        }
        await (0, azureBlobIncidents_1.deleteIncidentEvidence)(deleted.file_blob_name);
        res.json({ message: "Evidence file deleted", id: deleted.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteEvidenceFileController = deleteEvidenceFileController;
