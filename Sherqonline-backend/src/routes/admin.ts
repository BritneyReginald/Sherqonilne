// routes/admin.ts
import express from "express";
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  createInspectorStaff,
  decryptPassword,
  encryptPassword,
  hashPassword,
  deleteInspector,
} from "../services/authService";
import { updateInspectorSites } from "../controllers/userController";

const router = express.Router();

// Extra gate on top of authorize("rss_staff") — only the flagged super admin
// (your boss) can reach anything in this file.
async function requireSuperAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const result = await pool.query(
    `SELECT is_super_admin FROM users WHERE id = $1`,
    [req.user!.id],
  );
  if (!result.rows[0]?.is_super_admin) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}

// List all inspector staff with their decrypted credentials
router.get(
  "/inspectors",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT u.id, u.email AS username, u.password_encrypted, u.password_iv, u.status,
             p.employee_number, p.full_name, p.surname,
             COALESCE(array_agg(s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS sites
      FROM users u
      JOIN inspector_profiles p ON p.user_id = u.id
      LEFT JOIN inspector_assignments ia ON ia.user_id = u.id
      LEFT JOIN sites s ON s.id = ia.site_id
      WHERE u.role = 'inspector'
      GROUP BY u.id, p.employee_number, p.full_name, p.surname
      ORDER BY p.full_name
    `);

      const inspectors = result.rows.map((row) => ({
        id: row.id,
        username: row.username,
        employeeNumber: row.employee_number,
        fullName: row.full_name,
        surname: row.surname,
        status: row.status,
        sites: row.sites,
        password: decryptPassword(row.password_encrypted, row.password_iv),
      }));

      res.json(inspectors);
    } catch (err) {
      console.error("List inspectors error:", err);
      res.status(500).json({ error: "Failed to load inspector accounts" });
    }
  },
);

// Create a new inspector staff member — generates username + password automatically
router.post(
  "/inspectors",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { employeeNumber, fullName, surname, siteIds } = req.body;
      if (!employeeNumber || !fullName || !surname) {
        return res.status(400).json({
          error: "employeeNumber, fullName, and surname are required",
        });
      }

      const result = await createInspectorStaff(
        employeeNumber,
        fullName,
        surname,
        siteIds || [],
        req.user!.id,
      );

      res.status(201).json(result);
    } catch (err: any) {
      console.error("Create inspector error:", err);
      if (err.code === "23505") {
        return res
          .status(409)
          .json({ error: "That employee number is already in use" });
      }
      res.status(500).json({ error: "Failed to create inspector account" });
    }
  },
);

router.put(
  "/inspectors/:id/sites",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  updateInspectorSites,
);

// Manually reset a password — boss types in a new one directly
router.patch(
  "/inspectors/:id/reset-password",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: "A new password is required" });
      }

      const passwordHash = await hashPassword(newPassword);
      const { encrypted, iv } = encryptPassword(newPassword);

      await pool.query(
        `UPDATE users SET password_hash = $1, password_encrypted = $2, password_iv = $3 WHERE id = $4`,
        [passwordHash, encrypted, iv, req.params.id],
      );

      res.json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  },
);

router.patch(
  "/inspectors/:id/status",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["active", "disabled"].includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
        });
      }

      await pool.query(
        `UPDATE users
         SET status = $1
         WHERE id = $2`,
        [status, req.params.id],
      );

      res.json({
        message: `Inspector ${status} successfully`,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to update inspector status",
      });
    }
  },
);

router.delete(
  "/inspectors/:id",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const userId = req.params.id;

      await client.query(
        `DELETE FROM inspector_assignments
         WHERE user_id = $1`,
        [userId],
      );

      await client.query(
        `DELETE FROM inspector_profiles
         WHERE user_id = $1`,
        [userId],
      );

      await client.query(
        `DELETE FROM users
         WHERE id = $1`,
        [userId],
      );

      await client.query("COMMIT");

      res.json({
        message: "Inspector deleted successfully",
      });
    } catch (err) {
      await client.query("ROLLBACK");

      console.error(err);

      res.status(500).json({
        error: "Failed to delete inspector",
      });
    } finally {
      client.release();
    }
  },
);

router.delete(
  "/inspectors/:id",
  authenticate,
  authorize("rss_staff"),
  requireSuperAdmin,
  async (req, res) => {
    try {
      await deleteInspector(Number(req.params.id));

      res.json({
        message: "Inspector deleted successfully",
      });
    } catch (err) {
      console.error("Delete inspector error:", err);

      res.status(500).json({
        error: "Failed to delete inspector",
      });
    }
  },
);

export default router;
