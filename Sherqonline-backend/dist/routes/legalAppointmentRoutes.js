"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const legalAppointmentController_1 = require("../controllers/legalAppointmentController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
// Create
router.post("/", legalAppointmentController_1.addLegalAppointment);
// Read
router.get("/", legalAppointmentController_1.getAllLegalAppointments);
router.get("/:id", legalAppointmentController_1.getLegalAppointment);
// Update
router.patch("/:id", legalAppointmentController_1.editLegalAppointment);
// Signed document upload
router.post("/:id/document", upload.single("document"), legalAppointmentController_1.uploadLegalAppointmentDocumentController);
// Delete
router.delete("/:id", legalAppointmentController_1.deleteLegalAppointmentController);
exports.default = router;
