"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.getAppointments = getAppointments;
exports.getAppointmentById = getAppointmentById;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
const db_1 = __importDefault(require("../config/db"));
// Every SELECT:
//  - joins employees live for current name/work ID/site
//  - derives has_restrictions from medical_records rather than
//    storing a flag that could go stale
//  - auto-promotes a Pending/Confirmed appointment to "Overdue"
//    once its date has passed, without needing a cron job or
//    anyone remembering to update it by hand
const SELECT_BASE = `
  SELECT
    a.id,
    a.employee_id,
    e.employee_number   AS work_id,
    e.full_name          AS employee_name,
    e.site_location,
    a.appointment_type,
    a.practitioner,
    a.appointment_date,
    CASE
      WHEN a.status IN ('Pending', 'Confirmed') AND a.appointment_date < NOW()
        THEN 'Overdue'
      ELSE a.status
    END AS status,
    a.status AS raw_status,
    a.notes,
    EXISTS (
      SELECT 1 FROM medical_records mr
      WHERE mr.employee_id = a.employee_id
        AND mr.fitness_status IN ('fit-with-restrictions', 'unfit')
    ) AS has_restrictions,
    a.created_at,
    a.updated_at
  FROM appointments a
  JOIN employees e ON e.id = a.employee_id
`;
async function createAppointment(data) {
    const result = await db_1.default.query(`
    INSERT INTO appointments (
      employee_id, appointment_type, practitioner, appointment_date, status, notes
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id
    `, [
        data.employeeId,
        data.appointmentType,
        data.practitioner,
        data.appointmentDate,
        data.status || "Pending",
        data.notes || null,
    ]);
    return getAppointmentById(result.rows[0].id);
}
async function getAppointments(filters) {
    const conditions = [];
    const values = [];
    if (filters.employeeId) {
        values.push(filters.employeeId);
        conditions.push(`a.employee_id = $${values.length}`);
    }
    if (filters.siteLocation && filters.siteLocation !== "all") {
        values.push(filters.siteLocation);
        conditions.push(`e.site_location = $${values.length}`);
    }
    if (filters.appointmentType && filters.appointmentType !== "all") {
        values.push(filters.appointmentType);
        conditions.push(`a.appointment_type = $${values.length}`);
    }
    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
    const result = await db_1.default.query(`${SELECT_BASE} ${whereClause} ORDER BY a.appointment_date ASC`, values);
    return result.rows;
}
async function getAppointmentById(id) {
    const result = await db_1.default.query(`${SELECT_BASE} WHERE a.id = $1`, [id]);
    return result.rows[0] || null;
}
async function updateAppointment(id, data) {
    const fields = [];
    const values = [];
    const fieldMap = {
        appointmentType: "appointment_type",
        practitioner: "practitioner",
        appointmentDate: "appointment_date",
        status: "status",
        notes: "notes",
    };
    for (const [key, column] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length === 0) {
        return getAppointmentById(id);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    await db_1.default.query(`UPDATE appointments SET ${fields.join(", ")} WHERE id = $${values.length}`, values);
    return getAppointmentById(id);
}
async function deleteAppointment(id) {
    const result = await db_1.default.query(`DELETE FROM appointments WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
}
