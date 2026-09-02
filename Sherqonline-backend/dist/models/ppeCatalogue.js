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
exports.decrementStockWithClient = decrementStockWithClient;
const db_1 = __importDefault(require("../config/db"));
async function createCatalogueItem(data) {
    const result = await db_1.default.query(`
    INSERT INTO ppe_catalogue_items (
      item_name, category, supplier, requires_size, sizes,
      replacement_days, stock_level, min_stock_level
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `, [
        data.itemName,
        data.category,
        data.supplier || null,
        data.requiresSize,
        data.sizes || null,
        data.replacementDays,
        data.stockLevel,
        data.minStockLevel,
    ]);
    return result.rows[0];
}
async function getCatalogueItems(category) {
    const values = [];
    let whereClause = "";
    if (category && category !== "All Categories") {
        values.push(category);
        whereClause = `WHERE category = $1`;
    }
    const result = await db_1.default.query(`SELECT * FROM ppe_catalogue_items ${whereClause} ORDER BY item_name ASC`, values);
    return result.rows;
}
async function getCatalogueItemById(id) {
    const result = await db_1.default.query(`SELECT * FROM ppe_catalogue_items WHERE id = $1`, [id]);
    return result.rows[0] || null;
}
async function updateCatalogueItem(id, data) {
    const fields = [];
    const values = [];
    const fieldMap = {
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
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${column} = $${values.length}`);
        }
    }
    if (fields.length === 0) {
        return getCatalogueItemById(id);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const result = await db_1.default.query(`UPDATE ppe_catalogue_items SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`, values);
    return result.rows[0] || null;
}
async function deleteCatalogueItem(id) {
    const result = await db_1.default.query(`DELETE FROM ppe_catalogue_items WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
}
// Used inside the transaction model when issuing PPE — decrements
// stock atomically using the SAME client/transaction as the insert,
// so a stock miscount can never happen from a half-committed issue.
async function decrementStockWithClient(client, itemId, quantity = 1) {
    const result = await client.query(`
    UPDATE ppe_catalogue_items
    SET stock_level = stock_level - $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `, [itemId, quantity]);
    return result.rows[0] || null;
}
