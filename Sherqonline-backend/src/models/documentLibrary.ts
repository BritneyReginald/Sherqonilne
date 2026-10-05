import pool from "../config/db";

/**
 * Derived status. "Expiring" = 30 days or fewer remaining.
 * No expiry date = always valid.
 */
const STATUS_SQL = `
  CASE
    WHEN d.expiry_date IS NULL THEN 'valid'
    WHEN d.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN d.expiry_date <= CURRENT_DATE + 30 THEN 'expiring'
    ELSE 'valid'
  END
`;

// Dates are cast to text so the JS driver never shifts them across timezones
const DOC_SELECT = `
  SELECT
    d.id,
    d.folder_id,
    d.name,
    d.current_version,
    d.updated_by_employee_id,
    d.updated_by_name,
    to_char(d.last_updated_date, 'YYYY-MM-DD') AS last_updated_date,
    to_char(d.expiry_date, 'YYYY-MM-DD') AS expiry_date,
    ${STATUS_SQL} AS status,
    v.file_name,
    v.file_size,
    v.file_mime_type
  FROM documents d
  JOIN document_versions v
    ON v.document_id = d.id AND v.version_number = d.current_version
`;

/* ----------------------------- FOLDERS ----------------------------- */

export const getFolders = async () => {
  const result = await pool.query(
    `SELECT id, name, parent_id FROM document_folders ORDER BY LOWER(name)`,
  );
  return result.rows;
};

export const getFolderById = async (id: number) => {
  const result = await pool.query(
    `SELECT id, name, parent_id FROM document_folders WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const createFolder = async (name: string, parentId: number | null) => {
  const result = await pool.query(
    `INSERT INTO document_folders (name, parent_id)
     VALUES ($1, $2)
     RETURNING id, name, parent_id`,
    [name, parentId],
  );
  return result.rows[0];
};

/**
 * Every folder under (and including) rootId, with its path relative to
 * the root folder, plus every non-archived document's CURRENT file in it.
 * Folders with no documents still come back (one row, null file) so empty
 * folders survive in the ZIP.
 */
export const getFolderTreeForZip = async (rootId: number) => {
  const result = await pool.query(
    `
    WITH RECURSIVE tree AS (
      SELECT id, name, name::text AS path
      FROM document_folders
      WHERE id = $1
      UNION ALL
      SELECT f.id, f.name, tree.path || '/' || f.name
      FROM document_folders f
      JOIN tree ON f.parent_id = tree.id
    )
    SELECT t.path, v.file_blob_name, v.file_name
    FROM tree t
    LEFT JOIN documents d
      ON d.folder_id = t.id AND d.is_archived = FALSE
    LEFT JOIN document_versions v
      ON v.document_id = d.id AND v.version_number = d.current_version
    ORDER BY t.path, v.file_name
    `,
    [rootId],
  );
  return result.rows;
};

/* ---------------------------- DOCUMENTS ---------------------------- */

export const getDocumentsByFolder = async (folderId: number) => {
  const result = await pool.query(
    `${DOC_SELECT}
     WHERE d.folder_id = $1 AND d.is_archived = FALSE
     ORDER BY LOWER(d.name)`,
    [folderId],
  );
  return result.rows;
};

export const getDocumentById = async (id: number) => {
  const result = await pool.query(`${DOC_SELECT} WHERE d.id = $1`, [id]);
  return result.rows[0];
};

export const getEmployeeName = async (
  employeeId: number,
): Promise<string | null> => {
  const result = await pool.query(
    `SELECT full_name FROM employees WHERE id = $1`,
    [employeeId],
  );
  return result.rows[0]?.full_name ?? null;
};

interface NewDocumentInput {
  folderId: number;
  name: string;
  updatedById: number;
  updatedByName: string;
  updatedDate: string; // YYYY-MM-DD
  expiryDate: string | null;
  changeSummary: string | null;
  blob: {
    blobName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
}

export const createDocument = async (input: NewDocumentInput) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const doc = await client.query(
      `INSERT INTO documents
         (folder_id, name, current_version, updated_by_employee_id,
          updated_by_name, last_updated_date, expiry_date)
       VALUES ($1, $2, 1, $3, $4, $5, $6)
       RETURNING id`,
      [
        input.folderId,
        input.name,
        input.updatedById,
        input.updatedByName,
        input.updatedDate,
        input.expiryDate,
      ],
    );

    const docId = doc.rows[0].id;

    await client.query(
      `INSERT INTO document_versions
         (document_id, version_number, file_blob_name, file_name, file_size,
          file_mime_type, updated_by_employee_id, updated_by_name,
          updated_date, change_summary)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        docId,
        input.blob.blobName,
        input.blob.fileName,
        input.blob.fileSize,
        input.blob.mimeType,
        input.updatedById,
        input.updatedByName,
        input.updatedDate,
        input.changeSummary,
      ],
    );

    await client.query("COMMIT");
    return docId as number;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

