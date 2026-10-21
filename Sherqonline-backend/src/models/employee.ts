import pool from "../config/db";
import { Employee } from "../types";
import { resolveSite } from "./siteResolver";

/**
 * The frontend may send either `siteId` (preferred) or just the site
 * name in `siteLocation` (what the Workforce form sends today). Both
 * are resolved to a real sites row, and site_id + site_location are
 * always written together so they can't drift apart.
 */
export type EmployeeInput = Employee & { siteId?: number | string | null };

export const createEmployee = async (employee: EmployeeInput) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const site = await resolveSite(
      { siteId: employee.siteId, siteLocation: employee.siteLocation },
      client,
    );

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
        worker_type,
        site_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25
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
        site.name,
        employee.employmentType || null,
        employee.startDate || null,
        employee.contractEndDate || null,
        employee.salaryGrade || null,
        employee.workSchedule || null,
        employee.complianceStatus || "compliant",
        employee.status || "Active",
        employee.workerType || "Internal",
        site.id,
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
  employee: Partial<EmployeeInput>,
) => {
  // siteLocation / siteId are handled separately below so the two
  // columns are always written together.
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
    employmentType: "employment_type",
    workerType: "worker_type",
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

  const touchesSite =
    employee.siteId !== undefined || employee.siteLocation !== undefined;

  if (touchesSite) {
    const current = await getEmployeeById(id);
    if (!current) return undefined;

    // Profile screens often re-send the whole record. Only treat the
    // site as changed if it actually differs from what's stored, so an
    // unrelated edit never fails on an old, unmatched site name.
    const hasSiteId =
      employee.siteId !== undefined &&
      employee.siteId !== null &&
      employee.siteId !== "";

    const sameId = hasSiteId && Number(employee.siteId) === current.site_id;
    const sameName =
      employee.siteId === undefined &&
      (employee.siteLocation ?? "").trim() ===
        (current.site_location ?? "").trim();

    if (!sameId && !sameName) {
      const site = await resolveSite({
        siteId: employee.siteId,
        siteLocation: employee.siteLocation,
      });

      updates.push(`site_id = $${index}`);
      values.push(site.id);
      index++;

      updates.push(`site_location = $${index}`);
      values.push(site.name);
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