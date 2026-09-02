import pool from "../config/db";

export interface CatalogueItemInput {
  itemName: string;
  category: string;
  supplier?: string | null;
  requiresSize: boolean;
  sizes?: string[] | null;
  replacementDays: number;
  stockLevel: number;
  minStockLevel: number;
}

export async function createCatalogueItem(data: CatalogueItemInput) {
  const result = await pool.query(
    `
    INSERT INTO ppe_catalogue_items (
      item_name, category, supplier, requires_size, sizes,
      replacement_days, stock_level, min_stock_level
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      data.itemName,
      data.category,
      data.supplier || null,
      data.requiresSize,
      data.sizes || null,
      data.replacementDays,
      data.stockLevel,
      data.minStockLevel,
    ],
  );

  return result.rows[0];
}

export async function getCatalogueItems(category?: string) {
  const values: any[] = [];
  let whereClause = "";

  if (category && category !== "All Categories") {
    values.push(category);
    whereClause = `WHERE category = $1`;
  }

  const result = await pool.query(
    `SELECT * FROM ppe_catalogue_items ${whereClause} ORDER BY item_name ASC`,
    values,
  );

  return result.rows;
}

export async function getCatalogueItemById(id: number) {
  const result = await pool.query(
    `SELECT * FROM ppe_catalogue_items WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function updateCatalogueItem(
  id: number,
  data: Partial<CatalogueItemInput>,
) {
  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    itemName: "item_name",
    category: "category",
    supplier: "supplier",
    requiresSize: "requires_size",
    sizes: "sizes",
    replacementDays: "replacement_days",
    stockLevel: "stock_level",
    minStockLevel: "min_stock_level",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key as keyof CatalogueItemInput] !== undefined) {
      values.push(data[key as keyof CatalogueItemInput]);
      fields.push(`${column} = $${values.length}`);
    }
  }

  if (fields.length === 0) {
    return getCatalogueItemById(id);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE ppe_catalogue_items SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values,
  );

  return result.rows[0] || null;
}

export async function deleteCatalogueItem(id: number) {
  const result = await pool.query(
    `DELETE FROM ppe_catalogue_items WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
}

// Used inside the transaction model when issuing PPE — decrements
// stock atomically using the SAME client/transaction as the insert,
// so a stock miscount can never happen from a half-committed issue.
export async function decrementStockWithClient(
  client: any,
  itemId: number,
  quantity = 1,
) {
  const result = await client.query(
    `
    UPDATE ppe_catalogue_items
    SET stock_level = stock_level - $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [itemId, quantity],
  );
  return result.rows[0] || null;
}