import { Router } from "express";
import multer from "multer";

import {
  listFolders,
  addFolder,
  downloadFolderZip,
  listDocuments,
  uploadDocumentController,
  uploadNewVersionController,
  listVersions,
  getDocumentUrl,
  archiveDocumentController,
  listArchivedDocuments,
  restoreDocumentController,
} from "../controllers/documentLibraryController";

import {
  authenticate,
  authorize,
  scopeSites,
} from "../middleware/authMiddleware";
import { scopeByIdParam, lookupSite } from "../middleware/siteScope";
import {
  forceClientSite,
  requireFolderInScope,
  requireEmployeeInScope,
} from "../middleware/clientGuards";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Every folder (and so every document) belongs to a site.
// Staff see all sites; a client sees only their own.
router.use(authenticate, authorize("rss_staff", "client"), scopeSites);

/* ------------------------------ folders ------------------------------ */
// ":id" means a FOLDER id here, so folders and documents get separate
// sub-routers (router.param is per router, not per path).
const folders = Router();

folders.param(
  "id",
  scopeByIdParam(lookupSite("SELECT site_id FROM document_folders WHERE id = $1")),
);

folders.get("/", listFolders); // controller must filter by siteIdsFor(req)

// A sub-folder must sit inside one of the caller's folders; a client's
// top-level folder is stamped with their site. Controller: store
// body.siteId on top-level folders, and copy the parent's site_id onto sub-folders.
folders.post(
  "/",
  requireFolderInScope("parentId", { optional: true }),
  forceClientSite,
  addFolder,
);

folders.get("/:id/documents", listDocuments);
folders.get("/:id/download", downloadFolderZip);

/* ----------------------------- documents ----------------------------- */
// ":id" means a DOCUMENT id here; its site comes from its folder.
const documents = Router();

documents.param(
  "id",
  scopeByIdParam(
    lookupSite(
      `SELECT f.site_id
         FROM documents d
         JOIN document_folders f ON f.id = d.folder_id
        WHERE d.id = $1`,
    ),
  ),
);

// Upload: target folder (and the "updated by" employee, if sent) must be in scope.
documents.post(
  "/",
  upload.single("file"),
  requireFolderInScope("folderId"),
  requireEmployeeInScope("updatedByEmployeeId", { optional: true }),
  uploadDocumentController,
);
documents.post(
  "/:id/versions",
  upload.single("file"),
  requireEmployeeInScope("updatedByEmployeeId", { optional: true }),
  uploadNewVersionController,
);
documents.get("/:id/versions", listVersions);
documents.get("/:id/url", getDocumentUrl);
documents.patch("/:id/archive", archiveDocumentController);
// Restore stays RSS-only
documents.patch("/:id/restore", authorize("rss_staff"), restoreDocumentController);

/* ----------------------- archive list (RSS only) ---------------------- */
router.get("/archived", authorize("rss_staff"), listArchivedDocuments);

router.use("/folders", folders);
router.use("/documents", documents);

export default router;