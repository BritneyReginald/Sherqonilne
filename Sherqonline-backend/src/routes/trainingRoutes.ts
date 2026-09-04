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

const router = Router();

router.post("/", uploadTrainingCertificate, addTrainingRecord);

router.get("/", getAllTrainingRecords);
router.get("/:id", getTrainingRecord);
router.get("/:id/file", getTrainingRecordFileUrl);

router.patch("/:id", editTrainingRecord);

router.delete("/:id", deleteTrainingRecordController);

export default router;