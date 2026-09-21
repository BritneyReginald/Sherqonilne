import express from "express";
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  createFirstAiderStaff,
  decryptPassword,
  encryptPassword,
  hashPassword,
  deleteFirstAider,
} from "../services/authService";
import { updateFirstAiderSites } from "../controllers/userController"; // needs writing — see below

const router = express.Router();

async function requireSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const result = await pool.query(`SELECT is_super_admin FROM users WHERE id = $1`, [req.user!.id]);
  if (!result.rows[0]?.is_super_admin) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}

router.get("/first-aiders", authenticate, authorize("rss_staff"), requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
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
      let password: string | null = null;
      try {
        password = decryptPassword(row.password_encrypted, row.password_iv);
      } catch (error) {
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
  } catch (err) {
    console.error("List first aiders error:", err);
    res.status(500).json({ error: "Failed to load first aider accounts" });
  }
});

router.post("/first-aiders", authenticate, authorize("rss_staff"), requireSuperAdmin, async (req, res) => {
  try {
    const { employeeNumber, fullName, surname, siteIds } = req.body;
    if (!employeeNumber || !fullName || !surname) {
      return res.status(400).json({ error: "employeeNumber, fullName, and surname are required" });
    }

    const result = await createFirstAiderStaff(employeeNumber, fullName, surname, siteIds || [], req.user!.id);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("Create first aider error:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "That employee number is already in use" });
    }
    res.status(500).json({ error: "Failed to create first aider account" });
  }
});

router.put("/first-aiders/:id/sites", authenticate, authorize("rss_staff"), requireSuperAdmin, updateFirstAiderSites);

router.patch("/first-aiders/:id/reset-password", authenticate, authorize("rss_staff"), requireSuperAdmin, async (req, res) => {
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
});

router.patch("/first-aiders/:id/status", authenticate, authorize("rss_staff"), requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "disabled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await pool.query(`UPDATE users SET status = $1 WHERE id = $2`, [status, req.params.id]);
    res.json({ message: `First aider ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update first aider status" });
  }
});

router.delete("/first-aiders/:id", authenticate, authorize("rss_staff"), requireSuperAdmin, async (req, res) => {
  try {
    await deleteFirstAider(Number(req.params.id));
    res.json({ message: "First aider deleted successfully" });
  } catch (err) {
    console.error("Delete first aider error:", err);
    res.status(500).json({ error: "Failed to delete first aider" });
  }
});

export default router;