import pool from "../config/db";

export interface MedicalRecordInput {
  employeeId: number;
  examType: "pre-placement" | "periodic" | "exit" | "return-to-work";
  practitionerName: string;
  practitionerType: "OMP" | "OHNP";
  examDate: string;
  expiryDate?: string | null;
  fitnessStatus: "fit" | "fit-with-restrictions" | "unfit";
  restrictions?: string | null;
  restrictionType?: string[] | null;
}

export interface MedicalFileMeta {
  blobName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Every SELECT joins employees so the register always reflects the
// employee's CURRENT name/department/site, same relational approach
// as the rest of the compliance module.
//
// Soft-deleted rows (deleted_at IS NOT NULL) are excluded by every
// caller below. They live in the Recycle Bin and are kept forever.
const SELECT_BASE = `
  SELECT
    mr.id,
    mr.employee_id,
    e.employee_number,
    e.full_name        AS employee_name,
    e.site_location,
    mr.exam_type,
    mr.practitioner_name,
    mr.practitioner_type,
    mr.exam_date,
    mr.expiry_date,
    (mr.expiry_date IS NOT NULL AND mr.expiry_date < CURRENT_DATE) AS is_expired,
    mr.fitness_status,
    mr.restrictions,
    mr.restriction_type,
    mr.file_blob_name,
    mr.file_name,
    mr.file_size,
    mr.file_mime_type,
    mr.created_at,
    mr.updated_at
  FROM medical_records mr
  JOIN employees e ON e.id = mr.employee_id
`;

export async function createMedicalRecord(
  data: MedicalRecordInput,
  file?: MedicalFileMeta | null,
) {
  const result = await pool.query(
    `
    INSERT INTO medical_records (
      employee_id, exam_type, practitioner_name, practitioner_type,
      exam_date, expiry_date, fitness_status, restrictions, restriction_type,
      file_blob_name, file_name, file_size, file_mime_type
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING id
    `,
    [
      data.employeeId,
      data.examType,
      data.practitionerName,
      data.practitionerType,
      data.examDate,
      data.expiryDate || null,
      data.fitnessStatus,
      data.restrictions || null,
      data.restrictionType || null,
      file?.blobName || null,
      file?.fileName || null,
      file?.fileSize || null,
      file?.mimeType || null,
    ],
  );

  return getMedicalRecordById(result.rows[0].id);
}

export async function getMedicalRecords(filters: {
  siteLocation?: string;
  fitnessStatus?: string;
  employeeId?: number;
}) {
  const conditions: string[] = ["mr.deleted_at IS NULL"];
  const values: any[] = [];

  if (filters.employeeId) {
    values.push(filters.employeeId);
    conditions.push(`mr.employee_id = $${values.length}`);
  }

  if (filters.siteLocation && filters.siteLocation !== "All Sites") {
    values.push(filters.siteLocation);
    conditions.push(`e.site_location = $${values.length}`);
  }

  if (filters.fitnessStatus && filters.fitnessStatus !== "all") {
    values.push(filters.fitnessStatus);
    conditions.push(`mr.fitness_status = $${values.length}`);
  }

  const result = await pool.query(
    `${SELECT_BASE} WHERE ${conditions.join(" AND ")} ORDER BY mr.exam_date DESC`,
    values,
  );

  return result.rows;
}

export async function getMedicalRecordById(id: number) {
  const result = await pool.query(
    `${SELECT_BASE} WHERE mr.id = $1 AND mr.deleted_at IS NULL`,
    [id],
  );
  return result.rows[0] || null;
}

export async function updateMedicalRecord(
  id: number,
  data: Partial<MedicalRecordInput>,
) {
  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    examType: "exam_type",
    practitionerName: "practitioner_name",
    practitionerType: "practitioner_type",
    examDate: "exam_date",
    expiryDate: "expiry_date",
    fitnessStatus: "fitness_status",
    restrictions: "restrictions",
    restrictionType: "restriction_type",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key as keyof MedicalRecordInput] !== undefined) {
      values.push(data[key as keyof MedicalRecordInput]);
      fields.push(`${column} = $${values.length}`);
    }
  }

  if (fields.length === 0) {
    return getMedicalRecordById(id);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  await pool.query(
    `UPDATE medical_records SET ${fields.join(", ")}
      WHERE id = $${values.length} AND deleted_at IS NULL`,
    values,
  );

  return getMedicalRecordById(id);
}

export async function attachFileToRecord(id: number, file: MedicalFileMeta) {
  await pool.query(
    `
    UPDATE medical_records
    SET file_blob_name = $1, file_name = $2, file_size = $3,
        file_mime_type = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 AND deleted_at IS NULL
    `,
    [file.blobName, file.fileName, file.fileSize, file.mimeType, id],
  );

  return getMedicalRecordById(id);
}

/*
 * RECYCLE BIN — soft delete only. Medical records are NEVER permanently
 * deleted (OHS Act 40-year retention), so there is intentionally no
 * hard-delete function in this file any more.
 */

export async function softDeleteMedicalRecord(
  id: number,
  userId: number | null,
) {
  const result = await pool.query(
    `UPDATE medical_records
        SET deleted_at = NOW(), deleted_by = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id`,
    [id, userId],
  );
  return result.rows[0] || null;
}

export async function getArchivedMedicalRecords() {
  const result = await pool.query(
    `SELECT mr.id, mr.exam_type, mr.exam_date, mr.deleted_at,
            e.full_name AS employee_name, e.employee_number
       FROM medical_records mr
       JOIN employees e ON e.id = mr.employee_id
      WHERE mr.deleted_at IS NOT NULL
      ORDER BY mr.deleted_at DESC`,
  );
  return result.rows;
}

export async function restoreMedicalRecord(id: number) {
  const result = await pool.query(
    `UPDATE medical_records
        SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
}
