import { Router } from "express";

import {
  addTrainingRecord,
  getAllTrainingRecords,
  getTrainingRecord,
  editTrainingRecord,
  deleteTrainingRecordController,
  getTrainingRecordFileUrl,
} from "../controllers/trainingController";

import { uploadTrainingCertificate } from "../middleware/uploadTraining";
import {
  authenticate,
  authorize,
  scopeSites,
} from "../middleware/authMiddleware";
import { scopeByIdParam, lookupSite } from "../middleware/siteScope";

const router = Router();

router.use(authenticate, authorize("rss_staff", "client"), scopeSites);

router.param(
  "id",
  scopeByIdParam(
    lookupSite(
      `SELECT e.site_id
         FROM training_records tr
         JOIN employees e ON e.id = tr.employee_id
        WHERE tr.id = $1`,
    ),
  ),
);

// Writes: RSS staff only (authorize runs before the upload middleware)
router.post(
  "/",
  authorize("rss_staff"),
  uploadTrainingCertificate,
  addTrainingRecord,
);

// Reads: staff + the client's own site
router.get("/", getAllTrainingRecords);
router.get("/:id", getTrainingRecord);
router.get("/:id/file", getTrainingRecordFileUrl);

router.patch("/:id", authorize("rss_staff"), editTrainingRecord);

router.delete("/:id", authorize("rss_staff"), deleteTrainingRecordController);

export default router;