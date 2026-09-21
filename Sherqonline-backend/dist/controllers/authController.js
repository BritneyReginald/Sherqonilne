"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginStaff = loginStaff;
exports.loginClient = loginClient;
exports.loginInspector = loginInspector;
exports.loginFirstAider = loginFirstAider;
exports.issueClientCredentials = issueClientCredentials;
exports.issueInspectorCredentials = issueInspectorCredentials;
const user_1 = require("../models/user");
const authService_1 = require("../services/authService");
const db_1 = __importDefault(require("../config/db"));
async function loginStaff(req, res) {
    return handleLogin(req, res, "rss_staff");
}
async function loginClient(req, res) {
    return handleLogin(req, res, "client");
}
async function loginInspector(req, res) {
    return handleLogin(req, res, "inspector");
}
async function loginFirstAider(req, res) {
    return handleLogin(req, res, "first_aider");
}
async function handleLogin(req, res, role) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }
        const user = await (0, user_1.findUserByEmailAndRole)(email, role);
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        if (user.status === "disabled") {
            return res.status(403).json({
                error: "This account has been disabled",
            });
        }
        const validPassword = await (0, authService_1.verifyPassword)(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        let company = null;
        let fullName;
        let surname;
        if (role === "client") {
            const companyResult = await db_1.default.query(`
    SELECT
      s.id,
      s.name,
      s.logo
    FROM client_users cu
    JOIN sites s ON s.id = cu.site_id
    WHERE cu.user_id = $1
    LIMIT 1
    `, [user.id]);
            company = companyResult.rows[0] ?? null;
        }
        if (role === "first_aider") {
            const profileResult = await db_1.default.query(`SELECT full_name, surname FROM first_aider_profiles WHERE user_id = $1`, [user.id]);
            fullName = profileResult.rows[0]?.full_name;
            surname = profileResult.rows[0]?.surname;
        }
        const token = await (0, authService_1.buildTokenForUser)(user);
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                company,
                fullName,
                surname,
            },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            error: "Something went wrong. Please try again.",
        });
    }
}
async function issueClientCredentials(req, res) {
    try {
        const { email, siteId } = req.body;
        if (!email || !siteId) {
            return res.status(400).json({
                error: "email and siteId are required",
            });
        }
        const siteResult = await db_1.default.query(`SELECT name FROM sites WHERE id = $1`, [siteId]);
        if (siteResult.rows.length === 0) {
            return res.status(404).json({
                error: "Site not found",
            });
        }
        const siteName = siteResult.rows[0].name;
        const issuedByUserId = req.user.id;
        const { user, deliveryStatus } = await (0, authService_1.issueCredentials)({
            email,
            role: "client",
            issuedByUserId,
            siteId,
            siteName,
            loginUrl: `${process.env.CLIENT_LOGIN_URL}`,
        });
        return res.status(201).json({
            message: "Client account created",
            user: {
                id: user.id,
                email: user.email,
            },
            deliveryStatus,
        });
    }
    catch (err) {
        console.error("Issue client credentials error:", err);
        return res.status(500).json({
            error: "Failed to create client account",
        });
    }
}
async function issueInspectorCredentials(req, res) {
    try {
        const { email, siteIds } = req.body;
        if (!email || !Array.isArray(siteIds) || siteIds.length === 0) {
            return res
                .status(400)
                .json({ error: "email and a non-empty siteIds array are required" });
        }
        const issuedByUserId = req.user.id;
        const { user, deliveryStatus } = await (0, authService_1.issueCredentials)({
            email,
            role: "inspector",
            issuedByUserId,
            siteIds,
            loginUrl: `${process.env.INSPECTOR_LOGIN_URL}`,
        });
        return res.status(201).json({
            message: "Inspector account created",
            user: { id: user.id, email: user.email },
            deliveryStatus,
        });
    }
    catch (err) {
        console.error("Issue inspector credentials error:", err);
        return res
            .status(500)
            .json({ error: "Failed to create inspector account" });
    }
}
