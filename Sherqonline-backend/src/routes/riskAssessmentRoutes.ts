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

import {
  authenticate,
  authorize,
  scopeSites,
} from "../middleware/authMiddleware";
import { scopeByIdParam, lookupSite } from "../middleware/siteScope";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Staff see everything; a client sees (read-only) their own site only.
router.use(authenticate, authorize("rss_staff", "client"), scopeSites);

router.param(
  "id",
  scopeByIdParam(
    lookupSite("SELECT site_id FROM risk_assessments WHERE id = $1"),
  ),
);

// Reads
router.get("/", getAllRiskAssessments);
router.get("/:id", getRiskAssessment);

// Writes: RSS staff only (authorize runs before the upload middleware)
router.post("/", authorize("rss_staff"), addRiskAssessment);
router.patch("/:id", authorize("rss_staff"), editRiskAssessment);

router.post(
  "/:id/logo",
  authorize("rss_staff"),
  upload.single("logo"),
  uploadLogoController,
);
router.post(
  "/:id/pdf",
  authorize("rss_staff"),
  upload.single("pdf"),
  uploadPdfController,
);

router.delete("/:id", authorize("rss_staff"), deleteRiskAssessmentController);

export default router;