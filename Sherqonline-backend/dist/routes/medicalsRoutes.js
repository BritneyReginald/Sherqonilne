"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalsController_1 = require("../controllers/medicalsController");
const upload_1 = require("../middleware/upload");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
router.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)(`SELECT e.site_id
         FROM medical_records mr
         JOIN employees e ON e.id = mr.employee_id
        WHERE mr.id = $1 AND mr.deleted_at IS NULL`)));
// Create (multipart/form-data — file is optional). Staff only.
router.post("/", (0, authMiddleware_1.authorize)("rss_staff"), upload_1.uploadMedicalFile, medicalsController_1.addMedicalRecord);
// Read (clients get the certificate view for their own site only)
router.get("/", medicalsController_1.getAllMedicalRecords);
// Recycle bin. "/archived" MUST be registered before "/:id", otherwise
// Express matches "archived" as an id.
router.get("/archived", (0, authMiddleware_1.authorize)("rss_staff"), medicalsController_1.listArchivedMedicalRecords);
router.get("/:id", medicalsController_1.getMedicalRecord);
// The uploaded clinical file is never available to clients.
router.get("/:id/file", (0, authMiddleware_1.authorize)("rss_staff"), medicalsController_1.getMedicalRecordFileUrl);
// Update
router.patch("/:id", (0, authMiddleware_1.authorize)("rss_staff"), upload_1.uploadMedicalFile, medicalsController_1.editMedicalRecord);
// Soft delete + restore (staff only; deleted_by is now recorded)
router.post("/:id/restore", (0, authMiddleware_1.authorize)("rss_staff"), medicalsController_1.restoreMedicalRecordController);
router.delete("/:id", (0, authMiddleware_1.authorize)("rss_staff"), medicalsController_1.deleteMedicalRecordController);
exports.default = router;
