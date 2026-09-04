"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const router = (0, express_1.Router)();
// Create
router.post("/", appointmentController_1.addAppointment);
// Read
router.get("/", appointmentController_1.getAllAppointments);
router.get("/:id", appointmentController_1.getAppointment);
// Update
router.patch("/:id", appointmentController_1.editAppointment);
// Hard delete
router.delete("/:id", appointmentController_1.deleteAppointmentController);
exports.default = router;
