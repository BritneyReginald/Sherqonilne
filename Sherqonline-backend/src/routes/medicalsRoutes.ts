import { Router } from "express";

import {
  addMedicalRecord,
  getAllMedicalRecords,
  getMedicalRecord,
  editMedicalRecord,
  deleteMedicalRecordController,
  getMedicalRecordFileUrl,
} from "../controllers/medicalsController";

import { uploadMedicalFile } from "../middleware/upload";

const router = Router();

// Create (multipart/form-data — file is optional)
router.post("/", uploadMedicalFile, addMedicalRecord);

// Read
router.get("/", getAllMedicalRecords);
router.get("/:id", getMedicalRecord);
router.get("/:id/file", getMedicalRecordFileUrl);

// Update
router.patch("/:id", uploadMedicalFile, editMedicalRecord);

// Hard delete
router.delete("/:id", deleteMedicalRecordController);

export default router;
