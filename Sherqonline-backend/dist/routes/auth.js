"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auth.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public: one endpoint per role, matching your 3 separate login pages
router.post("/login/staff", authController_1.loginStaff);
router.post("/login/client", authController_1.loginClient);
router.post("/login/inspector", authController_1.loginInspector);
// RSS-only: create logins for clients/inspectors
router.post("/credentials/client", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), authController_1.issueClientCredentials);
router.post("/credentials/inspector", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), authController_1.issueInspectorCredentials);
exports.default = router;
