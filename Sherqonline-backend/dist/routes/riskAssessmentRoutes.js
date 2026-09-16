"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const riskAssessmentController_1 = require("../controllers/riskAssessmentController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
router.post("/", riskAssessmentController_1.addRiskAssessment);
router.get("/", riskAssessmentController_1.getAllRiskAssessments);
router.get("/:id", riskAssessmentController_1.getRiskAssessment);
router.patch("/:id", riskAssessmentController_1.editRiskAssessment);
router.post("/:id/logo", upload.single("logo"), riskAssessmentController_1.uploadLogoController);
router.post("/:id/pdf", upload.single("pdf"), riskAssessmentController_1.uploadPdfController);
router.delete("/:id", riskAssessmentController_1.deleteRiskAssessmentController);
exports.default = router;
