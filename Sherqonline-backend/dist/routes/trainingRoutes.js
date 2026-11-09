"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainingController_1 = require("../controllers/trainingController");
const uploadTraining_1 = require("../middleware/uploadTraining");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const clientGuards_1 = require("../middleware/clientGuards");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
router.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)(`SELECT e.site_id
         FROM training_records tr
         JOIN employees e ON e.id = tr.employee_id
        WHERE tr.id = $1`)));
// Create: clients can add records, but only for employees on their own site.
// The guard runs AFTER multer so the multipart fields are parsed.
router.post("/", uploadTraining_1.uploadTrainingCertificate, (0, clientGuards_1.requireEmployeeInScope)("employeeId"), trainingController_1.addTrainingRecord);
// Reads (controller filters the list with siteIdsFor(req))
router.get("/", trainingController_1.getAllTrainingRecords);
router.get("/:id", trainingController_1.getTrainingRecord);
router.get("/:id/file", trainingController_1.getTrainingRecordFileUrl);
// Update: may not be re-pointed at another site's employee
router.patch("/:id", (req, res, next) => (0, clientGuards_1.requireEmployeeInScope)("employeeId", { optional: true })(req, res, next), trainingController_1.editTrainingRecord);
router.delete("/:id", trainingController_1.deleteTrainingRecordController);
exports.default = router;
