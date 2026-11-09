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
import {
  forceClientSite,
  requireEmployeeInScope,
} from "../middleware/clientGuards";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Staff see everything; a client manages their own site's appointments.
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

// Create: employee must be on the caller's site, and the site is forced.
router.post(
  "/",
  requireEmployeeInScope("employeeId"),
  forceClientSite,
  addLegalAppointment,
);

// Update (renew, e-signature, ...): can't be re-pointed at another site/employee.
router.patch(
  "/:id",
  (req, res, next) => requireEmployeeInScope("employeeId", { optional: true })(req, res, next),
  forceClientSite,
  editLegalAppointment,
);

router.post(
  "/:id/document",
  upload.single("document"),
  uploadLegalAppointmentDocumentController,
);

router.delete("/:id", deleteLegalAppointmentController);

export default router;