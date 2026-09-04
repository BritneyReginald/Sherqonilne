import { Request, Response } from "express";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  AppointmentInput,
} from "../models/appointment";

function parseAppointmentBody(body: any): AppointmentInput {
  return {
    employeeId: Number(body.employeeId),
    appointmentType: body.appointmentType,
    practitioner: body.practitioner,
    appointmentDate: body.appointmentDate,
    status: body.status || undefined,
    notes: body.notes || null,
  };
}

export const addAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = parseAppointmentBody(req.body);

    if (
      !data.employeeId ||
      !data.appointmentType ||
      !data.practitioner ||
      !data.appointmentDate
    ) {
      res.status(400).json({
        error:
          "employeeId, appointmentType, practitioner, and appointmentDate are required",
      });
      return;
    }

    const appointment = await createAppointment(data);
    res.status(201).json(appointment);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
  }
};

export const getAllAppointments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const appointments = await getAppointments({
      siteLocation: req.query.site as string | undefined,
      appointmentType: req.query.type as string | undefined,
      employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
    });

    res.json(appointments);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const appointment = await getAppointmentById(Number(req.params.id));
    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }
    res.json(appointment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const appointment = await updateAppointment(
      Number(req.params.id),
      parseAppointmentBody(req.body),
    );
    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }
    res.json(appointment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAppointmentController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await deleteAppointment(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }
    res.json({ message: "Appointment permanently deleted", id: deleted.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};