"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetClientPassword = exports.getClientPassword = void 0;
const db_1 = __importDefault(require("../config/db"));
const authService_1 = require("../services/authService");
const findClientUser = async (siteId) => {
    const result = await db_1.default.query(`
    SELECT u.id, u.password_encrypted, u.password_iv
    FROM client_users cu
    JOIN users u ON u.id = cu.user_id
    WHERE cu.site_id = $1
      AND u.role = 'client'
    `, [siteId]);
    return result.rows[0] || null;
};
// RSS staff only (enforced in routes/auth.ts).
// Returns the client login's password for a site, decrypted from the
// AES-256-GCM copy stored when the credentials were issued. Returns
// { password: null } for logins created before that copy was stored.
const getClientPassword = async (req, res) => {
    try {
        const siteId = Number(req.params.siteId);
        if (!Number.isInteger(siteId)) {
            res.status(400).json({ error: "Invalid site id" });
            return;
        }
        const row = await findClientUser(siteId);
        if (!row) {
            res.status(404).json({ error: "No client login for this site" });
            return;
        }
        // Never cache a response containing a password
        res.set("Cache-Control", "no-store");
        if (!row.password_encrypted || !row.password_iv) {
            res.json({ password: null });
            return;
        }
        res.json({
            password: (0, authService_1.decryptPassword)(row.password_encrypted, row.password_iv),
        });
    }
    catch (err) {
        console.error("Failed to load client password:", err);
        res.status(500).json({ error: "Failed to load client password" });
    }
};
exports.getClientPassword = getClientPassword;
// RSS staff only. Generates a new temporary password for the site's
// existing client login, replaces the old one (the old password stops
// working) and returns the new one so it can be shown on screen.
const resetClientPassword = async (req, res) => {
    try {
        const siteId = Number(req.params.siteId);
        if (!Number.isInteger(siteId)) {
            res.status(400).json({ error: "Invalid site id" });
            return;
        }
        const row = await findClientUser(siteId);
        if (!row) {
            res.status(404).json({ error: "No client login for this site" });
            return;
        }
        const newPassword = (0, authService_1.generateTempPassword)();
        const passwordHash = await (0, authService_1.hashPassword)(newPassword);
        const { encrypted, iv } = (0, authService_1.encryptPassword)(newPassword);
        await db_1.default.query(`
      UPDATE users
      SET password_hash = $1,
          password_encrypted = $2,
          password_iv = $3
      WHERE id = $4
      `, [passwordHash, encrypted, iv, row.id]);
        res.set("Cache-Control", "no-store");
        res.json({ password: newPassword });
    }
    catch (err) {
        console.error("Failed to reset client password:", err);
        res.status(500).json({ error: "Failed to reset client password" });
    }
};
exports.resetClientPassword = resetClientPassword;
