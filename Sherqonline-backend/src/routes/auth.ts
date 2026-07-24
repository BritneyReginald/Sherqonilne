// routes/auth.ts
import { Router } from "express";
import {
  loginStaff,
  loginClient,
  loginInspector,
  issueClientCredentials,
  issueInspectorCredentials,
} from "../controllers/authController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Public: one endpoint per role, matching your 3 separate login pages
router.post("/login/staff", loginStaff);
router.post("/login/client", loginClient);
router.post("/login/inspector", loginInspector);

// RSS-only: create logins for clients/inspectors
router.post(
  "/credentials/client",
  authenticate,
  authorize("rss_staff"),
  issueClientCredentials
);
router.post(
  "/credentials/inspector",
  authenticate,
  authorize("rss_staff"),
  issueInspectorCredentials
);

export default router;