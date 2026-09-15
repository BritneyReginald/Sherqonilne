import pool from "../config/db";

export interface EvidenceFileMeta {
  blobName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function addEvidenceFile(recordId: number, file: EvidenceFileMeta) {
  const result = await pool.query(
    `
    INSERT INTO incident_evidence_files (record_id, file_blob_name, file_name, file_size, file_mime_type)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, record_id, file_blob_name, file_name, file_size, file_mime_type, uploaded_at
    `,
    [recordId, file.blobName, file.fileName, file.fileSize, file.mimeType],
  );

  return result.rows[0];
}

export async function getEvidenceForRecord(recordId: number) {
  const result = await pool.query(
    `SELECT * FROM incident_evidence_files WHERE record_id = $1 ORDER BY uploaded_at ASC`,
    [recordId],
  );

  return result.rows;
}

export async function deleteEvidenceFile(id: number) {
  const result = await pool.query(
    `DELETE FROM incident_evidence_files WHERE id = $1 RETURNING id, file_blob_name`,
    [id],
  );

  return result.rows[0] || null;
}