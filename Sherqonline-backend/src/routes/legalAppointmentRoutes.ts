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

// Any route with :id is checked against the caller's sites first.
router.param(
  "id",
  scopeByIdParam(
    lookupSite("SELECT site_id FROM legal_appointments WHERE id = $1"),
  ),
);

// Read
router.get("/", getAllLegalAppointments);
router.get("/:id", getLegalAppointment);

// Writes: RSS staff only
router.post("/", authorize("rss_staff"), addLegalAppointment);
router.patch("/:id", authorize("rss_staff"), editLegalAppointment);

router.post(
  "/:id/document",
  authorize("rss_staff"),
  upload.single("document"),
  uploadLegalAppointmentDocumentController,
);

router.delete("/:id", authorize("rss_staff"), deleteLegalAppointmentController);

export default router;
