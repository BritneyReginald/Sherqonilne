"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCatalogueItem = createCatalogueItem;
exports.getCatalogueItems = getCatalogueItems;
exports.getCatalogueItemById = getCatalogueItemById;
exports.updateCatalogueItem = updateCatalogueItem;
exports.deleteCatalogueItem = deleteCatalogueItem;
exports.stockByName = stockByName;
exports.decrementStockWithClient = decrementStockWithClient;
// models/ppeCatalogue.ts
const db_1 = __importDefault(require("../config/db"));
const ppeSizes_1 = require("../config/ppeSizes"); // adjust path to where you put ppeSizes.ts
const ppeTypes_1 = require("../config/ppeTypes");
const httpError = (status, message) => Object.assign(new Error(message), { status });
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
async function createCatalogueItem(data) {
    const result = await db_1.default.query(`INSERT INTO ppe_catalogue_items
       (item_name, category, size_type, replacement_days, stock_level, min_stock_level)
     VALUES ($1,$2,$3,$4,0,$5)
     RETURNING id`, [data.itemName, data.category, data.sizeType, data.replacementDays, data.minStockLevel]);
    return getCatalogueItemById(result.rows[0].id);
}
async function getCatalogueItems(category) {
    const values = [];
    let where = "";
    if (category && category !== "All Categories") {
        values.push(category);
        where = "WHERE i.category = $1";
    }
    const result = await db_1.default.query(`${SELECT_ITEM} ${where} ORDER BY i.item_name ASC`, values);
    return result.rows;
}
async function getCatalogueItemById(id) {
    const result = await db_1.default.query(`${SELECT_ITEM} WHERE i.id = $1`, [id]);
    return result.rows[0] || null;
}
async function updateCatalogueItem(id, data) {
    const existing = await db_1.default.query(`SELECT size_type FROM ppe_catalogue_items WHERE id = $1`, [id]);
    if (!existing.rows[0])
        return null;
    // Changing the sizing scheme is only safe when no stock is held in the old sizes.
    if (data.sizeType && data.sizeType !== existing.rows[0].size_type) {
        const held = await db_1.default.query(`SELECT COALESCE(SUM(quantity),0)::int AS n FROM ppe_item_sizes WHERE item_id = $1`, [id]);
        if (held.rows[0].n > 0) {
            throw httpError(400, "Can't change the size type while there is stock in the current sizes. Set those counts to 0 first.");
        }
        await db_1.default.query(`DELETE FROM ppe_item_sizes WHERE item_id = $1`, [id]);
    }
    const fieldMap = {
        itemName: "item_name",
        category: "category",
        sizeType: "size_type",
        replacementDays: "replacement_days",
        minStockLevel: "min_stock_level",
    };
    const fields = [];
    const values = [];
    for (const [key, column] of Object.entries(fieldMap)) {
        const v = data[key];
        if (v !== undefined) {
            values.push(v);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await db_1.default.query(`UPDATE ppe_catalogue_items SET ${fields.join(", ")} WHERE id = $${values.length}`, values);
    }
    return getCatalogueItemById(id);
}
async function deleteCatalogueItem(id) {
    const result = await db_1.default.query(`DELETE FROM ppe_catalogue_items WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
}
// Core stock logic. Runs on a caller-supplied client so it shares that transaction.
async function applyStockWithClient(client, itemId, mode, entries) {
    const itemRes = await client.query(`SELECT size_type FROM ppe_catalogue_items WHERE id = $1 FOR UPDATE`, [itemId]);
    const item = itemRes.rows[0];
    if (!item)
        throw httpError(404, "Catalogue item not found");
    const sizeType = item.size_type;
    for (const entry of entries) {
        const qty = Number(entry.quantity);
        if (!Number.isInteger(qty) || qty < 0) {
            throw httpError(400, "Quantities must be whole numbers, 0 or more.");
        }
        if (sizeType === "none") {
            await client.query(mode === "add"
                ? `UPDATE ppe_catalogue_items SET stock_level = stock_level + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`
                : `UPDATE ppe_catalogue_items SET stock_level = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [itemId, qty]);
        }
        else {
            if (!entry.size || !ppeSizes_1.SIZE_TYPES[sizeType].includes(entry.size)) {
                throw httpError(400, `"${entry.size}" is not a valid size for this item.`);
            }
            await client.query(`INSERT INTO ppe_item_sizes (item_id, size, quantity)
         VALUES ($1,$2,$3)
         ON CONFLICT (item_id, size) DO UPDATE
         SET quantity = ${mode === "add" ? "ppe_item_sizes.quantity + EXCLUDED.quantity" : "EXCLUDED.quantity"}`, [itemId, entry.size, qty]);
        }
    }
}
// Stock in by dropdown choice. `itemName` must be one of PPE_TYPES. The catalogue row
// is created on first use (category + sizing come from PPE_TYPES, never from the client).
async function stockByName(itemName, mode, entries) {
    const type = ppeTypes_1.PPE_TYPES.find((t) => t.name === itemName);
    if (!type)
        throw httpError(400, "Unknown PPE item. Choose one from the list.");
    const client = await db_1.default.connect();
    let itemId;
    try {
        await client.query("BEGIN");
        const up = await client.query(`INSERT INTO ppe_catalogue_items
         (item_name, category, size_type, replacement_days, stock_level, min_stock_level)
       VALUES ($1,$2,$3,180,0,0)
       ON CONFLICT (item_name) DO UPDATE SET item_name = EXCLUDED.item_name
       RETURNING id`, [type.name, type.category, type.sizeType]);
        itemId = up.rows[0].id;
        await applyStockWithClient(client, itemId, mode, entries);
        await client.query("COMMIT");
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
    return getCatalogueItemById(itemId);
}
// Used inside the issue-PPE transaction (same client, so it commits/rolls back with the insert).
// Pass `size` for sized items. Throws if there isn't enough stock.
async function decrementStockWithClient(client, itemId, quantity = 1, size) {
    if (size) {
        const res = await client.query(`UPDATE ppe_item_sizes SET quantity = quantity - $3
       WHERE item_id = $1 AND size = $2 AND quantity >= $3
       RETURNING *`, [itemId, size, quantity]);
        if (!res.rows[0])
            throw httpError(400, `Not enough stock for size ${size}.`);
        return res.rows[0];
    }
    const res = await client.query(`UPDATE ppe_catalogue_items
     SET stock_level = stock_level - $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND stock_level >= $2
     RETURNING *`, [itemId, quantity]);
    if (!res.rows[0])
        throw httpError(400, "Not enough stock.");
    return res.rows[0];
}
