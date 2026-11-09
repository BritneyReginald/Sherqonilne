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
import { requireEmployeeInScope } from "../middleware/clientGuards";

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

// Create: clients can add records, but only for employees on their own site.
// The guard runs AFTER multer so the multipart fields are parsed.
router.post(
  "/",
  uploadTrainingCertificate,
  requireEmployeeInScope("employeeId"),
  addTrainingRecord,
);

// Reads (controller filters the list with siteIdsFor(req))
router.get("/", getAllTrainingRecords);
router.get("/:id", getTrainingRecord);
router.get("/:id/file", getTrainingRecordFileUrl);

// Update: may not be re-pointed at another site's employee
router.patch(
  "/:id",
  (req, res, next) => requireEmployeeInScope("employeeId", { optional: true })(req, res, next),
  editTrainingRecord,
);

router.delete("/:id", deleteTrainingRecordController);

export default router;