"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PPE_RETENTION_DAYS = void 0;
exports.createPPETransactions = createPPETransactions;
exports.getPPETransactions = getPPETransactions;
exports.getPPETransactionById = getPPETransactionById;
exports.softDeletePPETransaction = softDeletePPETransaction;
exports.getArchivedPPETransactions = getArchivedPPETransactions;
exports.restorePPETransaction = restorePPETransaction;
exports.purgeExpiredPPETransactions = purgeExpiredPPETransactions;
const db_1 = __importDefault(require("../config/db"));
const ppeCatalogue_1 = require("./ppeCatalogue");
const ppeSizes_1 = require("../config/ppeSizes");
exports.PPE_RETENTION_DAYS = 30;
const httpError = (status, message) => Object.assign(new Error(message), { status });
/**
 * Issues one or more PPE items to an employee in a single atomic
 * operation: every item gets its own transaction row AND has its
 * catalogue stock decremented, all inside one BEGIN/COMMIT so a
 * failure partway through never leaves stock counts out of sync
 * with the issue log.
 *
 * Sized items (boots, overalls, etc.) must be issued with a valid
 * size, and the stock for THAT size is decremented. Issuing a size
 * that is out of stock fails the whole issuance (nothing is saved).
 *
 * The site is taken from the EMPLOYEE (site_id), never from the
 * request, so an issue can't be filed under the wrong client.
 */
async function createPPETransactions(data) {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        const employeeResult = await client.query(`SELECT e.site_id, s.name AS site_name
         FROM employees e
         LEFT JOIN sites s ON s.id = e.site_id
        WHERE e.id = $1`, [data.employeeId]);
        if (!employeeResult.rows[0]) {
            throw httpError(404, `Employee ${data.employeeId} not found`);
        }
        const siteId = employeeResult.rows[0].site_id ?? null;
        const siteLocation = employeeResult.rows[0].site_name ?? data.siteLocation ?? null;
        const createdIds = [];
        const today = new Date().toISOString().slice(0, 10);
        // Signature applies to the whole issuance, so every item created
        // in this batch is signed off together (matches the original
        // flow, where signing happens once per Issue PPE submission).
        const signOffDate = new Date().toISOString();
        for (const item of data.items) {
            const catalogueItem = await (0, ppeCatalogue_1.getCatalogueItemById)(item.itemId);
            if (!catalogueItem) {
                throw httpError(404, `PPE catalogue item ${item.itemId} not found`);
            }
            // Sized items need a valid size; unsized items never store one.
            const sizeType = catalogueItem.size_type;
            let size = null;
            if (sizeType !== "none") {
                if (!item.size || !ppeSizes_1.SIZE_TYPES[sizeType].includes(item.size)) {
                    throw httpError(400, `Select a valid size for ${catalogueItem.item_name}.`);
                }
                size = item.size;
            }
            const replacementDue = new Date();
            replacementDue.setDate(replacementDue.getDate() + (catalogueItem.replacement_days || 180));
            const insertResult = await client.query(`
        INSERT INTO ppe_transactions (
          employee_id, employee_name, job_title, site_location,
          ppe_item_id, ppe_item_name, ppe_category, ppe_brand, ppe_size,
          issue_date, condition, replacement_due,
          sign_off_status, sign_off_date, signature_data, site_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'signed',$13,$14,$15)
        RETURNING id
        `, [
                data.employeeId,
                data.employeeName,
                data.jobTitle || null,
                siteLocation,
                catalogueItem.id,
                catalogueItem.item_name,
                catalogueItem.category,
                null, // ppe_brand: suppliers were removed from the catalogue
                size,
                today,
                item.condition,
                replacementDue.toISOString().slice(0, 10),
                signOffDate,
                data.signatureData,
                siteId,
            ]);
            // Decrements the per-size stock (sized items) or the item's
            // stock_level (unsized). Throws a 400 if there isn't enough, which
            // rolls back the entire issuance.
            await (0, ppeCatalogue_1.decrementStockWithClient)(client, catalogueItem.id, 1, size);
            createdIds.push(insertResult.rows[0].id);
        }
        await client.query("COMMIT");
        const result = await db_1.default.query(`SELECT * FROM ppe_transactions WHERE id = ANY($1::int[]) ORDER BY id ASC`, [createdIds]);
        return result.rows;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function getPPETransactions(filters) {
    const conditions = ["deleted_at IS NULL"];
    const values = [];
    if (filters.siteIds) {
        values.push(filters.siteIds);
        conditions.push(`site_id = ANY($${values.length}::int[])`);
    }
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
    const result = await db_1.default.query(`SELECT * FROM ppe_transactions WHERE ${conditions.join(" AND ")} ORDER BY issue_date DESC, id DESC`, values);
    return result.rows;
}
async function getPPETransactionById(id) {
    const result = await db_1.default.query(`SELECT * FROM ppe_transactions WHERE id = $1 AND deleted_at IS NULL`, [id]);
    return result.rows[0] || null;
}
/*
 * ------------------------------------------------------------
 * RECYCLE BIN (soft delete, purged after PPE_RETENTION_DAYS)
 * ------------------------------------------------------------
 * Catalogue stock is NOT adjusted on delete/restore: a deleted
 * record is an admin correction to the log, not a return of
 * physical stock. Adjust stock in the catalogue if needed.
 */
async function softDeletePPETransaction(id, userId) {
    const result = await db_1.default.query(`UPDATE ppe_transactions
        SET deleted_at = NOW(), deleted_by = $2
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id`, [id, userId]);
    return result.rows[0] || null;
}
async function getArchivedPPETransactions() {
    const result = await db_1.default.query(`SELECT id, employee_name, ppe_item_name, issue_date, deleted_at
       FROM ppe_transactions
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC`);
    return result.rows;
}
async function restorePPETransaction(id) {
    const result = await db_1.default.query(`UPDATE ppe_transactions
        SET deleted_at = NULL, deleted_by = NULL
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id`, [id]);
    return result.rows[0] || null;
}
/** Permanently removes PPE rows that have been in the bin longer than 30 days. */
async function purgeExpiredPPETransactions() {
    const result = await db_1.default.query(`DELETE FROM ppe_transactions
      WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - ($1 || ' days')::interval
      RETURNING id`, [String(exports.PPE_RETENTION_DAYS)]);
    return result.rowCount ?? 0;
}
