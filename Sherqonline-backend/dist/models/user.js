"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmailAndRole = findUserByEmailAndRole;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.linkClientToSite = linkClientToSite;
exports.assignInspectorToSites = assignInspectorToSites;
exports.getClientSiteId = getClientSiteId;
exports.getInspectorSiteIds = getInspectorSiteIds;
exports.markUserActiveAndLogin = markUserActiveAndLogin;
exports.updateLastLogin = updateLastLogin;
exports.logCredentialIssuance = logCredentialIssuance;
exports.replaceInspectorSites = replaceInspectorSites;
exports.getClientCompany = getClientCompany;
// models/user.ts
const db_1 = __importDefault(require("../config/db"));
// --- Core lookups ---
// Used by each of the 3 login endpoints — role is baked into the query,
// so a client credential can't authenticate on the inspector endpoint even
// if the password happened to match some other row.
async function findUserByEmailAndRole(email, role) {
    const result = await db_1.default.query(`SELECT * FROM users WHERE email = $1 AND role = $2`, [email, role]);
    return result.rows[0] ?? null;
}
async function findUserById(id) {
    const result = await db_1.default.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0] ?? null;
}
// --- Creation (RSS-only actions) ---
async function createUser(email, passwordHash, role, createdBy) {
    const normalizedEmail = email.trim().toLowerCase();
    /*
     * Find an existing account with this email.
     *
     * We also check whether the account is currently linked
     * to a client site.
     */
    const existingResult = await db_1.default.query(`
    SELECT
      u.*,
      cu.site_id
    FROM users u
    LEFT JOIN client_users cu
      ON cu.user_id = u.id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1
    `, [normalizedEmail]);
    const existingUser = existingResult.rows[0];
    /*
     * ============================================================
     * NO EXISTING USER
     * ============================================================
     */
    if (!existingUser) {
        const result = await db_1.default.query(`
      INSERT INTO users (
        email,
        password_hash,
        role,
        status,
        created_by
      )
      VALUES ($1, $2, $3, 'invited', $4)
      RETURNING *
      `, [normalizedEmail, passwordHash, role, createdBy]);
        return result.rows[0];
    }
    /*
     * ============================================================
     * REUSE OLD CLIENT ACCOUNT
     * ============================================================
     *
     * We allow this when:
     *
     * 1. It is a client account
     * 2. The new account being created is also a client
     * 3. The old account is disabled
     *
     * OR:
     *
     * 4. The old client account no longer has a site attached.
     *
     * The second condition handles clients that were deleted
     * before we introduced the new disabled-account behaviour.
     */
    const isReusableClient = existingUser.role === "client" &&
        role === "client" &&
        (existingUser.status === "disabled" || existingUser.site_id === null);
    if (isReusableClient) {
        const result = await db_1.default.query(`
      UPDATE users
      SET
        password_hash = $1,
        role = 'client',
        status = 'invited',
        must_change_password = TRUE,
        created_by = $2,
        last_login_at = NULL
      WHERE id = $3
      RETURNING *
      `, [passwordHash, createdBy, existingUser.id]);
        return result.rows[0];
    }
    /*
     * ============================================================
     * EXISTING ACTIVE ACCOUNT
     * ============================================================
     *
     * Do not overwrite a real active account.
     */
    throw new Error(`A user with email ${normalizedEmail} already exists.`);
}
async function linkClientToSite(userId, siteId) {
    await db_1.default.query(`INSERT INTO client_users (user_id, site_id) VALUES ($1, $2)`, [userId, siteId]);
}
async function assignInspectorToSites(userId, siteIds) {
    if (siteIds.length === 0)
        return;
    const values = siteIds.map((_, i) => `($1, $${i + 2})`).join(", ");
    await db_1.default.query(`INSERT INTO inspector_assignments (user_id, site_id)
     VALUES ${values}
     ON CONFLICT (user_id, site_id) DO NOTHING`, [userId, ...siteIds]);
}
// --- Scoping lookups (used by auth middleware on every request) ---
async function getClientSiteId(userId) {
    const result = await db_1.default.query(`SELECT site_id FROM client_users WHERE user_id = $1`, [userId]);
    return result.rows[0]?.site_id ?? null;
}
async function getInspectorSiteIds(userId) {
    const result = await db_1.default.query(`SELECT site_id FROM inspector_assignments WHERE user_id = $1`, [userId]);
    return result.rows.map((r) => r.site_id);
}
// --- Login bookkeeping ---
async function markUserActiveAndLogin(userId) {
    await db_1.default.query(`UPDATE users SET status = 'active', last_login_at = NOW() WHERE id = $1`, [userId]);
}
async function updateLastLogin(userId) {
    await db_1.default.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [
        userId,
    ]);
}
// --- Credential issuance logging ---
async function logCredentialIssuance(userId, issuedBy, deliveryMethod = "email", deliveryStatus = "sent", notes) {
    await db_1.default.query(`INSERT INTO credential_issuance_log (user_id, issued_by, delivery_method, delivery_status, notes)
     VALUES ($1, $2, $3, $4, $5)`, [userId, issuedBy, deliveryMethod, deliveryStatus, notes ?? null]);
}
async function replaceInspectorSites(userId, siteIds) {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        // Remove existing assignments
        await client.query(`DELETE FROM inspector_assignments
        WHERE user_id = $1`, [userId]);
        // Add the new assignments
        for (const siteId of siteIds) {
            await client.query(`INSERT INTO inspector_assignments
   (user_id, site_id)
   VALUES ($1, $2)
   ON CONFLICT (user_id, site_id) DO NOTHING`, [userId, siteId]);
        }
        await client.query("COMMIT");
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
async function getClientCompany(userId) {
    const result = await db_1.default.query(`
    SELECT
      s.id,
      s.name,
      s.logo,
      s.email,
      s.contact_person,
      s.contact_number
    FROM client_users cu
    INNER JOIN sites s
      ON s.id = cu.site_id
    WHERE cu.user_id = $1
    `, [userId]);
    return result.rows[0] ?? null;
}
