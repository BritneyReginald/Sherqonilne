import { Request, Response } from "express";
import { ZipArchive } from "archiver";

import {
  getFolders,
  getFolderById,
  createFolder,
  getFolderTreeForZip,
  getDocumentsByFolder,
  getDocumentById,
  getEmployeeName,
  createDocument,
  addDocumentVersion,
  getDocumentVersions,
  getVersionFile,
  archiveDocument,
  getArchivedDocuments,
  restoreDocument,
} from "../models/documentLibrary";

import {
  uploadLibraryFile,
  getLibraryFileSasUrl,
  downloadLibraryFileStream,
  deleteLibraryFile,
} from "../config/documentBlob";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function optionalDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  if (!DATE_RE.test(value))
    throw new Error("Dates must be in YYYY-MM-DD format");
  return value;
}

function sanitizeZipSegment(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

/* ------------------------------ FOLDERS ------------------------------ */

export const listFolders = async (_req: Request, res: Response) => {
  try {
    res.json(await getFolders());
  } catch (error: any) {
    console.error("Failed to fetch folders:", error);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};

export const addFolder = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const parentId =
      req.body.parentId === null || req.body.parentId === undefined
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
      const parent = await getFolderById(parentId);
      if (!parent)
        return res.status(404).json({ message: "Parent folder not found" });
    }

    const folder = await createFolder(name, parentId);
    res.status(201).json(folder);
  } catch (error: any) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "A folder with that name already exists here" });
    }
    console.error("Failed to create folder:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

/** Streams the folder (and all subfolders) as a ZIP. */
export const downloadFolderZip = async (req: Request, res: Response) => {
  try {
    const folderId = Number(req.params.id);
    const folder = await getFolderById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const rows = await getFolderTreeForZip(folderId);

    const archive = new ZipArchive({ zlib: { level: 6 } });

    archive.on("error", (err) => {
      console.error("ZIP error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to build ZIP" });
      } else {
        res.destroy(err);
      }
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(
        sanitizeZipSegment(folder.name),
      )}.zip`,
    );

    archive.pipe(res);

    const usedNames = new Set<string>();
    const emptyDirsAdded = new Set<string>();

    for (const row of rows) {
      const dirPath = (row.path as string)
        .split("/")
        .map(sanitizeZipSegment)
        .join("/");

      // Always add the folder itself so empty folders are preserved
      if (!emptyDirsAdded.has(dirPath)) {
        archive.append(Buffer.alloc(0), { name: `${dirPath}/` });
        emptyDirsAdded.add(dirPath);
      }

      if (!row.file_blob_name) continue;

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

      const stream = await downloadLibraryFileStream(row.file_blob_name);
      archive.append(stream, { name: entryName });
    }

    await archive.finalize();
  } catch (error: any) {
    console.error("Failed to download folder:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to download folder" });
    } else {
      res.destroy(error);
    }
  }
};

/* ----------------------------- DOCUMENTS ----------------------------- */

export const listDocuments = async (req: Request, res: Response) => {
  try {
    res.json(await getDocumentsByFolder(Number(req.params.id)));
  } catch (error: any) {
    console.error("Failed to fetch documents:", error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

export const uploadDocumentController = async (req: Request, res: Response) => {
  let uploadedBlobName: string | null = null;

  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const folderId = Number(req.body.folderId);
    const updatedById = Number(req.body.updatedById);
    const name = String(req.body.name ?? "").trim();

    if (!folderId || !(await getFolderById(folderId))) {
      return res.status(404).json({ message: "Folder not found" });
    }
    if (!name)
      return res.status(400).json({ message: "Document name is required" });
    if (!updatedById) {
      return res
        .status(400)
        .json({ message: "Please select who updated the document" });
    }

    const updatedByName = await getEmployeeName(updatedById);
    if (!updatedByName)
      return res.status(400).json({ message: "Employee not found" });

    const updatedDate =
      optionalDate(req.body.updatedDate) ??
      new Date().toISOString().slice(0, 10);
    const expiryDate = optionalDate(req.body.expiryDate);

    const blob = await uploadLibraryFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folderId,
    );
    uploadedBlobName = blob.blobName;

    const docId = await createDocument({
      folderId,
      name,
      updatedById,
      updatedByName,
      updatedDate,
      expiryDate,
      changeSummary: String(req.body.changeSummary ?? "").trim() || null,
      blob,
    });

    res.status(201).json(await getDocumentById(docId));
  } catch (error: any) {
    // Don't orphan the file if the DB insert failed
    if (uploadedBlobName) {
      await deleteLibraryFile(uploadedBlobName).catch(() => {});
    }
    console.error("Failed to upload document:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to upload document" });
  }
};

export const uploadNewVersionController = async (
  req: Request,
  res: Response,
) => {
  let uploadedBlobName: string | null = null;

  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const documentId = Number(req.params.id);
    const existing = await getDocumentById(documentId);
    if (!existing)
      return res.status(404).json({ message: "Document not found" });

    const updatedById = Number(req.body.updatedById);
    if (!updatedById) {
      return res
        .status(400)
        .json({ message: "Please select who updated the document" });
    }

    const updatedByName = await getEmployeeName(updatedById);
    if (!updatedByName)
      return res.status(400).json({ message: "Employee not found" });

    const updatedDate =
      optionalDate(req.body.updatedDate) ??
      new Date().toISOString().slice(0, 10);
    const expiryDate = optionalDate(req.body.expiryDate);

    const blob = await uploadLibraryFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      existing.folder_id,
    );
    uploadedBlobName = blob.blobName;

    const result = await addDocumentVersion({
      documentId,
      updatedById,
      updatedByName,
      updatedDate,
      expiryDate,
      changeSummary: String(req.body.changeSummary ?? "").trim() || null,
      blob,
    });

    if (!result) {
      await deleteLibraryFile(uploadedBlobName).catch(() => {});
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(await getDocumentById(documentId));
  } catch (error: any) {
    if (uploadedBlobName) {
      await deleteLibraryFile(uploadedBlobName).catch(() => {});
    }
    console.error("Failed to upload new version:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to upload new version" });
  }
};

export const listVersions = async (req: Request, res: Response) => {
  try {
    res.json(await getDocumentVersions(Number(req.params.id)));
  } catch (error: any) {
    console.error("Failed to fetch versions:", error);
    res.status(500).json({ message: "Failed to fetch versions" });
  }
};

/**
 * GET /documents/:id/url?mode=view|download&versionId=123
 * Returns a fresh 10-minute SAS URL (current version if versionId omitted).
 */
export const getDocumentUrl = async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.id);
    const versionId = req.query.versionId
      ? Number(req.query.versionId)
      : undefined;
    const mode = req.query.mode === "download" ? "download" : "view";

    const file = await getVersionFile(documentId, versionId);
    if (!file) return res.status(404).json({ message: "File not found" });

    res.json({
      url: getLibraryFileSasUrl(
        file.file_blob_name,
        mode === "download" ? file.file_name : undefined,
      ),
    });
  } catch (error: any) {
    console.error("Failed to generate file URL:", error);
    res.status(500).json({ message: "Failed to generate file URL" });
  }
};

export const archiveDocumentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const archived = await archiveDocument(Number(req.params.id));
    if (!archived)
      return res.status(404).json({ message: "Document not found" });
    res.json({ id: archived.id });
  } catch (error: any) {
    console.error("Failed to archive document:", error);
    res.status(500).json({ message: "Failed to archive document" });
  }
};

export const listArchivedDocuments = async (_req: Request, res: Response) => {
  try {
    res.json(await getArchivedDocuments());
  } catch (error: any) {
    console.error("Failed to fetch archived documents:", error);
    res.status(500).json({ message: "Failed to fetch archived documents" });
  }
};

export const restoreDocumentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const restored = await restoreDocument(Number(req.params.id));
    if (!restored) {
      return res.status(404).json({ message: "Archived document not found" });
    }
    res.json({ id: restored.id });
  } catch (error: any) {
    console.error("Failed to restore document:", error);
    res.status(500).json({ message: "Failed to restore document" });
  }
};
