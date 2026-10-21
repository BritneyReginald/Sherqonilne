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

import {
  authenticate,
  authorize,
  scopeSites,
} from "../middleware/authMiddleware";
import { scopeByIdParam, lookupSite } from "../middleware/siteScope";

// In-memory storage — files are streamed straight to Azure Blob in
// the controller, same as the medicals upload path.
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// first_aider is allowed to read and edit records for THEIR sites
// (to sign first-aid entries). Remove it here if first aiders should
// use a different endpoint.
router.use(
  authenticate,
  authorize("rss_staff", "client", "first_aider"),
  scopeSites,
);

router.param(
  "id",
  scopeByIdParam(
    lookupSite("SELECT site_id FROM incident_records WHERE id = $1"),
  ),
);

// Reads
router.get("/", getAllIncidentRecords);
router.get("/:id", getIncidentRecord);
router.get("/:id/evidence/:fileId/url", getEvidenceFileUrl);

// Create / delete / workflow: RSS staff only
router.post("/", authorize("rss_staff"), addIncidentRecord);
router.delete("/:id", authorize("rss_staff"), deleteIncidentRecordController);
router.patch(
  "/:id/status",
  authorize("rss_staff"),
  updateIncidentStatusController,
);
router.patch(
  "/:id/investigation",
  authorize("rss_staff"),
  updateInvestigationController,
);

// Edit: staff, plus first aiders (site-checked above)
router.put("/:id", authorize("rss_staff", "first_aider"), editIncidentRecord);

// Evidence files
router.post(
  "/:id/evidence",
  authorize("rss_staff"),
  upload.array("files"),
  uploadEvidenceController,
);
router.delete(
  "/:id/evidence/:fileId",
  authorize("rss_staff"),
  deleteEvidenceFileController,
);

export default router;