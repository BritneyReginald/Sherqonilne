// models/ppeCatalogue.ts
import pool from "../config/db";
import { SIZE_TYPES, SizeType } from "../config/ppeSizes"; // adjust path to where you put ppeSizes.ts
import { PPE_TYPES } from "../config/ppeTypes";

export interface CatalogueItemInput {
  itemName: string;
  category: string;
  sizeType: SizeType;
  replacementDays: number;
  minStockLevel: number;
}

export interface StockEntry {
  size?: string | null;
  quantity: number;
}

const httpError = (status: number, message: string) =>
  Object.assign(new Error(message), { status });

// stock_level is the total: the sum of size rows for sized items,
// the plain column for items without sizes.
const SELECT_ITEM = `
  SELECT
    i.id, i.item_name, i.category, i.size_type,
    i.replacement_days, i.min_stock_level,
    CASE WHEN i.size_type = 'none'
      THEN i.stock_level
      ELSE COALESCE((SELECT SUM(s.quantity) FROM ppe_item_sizes s WHERE s.item_id = i.id), 0)::int
    END AS stock_level,
    COALESCE(
      (SELECT json_agg(json_build_object('size', s.size, 'quantity', s.quantity))
       FROM ppe_item_sizes s WHERE s.item_id = i.id),
      '[]'::json
    ) AS size_stock
  FROM ppe_catalogue_items i
`;

export async function createCatalogueItem(data: CatalogueItemInput) {
  const result = await pool.query(
    `INSERT INTO ppe_catalogue_items
       (item_name, category, size_type, replacement_days, stock_level, min_stock_level)
     VALUES ($1,$2,$3,$4,0,$5)
     RETURNING id`,
    [data.itemName, data.category, data.sizeType, data.replacementDays, data.minStockLevel],
  );
  return getCatalogueItemById(result.rows[0].id);
}

export async function getCatalogueItems(category?: string) {
  const values: any[] = [];
  let where = "";
  if (category && category !== "All Categories") {
    values.push(category);
    where = "WHERE i.category = $1";
  }
  const result = await pool.query(`${SELECT_ITEM} ${where} ORDER BY i.item_name ASC`, values);
  return result.rows;
}

export async function getCatalogueItemById(id: number) {
  const result = await pool.query(`${SELECT_ITEM} WHERE i.id = $1`, [id]);
  return result.rows[0] || null;
}

export async function updateCatalogueItem(id: number, data: Partial<CatalogueItemInput>) {
  const existing = await pool.query(
    `SELECT size_type FROM ppe_catalogue_items WHERE id = $1`,
    [id],
  );
  if (!existing.rows[0]) return null;

  // Changing the sizing scheme is only safe when no stock is held in the old sizes.
  if (data.sizeType && data.sizeType !== existing.rows[0].size_type) {
    const held = await pool.query(
      `SELECT COALESCE(SUM(quantity),0)::int AS n FROM ppe_item_sizes WHERE item_id = $1`,
      [id],
    );
    if (held.rows[0].n > 0) {
      throw httpError(400, "Can't change the size type while there is stock in the current sizes. Set those counts to 0 first.");
    }
    await pool.query(`DELETE FROM ppe_item_sizes WHERE item_id = $1`, [id]);
  }

  const fieldMap: Record<string, string> = {
    itemName: "item_name",
    category: "category",
    sizeType: "size_type",
    replacementDays: "replacement_days",
    minStockLevel: "min_stock_level",
  };

  const fields: string[] = [];
  const values: any[] = [];
  for (const [key, column] of Object.entries(fieldMap)) {
    const v = data[key as keyof CatalogueItemInput];
    if (v !== undefined) {
      values.push(v);
      fields.push(`${column} = $${values.length}`);
    }
  }

  if (fields.length > 0) {
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    await pool.query(
      `UPDATE ppe_catalogue_items SET ${fields.join(", ")} WHERE id = $${values.length}`,
      values,
    );
  }
  return getCatalogueItemById(id);
}

export async function deleteCatalogueItem(id: number) {
  const result = await pool.query(
    `DELETE FROM ppe_catalogue_items WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
}

// Core stock logic. Runs on a caller-supplied client so it shares that transaction.
async function applyStockWithClient(
  client: any,
  itemId: number,
  mode: "add" | "set",
  entries: StockEntry[],
) {
  const itemRes = await client.query(
    `SELECT size_type FROM ppe_catalogue_items WHERE id = $1 FOR UPDATE`,
    [itemId],
  );
  const item = itemRes.rows[0];
  if (!item) throw httpError(404, "Catalogue item not found");

  const sizeType = item.size_type as SizeType;

  for (const entry of entries) {
    const qty = Number(entry.quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      throw httpError(400, "Quantities must be whole numbers, 0 or more.");
    }

    if (sizeType === "none") {
      await client.query(
        mode === "add"
          ? `UPDATE ppe_catalogue_items SET stock_level = stock_level + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`
          : `UPDATE ppe_catalogue_items SET stock_level = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [itemId, qty],
      );
    } else {
      if (!entry.size || !SIZE_TYPES[sizeType].includes(entry.size)) {
        throw httpError(400, `"${entry.size}" is not a valid size for this item.`);
      }
      await client.query(
        `INSERT INTO ppe_item_sizes (item_id, size, quantity)
         VALUES ($1,$2,$3)
         ON CONFLICT (item_id, size) DO UPDATE
         SET quantity = ${mode === "add" ? "ppe_item_sizes.quantity + EXCLUDED.quantity" : "EXCLUDED.quantity"}`,
        [itemId, entry.size, qty],
      );
    }
  }
}

// Stock in by dropdown choice. `itemName` must be one of PPE_TYPES. The catalogue row
// is created on first use (category + sizing come from PPE_TYPES, never from the client).
export async function stockByName(itemName: string, mode: "add" | "set", entries: StockEntry[]) {
  const type = PPE_TYPES.find((t) => t.name === itemName);
  if (!type) throw httpError(400, "Unknown PPE item. Choose one from the list.");

  const client = await pool.connect();
  let itemId: number;
  try {
    await client.query("BEGIN");
    const up = await client.query(
      `INSERT INTO ppe_catalogue_items
         (item_name, category, size_type, replacement_days, stock_level, min_stock_level)
       VALUES ($1,$2,$3,180,0,0)
       ON CONFLICT (item_name) DO UPDATE SET item_name = EXCLUDED.item_name
       RETURNING id`,
      [type.name, type.category, type.sizeType],
    );
    itemId = up.rows[0].id;
    await applyStockWithClient(client, itemId, mode, entries);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  return getCatalogueItemById(itemId);
}

// Used inside the issue-PPE transaction (same client, so it commits/rolls back with the insert).
// Pass `size` for sized items. Throws if there isn't enough stock.
export async function decrementStockWithClient(
  client: any,
  itemId: number,
  quantity = 1,
  size?: string | null,
) {
  if (size) {
    const res = await client.query(
      `UPDATE ppe_item_sizes SET quantity = quantity - $3
       WHERE item_id = $1 AND size = $2 AND quantity >= $3
       RETURNING *`,
      [itemId, size, quantity],
    );
    if (!res.rows[0]) throw httpError(400, `Not enough stock for size ${size}.`);
    return res.rows[0];
  }
  const res = await client.query(
    `UPDATE ppe_catalogue_items
     SET stock_level = stock_level - $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND stock_level >= $2
     RETURNING *`,
    [itemId, quantity],
  );
  if (!res.rows[0]) throw httpError(400, "Not enough stock.");
  return res.rows[0];
}