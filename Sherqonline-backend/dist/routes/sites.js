"use strict";
// routes/sites.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/*
 * ============================================================
 * GET ALL SITES
 * ============================================================
 *
 * RSS staff can see all sites they are responsible for
 * inspecting.
 */
router.get("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), async (_req, res) => {
    try {
        const result = await db_1.default.query(`
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
    }
    catch (err) {
        console.error("Get sites error:", err);
        res.status(500).json({
            error: "Failed to fetch sites",
        });
    }
});
/*
 * ============================================================
 * CREATE SITE
 * ============================================================
 *
 * RSS staff creates/registers the client inspection site.
 */
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), async (req, res) => {
    try {
        const { name, logo, email, contact_person, contact_number, } = req.body;
        if (!name) {
            return res.status(400).json({
                error: "Site name is required",
            });
        }
        const result = await db_1.default.query(`
        INSERT INTO sites (
          name,
          logo,
          email,
          contact_person,
          contact_number
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `, [
            name,
            logo ?? null,
            email ?? null,
            contact_person ?? null,
            contact_number ?? null,
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error("Create site error:", err);
        res.status(500).json({
            error: "Failed to create site",
        });
    }
});
router.delete("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query(`DELETE FROM sites
         WHERE id = $1
         RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Site not found",
            });
        }
        res.json({
            message: "Site deleted successfully",
            site: result.rows[0],
        });
    }
    catch (err) {
        console.error("Delete site error:", err);
        res.status(500).json({
            error: "Failed to delete site",
        });
    }
});
exports.default = router;
