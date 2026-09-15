import pool from "../config/db";

export interface FirstAidEntryInput {
  employeeId?: number | null;
  employeeName?: string | null;
  employeeNumber?: string | null;

  date?: string | null;
  time?: string | null;

  injury?: string | null;
  treatment?: string | null;
  comments?: string | null;

  firstAider?: string | null;
  furtherMedicalAttention?: boolean;

  status?: string;
}

export async function createFirstAidEntries(recordId: number, entries: FirstAidEntryInput[]) {
  const created = [];

  for (const entry of entries) {
    const result = await pool.query(
      `
      INSERT INTO first_aid_entries (
        record_id, employee_id, employee_name, employee_number,
        entry_date, entry_time,
        injury, treatment, comments,
        first_aider, further_medical_attention, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        recordId,
        entry.employeeId || null,
        entry.employeeName || null,
        entry.employeeNumber || null,
        entry.date || null,
        entry.time || null,
        entry.injury || null,
        entry.treatment || null,
        entry.comments || null,
        entry.firstAider || null,
        entry.furtherMedicalAttention ?? false,
        entry.status || "draft",
      ],
    );
    created.push(result.rows[0]);
  }

  return created;
}

export async function getFirstAidEntriesForRecord(recordId: number) {
  const result = await pool.query(
    `SELECT * FROM first_aid_entries WHERE record_id = $1 ORDER BY id ASC`,
    [recordId],
  );
  return result.rows;
}

// Replaces every entry for a record with a fresh set — simplest
// correct approach for a log the user edits as a whole rather than
// per-row (matches how the frontend submits the entire `entries`
// array together, not one entry at a time).
export async function replaceFirstAidEntries(recordId: number, entries: FirstAidEntryInput[]) {
  await pool.query(`DELETE FROM first_aid_entries WHERE record_id = $1`, [recordId]);
  return createFirstAidEntries(recordId, entries);
}

export async function deleteFirstAidEntriesForRecord(recordId: number) {
  await pool.query(`DELETE FROM first_aid_entries WHERE record_id = $1`, [recordId]);
}