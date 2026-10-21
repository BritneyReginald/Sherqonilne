"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const legalAppointmentController_1 = require("../controllers/legalAppointmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
// Staff see everything; a client sees (read-only) their own site only.
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
// Any route with :id is checked against the caller's sites first.
router.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)("SELECT site_id FROM legal_appointments WHERE id = $1")));
// Read
router.get("/", legalAppointmentController_1.getAllLegalAppointments);
router.get("/:id", legalAppointmentController_1.getLegalAppointment);
// Writes: RSS staff only
router.post("/", (0, authMiddleware_1.authorize)("rss_staff"), legalAppointmentController_1.addLegalAppointment);
router.patch("/:id", (0, authMiddleware_1.authorize)("rss_staff"), legalAppointmentController_1.editLegalAppointment);
router.post("/:id/document", (0, authMiddleware_1.authorize)("rss_staff"), upload.single("document"), legalAppointmentController_1.uploadLegalAppointmentDocumentController);
router.delete("/:id", (0, authMiddleware_1.authorize)("rss_staff"), legalAppointmentController_1.deleteLegalAppointmentController);
exports.default = router;
