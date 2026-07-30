"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/sites.ts
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db")); // adjust path to match your project
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// GET all sites — RSS staff only.
router.get("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT * FROM sites ORDER BY name`);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Get sites error:", err);
        res.status(500).json({ error: "Failed to fetch sites" });
    }
});
// GET only the logged-in client's own sites (via their linked company).
router.get("/me", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("client"), authMiddleware_1.scopeClient, async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT * FROM sites WHERE company_id = $1 ORDER BY name`, [req.user.companyId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Get own sites error:", err);
        res.status(500).json({ error: "Failed to fetch sites" });
    }
});
// POST create a new site — RSS staff only (RSS registers client sites,
// clients don't create their own, per your earlier requirement).
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"), async (req, res) => {
    try {
        const { companyId, name, location } = req.body;
        if (!companyId || !name) {
            return res.status(400).json({ error: "companyId and name are required" });
        }
        const result = await db_1.default.query(`INSERT INTO sites (company_id, name, location)
       VALUES ($1, $2, $3)
       RETURNING *`, [companyId, name, location ?? null]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error("Create site error:", err);
        res.status(500).json({ error: "Failed to create site" });
    }
});
exports.default = router;
