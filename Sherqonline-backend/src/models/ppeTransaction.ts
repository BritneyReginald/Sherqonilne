import pool from "../config/db";
import { getCatalogueItemById, decrementStockWithClient } from "./ppeCatalogue";

export interface IssuePPEItem {
  itemId: number;
  size?: string | null;
  condition: "new" | "re-issued-good";
}

export interface IssuePPEInput {
  employeeId: number;
  employeeName: string;
  jobTitle?: string | null;
  siteLocation?: string | null;
  items: IssuePPEItem[];
  signatureData: string; // base64 dataURL captured client-side
}

const SELECT_ALL = `SELECT * FROM ppe_transactions ORDER BY issue_date DESC, id DESC`;

/**
 * Issues one or more PPE items to an employee in a single atomic
 * operation: every item gets its own transaction row AND has its
 * catalogue stock decremented, all inside one BEGIN/COMMIT so a
 * failure partway through never leaves stock counts out of sync
 * with the issue log.
 */
export async function createPPETransactions(data: IssuePPEInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const createdIds: number[] = [];
    const today = new Date().toISOString().slice(0, 10);
    // Signature applies to the whole issuance, so every item created
    // in this batch is signed off together (matches the original
    // flow, where signing happens once per Issue PPE submission).
    const signOffDate = new Date().toISOString();

    for (const item of data.items) {
      const catalogueItem = await getCatalogueItemById(item.itemId);

      if (!catalogueItem) {
        throw new Error(`PPE catalogue item ${item.itemId} not found`);
      }

      const replacementDue = new Date();
      replacementDue.setDate(
        replacementDue.getDate() + (catalogueItem.replacement_days || 180),
      );

      const insertResult = await client.query(
        `
        INSERT INTO ppe_transactions (
          employee_id, employee_name, job_title, site_location,
          ppe_item_id, ppe_item_name, ppe_category, ppe_brand, ppe_size,
          issue_date, condition, replacement_due,
          sign_off_status, sign_off_date, signature_data
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'signed',$13,$14)
        RETURNING id
        `,
        [
          data.employeeId,
          data.employeeName,
          data.jobTitle || null,
          data.siteLocation || null,
          catalogueItem.id,
          catalogueItem.item_name,
          catalogueItem.category,
          catalogueItem.supplier || "Standard Issue",
          item.size || null,
          today,
          item.condition,
          replacementDue.toISOString().slice(0, 10),
          signOffDate,
          data.signatureData,
        ],
      );

      // Stock is allowed to go negative rather than blocking
      // issuance — a compliance officer issuing PPE for safety
      // reasons should never be stopped by a stock-count edge case.
      // Low/negative stock surfaces via the catalogue's stock alerts
      // instead, which is a purchasing signal, not an issuance gate.
      await decrementStockWithClient(client, catalogueItem.id, 1);

      createdIds.push(insertResult.rows[0].id);
    }

    await client.query("COMMIT");

    const result = await pool.query(
      `SELECT * FROM ppe_transactions WHERE id = ANY($1::int[]) ORDER BY id ASC`,
      [createdIds],
    );

    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getPPETransactions(filters: {
  employeeId?: number;
  category?: string;
  siteLocation?: string;
}) {
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.employeeId) {
    values.push(filters.employeeId);
    conditions.push(`employee_id = $${values.length}`);
  }

  if (filters.category && filters.category !== "All PPE Types") {
    values.push(filters.category);
    conditions.push(`ppe_category = $${values.length}`);
  }

  if (filters.siteLocation && filters.siteLocation !== "All Sites") {
    values.push(filters.siteLocation);
    conditions.push(`site_location = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT * FROM ppe_transactions ${whereClause} ORDER BY issue_date DESC, id DESC`,
    values,
  );

  return result.rows;
}

export async function getPPETransactionById(id: number) {
  const result = await pool.query(`SELECT * FROM ppe_transactions WHERE id = $1`, [id]);
  return result.rows[0] || null;
}