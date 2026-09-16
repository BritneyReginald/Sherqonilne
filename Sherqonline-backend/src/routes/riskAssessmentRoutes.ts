import { Router } from "express";
import multer from "multer";

import {
  addRiskAssessment,
  getAllRiskAssessments,
  getRiskAssessment,
  editRiskAssessment,
  deleteRiskAssessmentController,
  uploadLogoController,
  uploadPdfController,
} from "../controllers/riskAssessmentController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post("/", addRiskAssessment);
router.get("/", getAllRiskAssessments);
router.get("/:id", getRiskAssessment);
router.patch("/:id", editRiskAssessment);

router.post("/:id/logo", upload.single("logo"), uploadLogoController);
router.post("/:id/pdf", upload.single("pdf"), uploadPdfController);

router.delete("/:id", deleteRiskAssessmentController);

export default router;