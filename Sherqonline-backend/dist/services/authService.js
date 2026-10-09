"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.encryptPassword = encryptPassword;
exports.decryptPassword = decryptPassword;
exports.generateTempPassword = generateTempPassword;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.buildTokenForUser = buildTokenForUser;
exports.getInspectorSites = getInspectorSites;
exports.issueCredentials = issueCredentials;
exports.createInspectorStaff = createInspectorStaff;
exports.provisionInspector = provisionInspector;
exports.deleteInspector = deleteInspector;
exports.createFirstAiderStaff = createFirstAiderStaff;
exports.deleteFirstAider = deleteFirstAider;
// services/authService.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const user_1 = require("../models/user");
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}
// --- Password hashing ---
async function hashPassword(plain) {
    return bcrypt_1.default.hash(plain, SALT_ROUNDS);
}
async function verifyPassword(plain, hash) {
    return bcrypt_1.default.compare(plain, hash);
}
// --- Credential encryption (for admin-retrievable passwords) ---
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY; // 32-byte hex string
const ALGORITHM = "aes-256-gcm";
if (!ENCRYPTION_KEY) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY is not set in environment variables");
}
if (!/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY must be exactly 64 hexadecimal characters");
}
function encryptPassword(plain) {
    const iv = crypto_1.default.randomBytes(12);
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encryptedBuf = Buffer.concat([
        cipher.update(plain, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return {
        encrypted: Buffer.concat([encryptedBuf, authTag]).toString("hex"),
        iv: iv.toString("hex"),
    };
}
function decryptPassword(encryptedHex, ivHex) {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const data = Buffer.from(encryptedHex, "hex");
    const authTag = data.subarray(data.length - 16);
    const encrypted = data.subarray(0, data.length - 16);
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
// --- Temp password generation (for RSS-issued client accounts) ---
function generateTempPassword() {
    // 12 random bytes -> readable base64-ish string, trimmed of ambiguous chars
    return crypto_1.default
        .randomBytes(9)
        .toString("base64")
        .replace(/[+/=]/g, "")
        .slice(0, 6);
}
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h"),
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
// --- Login (shared logic used by all role-specific controllers) ---
async function buildTokenForUser(user) {
    const payload = {
        userId: user.id,
        role: user.role,
    };
    if (user.role === "client") {
        const siteId = await (0, user_1.getClientSiteId)(user.id);
        if (siteId) {
            payload.siteId = siteId;
        }
    }
    // status/last_login bookkeeping
    if (user.status === "invited") {
        await (0, user_1.markUserActiveAndLogin)(user.id);
    }
    else {
        await (0, user_1.updateLastLogin)(user.id);
    }
    return signToken(payload);
}
// --- Inspector site list (used post-login to build the Fire Equipment handoff) ---
async function getInspectorSites(userId) {
    return (0, user_1.getInspectorSiteIds)(userId);
}
// --- Credential delivery email ---
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
async function sendCredentialsEmail(args) {
    const { identifierLabel, identifier, tempPassword, loginUrl, role, siteName } = args;
    // No hardcoded fallback address: credentials (including the plaintext
    // password) must only ever go to an address configured for this environment.
    const notifyTo = process.env.CREDENTIALS_NOTIFY_EMAIL;
    if (!notifyTo) {
        throw new Error("CREDENTIALS_NOTIFY_EMAIL is not set; cannot deliver credentials");
    }
    const subject = role === "client"
        ? `New client login created — ${siteName ?? "client"}`
        : `New Fire Equipment Inspector login created${siteName ? ` — ${siteName}` : ""}`;
    const roleLabel = role === "client" ? "client" : "Fire Equipment inspector";
    const forSite = siteName ? ` for ${escapeHtml(siteName)}` : "";
    const html = `
    <p>Hello,</p>
    <p>A new ${roleLabel} account${forSite} was created on the SHERQ Online platform.</p>
    <p><strong>${identifierLabel}:</strong> ${escapeHtml(identifier)}</p>
    <p><strong>Login link:</strong> <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></p>
    <p><strong>Password:</strong> ${escapeHtml(tempPassword)}</p>
    <p>Please forward these details to the ${roleLabel} securely, or share them as you see fit.</p>
  `;
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: notifyTo,
        subject,
        html,
    });
}
async function issueCredentials(params) {
    const { email, role, issuedByUserId, siteId, siteName, loginUrl } = params;
    if (!siteId) {
        throw new Error("siteId is required for client accounts");
    }
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    const user = await (0, user_1.createUser)(email, passwordHash, role, issuedByUserId);
    await (0, user_1.linkClientToSite)(user.id, siteId);
    let deliveryStatus = "sent";
    try {
        await sendCredentialsEmail({
            identifierLabel: "Email",
            identifier: email,
            tempPassword,
            loginUrl,
            role,
            siteName,
        });
    }
    catch (err) {
        console.error("Failed to send credentials email:", err);
        deliveryStatus = "failed";
    }
    // RSS's "copy of the details" — logged in-app, not re-emailed with the plaintext password
    await (0, user_1.logCredentialIssuance)(user.id, issuedByUserId, "email", deliveryStatus);
    return { user, deliveryStatus };
}
// --- Username / password generation for staff-style accounts ---
function generateUsername(fullName) {
    // literal name, trimmed and collapsed to single spaces
    return fullName.trim().replace(/\s+/g, " ");
}
function generateInspectorPassword(employeeNumber, surname) {
    const cleanSurname = surname.trim();
    const capitalizedSurname = cleanSurname.charAt(0).toUpperCase() + cleanSurname.slice(1).toLowerCase();
    return `${employeeNumber}${capitalizedSurname}`;
}
// --- Inspectors: generated username, assigned to sites in one transaction ---
async function createInspectorStaff(employeeNumber, fullName, surname, siteIds, createdBy) {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        let username = generateUsername(fullName);
        const existing = await client.query(`SELECT id FROM users WHERE email = $1`, [username]);
        if (existing.rows.length > 0) {
            username = `${username} (${employeeNumber})`;
        }
        const plainPassword = generateInspectorPassword(employeeNumber, surname);
        const passwordHash = await hashPassword(plainPassword);
        const { encrypted, iv } = encryptPassword(plainPassword);
        const userResult = await client.query(`
      INSERT INTO users (
        email,
        password_hash,
        role,
        status,
        password_encrypted,
        password_iv,
        created_by
      )
      VALUES ($1,$2,'inspector','active',$3,$4,$5)
      RETURNING id,email
      `, [username, passwordHash, encrypted, iv, createdBy]);
        const user = userResult.rows[0];
        await client.query(`
      INSERT INTO inspector_profiles
      (
        user_id,
        employee_number,
        full_name,
        surname
      )
      VALUES ($1,$2,$3,$4)
      `, [user.id, employeeNumber, fullName, surname]);
        // Assign sites (this is what the Security & Privacy page reads)
        for (const siteId of siteIds) {
            await client.query(`
        INSERT INTO inspector_assignments
        (user_id, site_id)
        VALUES ($1,$2)
        `, [user.id, siteId]);
        }
        await client.query("COMMIT");
        return {
            id: user.id,
            username: user.email,
            plainPassword,
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Creates an inspector (generated username, sites assigned) and sends the
 * login details + hosted login link to the RSS notify address.
 */
async function provisionInspector(params) {
    const { employeeNumber, fullName, surname, siteIds, siteNames, issuedByUserId, loginUrl, } = params;
    const created = await createInspectorStaff(employeeNumber, fullName, surname, siteIds, issuedByUserId);
    let deliveryStatus = "sent";
    try {
        await sendCredentialsEmail({
            identifierLabel: "Username",
            identifier: created.username,
            tempPassword: created.plainPassword,
            loginUrl,
            role: "inspector",
            siteName: siteNames.join(", "),
        });
    }
    catch (err) {
        console.error("Failed to send inspector credentials email:", err);
        deliveryStatus = "failed";
    }
    await (0, user_1.logCredentialIssuance)(created.id, issuedByUserId, "email", deliveryStatus);
    return { user: { id: created.id, username: created.username }, deliveryStatus };
}
async function deleteInspector(userId) {
    await db_1.default.query(`DELETE FROM users
     WHERE id = $1
       AND role = 'inspector'`, [userId]);
}
// --- First aiders ---
function generateFirstAiderPassword(employeeNumber, surname) {
    const cleanSurname = surname.trim();
    const capitalizedSurname = cleanSurname.charAt(0).toUpperCase() + cleanSurname.slice(1).toLowerCase();
    return `${employeeNumber}${capitalizedSurname}`;
}
async function createFirstAiderStaff(employeeNumber, fullName, surname, siteIds, createdBy) {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        let username = generateUsername(fullName);
        const existing = await client.query(`SELECT id FROM users WHERE email = $1`, [username]);
        if (existing.rows.length > 0) {
            username = `${username} (${employeeNumber})`;
        }
        const plainPassword = generateFirstAiderPassword(employeeNumber, surname);
        const passwordHash = await hashPassword(plainPassword);
        const { encrypted, iv } = encryptPassword(plainPassword);
        const userResult = await client.query(`
      INSERT INTO users (
        email, password_hash, role, status,
        password_encrypted, password_iv, created_by
      )
      VALUES ($1,$2,'first_aider','active',$3,$4,$5)
      RETURNING id,email
      `, [username, passwordHash, encrypted, iv, createdBy]);
        const user = userResult.rows[0];
        await client.query(`
      INSERT INTO first_aider_profiles
      (user_id, employee_number, full_name, surname)
      VALUES ($1,$2,$3,$4)
      `, [user.id, employeeNumber, fullName, surname]);
        for (const siteId of siteIds) {
            await client.query(`INSERT INTO first_aider_assignments (user_id, site_id) VALUES ($1,$2)`, [user.id, siteId]);
        }
        await client.query("COMMIT");
        return { id: user.id, username: user.email, plainPassword };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function deleteFirstAider(userId) {
    await db_1.default.query(`DELETE FROM users WHERE id = $1 AND role = 'first_aider'`, [
        userId,
    ]);
}
