import express from "express";
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();

/*
 * GET ALL SITES
 *
 * RSS staff can see all sites that RSS is responsible for inspecting.
 */
router.get(
  "/",
  authenticate,
  authorize("rss_staff"),
  async (_req, res) => {
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
  }
);

/*
 * CREATE SITE
 *
 * RSS staff creates/registers the client site.
 *
 * Example:
 *   name = "Secunda"
 *   email = "contact@example.com"
 *   contact_person = "John Doe"
 *   contact_number = "0123456789"
 */
router.post(
  "/",
  authenticate,
  authorize("rss_staff"),
  async (req, res) => {
    try {
      const {
        name,
        logo,
        email,
        contact_person,
        contact_number,
      } = req.body;

      if (
        !name ||
        !email ||
        !contact_person ||
        !contact_number
      ) {
        return res.status(400).json({
          error:
            "Site name, email, contact person and contact number are required",
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
          email,
          contact_person,
          contact_number,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Create site error:", err);

      res.status(500).json({
        error: "Failed to create site",
      });
    }
  }
);

export default router;