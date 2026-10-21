import { Router } from "express";

import {
  addMedicalRecord,
  getAllMedicalRecords,
  getMedicalRecord,
  editMedicalRecord,
  deleteMedicalRecordController,
  getMedicalRecordFileUrl,
  listArchivedMedicalRecords,
  restoreMedicalRecordController,
} from "../controllers/medicalsController";

import { uploadMedicalFile } from "../middleware/upload";
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
         FROM medical_records mr
         JOIN employees e ON e.id = mr.employee_id
        WHERE mr.id = $1 AND mr.deleted_at IS NULL`,
    ),
  ),
);

// Create (multipart/form-data — file is optional). Staff only.
router.post("/", authorize("rss_staff"), uploadMedicalFile, addMedicalRecord);

// Read (clients get the certificate view for their own site only)
router.get("/", getAllMedicalRecords);

// Recycle bin. "/archived" MUST be registered before "/:id", otherwise
// Express matches "archived" as an id.
router.get("/archived", authorize("rss_staff"), listArchivedMedicalRecords);

router.get("/:id", getMedicalRecord);

// The uploaded clinical file is never available to clients.
router.get("/:id/file", authorize("rss_staff"), getMedicalRecordFileUrl);

// Update
router.patch(
  "/:id",
  authorize("rss_staff"),
  uploadMedicalFile,
  editMedicalRecord,
);

// Soft delete + restore (staff only; deleted_by is now recorded)
router.post(
  "/:id/restore",
  authorize("rss_staff"),
  restoreMedicalRecordController,
);
router.delete("/:id", authorize("rss_staff"), deleteMedicalRecordController);

export default router;