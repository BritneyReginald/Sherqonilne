import pool from "../config/db";

export interface LegalAppointmentInput {
  employeeId?: number | null;
  employeeName: string;
  employeeNumber?: string;
  jobTitle?: string;

  appointmentType:
    | "First Aid Officer"
    | "HSE/SHE Representative"
    | "Incident Investigator";
  legalSection: string;
  department?: string;

  siteId?: number | null;
  siteName?: string;

  appointerName?: string;

  startDate?: string;
  endDate?: string;

  status?: "Active" | "Expired" | "Pending";
  signatureStatus?: "Signed" | "Pending" | "Not Required";

  reportsTo?: string;
  reportsToId?: string;

  delegatedAuthorityScope?: string;
  hierarchyLevel?: number;
}

/**
 * Single-appointment read. Joins sites so the letter can use the
 * site's registered logo (returned as `site_logo`). The list query
 * below deliberately does NOT join it, so the register doesn't ship
 * a logo for every row.
 */
export const getLegalAppointmentById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT la.*, s.logo AS site_logo
    FROM legal_appointments la
    LEFT JOIN sites s ON s.id = la.site_id
    WHERE la.id = $1
    `,
    [id],
  );
  return result.rows[0];
};

export const getLegalAppointments = async () => {
  const result = await pool.query(
    "SELECT * FROM legal_appointments ORDER BY id DESC",
  );
  return result.rows;
};

export const createLegalAppointment = async (input: LegalAppointmentInput) => {
  const result = await pool.query(
    `
    INSERT INTO legal_appointments (
      employee_id,
      employee_name,
      employee_number,
      job_title,
      appointment_type,
      legal_section,
      department,
      site_id,
      site_name,
      appointer_name,
      start_date,
      end_date,
      status,
      signature_status,
      reports_to,
      reports_to_id,
      delegated_authority_scope,
      hierarchy_level
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
    RETURNING id
    `,
    [
      input.employeeId ?? null,
      input.employeeName,
      input.employeeNumber || null,
      input.jobTitle || null,
      input.appointmentType,
      input.legalSection,
      input.department || "Health & Safety",
      input.siteId ?? null,
      input.siteName || null,
      input.appointerName || null,
      input.startDate || null,
      input.endDate || null,
      input.status || "Active",
      input.signatureStatus || "Pending",
      input.reportsTo || null,
      input.reportsToId || null,
      input.delegatedAuthorityScope || "Health & Safety",
      input.hierarchyLevel ?? 4,
    ],
  );

  return getLegalAppointmentById(result.rows[0].id);
};

export const updateLegalAppointment = async (
  id: number,
  updates: Partial<LegalAppointmentInput> & {
    documentBlobName?: string | null;
    documentFileName?: string | null;
    documentSize?: number | null;
    documentMimeType?: string | null;
    /** Base64 PNG data URL from the on-screen signature pad, or null to clear it */
    signatureData?: string | null;
    /** ISO timestamp of when the signature was captured, or null to clear it */
    signedAt?: string | null;
  },
) => {
  const fieldMap: Record<string, string> = {
    employeeId: "employee_id",
    employeeName: "employee_name",
    employeeNumber: "employee_number",
    jobTitle: "job_title",

    appointmentType: "appointment_type",
    legalSection: "legal_section",
    department: "department",

    siteId: "site_id",
    siteName: "site_name",

    appointerName: "appointer_name",

    startDate: "start_date",
    endDate: "end_date",

    status: "status",
    signatureStatus: "signature_status",

    reportsTo: "reports_to",
    reportsToId: "reports_to_id",

    delegatedAuthorityScope: "delegated_authority_scope",
    hierarchyLevel: "hierarchy_level",

    documentBlobName: "document_blob_name",
    documentFileName: "document_file_name",
    documentSize: "document_size",
    documentMimeType: "document_mime_type",

    signatureData: "signature_data",
    signedAt: "signed_at",
  };

  const setClauses: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    // signatureData / signedAt intentionally allow `null` (clearing a
    // signature to re-sign), so only skip truly unset (`undefined`) keys.
    if (value !== undefined && fieldMap[key]) {
      setClauses.push(`${fieldMap[key]} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (setClauses.length === 0) {
    throw new Error("No fields supplied for update.");
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `
    UPDATE legal_appointments
    SET ${setClauses.join(", ")}
    WHERE id = $${index}
    RETURNING id
    `,
    values,
  );

  if (!result.rows[0]) return undefined;
  return getLegalAppointmentById(id);
};

export const deleteLegalAppointment = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM legal_appointments
    WHERE id = $1
    RETURNING id, document_blob_name
    `,
    [id],
  );

  return result.rows[0];
};
