import { Router } from "express";
import multer from "multer";

import {
  addIncidentRecord,
  getAllIncidentRecords,
  getIncidentRecord,
  editIncidentRecord,
  updateIncidentStatusController,
  deleteIncidentRecordController,
  updateInvestigationController,
  uploadEvidenceController,
  getEvidenceFileUrl,
  deleteEvidenceFileController,
} from "../controllers/incidentsController";

// In-memory storage — files are streamed straight to Azure Blob in
// the controller, same as the medicals upload path.
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", getAllIncidentRecords);
router.post("/", addIncidentRecord);

router.get("/:id", getIncidentRecord);
router.put("/:id", editIncidentRecord);
router.delete("/:id", deleteIncidentRecordController);

router.patch("/:id/status", updateIncidentStatusController);
router.patch("/:id/investigation", updateInvestigationController);

router.post("/:id/evidence", upload.array("files"), uploadEvidenceController);
router.get("/:id/evidence/:fileId/url", getEvidenceFileUrl);
router.delete("/:id/evidence/:fileId", deleteEvidenceFileController);

export default router;
