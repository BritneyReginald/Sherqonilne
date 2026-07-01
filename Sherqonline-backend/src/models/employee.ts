import pool from "../config/db";
import { Employee } from "../types";

import pool from "../config/db";
import { Employee } from "../types";

export const createEmployee = async (employee: Employee) => {
  const result = await pool.query(
    `INSERT INTO employees (
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
    RETURNING *`,
    [
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
    ]
  );

  const newId = result.rows[0].id;
  const employeeId = `EMP${newId.toString().padStart(3, "0")}`;

  const updatedResult = await pool.query(
    `
      UPDATE employees
      SET employee_id = $1
      WHERE id = $2
      RETURNING *
    `,
    [employeeId, newId]
  );

  return updatedResult.rows[0];
};

export const getEmployees = async () => {
  const result = await pool.query(
    "SELECT * FROM employees ORDER BY id"
  );

  return result.rows;
};

export const getEmployeeById = async (id: number) => {
  const result = await pool.query(
    "SELECT * FROM employees WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

export const deactivateEmployee = async (id: number) => {
  const result = await pool.query(
    `
    UPDATE employees
    SET status = 'Inactive'
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

export const deleteEmployee = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM employees
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};

export const updateEmployee = async (
  id: number,
  employee: Partial<Employee>
) => {
  // Convert frontend camelCase fields to database snake_case fields
  const fieldMap: Record<string, string> = {
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
    reportingManagerLegalAppointment:
      "reporting_manager_legal_appointment",
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

  const updates: string[] = [];
  const values: any[] = [];

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

  const result = await pool.query(query, values);

  return result.rows[0];
};