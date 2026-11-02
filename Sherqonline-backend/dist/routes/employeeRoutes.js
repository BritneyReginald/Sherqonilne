"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const employeeController_1 = require("../controllers/employeeController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
// Create
router.post("/", employeeController_1.addEmployee);
// Read
router.get("/", employeeController_1.getAllEmployees);
router.get("/:id", employeeController_1.getEmployee);
// Update
router.patch("/:id", employeeController_1.editEmployee);
// File uploads
router.post("/:id/id-document", upload.single("idDocument"), employeeController_1.uploadIdDocumentController);
router.post("/:id/profile-picture", upload.single("profilePicture"), employeeController_1.uploadProfilePictureController);
// Soft delete
router.patch("/:id/deactivate", employeeController_1.deactivateEmployeeController);
// Restore a deactivated employee
router.patch("/:id/activate", employeeController_1.activateEmployeeController);
// Hard delete
router.delete("/:id", employeeController_1.deleteEmployeeController);
exports.default = router;
