// routes/auth.ts
import { Router } from "express";
import {
  loginStaff,
  loginClient,
  loginInspector,
  loginFirstAider,
  issueClientCredentials,
  issueInspectorCredentials,
} from "../controllers/authController";
import {
  getClientPassword,
  resetClientPassword,
} from "../controllers/clientPasswordController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Public: one endpoint per role, matching your 3 separate login pages
router.post("/login/staff", loginStaff);
router.post("/login/client", loginClient);
router.post("/login/inspector", loginInspector);
router.post("/login/first-aider", loginFirstAider);

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

// RSS-only: view the password of a site's client login
router.get(
  "/credentials/client/:siteId/password",
  authenticate,
  authorize("rss_staff"),
  getClientPassword
);

// RSS-only: generate a new password for a site's existing client login
router.post(
  "/credentials/client/:siteId/reset-password",
  authenticate,
  authorize("rss_staff"),
  resetClientPassword
);

export default router;