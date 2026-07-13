import { Router } from "express";

import {
  addEmployee,
  getAllEmployees,
  getEmployee,
  editEmployee,
  deactivateEmployeeController,
  deleteEmployeeController,
} from "../controllers/employeeController";

const router = Router();

// Create
router.post("/", addEmployee);

// Read
router.get("/", getAllEmployees);
router.get("/:id", getEmployee);

// Update
router.patch("/:id", editEmployee);

// Soft delete
router.patch("/:id/deactivate", deactivateEmployeeController);

// Hard delete
router.delete("/:id", deleteEmployeeController);

export default router;