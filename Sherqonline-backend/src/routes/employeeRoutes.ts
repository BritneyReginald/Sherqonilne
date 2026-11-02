import { Router } from "express";
import multer from "multer";

import {
  addEmployee,
  getAllEmployees,
  getEmployee,
  editEmployee,
  deactivateEmployeeController,
  activateEmployeeController,
  deleteEmployeeController,
  uploadIdDocumentController,
  uploadProfilePictureController,
} from "../controllers/employeeController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Create
router.post("/", addEmployee);

// Read
router.get("/", getAllEmployees);
router.get("/:id", getEmployee);

// Update
router.patch("/:id", editEmployee);

// File uploads
router.post(
  "/:id/id-document",
  upload.single("idDocument"),
  uploadIdDocumentController,
);
router.post(
  "/:id/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePictureController,
);

// Soft delete
router.patch("/:id/deactivate", deactivateEmployeeController);

// Restore a deactivated employee
router.patch("/:id/activate", activateEmployeeController);

// Hard delete
router.delete("/:id", deleteEmployeeController);

export default router;