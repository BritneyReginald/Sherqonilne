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
import { forceClientSite } from "../middleware/clientGuards";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Staff see everything; a client manages their own site's assessments.
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

// Writes: clients are pinned to their own site (any siteId they send is replaced)
router.post("/", forceClientSite, addRiskAssessment);
router.patch("/:id", forceClientSite, editRiskAssessment);

router.post("/:id/logo", upload.single("logo"), uploadLogoController);
router.post("/:id/pdf", upload.single("pdf"), uploadPdfController);

router.delete("/:id", deleteRiskAssessmentController);

export default router;