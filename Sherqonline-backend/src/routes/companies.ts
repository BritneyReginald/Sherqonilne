// routes/companies.ts
import express from "express";
import pool from "../config/db"; // adjust path to match your project
import { authenticate, authorize, scopeClient } from "../middleware/authMiddleware";

const router = express.Router();

// GET all companies — RSS staff only. Clients should never hit this one;
// it returns every company in the system.
router.get("/", authenticate, authorize("rss_staff"), async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM companies ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error("Get companies error:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
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
        `SELECT * FROM companies WHERE id = $1`,
        [req.user!.companyId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No company linked to this account" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Get own company error:", err);
      res.status(500).json({ error: "Failed to fetch company" });
    }
  }
);

export default router;