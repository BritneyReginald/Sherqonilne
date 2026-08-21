// routes/companies.ts
import express from "express";
import pool from "../config/db"; // adjust path to match your project
import {
  authenticate,
  authorize,
  scopeClient,
} from "../middleware/authMiddleware";

const router = express.Router();

// GET all companies — RSS staff only. Clients should never hit this one;
// it returns every company in the system.
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
    console.error("Get clients error:", err);

    res.status(500).json({
      error: "Failed to fetch clients",
    });
  }
});

// GET the logged-in client's own company only.
// scopeClient middleware attaches req.user.companyId, fetched fresh from the
// DB (not trusted from the JWT), so this can't be tricked into returning
// someone else's company.
router.get(
  "/me",
  authenticate,
  authorize("client"),
  scopeClient,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          logo,
          email,
          contact_person,
          contact_number,
          created_at
        FROM sites
        WHERE id = $1
        `,
        [req.user!.siteId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "No site linked to this account",
        });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Get own site error:", err);

      res.status(500).json({
        error: "Failed to fetch client site",
      });
    }
  },
);

router.post("/", authenticate, authorize("rss_staff"), async (req, res) => {
  try {
    const { name, email, logo, contactPerson, contactNumber } = req.body;

    if (!name || !email || !contactPerson || !contactNumber) {
      return res.status(400).json({
        error:
          "Client name, email, contact person and contact number are required",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO sites (
          name,
          email,
          logo,
          contact_person,
          contact_number
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
      [name, email, logo || null, contactPerson, contactNumber],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create client site error:", err);

    res.status(500).json({
      error: "Failed to create client site",
    });
  }
});

export default router;
