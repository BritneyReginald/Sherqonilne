"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalsController_1 = require("../controllers/medicalsController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Create (multipart/form-data — file is optional)
router.post("/", upload_1.uploadMedicalFile, medicalsController_1.addMedicalRecord);
// Read
router.get("/", medicalsController_1.getAllMedicalRecords);
router.get("/:id", medicalsController_1.getMedicalRecord);
router.get("/:id/file", medicalsController_1.getMedicalRecordFileUrl);
// Update
router.patch("/:id", upload_1.uploadMedicalFile, medicalsController_1.editMedicalRecord);
// Hard delete
router.delete("/:id", medicalsController_1.deleteMedicalRecordController);
exports.default = router;
