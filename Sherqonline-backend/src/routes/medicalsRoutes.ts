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
// OPTIONAL: if you want deleted_by recorded in the recycle bin, import your
// auth middleware and add it to the delete/restore routes below. It only
// identifies the user — there is no role restriction.
// import { authenticate } from "../middleware/auth";

const router = Router();

// Create (multipart/form-data — file is optional)
router.post("/", uploadMedicalFile, addMedicalRecord);

// Read
router.get("/", getAllMedicalRecords);

// Recycle bin. "/archived" MUST be registered before "/:id", otherwise
// Express matches "archived" as an id.
router.get("/archived" /*, authenticate */, listArchivedMedicalRecords);

router.get("/:id", getMedicalRecord);
router.get("/:id/file", getMedicalRecordFileUrl);

// Update
router.patch("/:id", uploadMedicalFile, editMedicalRecord);

// Soft delete + restore (any user; no role check)
router.post("/:id/restore" /*, authenticate */, restoreMedicalRecordController);
router.delete("/:id" /*, authenticate */, deleteMedicalRecordController);

export default router;