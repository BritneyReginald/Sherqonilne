"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointmentController = exports.editAppointment = exports.getAppointment = exports.getAllAppointments = exports.addAppointment = void 0;
const appointment_1 = require("../models/appointment");
function parseAppointmentBody(body) {
    return {
        employeeId: Number(body.employeeId),
        appointmentType: body.appointmentType,
        practitioner: body.practitioner,
        appointmentDate: body.appointmentDate,
        status: body.status || undefined,
        notes: body.notes || null,
    };
}
const addAppointment = async (req, res) => {
    try {
        const data = parseAppointmentBody(req.body);
        if (!data.employeeId ||
            !data.appointmentType ||
            !data.practitioner ||
            !data.appointmentDate) {
            res.status(400).json({
                error: "employeeId, appointmentType, practitioner, and appointmentDate are required",
            });
            return;
        }
        const appointment = await (0, appointment_1.createAppointment)(data);
        res.status(201).json(appointment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
    }
};
exports.addAppointment = addAppointment;
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await (0, appointment_1.getAppointments)({
            siteLocation: req.query.site,
            appointmentType: req.query.type,
            employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
        });
        res.json(appointments);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllAppointments = getAllAppointments;
const getAppointment = async (req, res) => {
    try {
        const appointment = await (0, appointment_1.getAppointmentById)(Number(req.params.id));
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }
        res.json(appointment);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAppointment = getAppointment;
const editAppointment = async (req, res) => {
    try {
        const appointment = await (0, appointment_1.updateAppointment)(Number(req.params.id), parseAppointmentBody(req.body));
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }
        res.json(appointment);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.editAppointment = editAppointment;
const deleteAppointmentController = async (req, res) => {
    try {
        const deleted = await (0, appointment_1.deleteAppointment)(Number(req.params.id));
        if (!deleted) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }
        res.json({ message: "Appointment permanently deleted", id: deleted.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAppointmentController = deleteAppointmentController;
