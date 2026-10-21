"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const incidentsController_1 = require("../controllers/incidentsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
// In-memory storage — files are streamed straight to Azure Blob in
// the controller, same as the medicals upload path.
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
// first_aider is allowed to read and edit records for THEIR sites
// (to sign first-aid entries). Remove it here if first aiders should
// use a different endpoint.
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client", "first_aider"), authMiddleware_1.scopeSites);
router.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)("SELECT site_id FROM incident_records WHERE id = $1")));
// Reads
router.get("/", incidentsController_1.getAllIncidentRecords);
router.get("/:id", incidentsController_1.getIncidentRecord);
router.get("/:id/evidence/:fileId/url", incidentsController_1.getEvidenceFileUrl);
// Create / delete / workflow: RSS staff only
router.post("/", (0, authMiddleware_1.authorize)("rss_staff"), incidentsController_1.addIncidentRecord);
router.delete("/:id", (0, authMiddleware_1.authorize)("rss_staff"), incidentsController_1.deleteIncidentRecordController);
router.patch("/:id/status", (0, authMiddleware_1.authorize)("rss_staff"), incidentsController_1.updateIncidentStatusController);
router.patch("/:id/investigation", (0, authMiddleware_1.authorize)("rss_staff"), incidentsController_1.updateInvestigationController);
// Edit: staff, plus first aiders (site-checked above)
router.put("/:id", (0, authMiddleware_1.authorize)("rss_staff", "first_aider"), incidentsController_1.editIncidentRecord);
// Evidence files
router.post("/:id/evidence", (0, authMiddleware_1.authorize)("rss_staff"), upload.array("files"), incidentsController_1.uploadEvidenceController);
router.delete("/:id/evidence/:fileId", (0, authMiddleware_1.authorize)("rss_staff"), incidentsController_1.deleteEvidenceFileController);
exports.default = router;
