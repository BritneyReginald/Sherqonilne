import express from "express";
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();

/*
 * GET ALL SITES (RSS staff only)
 */
router.get("/", authenticate, authorize("rss_staff"), async (_req, res) => {
  try {
    const result = await pool.query(`
        SELECT
          id,
          name,
          logo,
          email,
          contact_person,
          contact_number,
          created_at
        FROM sites
        ORDER BY name
      `);

    res.json(result.rows);
  } catch (err) {
    console.error("Get sites error:", err);

    res.status(500).json({
      error: "Failed to fetch sites",
    });
  }
});

/*
 * GET CLIENT ACCESS FOR A SITE (RSS staff only)
 *
 * Returns the client login linked to this site, or null if none has
 * been created yet. Never returns any password material.
 */
router.get(
  "/:id/client-access",
  authenticate,
  authorize("rss_staff"),
  async (req, res) => {
    try {
      const siteId = Number(req.params.id);

      if (!Number.isInteger(siteId)) {
        return res.status(400).json({ error: "Invalid site id" });
      }

      const result = await pool.query(
        `
        SELECT
          u.id,
          u.email,
          u.status,
          u.last_login_at
        FROM client_users cu
        JOIN users u ON u.id = cu.user_id
        WHERE cu.site_id = $1
        `,
        [siteId],
      );

      res.json({ clientAccess: result.rows[0] ?? null });
    } catch (err) {
      console.error("Get client access error:", err);

      res.status(500).json({
        error: "Failed to fetch client access",
      });
    }
  },
);

/*
 * CREATE SITE (RSS staff registers the client inspection site)
 */
router.post("/", authenticate, authorize("rss_staff"), async (req, res) => {
  try {
    const { name, logo, email, contact_person, contact_number } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Site name is required",
      });
    }

    // Site names are how older screens still match records, so two
    // sites must never share a name.
    const duplicate = await pool.query(
      `SELECT 1 FROM sites WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))`,
      [name],
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        error: "A site with this name already exists",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO sites (
          name,
          logo,
          email,
          contact_person,
          contact_number
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
      [
        name,
        logo ?? null,
        email ?? null,
        contact_person ?? null,
        contact_number ?? null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create site error:", err);

    res.status(500).json({
      error: "Failed to create site",
    });
  }
});

/*
 * DELETE SITE
 *
 * Also deletes the site's client login. client_users cascades when the
 * site goes, but the users row would be left behind and its email would
 * stay taken, so the client user is removed first, in one transaction.
 */
router.delete(
  "/:id",
  authenticate,
  authorize("rss_staff"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;

      await client.query("BEGIN");

      const clientUsers = await client.query(
        `SELECT user_id FROM client_users WHERE site_id = $1`,
        [id],
      );

      const clientUserIds = clientUsers.rows.map((row) => row.user_id);

      if (clientUserIds.length > 0) {
        await client.query(
          `DELETE FROM users
           WHERE id = ANY($1::int[])
             AND role = 'client'`,
          [clientUserIds],
        );
      }

      const result = await client.query(
        `DELETE FROM sites
         WHERE id = $1
         RETURNING *`,
        [id],
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          error: "Site not found",
        });
      }

      await client.query("COMMIT");

      res.json({
        message: "Site deleted successfully",
        site: result.rows[0],
      });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      console.error("Delete site error:", err);

      res.status(500).json({
        error: "Failed to delete site",
      });
    } finally {
      client.release();
    }
  },
);

/*
 * UPDATE SITE
 *
 * Also pushes a renamed site's name into the display-name columns on
 * the registers, in the same transaction, so old and new never differ.
 */
router.patch("/:id", authenticate, authorize("rss_staff"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const { name, logo, email, contact_person, contact_number } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Site name is required",
      });
    }

    const duplicate = await client.query(
      `SELECT 1 FROM sites
        WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND id <> $2`,
      [name, id],
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        error: "A site with this name already exists",
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE sites
        SET
          name = $1,
          logo = $2,
          email = $3,
          contact_person = $4,
          contact_number = $5
        WHERE id = $6
        RETURNING *
        `,
      [
        name,
        logo ?? null,
        email ?? null,
        contact_person ?? null,
        contact_number ?? null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Site not found",
      });
    }

    const newName = result.rows[0].name;

    await client.query(`UPDATE employees SET site_location = $1 WHERE site_id = $2`, [newName, id]);
    await client.query(`UPDATE legal_appointments SET site_name = $1 WHERE site_id = $2`, [newName, id]);
    await client.query(`UPDATE incident_records SET site = $1 WHERE site_id = $2`, [newName, id]);
    await client.query(`UPDATE risk_assessments SET linked_site = $1 WHERE site_id = $2`, [newName, id]);

    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Update site error:", err);

    res.status(500).json({
      error: "Failed to update site",
    });
  } finally {
    client.release();
  }
});

export default router;