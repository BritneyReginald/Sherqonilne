"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const router = (0, express_1.Router)();
// Create
router.post("/", employeeController_1.addEmployee);
// Read
router.get("/", employeeController_1.getAllEmployees);
router.get("/:id", employeeController_1.getEmployee);
// Update
router.patch("/:id", employeeController_1.editEmployee);
// Soft delete
router.patch("/:id/deactivate", employeeController_1.deactivateEmployeeController);
// Hard delete
router.delete("/:id", employeeController_1.deleteEmployeeController);
exports.default = router;
