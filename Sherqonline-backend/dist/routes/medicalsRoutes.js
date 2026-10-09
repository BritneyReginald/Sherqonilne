"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalsController_1 = require("../controllers/medicalsController");
const upload_1 = require("../middleware/upload");
// OPTIONAL: if you want deleted_by recorded in the recycle bin, import your
// auth middleware and add it to the delete/restore routes below. It only
// identifies the user — there is no role restriction.
// import { authenticate } from "../middleware/auth";
const router = (0, express_1.Router)();
// Create (multipart/form-data — file is optional)
router.post("/", upload_1.uploadMedicalFile, medicalsController_1.addMedicalRecord);
// Read
router.get("/", medicalsController_1.getAllMedicalRecords);
// Recycle bin. "/archived" MUST be registered before "/:id", otherwise
// Express matches "archived" as an id.
router.get("/archived" /*, authenticate */, medicalsController_1.listArchivedMedicalRecords);
router.get("/:id", medicalsController_1.getMedicalRecord);
router.get("/:id/file", medicalsController_1.getMedicalRecordFileUrl);
// Update
router.patch("/:id", upload_1.uploadMedicalFile, medicalsController_1.editMedicalRecord);
// Soft delete + restore (any user; no role check)
router.post("/:id/restore" /*, authenticate */, medicalsController_1.restoreMedicalRecordController);
router.delete("/:id" /*, authenticate */, medicalsController_1.deleteMedicalRecordController);
exports.default = router;
