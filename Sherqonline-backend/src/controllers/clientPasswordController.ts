// controllers/clientPasswordController.ts  (NEW FILE)
import { Request, Response } from "express";
import pool from "../config/db";
import {
  decryptPassword,
  encryptPassword,
  generateTempPassword,
  hashPassword,
} from "../services/authService";

const findClientUser = async (siteId: number) => {
  const result = await pool.query(
    `
    SELECT u.id, u.password_encrypted, u.password_iv
    FROM client_users cu
    JOIN users u ON u.id = cu.user_id
    WHERE cu.site_id = $1
      AND u.role = 'client'
    `,
    [siteId],
  );
  return result.rows[0] || null;
};

// RSS staff only (enforced in routes/auth.ts).
// Returns the client login's password for a site, decrypted from the
// AES-256-GCM copy stored when the credentials were issued. Returns
// { password: null } for logins created before that copy was stored.
export const getClientPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
      password: decryptPassword(row.password_encrypted, row.password_iv),
    });
  } catch (err: any) {
    console.error("Failed to load client password:", err);
    res.status(500).json({ error: "Failed to load client password" });
  }
};

// RSS staff only. Generates a new temporary password for the site's
// existing client login, replaces the old one (the old password stops
// working) and returns the new one so it can be shown on screen.
export const resetClientPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    const newPassword = generateTempPassword();
    const passwordHash = await hashPassword(newPassword);
    const { encrypted, iv } = encryptPassword(newPassword);

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1,
          password_encrypted = $2,
          password_iv = $3
      WHERE id = $4
      `,
      [passwordHash, encrypted, iv, row.id],
    );

    res.set("Cache-Control", "no-store");
    res.json({ password: newPassword });
  } catch (err: any) {
    console.error("Failed to reset client password:", err);
    res.status(500).json({ error: "Failed to reset client password" });
  }
};