import { Router } from "express";

import {
  addAppointment,
  getAllAppointments,
  getAppointment,
  editAppointment,
  deleteAppointmentController,
} from "../controllers/appointmentController";

const router = Router();

// Create
router.post("/", addAppointment);

// Read
router.get("/", getAllAppointments);
router.get("/:id", getAppointment);

// Update
router.patch("/:id", editAppointment);

// Hard delete
router.delete("/:id", deleteAppointmentController);

export default router;