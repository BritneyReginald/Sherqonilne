"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreDocumentController = exports.listArchivedDocuments = exports.archiveDocumentController = exports.getDocumentUrl = exports.listVersions = exports.uploadNewVersionController = exports.uploadDocumentController = exports.listDocuments = exports.downloadFolderZip = exports.addFolder = exports.listFolders = void 0;
const archiver_1 = require("archiver");
const documentLibrary_1 = require("../models/documentLibrary");
const documentBlob_1 = require("../config/documentBlob");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function optionalDate(value) {
    if (typeof value !== "string" || value.trim() === "")
        return null;
    if (!DATE_RE.test(value))
        throw new Error("Dates must be in YYYY-MM-DD format");
    return value;
}
function sanitizeZipSegment(name) {
    return name.replace(/[\\/:*?"<>|]/g, "_");
}
/* ------------------------------ FOLDERS ------------------------------ */
const listFolders = async (_req, res) => {
    try {
        res.json(await (0, documentLibrary_1.getFolders)());
    }
    catch (error) {
        console.error("Failed to fetch folders:", error);
        res.status(500).json({ message: "Failed to fetch folders" });
    }
};
exports.listFolders = listFolders;
const addFolder = async (req, res) => {
    try {
        const name = String(req.body.name ?? "").trim();
        const parentId = req.body.parentId === null || req.body.parentId === undefined
            ? null
            : Number(req.body.parentId);
        if (!name)
            return res.status(400).json({ message: "Folder name is required" });
        if (/[\\/]/.test(name)) {
            return res
                .status(400)
                .json({ message: "Folder name cannot contain / or \\" });
        }
        if (parentId !== null) {
            const parent = await (0, documentLibrary_1.getFolderById)(parentId);
            if (!parent)
                return res.status(404).json({ message: "Parent folder not found" });
        }
        const folder = await (0, documentLibrary_1.createFolder)(name, parentId);
        res.status(201).json(folder);
    }
    catch (error) {
        if (error.code === "23505") {
            return res
                .status(409)
                .json({ message: "A folder with that name already exists here" });
        }
        console.error("Failed to create folder:", error);
        res.status(500).json({ message: "Failed to create folder" });
    }
};
exports.addFolder = addFolder;
/** Streams the folder (and all subfolders) as a ZIP. */
const downloadFolderZip = async (req, res) => {
    try {
        const folderId = Number(req.params.id);
        const folder = await (0, documentLibrary_1.getFolderById)(folderId);
        if (!folder)
            return res.status(404).json({ message: "Folder not found" });
        const rows = await (0, documentLibrary_1.getFolderTreeForZip)(folderId);
        const archive = new archiver_1.ZipArchive({ zlib: { level: 6 } });
        archive.on("error", (err) => {
            console.error("ZIP error:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: "Failed to build ZIP" });
            }
            else {
                res.destroy(err);
            }
        });
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(sanitizeZipSegment(folder.name))}.zip`);
        archive.pipe(res);
        const usedNames = new Set();
        const emptyDirsAdded = new Set();
        for (const row of rows) {
            const dirPath = row.path
                .split("/")
                .map(sanitizeZipSegment)
                .join("/");
            // Always add the folder itself so empty folders are preserved
            if (!emptyDirsAdded.has(dirPath)) {
                archive.append(Buffer.alloc(0), { name: `${dirPath}/` });
                emptyDirsAdded.add(dirPath);
            }
            if (!row.file_blob_name)
                continue;
            // Avoid two files with the same name overwriting each other
            const original = sanitizeZipSegment(row.file_name);
            const dot = original.lastIndexOf(".");
            const base = dot > 0 ? original.slice(0, dot) : original;
            const ext = dot > 0 ? original.slice(dot) : "";
            let entryName = `${dirPath}/${original}`;
            let counter = 1;
            while (usedNames.has(entryName.toLowerCase())) {
                entryName = `${dirPath}/${base} (${counter})${ext}`;
                counter++;
            }
            usedNames.add(entryName.toLowerCase());
            const stream = await (0, documentBlob_1.downloadLibraryFileStream)(row.file_blob_name);
            archive.append(stream, { name: entryName });
        }
        await archive.finalize();
    }
    catch (error) {
        console.error("Failed to download folder:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to download folder" });
        }
        else {
            res.destroy(error);
        }
    }
};
exports.downloadFolderZip = downloadFolderZip;
/* ----------------------------- DOCUMENTS ----------------------------- */
const listDocuments = async (req, res) => {
    try {
        res.json(await (0, documentLibrary_1.getDocumentsByFolder)(Number(req.params.id)));
    }
    catch (error) {
        console.error("Failed to fetch documents:", error);
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};
exports.listDocuments = listDocuments;
const uploadDocumentController = async (req, res) => {
    let uploadedBlobName = null;
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const folderId = Number(req.body.folderId);
        const updatedById = Number(req.body.updatedById);
        const name = String(req.body.name ?? "").trim();
        if (!folderId || !(await (0, documentLibrary_1.getFolderById)(folderId))) {
            return res.status(404).json({ message: "Folder not found" });
        }
        if (!name)
            return res.status(400).json({ message: "Document name is required" });
        if (!updatedById) {
            return res
                .status(400)
                .json({ message: "Please select who updated the document" });
        }
        const updatedByName = await (0, documentLibrary_1.getEmployeeName)(updatedById);
        if (!updatedByName)
            return res.status(400).json({ message: "Employee not found" });
        const updatedDate = optionalDate(req.body.updatedDate) ??
            new Date().toISOString().slice(0, 10);
        const expiryDate = optionalDate(req.body.expiryDate);
        const blob = await (0, documentBlob_1.uploadLibraryFile)(file.buffer, file.originalname, file.mimetype, folderId);
        uploadedBlobName = blob.blobName;
        const docId = await (0, documentLibrary_1.createDocument)({
            folderId,
            name,
            updatedById,
            updatedByName,
            updatedDate,
            expiryDate,
            changeSummary: String(req.body.changeSummary ?? "").trim() || null,
            blob,
        });
        res.status(201).json(await (0, documentLibrary_1.getDocumentById)(docId));
    }
    catch (error) {
        // Don't orphan the file if the DB insert failed
        if (uploadedBlobName) {
            await (0, documentBlob_1.deleteLibraryFile)(uploadedBlobName).catch(() => { });
        }
        console.error("Failed to upload document:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to upload document" });
    }
};
exports.uploadDocumentController = uploadDocumentController;
const uploadNewVersionController = async (req, res) => {
    let uploadedBlobName = null;
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No file provided" });
        const documentId = Number(req.params.id);
        const existing = await (0, documentLibrary_1.getDocumentById)(documentId);
        if (!existing)
            return res.status(404).json({ message: "Document not found" });
        const updatedById = Number(req.body.updatedById);
        if (!updatedById) {
            return res
                .status(400)
                .json({ message: "Please select who updated the document" });
        }
        const updatedByName = await (0, documentLibrary_1.getEmployeeName)(updatedById);
        if (!updatedByName)
            return res.status(400).json({ message: "Employee not found" });
        const updatedDate = optionalDate(req.body.updatedDate) ??
            new Date().toISOString().slice(0, 10);
        const expiryDate = optionalDate(req.body.expiryDate);
        const blob = await (0, documentBlob_1.uploadLibraryFile)(file.buffer, file.originalname, file.mimetype, existing.folder_id);
        uploadedBlobName = blob.blobName;
        const result = await (0, documentLibrary_1.addDocumentVersion)({
            documentId,
            updatedById,
            updatedByName,
            updatedDate,
            expiryDate,
            changeSummary: String(req.body.changeSummary ?? "").trim() || null,
            blob,
        });
        if (!result) {
            await (0, documentBlob_1.deleteLibraryFile)(uploadedBlobName).catch(() => { });
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(await (0, documentLibrary_1.getDocumentById)(documentId));
    }
    catch (error) {
        if (uploadedBlobName) {
            await (0, documentBlob_1.deleteLibraryFile)(uploadedBlobName).catch(() => { });
        }
        console.error("Failed to upload new version:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to upload new version" });
    }
};
exports.uploadNewVersionController = uploadNewVersionController;
const listVersions = async (req, res) => {
    try {
        res.json(await (0, documentLibrary_1.getDocumentVersions)(Number(req.params.id)));
    }
    catch (error) {
        console.error("Failed to fetch versions:", error);
        res.status(500).json({ message: "Failed to fetch versions" });
    }
};
exports.listVersions = listVersions;
/**
 * GET /documents/:id/url?mode=view|download&versionId=123
 * Returns a fresh 10-minute SAS URL (current version if versionId omitted).
 */
const getDocumentUrl = async (req, res) => {
    try {
        const documentId = Number(req.params.id);
        const versionId = req.query.versionId
            ? Number(req.query.versionId)
            : undefined;
        const mode = req.query.mode === "download" ? "download" : "view";
        const file = await (0, documentLibrary_1.getVersionFile)(documentId, versionId);
        if (!file)
            return res.status(404).json({ message: "File not found" });
        res.json({
            url: (0, documentBlob_1.getLibraryFileSasUrl)(file.file_blob_name, mode === "download" ? file.file_name : undefined),
        });
    }
    catch (error) {
        console.error("Failed to generate file URL:", error);
        res.status(500).json({ message: "Failed to generate file URL" });
    }
};
exports.getDocumentUrl = getDocumentUrl;
const archiveDocumentController = async (req, res) => {
    try {
        const archived = await (0, documentLibrary_1.archiveDocument)(Number(req.params.id));
        if (!archived)
            return res.status(404).json({ message: "Document not found" });
        res.json({ id: archived.id });
    }
    catch (error) {
        console.error("Failed to archive document:", error);
        res.status(500).json({ message: "Failed to archive document" });
    }
};
exports.archiveDocumentController = archiveDocumentController;
const listArchivedDocuments = async (_req, res) => {
    try {
        res.json(await (0, documentLibrary_1.getArchivedDocuments)());
    }
    catch (error) {
        console.error("Failed to fetch archived documents:", error);
        res.status(500).json({ message: "Failed to fetch archived documents" });
    }
};
exports.listArchivedDocuments = listArchivedDocuments;
const restoreDocumentController = async (req, res) => {
    try {
        const restored = await (0, documentLibrary_1.restoreDocument)(Number(req.params.id));
        if (!restored) {
            return res.status(404).json({ message: "Archived document not found" });
        }
        res.json({ id: restored.id });
    }
    catch (error) {
        console.error("Failed to restore document:", error);
        res.status(500).json({ message: "Failed to restore document" });
    }
};
exports.restoreDocumentController = restoreDocumentController;
