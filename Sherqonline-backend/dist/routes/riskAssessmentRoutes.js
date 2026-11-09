"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const riskAssessmentController_1 = require("../controllers/riskAssessmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const clientGuards_1 = require("../middleware/clientGuards");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
// Staff see everything; a client manages their own site's assessments.
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
router.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)("SELECT site_id FROM risk_assessments WHERE id = $1")));
// Reads
router.get("/", riskAssessmentController_1.getAllRiskAssessments);
router.get("/:id", riskAssessmentController_1.getRiskAssessment);
// Writes: clients are pinned to their own site (any siteId they send is replaced)
router.post("/", clientGuards_1.forceClientSite, riskAssessmentController_1.addRiskAssessment);
router.patch("/:id", clientGuards_1.forceClientSite, riskAssessmentController_1.editRiskAssessment);
router.post("/:id/logo", upload.single("logo"), riskAssessmentController_1.uploadLogoController);
router.post("/:id/pdf", upload.single("pdf"), riskAssessmentController_1.uploadPdfController);
router.delete("/:id", riskAssessmentController_1.deleteRiskAssessmentController);
exports.default = router;
