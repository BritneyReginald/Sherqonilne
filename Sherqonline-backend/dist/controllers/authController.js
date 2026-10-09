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
// Returns the configured login URL, or null if it's missing. This avoids the
// old behaviour where a missing variable became the literal text "undefined"
// inside the credentials email.
function getLoginUrl(name) {
    const value = process.env[name]?.trim();
    return value ? value : null;
}
async function handleLogin(req, res, role) {
    try {
        // Inspectors and first aiders log in with a generated username (stored in
        // users.email). Accept either `username` or `email` in the body so
        // existing clients keep working.
        const { email, username, password } = req.body;
        const identifier = String(username ?? email ?? "").trim();
        const usesUsername = role === "inspector" || role === "first_aider";
        const identifierLabel = usesUsername ? "username" : "email";
        if (!identifier || !password) {
            return res.status(400).json({
                error: `${usesUsername ? "Username" : "Email"} and password are required`,
            });
        }
        const user = await (0, user_1.findUserByEmailAndRole)(identifier, role);
        if (!user) {
            return res.status(401).json({
                error: `Invalid ${identifierLabel} or password`,
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
                error: `Invalid ${identifierLabel} or password`,
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
        const loginUrl = getLoginUrl("CLIENT_LOGIN_URL");
        if (!loginUrl) {
            console.error("CLIENT_LOGIN_URL is not set");
            return res.status(500).json({
                error: "Client login URL is not configured on the server",
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
            loginUrl,
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
// Inspectors log in with a generated username (from their full name) and are
// assigned to one or more sites at creation time. The assignment is written to
// inspector_assignments, the same table the Security & Privacy page reads.
async function issueInspectorCredentials(req, res) {
    try {
        const { employeeNumber, fullName, surname, siteIds } = req.body;
        if (!employeeNumber ||
            !fullName ||
            !surname ||
            !Array.isArray(siteIds) ||
            siteIds.length === 0) {
            return res.status(400).json({
                error: "employeeNumber, fullName, surname and a non-empty siteIds array are required",
            });
        }
        const cleanSiteIds = [...new Set(siteIds.map(Number))];
        if (!cleanSiteIds.every((id) => Number.isInteger(id) && id > 0)) {
            return res.status(400).json({ error: "siteIds must be valid site ids" });
        }
        const loginUrl = getLoginUrl("INSPECTOR_LOGIN_URL");
        if (!loginUrl) {
            console.error("INSPECTOR_LOGIN_URL is not set");
            return res.status(500).json({
                error: "Inspector login URL is not configured on the server",
            });
        }
        const siteResult = await db_1.default.query(`SELECT id, name FROM sites WHERE id = ANY($1)`, [cleanSiteIds]);
        if (siteResult.rows.length !== cleanSiteIds.length) {
            return res.status(404).json({ error: "One or more sites not found" });
        }
        const issuedByUserId = req.user.id;
        const { user, deliveryStatus } = await (0, authService_1.provisionInspector)({
            employeeNumber: String(employeeNumber).trim(),
            fullName: String(fullName).trim(),
            surname: String(surname).trim(),
            siteIds: cleanSiteIds,
            siteNames: siteResult.rows.map((row) => row.name),
            issuedByUserId,
            loginUrl,
        });
        return res.status(201).json({
            message: "Inspector account created",
            user: { id: user.id, username: user.username },
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
