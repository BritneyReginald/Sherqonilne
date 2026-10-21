"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainingController_1 = require("../controllers/trainingController");
const uploadTraining_1 = require("../middleware/uploadTraining");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
router.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)(`SELECT e.site_id
         FROM training_records tr
         JOIN employees e ON e.id = tr.employee_id
        WHERE tr.id = $1`)));
// Writes: RSS staff only (authorize runs before the upload middleware)
router.post("/", (0, authMiddleware_1.authorize)("rss_staff"), uploadTraining_1.uploadTrainingCertificate, trainingController_1.addTrainingRecord);
// Reads: staff + the client's own site
router.get("/", trainingController_1.getAllTrainingRecords);
router.get("/:id", trainingController_1.getTrainingRecord);
router.get("/:id/file", trainingController_1.getTrainingRecordFileUrl);
router.patch("/:id", (0, authMiddleware_1.authorize)("rss_staff"), trainingController_1.editTrainingRecord);
router.delete("/:id", (0, authMiddleware_1.authorize)("rss_staff"), trainingController_1.deleteTrainingRecordController);
exports.default = router;
