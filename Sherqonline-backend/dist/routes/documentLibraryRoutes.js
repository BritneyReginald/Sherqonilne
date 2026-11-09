"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documentLibraryController_1 = require("../controllers/documentLibraryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const clientGuards_1 = require("../middleware/clientGuards");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
// Every folder (and so every document) belongs to a site.
// Staff see all sites; a client sees only their own.
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
/* ------------------------------ folders ------------------------------ */
// ":id" means a FOLDER id here, so folders and documents get separate
// sub-routers (router.param is per router, not per path).
const folders = (0, express_1.Router)();
folders.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)("SELECT site_id FROM document_folders WHERE id = $1")));
folders.get("/", documentLibraryController_1.listFolders); // controller must filter by siteIdsFor(req)
// A sub-folder must sit inside one of the caller's folders; a client's
// top-level folder is stamped with their site. Controller: store
// body.siteId on top-level folders, and copy the parent's site_id onto sub-folders.
folders.post("/", (0, clientGuards_1.requireFolderInScope)("parentId", { optional: true }), clientGuards_1.forceClientSite, documentLibraryController_1.addFolder);
folders.get("/:id/documents", documentLibraryController_1.listDocuments);
folders.get("/:id/download", documentLibraryController_1.downloadFolderZip);
/* ----------------------------- documents ----------------------------- */
// ":id" means a DOCUMENT id here; its site comes from its folder.
const documents = (0, express_1.Router)();
documents.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)(`SELECT f.site_id
         FROM documents d
         JOIN document_folders f ON f.id = d.folder_id
        WHERE d.id = $1`)));
// Upload: target folder (and the "updated by" employee, if sent) must be in scope.
documents.post("/", upload.single("file"), (0, clientGuards_1.requireFolderInScope)("folderId"), (0, clientGuards_1.requireEmployeeInScope)("updatedByEmployeeId", { optional: true }), documentLibraryController_1.uploadDocumentController);
documents.post("/:id/versions", upload.single("file"), (0, clientGuards_1.requireEmployeeInScope)("updatedByEmployeeId", { optional: true }), documentLibraryController_1.uploadNewVersionController);
documents.get("/:id/versions", documentLibraryController_1.listVersions);
documents.get("/:id/url", documentLibraryController_1.getDocumentUrl);
documents.patch("/:id/archive", documentLibraryController_1.archiveDocumentController);
// Restore stays RSS-only
documents.patch("/:id/restore", (0, authMiddleware_1.authorize)("rss_staff"), documentLibraryController_1.restoreDocumentController);
/* ----------------------- archive list (RSS only) ---------------------- */
router.get("/archived", (0, authMiddleware_1.authorize)("rss_staff"), documentLibraryController_1.listArchivedDocuments);
router.use("/folders", folders);
router.use("/documents", documents);
exports.default = router;
