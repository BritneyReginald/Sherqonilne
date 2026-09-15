"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const incidentsController_1 = require("../controllers/incidentsController");
// In-memory storage — files are streamed straight to Azure Blob in
// the controller, same as the medicals upload path.
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.get("/", incidentsController_1.getAllIncidentRecords);
router.post("/", incidentsController_1.addIncidentRecord);
router.get("/:id", incidentsController_1.getIncidentRecord);
router.put("/:id", incidentsController_1.editIncidentRecord);
router.delete("/:id", incidentsController_1.deleteIncidentRecordController);
router.patch("/:id/status", incidentsController_1.updateIncidentStatusController);
router.patch("/:id/investigation", incidentsController_1.updateInvestigationController);
router.post("/:id/evidence", upload.array("files"), incidentsController_1.uploadEvidenceController);
router.get("/:id/evidence/:fileId/url", incidentsController_1.getEvidenceFileUrl);
router.delete("/:id/evidence/:fileId", incidentsController_1.deleteEvidenceFileController);
exports.default = router;
