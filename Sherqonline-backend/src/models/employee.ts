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

/*
 * ------------------------------------------------------------
 * COMPLIANCE (derived from the compliance modules)
 * ------------------------------------------------------------
 * Same rules as the Dashboard:
 *
 *   Legal appointments : expired OR no signature/document -> action
 *                        ends within 30 days              -> review
 *   Training           : latest per certificate; expired  -> action
 *                        expiring within 30 days          -> review
 *   Medicals           : latest exam per employee; same expiry rules
 *   PPE                : latest issue per item; replacement overdue
 *                        -> action, due within 30 days    -> review
 *
 * If the employee has NO records in any of those modules, the stored
 * compliance_status (chosen when onboarding / editing) is used as is.
 * As soon as any record exists, the status comes from the modules.
 *
 * Records are matched to the employee by id, falling back to employee
 * number (legal appointments) or name (PPE) when the id link is empty.
 * ------------------------------------------------------------
 */
const EMPLOYEES_WITH_COMPLIANCE_SQL = `
  WITH legal AS (
    SELECT e.id AS employee_id,
           la.end_date, la.status, la.signature_data, la.document_blob_name
    FROM legal_appointments la
    JOIN employees e
      ON e.id = la.employee_id
      OR (la.employee_id IS NULL AND e.employee_number = la.employee_number)
  ),
  training AS (
    SELECT DISTINCT ON (employee_id, certificate_name)
      employee_id, expiry_date
    FROM training_records
    ORDER BY employee_id, certificate_name, expiry_date DESC, id DESC
  ),
  medical AS (
    SELECT DISTINCT ON (employee_id)
      employee_id, expiry_date
    FROM medical_records
    WHERE deleted_at IS NULL
    ORDER BY employee_id, exam_date DESC, id DESC
  ),
  ppe AS (
    SELECT DISTINCT ON (e.id, COALESCE(pt.ppe_item_id::text, pt.ppe_item_name))
      e.id AS employee_id, pt.replacement_due
    FROM ppe_transactions pt
    JOIN employees e
      ON e.id = pt.employee_id
      OR (pt.employee_id IS NULL AND e.full_name = pt.employee_name)
    WHERE pt.deleted_at IS NULL
    ORDER BY e.id, COALESCE(pt.ppe_item_id::text, pt.ppe_item_name),
             pt.issue_date DESC, pt.id DESC
  ),
  issues AS (
    SELECT employee_id,
      CASE
        WHEN end_date < CURRENT_DATE
          OR status = 'Expired'
          OR (signature_data IS NULL AND document_blob_name IS NULL) THEN 'action'
        WHEN end_date <= CURRENT_DATE + 30 THEN 'review'
      END AS level
    FROM legal

    UNION ALL

    SELECT employee_id,
      CASE
        WHEN expiry_date < CURRENT_DATE THEN 'action'
        WHEN expiry_date <= CURRENT_DATE + 30 THEN 'review'
      END
    FROM training

    UNION ALL

    SELECT employee_id,
      CASE
        WHEN expiry_date < CURRENT_DATE THEN 'action'
        WHEN expiry_date <= CURRENT_DATE + 30 THEN 'review'
      END
    FROM medical

    UNION ALL

    SELECT employee_id,
      CASE
        WHEN replacement_due < CURRENT_DATE THEN 'action'
        WHEN replacement_due <= CURRENT_DATE + 30 THEN 'review'
      END
    FROM ppe
  ),
  rolled AS (
    SELECT employee_id,
           bool_or(level = 'action') AS has_action,
           bool_or(level = 'review') AS has_review
    FROM issues
    GROUP BY employee_id
  )
  SELECT e.*,
    CASE
      WHEN r.employee_id IS NULL THEN COALESCE(e.compliance_status, 'compliant')
      WHEN r.has_action THEN 'action'
      WHEN r.has_review THEN 'review'
      ELSE 'compliant'
    END AS computed_compliance
  FROM employees e
  LEFT JOIN rolled r ON r.employee_id = e.id
`;

/** Replaces the stored compliance_status with the computed one. */
function applyCompliance(row: any) {
  if (!row) return row;
  const { computed_compliance, ...rest } = row;
  return { ...rest, compliance_status: computed_compliance };
}

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

    await client.query(
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

    return getEmployeeById(newId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getEmployees = async () => {
  const result = await pool.query(
    `${EMPLOYEES_WITH_COMPLIANCE_SQL} ORDER BY e.id`,
  );
  return result.rows.map(applyCompliance);
};

export const getEmployeeById = async (id: number) => {
  const result = await pool.query(
    `${EMPLOYEES_WITH_COMPLIANCE_SQL} WHERE e.id = $1`,
    [id],
  );
  return applyCompliance(result.rows[0]);
};

export const deactivateEmployee = async (id: number) => {
  const result = await pool.query(
    `
    UPDATE employees
    SET status = 'Inactive'
    WHERE id = $1
    RETURNING id
    `,
    [id],
  );

  if (!result.rows[0]) return undefined;
  return getEmployeeById(id);
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
      RETURNING id;
    `;

  const result = await pool.query(query, values);

  if (!result.rows[0]) return undefined;

  return getEmployeeById(id);
};
