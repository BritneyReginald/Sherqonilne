"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployee = exports.deleteEmployee = exports.deactivateEmployee = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const db_1 = __importDefault(require("../config/db"));
const createEmployee = async (employee) => {
    const result = await db_1.default.query(`INSERT INTO employees (
      full_name, date_of_birth, id_number, gender, nationality,
      email, phone, mobile, address, reporting_manager, reporting_manager_id,
      reporting_manager_job_title, reporting_manager_legal_appointment,
      department, division, organisational_level, emergency_contact,
      relationship, emergency_phone, job_title, site_location,
      employment_type, start_date, contract_end_date,
      salary_grade, work_schedule, compliance_status, status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28
    )
    RETURNING *`, [
        employee.fullName,
        employee.dateOfBirth,
        employee.idNumber,
        employee.gender,
        employee.nationality,
        employee.email,
        employee.phone,
        employee.mobile,
        employee.address,
        employee.reportingManager,
        employee.reportingManagerId,
        employee.reportingManagerJobTitle,
        employee.reportingManagerLegalAppointment,
        employee.department,
        employee.division,
        employee.organisationalLevel,
        employee.emergencyContact,
        employee.relationship,
        employee.emergencyPhone,
        employee.jobTitle,
        employee.siteLocation,
        employee.employmentType,
        employee.startDate,
        employee.contractEndDate,
        employee.salaryGrade,
        employee.workSchedule,
        employee.complianceStatus,
        employee.status,
    ]);
    const newId = result.rows[0].id;
    const employeeId = `EMP${newId.toString().padStart(3, "0")}`;
    const updatedResult = await db_1.default.query(`
      UPDATE employees
      SET employee_id = $1
      WHERE id = $2
      RETURNING *
    `, [employeeId, newId]);
    return updatedResult.rows[0];
};
exports.createEmployee = createEmployee;
const getEmployees = async () => {
    const result = await db_1.default.query("SELECT * FROM employees ORDER BY id");
    return result.rows;
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (id) => {
    const result = await db_1.default.query("SELECT * FROM employees WHERE id = $1", [id]);
    return result.rows[0];
};
exports.getEmployeeById = getEmployeeById;
const deactivateEmployee = async (id) => {
    const result = await db_1.default.query(`
    UPDATE employees
    SET status = 'Inactive'
    WHERE id = $1
    RETURNING *
    `, [id]);
    return result.rows[0];
};
exports.deactivateEmployee = deactivateEmployee;
const deleteEmployee = async (id) => {
    const result = await db_1.default.query(`
    DELETE FROM employees
    WHERE id = $1
    RETURNING id
    `, [id]);
    return result.rows[0];
};
exports.deleteEmployee = deleteEmployee;
const updateEmployee = async (id, employee) => {
    // Convert frontend camelCase fields to database snake_case fields
    const fieldMap = {
        fullName: "full_name",
        dateOfBirth: "date_of_birth",
        idNumber: "id_number",
        gender: "gender",
        nationality: "nationality",
        email: "email",
        phone: "phone",
        mobile: "mobile",
        address: "address",
        reportingManager: "reporting_manager",
        reportingManagerId: "reporting_manager_id",
        reportingManagerJobTitle: "reporting_manager_job_title",
        reportingManagerLegalAppointment: "reporting_manager_legal_appointment",
        department: "department",
        division: "division",
        organisationalLevel: "organisational_level",
        emergencyContact: "emergency_contact",
        relationship: "relationship",
        emergencyPhone: "emergency_phone",
        jobTitle: "job_title",
        siteLocation: "site_location",
        employmentType: "employment_type",
        salaryGrade: "salary_grade",
        startDate: "start_date",
        contractEndDate: "contract_end_date",
        workSchedule: "work_schedule",
        complianceStatus: "compliance_status",
        status: "status",
    };
    const updates = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(employee)) {
        if (value !== undefined && fieldMap[key]) {
            updates.push(`${fieldMap[key]} = $${index}`);
            values.push(value);
            index++;
        }
    }
    if (updates.length === 0) {
        throw new Error("No fields supplied for update.");
    }
    values.push(id);
    const query = `
      UPDATE employees
      SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;
    const result = await db_1.default.query(query, values);
    return result.rows[0];
};
exports.updateEmployee = updateEmployee;
