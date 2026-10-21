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

import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// The document library has no site concept, so it is RSS staff only.
router.use(authenticate, authorize("rss_staff"));

// Folders
router.get("/folders", listFolders);
router.post("/folders", addFolder);
router.get("/folders/:id/documents", listDocuments);
router.get("/folders/:id/download", downloadFolderZip);

// Documents
router.post("/documents", upload.single("file"), uploadDocumentController);
router.post("/documents/:id/versions", upload.single("file"), uploadNewVersionController);
router.get("/documents/:id/versions", listVersions);
router.get("/documents/:id/url", getDocumentUrl);
router.patch("/documents/:id/archive", archiveDocumentController);
router.get("/archived", listArchivedDocuments);
router.patch("/documents/:id/restore", restoreDocumentController);

export default router;