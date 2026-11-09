import pool from "../config/db";

export interface WhyRow {
  question: string;
  finding: string;
}

export interface ActionRow {
  action: string;
  responsiblePerson: string;
  targetDate: string;
}

export interface InvestigationInput {
  investigator?: string | null;
  investigationDate?: string | null;
  location?: string | null;
  department?: string | null;

  immediateCause?: string | null;
  /** Shown in the UI as "Identified Root Cause" */
  rootCause?: string | null;
  contributingFactors?: string | null;

  /** 5 Why table: [{ question, finding }] */
  fiveWhys?: WhyRow[] | null;

  /** Free text: damage to property or equipment */
  propertyDamage?: string | null;

  /** Corrective / preventive action tables */
  correctiveActionItems?: ActionRow[] | null;
  preventiveActionItems?: ActionRow[] | null;

  // Legacy fields — no longer written by the UI, still read so older
  // investigations keep displaying.
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
  fiveWhys: "five_whys",
  propertyDamage: "property_damage",
  correctiveActionItems: "corrective_action_items",
  preventiveActionItems: "preventive_action_items",
  correctiveActions: "corrective_actions",
  responsiblePerson: "responsible_person",
  dueDate: "due_date",
  preventiveActions: "preventive_actions",
};

// JSONB columns. node-pg turns a JS array into a Postgres ARRAY
// literal, which JSONB rejects, so these must be stringified first.
const JSON_FIELDS = new Set([
  "fiveWhys",
  "correctiveActionItems",
  "preventiveActionItems",
]);

const toDbValue = (key: string, value: any) =>
  JSON_FIELDS.has(key) && value !== null ? JSON.stringify(value) : value;

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
export async function upsertInvestigation(
  recordId: number,
  data: Partial<InvestigationInput>,
) {
  const existing = await getInvestigationByRecordId(recordId);

  if (!existing) {
    const columns: string[] = ["record_id"];
    const placeholders: string[] = ["$1"];
    const values: any[] = [recordId];

    for (const [key, column] of Object.entries(FIELD_MAP)) {
      const value = data[key as keyof InvestigationInput];
      if (value !== undefined) {
        values.push(toDbValue(key, value));
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
      values.push(toDbValue(key, value));
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