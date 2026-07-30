// routes/sites.ts
import express from "express";
import pool from "../config/db"; // adjust path to match your project
import { authenticate, authorize, scopeClient } from "../middleware/authMiddleware";

const router = express.Router();

// GET all sites — RSS staff only.
router.get("/", authenticate, authorize("rss_staff"), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM sites ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error("Get sites error:", err);
    res.status(500).json({ error: "Failed to fetch sites" });
  }
});

// GET only the logged-in client's own sites (via their linked company).
router.get(
  "/me",
  authenticate,
  authorize("client"),
  scopeClient,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM sites WHERE company_id = $1 ORDER BY name`,
        [req.user!.companyId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get own sites error:", err);
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  }
);

// POST create a new site — RSS staff only (RSS registers client sites,
// clients don't create their own, per your earlier requirement).
router.post("/", authenticate, authorize("rss_staff"), async (req, res) => {
  try {
    const { companyId, name, location } = req.body;
    if (!companyId || !name) {
      return res.status(400).json({ error: "companyId and name are required" });
    }

    const result = await pool.query(
      `INSERT INTO sites (company_id, name, location)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [companyId, name, location ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create site error:", err);
    res.status(500).json({ error: "Failed to create site" });
  }
});

export default router;