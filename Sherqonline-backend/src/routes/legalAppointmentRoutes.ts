import { Router } from "express";
import multer from "multer";

import {
  addLegalAppointment,
  getAllLegalAppointments,
  getLegalAppointment,
  editLegalAppointment,
  deleteLegalAppointmentController,
  uploadLegalAppointmentDocumentController,
} from "../controllers/legalAppointmentController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Create
router.post("/", addLegalAppointment);

// Read
router.get("/", getAllLegalAppointments);
router.get("/:id", getLegalAppointment);

// Update
router.patch("/:id", editLegalAppointment);

// Signed document upload
router.post(
  "/:id/document",
  upload.single("document"),
  uploadLegalAppointmentDocumentController,
);

// Delete
router.delete("/:id", deleteLegalAppointmentController);

export default router;