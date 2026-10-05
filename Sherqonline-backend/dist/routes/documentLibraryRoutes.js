"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documentLibraryController_1 = require("../controllers/documentLibraryController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
// Folders
router.get("/folders", documentLibraryController_1.listFolders);
router.post("/folders", documentLibraryController_1.addFolder);
router.get("/folders/:id/documents", documentLibraryController_1.listDocuments);
router.get("/folders/:id/download", documentLibraryController_1.downloadFolderZip);
// Documents
router.post("/documents", upload.single("file"), documentLibraryController_1.uploadDocumentController);
router.post("/documents/:id/versions", upload.single("file"), documentLibraryController_1.uploadNewVersionController);
router.get("/documents/:id/versions", documentLibraryController_1.listVersions);
router.get("/documents/:id/url", documentLibraryController_1.getDocumentUrl);
router.patch("/documents/:id/archive", documentLibraryController_1.archiveDocumentController);
router.get("/archived", documentLibraryController_1.listArchivedDocuments);
router.patch("/documents/:id/restore", documentLibraryController_1.restoreDocumentController);
exports.default = router;
