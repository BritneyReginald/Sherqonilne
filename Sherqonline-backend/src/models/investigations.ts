import pool from "../config/db";

export interface InvestigationInput {
  investigator?: string | null;
  investigationDate?: string | null;
  location?: string | null;
  department?: string | null;

  immediateCause?: string | null;
  rootCause?: string | null;
  contributingFactors?: string | null;

  correctiveActions?: string[] | null;
  responsiblePerson?: string | null;
  dueDate?: string | null;

  preventiveActions?: string | null;
}

const FIELD_MAP: Record<string, string> = {
  investigator: "investigator",
  investigationDate: "investigation_date",
  location: "location",
  department: "department",
  immediateCause: "immediate_cause",
  rootCause: "root_cause",
  contributingFactors: "contributing_factors",
  correctiveActions: "corrective_actions",
  responsiblePerson: "responsible_person",
  dueDate: "due_date",
  preventiveActions: "preventive_actions",
};

export async function getInvestigationByRecordId(recordId: number) {
  const result = await pool.query(
    `SELECT * FROM investigations WHERE record_id = $1`,
    [recordId],
  );
  return result.rows[0] || null;
}

// Creates the investigation row on first write, otherwise patches
// only the fields provided — same partial-update shape as
// updateMedicalRecord/updateAppointment, but as an upsert since the
// row may not exist yet (investigations start empty).
export async function upsertInvestigation(recordId: number, data: Partial<InvestigationInput>) {
  const existing = await getInvestigationByRecordId(recordId);

  if (!existing) {
    const columns: string[] = ["record_id"];
    const placeholders: string[] = ["$1"];
    const values: any[] = [recordId];

    for (const [key, column] of Object.entries(FIELD_MAP)) {
      const value = data[key as keyof InvestigationInput];
      if (value !== undefined) {
        values.push(value);
        columns.push(column);
        placeholders.push(`$${values.length}`);
      }
    }

    await pool.query(
      `INSERT INTO investigations (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
      values,
    );

    return getInvestigationByRecordId(recordId);
  }

  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, column] of Object.entries(FIELD_MAP)) {
    const value = data[key as keyof InvestigationInput];
    if (value !== undefined) {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    }
  }

  if (fields.length === 0) {
    return existing;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(recordId);

  await pool.query(
    `UPDATE investigations SET ${fields.join(", ")} WHERE record_id = $${values.length}`,
    values,
  );

  return getInvestigationByRecordId(recordId);
}