"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmailAndRole = findUserByEmailAndRole;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.linkClientToCompany = linkClientToCompany;
exports.assignInspectorToSites = assignInspectorToSites;
exports.getClientCompanyId = getClientCompanyId;
exports.getInspectorSiteIds = getInspectorSiteIds;
exports.markUserActiveAndLogin = markUserActiveAndLogin;
exports.updateLastLogin = updateLastLogin;
exports.logCredentialIssuance = logCredentialIssuance;
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
    const result = await db_1.default.query(`INSERT INTO users (email, password_hash, role, status, created_by)
     VALUES ($1, $2, $3, 'invited', $4)
     RETURNING *`, [email, passwordHash, role, createdBy]);
    return result.rows[0];
}
async function linkClientToCompany(userId, companyId) {
    await db_1.default.query(`INSERT INTO client_users (user_id, company_id) VALUES ($1, $2)`, [userId, companyId]);
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
async function getClientCompanyId(userId) {
    const result = await db_1.default.query(`SELECT company_id FROM client_users WHERE user_id = $1`, [userId]);
    return result.rows[0]?.company_id ?? null;
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
