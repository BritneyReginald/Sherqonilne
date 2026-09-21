"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const authService_1 = require("../services/authService");
const userController_1 = require("../controllers/userController"); // needs writing — see below
const router = express_1.default.Router();
async function requireSuperAdmin(req, res, next) {
    const result = await db_1.default.query(`SELECT is_super_admin FROM users WHERE id = $1`, [req.user.id]);
    if (!result.rows[0]?.is_super_admin) {
        return res.status(403).json({ error: "Admin access only" });
    }
    next();
}
router.get("/first-aiders", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), requireSuperAdmin, async (req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT u.id, u.email AS username, u.password_encrypted, u.password_iv, u.status,
             p.employee_number, p.full_name, p.surname,
             COALESCE(array_agg(s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS sites
      FROM users u
      JOIN first_aider_profiles p ON p.user_id = u.id
      LEFT JOIN first_aider_assignments fa ON fa.user_id = u.id
      LEFT JOIN sites s ON s.id = fa.site_id
      WHERE u.role = 'first_aider'
      GROUP BY u.id, p.employee_number, p.full_name, p.surname
      ORDER BY p.full_name
    `);
        const firstAiders = result.rows.map((row) => {
            let password = null;
            try {
                password = (0, authService_1.decryptPassword)(row.password_encrypted, row.password_iv);
            }
            catch (error) {
                console.error(`Could not decrypt password for first aider ${row.username}:`, error);
            }
            return {
                id: row.id,
                username: row.username,
                employeeNumber: row.employee_number,
                fullName: row.full_name,
                surname: row.surname,
                status: row.status,
                sites: row.sites,
                password,
            };
        });
        res.json(firstAiders);
    }
    catch (err) {
        console.error("List first aiders error:", err);
        res.status(500).json({ error: "Failed to load first aider accounts" });
    }
});
router.post("/first-aiders", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), requireSuperAdmin, async (req, res) => {
    try {
        const { employeeNumber, fullName, surname, siteIds } = req.body;
        if (!employeeNumber || !fullName || !surname) {
            return res.status(400).json({ error: "employeeNumber, fullName, and surname are required" });
        }
        const result = await (0, authService_1.createFirstAiderStaff)(employeeNumber, fullName, surname, siteIds || [], req.user.id);
        res.status(201).json(result);
    }
    catch (err) {
        console.error("Create first aider error:", err);
        if (err.code === "23505") {
            return res.status(409).json({ error: "That employee number is already in use" });
        }
        res.status(500).json({ error: "Failed to create first aider account" });
    }
});
router.put("/first-aiders/:id/sites", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), requireSuperAdmin, userController_1.updateFirstAiderSites);
router.patch("/first-aiders/:id/reset-password", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), requireSuperAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: "A new password is required" });
        }
        const passwordHash = await (0, authService_1.hashPassword)(newPassword);
        const { encrypted, iv } = (0, authService_1.encryptPassword)(newPassword);
        await db_1.default.query(`UPDATE users SET password_hash = $1, password_encrypted = $2, password_iv = $3 WHERE id = $4`, [passwordHash, encrypted, iv, req.params.id]);
        res.json({ message: "Password reset successfully" });
    }
    catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Failed to reset password" });
    }
});
router.patch("/first-aiders/:id/status", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), requireSuperAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["active", "disabled"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        await db_1.default.query(`UPDATE users SET status = $1 WHERE id = $2`, [status, req.params.id]);
        res.json({ message: `First aider ${status} successfully` });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update first aider status" });
    }
});
router.delete("/first-aiders/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), requireSuperAdmin, async (req, res) => {
    try {
        await (0, authService_1.deleteFirstAider)(Number(req.params.id));
        res.json({ message: "First aider deleted successfully" });
    }
    catch (err) {
        console.error("Delete first aider error:", err);
        res.status(500).json({ error: "Failed to delete first aider" });
    }
});
exports.default = router;