interface NewVersionInput {
  documentId: number;
  updatedById: number;
  updatedByName: string;
  updatedDate: string;
  expiryDate: string | null;
  changeSummary: string | null;
  blob: {
    blobName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
}

export const addDocumentVersion = async (input: NewVersionInput) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updated = await client.query(
      `UPDATE documents
       SET current_version = current_version + 1,
           updated_by_employee_id = $2,
           updated_by_name = $3,
           last_updated_date = $4,
           expiry_date = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_archived = FALSE
       RETURNING current_version`,
      [
        input.documentId,
        input.updatedById,
        input.updatedByName,
        input.updatedDate,
        input.expiryDate,
      ],
    );

    if (updated.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `INSERT INTO document_versions
         (document_id, version_number, file_blob_name, file_name, file_size,
          file_mime_type, updated_by_employee_id, updated_by_name,
          updated_date, change_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        input.documentId,
        updated.rows[0].current_version,
        input.blob.blobName,
        input.blob.fileName,
        input.blob.fileSize,
        input.blob.mimeType,
        input.updatedById,
        input.updatedByName,
        input.updatedDate,
        input.changeSummary,
      ],
    );

    await client.query("COMMIT");
    return input.documentId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getDocumentVersions = async (documentId: number) => {
  const result = await pool.query(
    `SELECT id, version_number, file_name, file_size, file_mime_type,
            updated_by_name,
            to_char(updated_date, 'YYYY-MM-DD') AS updated_date,
            change_summary, created_at
     FROM document_versions
     WHERE document_id = $1
     ORDER BY version_number DESC`,
    [documentId],
  );
  return result.rows;
};

/** Blob info for a specific version, or the current one if versionId is omitted. */
export const getVersionFile = async (
  documentId: number,
  versionId?: number,
) => {
  const result = versionId
    ? await pool.query(
        `SELECT file_blob_name, file_name FROM document_versions
         WHERE document_id = $1 AND id = $2`,
        [documentId, versionId],
      )
    : await pool.query(
        `SELECT v.file_blob_name, v.file_name
         FROM documents d
         JOIN document_versions v
           ON v.document_id = d.id AND v.version_number = d.current_version
         WHERE d.id = $1`,
        [documentId],
      );
  return result.rows[0];
};

/** Soft delete: the row and every version/blob stay for audit purposes. */
export const archiveDocument = async (id: number) => {
  const result = await pool.query(
    `UPDATE documents
     SET is_archived = TRUE, archived_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_archived = FALSE
     RETURNING id`,
    [id],
  );
  return result.rows[0];
};

/** Archived documents with their full folder path, newest first. */
export const getArchivedDocuments = async () => {
  const result = await pool.query(`
    WITH RECURSIVE paths AS (
      SELECT id, name::text AS path
      FROM document_folders
      WHERE parent_id IS NULL
      UNION ALL
      SELECT f.id, paths.path || ' / ' || f.name
      FROM document_folders f
      JOIN paths ON f.parent_id = paths.id
    )
    SELECT
      d.id,
      d.folder_id,
      d.name,
      d.current_version,
      d.updated_by_name,
      to_char(d.expiry_date, 'YYYY-MM-DD') AS expiry_date,
      d.archived_at,
      p.path AS folder_path,
      v.file_name,
      v.file_size,
      v.file_mime_type
    FROM documents d
    JOIN document_versions v
      ON v.document_id = d.id AND v.version_number = d.current_version
    LEFT JOIN paths p ON p.id = d.folder_id
    WHERE d.is_archived = TRUE
    ORDER BY d.archived_at DESC
  `);
  return result.rows;
};

export const restoreDocument = async (id: number) => {
  const result = await pool.query(
    `UPDATE documents
     SET is_archived = FALSE, archived_at = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_archived = TRUE
     RETURNING id`,
    [id],
  );
  return result.rows[0];
};
