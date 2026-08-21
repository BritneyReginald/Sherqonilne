"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/companies.ts
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db")); // adjust path to match your project
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// GET all companies — RSS staff only. Clients should never hit this one;
// it returns every company in the system.
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
router.get("/me", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("client"), authMiddleware_1.scopeClient, async (req, res) => {
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
        WHERE id = $1
        `, [req.user.siteId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "No site linked to this account",
            });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error("Get own site error:", err);
        res.status(500).json({
            error: "Failed to fetch client site",
        });
    }
});
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), async (req, res) => {
    try {
        const { name, email, logo, contactPerson, contactNumber } = req.body;
        if (!name || !email || !contactPerson || !contactNumber) {
            return res.status(400).json({
                error: "Client name, email, contact person and contact number are required",
            });
        }
        const result = await db_1.default.query(`
        INSERT INTO sites (
          name,
          email,
          logo,
          contact_person,
          contact_number
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `, [name, email, logo || null, contactPerson, contactNumber]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error("Create client site error:", err);
        res.status(500).json({
            error: "Failed to create client site",
        });
    }
});
exports.default = router;
