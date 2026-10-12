import pool from "../config/db";
import { Employee } from "../types";

export const createEmployee = async (employee: Employee) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get the next database ID
    const idResult = await client.query(
      `SELECT nextval('employees_id_seq') AS id`,
    );

    const newId = Number(idResult.rows[0].id);

    // Auto-generate employee number: EMP001, EMP002, EMP003 …
    const employeeNumber = `EMP${newId.toString().padStart(3, "0")}`;

    const result = await client.query(
      `
      INSERT INTO employees (
        id,
        employee_number,
        full_name,
        date_of_birth,
        gender,
        nationality,
        email,
        phone,
        mobile,
        address,
        reporting_manager,
        emergency_contact,
        relationship,
        emergency_phone,
        job_title,
        site_location,
        employment_type,
        start_date,
        contract_end_date,
        salary_grade,
        work_schedule,
        compliance_status,
        status,
        worker_type
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24
      )
      RETURNING *
      `,
      [
        newId,
        employeeNumber,
        employee.fullName,
        employee.dateOfBirth || null,
        employee.gender || null,
        employee.nationality || null,
        employee.email || null,
        employee.phone || null,
        employee.mobile || null,
        employee.address || null,
        employee.reportingManager || null,
        employee.emergencyContact || null,
        employee.relationship || null,
        employee.emergencyPhone || null,
        employee.jobTitle || null,
        employee.siteLocation || null,
        employee.employmentType || null,
        employee.startDate || null,
        employee.contractEndDate || null,
        employee.salaryGrade || null,
        employee.workSchedule || null,
        employee.complianceStatus || "compliant",
        employee.status || "Active",
        employee.workerType || "Internal",
      ],
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getEmployees = async () => {
  const result = await pool.query("SELECT * FROM employees ORDER BY id");
  return result.rows;
};

export const getEmployeeById = async (id: number) => {
  const result = await pool.query("SELECT * FROM employees WHERE id = $1", [
    id,
  ]);
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
    [id],
  );

  return result.rows[0];
};

export const deleteEmployee = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM employees
    WHERE id = $1
    RETURNING id, id_document_blob_name, profile_picture_blob_name
    `,
    [id],
  );

  return result.rows[0];
};

export const updateEmployee = async (
  id: number,
  employee: Partial<Employee>,
) => {
  const fieldMap: Record<string, string> = {
    fullName: "full_name",
    dateOfBirth: "date_of_birth",
    gender: "gender",
    nationality: "nationality",
    email: "email",
    phone: "phone",
    mobile: "mobile",
    address: "address",
    reportingManager: "reporting_manager",
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

    idDocumentBlobName: "id_document_blob_name",
    idDocumentFileName: "id_document_file_name",
    idDocumentSize: "id_document_size",
    idDocumentMimeType: "id_document_mime_type",

    profilePictureBlobName: "profile_picture_blob_name",
    profilePictureFileName: "profile_picture_file_name",
    profilePictureSize: "profile_picture_size",
    profilePictureMimeType: "profile_picture_mime_type",
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