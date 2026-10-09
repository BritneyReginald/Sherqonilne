// services/authService.ts
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  User,
  UserRole,
  createUser,
  linkClientToSite,
  logCredentialIssuance,
  markUserActiveAndLogin,
  updateLastLogin,
  getClientSiteId,
  getInspectorSiteIds,
} from "../models/user";
import pool from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 12;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// --- Password hashing ---

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// --- Credential encryption (for admin-retrievable passwords) ---

const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY as string; // 32-byte hex string
const ALGORITHM = "aes-256-gcm";

if (!ENCRYPTION_KEY) {
  throw new Error(
    "CREDENTIAL_ENCRYPTION_KEY is not set in environment variables",
  );
}

if (!/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
  throw new Error(
    "CREDENTIAL_ENCRYPTION_KEY must be exactly 64 hexadecimal characters",
  );
}

export function encryptPassword(plain: string): {
  encrypted: string;
  iv: string;
} {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

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

export function decryptPassword(encryptedHex: string, ivHex: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(encryptedHex, "hex");

  const authTag = data.subarray(data.length - 16);
  const encrypted = data.subarray(0, data.length - 16);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

// --- Temp password generation (for RSS-issued client accounts) ---

export function generateTempPassword(): string {
  // 12 random bytes -> readable base64-ish string, trimmed of ambiguous chars
  return crypto
    .randomBytes(9)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, 6);
}

// --- JWT ---

export interface AuthTokenPayload {
  userId: number;
  role: UserRole;
  siteId?: number; // present only for 'client'
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

// --- Login (shared logic used by all role-specific controllers) ---

export async function buildTokenForUser(user: User): Promise<string> {
  const payload: AuthTokenPayload = {
    userId: user.id,
    role: user.role,
  };

  if (user.role === "client") {
    const siteId = await getClientSiteId(user.id);

    if (siteId) {
      payload.siteId = siteId;
    }
  }

  // status/last_login bookkeeping
  if (user.status === "invited") {
    await markUserActiveAndLogin(user.id);
  } else {
    await updateLastLogin(user.id);
  }

  return signToken(payload);
}

// --- Inspector site list (used post-login to build the Fire Equipment handoff) ---

export async function getInspectorSites(userId: number): Promise<number[]> {
  return getInspectorSiteIds(userId);
}

// --- Credential delivery email ---

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendCredentialsEmail(args: {
  identifierLabel: "Email" | "Username";
  identifier: string;
  tempPassword: string;
  loginUrl: string;
  role: "client" | "inspector";
  siteName?: string;
}) {
  const { identifierLabel, identifier, tempPassword, loginUrl, role, siteName } =
    args;

  // No hardcoded fallback address: credentials (including the plaintext
  // password) must only ever go to an address configured for this environment.
  const notifyTo = process.env.CREDENTIALS_NOTIFY_EMAIL;
  if (!notifyTo) {
    throw new Error(
      "CREDENTIALS_NOTIFY_EMAIL is not set; cannot deliver credentials",
    );
  }

  const subject =
    role === "client"
      ? `New client login created — ${siteName ?? "client"}`
      : `New Fire Equipment Inspector login created${
          siteName ? ` — ${siteName}` : ""
        }`;

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

// --- Client credential issuance (RSS-only) ---

interface IssueClientCredentialsParams {
  email: string;
  role: "client";
  issuedByUserId: number;
  siteId: number;
  siteName?: string; // for the email copy
  loginUrl: string; // e.g. https://yourapp.com/login/client
}

export async function issueCredentials(params: IssueClientCredentialsParams) {
  const { email, role, issuedByUserId, siteId, siteName, loginUrl } = params;

  if (!siteId) {
    throw new Error("siteId is required for client accounts");
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await createUser(email, passwordHash, role, issuedByUserId);

  await linkClientToSite(user.id, siteId);

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
  } catch (err) {
    console.error("Failed to send credentials email:", err);
    deliveryStatus = "failed";
  }

  // RSS's "copy of the details" — logged in-app, not re-emailed with the plaintext password
  await logCredentialIssuance(user.id, issuedByUserId, "email", deliveryStatus);

  return { user, deliveryStatus };
}

// --- Username / password generation for staff-style accounts ---

function generateUsername(fullName: string): string {
  // literal name, trimmed and collapsed to single spaces
  return fullName.trim().replace(/\s+/g, " ");
}

function generateInspectorPassword(
  employeeNumber: string,
  surname: string,
): string {
  const cleanSurname = surname.trim();

  const capitalizedSurname =
    cleanSurname.charAt(0).toUpperCase() + cleanSurname.slice(1).toLowerCase();

  return `${employeeNumber}${capitalizedSurname}`;
}

// --- Inspectors: generated username, assigned to sites in one transaction ---

export async function createInspectorStaff(
  employeeNumber: string,
  fullName: string,
  surname: string,
  siteIds: number[],
  createdBy: number,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let username = generateUsername(fullName);

    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [username],
    );

    if (existing.rows.length > 0) {
      username = `${username} (${employeeNumber})`;
    }

    const plainPassword = generateInspectorPassword(employeeNumber, surname);

    const passwordHash = await hashPassword(plainPassword);

    const { encrypted, iv } = encryptPassword(plainPassword);

    const userResult = await client.query(
      `
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
      `,
      [username, passwordHash, encrypted, iv, createdBy],
    );

    const user = userResult.rows[0];

    await client.query(
      `
      INSERT INTO inspector_profiles
      (
        user_id,
        employee_number,
        full_name,
        surname
      )
      VALUES ($1,$2,$3,$4)
      `,
      [user.id, employeeNumber, fullName, surname],
    );

    // Assign sites (this is what the Security & Privacy page reads)
    for (const siteId of siteIds) {
      await client.query(
        `
        INSERT INTO inspector_assignments
        (user_id, site_id)
        VALUES ($1,$2)
        `,
        [user.id, siteId],
      );
    }

    await client.query("COMMIT");

    return {
      id: user.id,
      username: user.email,
      plainPassword,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

interface ProvisionInspectorParams {
  employeeNumber: string;
  fullName: string;
  surname: string;
  siteIds: number[];
  siteNames: string[]; // for the email copy
  issuedByUserId: number;
  loginUrl: string; // INSPECTOR_LOGIN_URL
}

/**
 * Creates an inspector (generated username, sites assigned) and sends the
 * login details + hosted login link to the RSS notify address.
 */
export async function provisionInspector(params: ProvisionInspectorParams) {
  const {
    employeeNumber,
    fullName,
    surname,
    siteIds,
    siteNames,
    issuedByUserId,
    loginUrl,
  } = params;

  const created = await createInspectorStaff(
    employeeNumber,
    fullName,
    surname,
    siteIds,
    issuedByUserId,
  );

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
  } catch (err) {
    console.error("Failed to send inspector credentials email:", err);
    deliveryStatus = "failed";
  }

  await logCredentialIssuance(
    created.id,
    issuedByUserId,
    "email",
    deliveryStatus,
  );

  return { user: { id: created.id, username: created.username }, deliveryStatus };
}

export async function deleteInspector(userId: number) {
  await pool.query(
    `DELETE FROM users
     WHERE id = $1
       AND role = 'inspector'`,
    [userId],
  );
}

// --- First aiders ---

function generateFirstAiderPassword(
  employeeNumber: string,
  surname: string,
): string {
  const cleanSurname = surname.trim();
  const capitalizedSurname =
    cleanSurname.charAt(0).toUpperCase() + cleanSurname.slice(1).toLowerCase();
  return `${employeeNumber}${capitalizedSurname}`;
}

export async function createFirstAiderStaff(
  employeeNumber: string,
  fullName: string,
  surname: string,
  siteIds: number[],
  createdBy: number,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let username = generateUsername(fullName);

    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [username],
    );

    if (existing.rows.length > 0) {
      username = `${username} (${employeeNumber})`;
    }

    const plainPassword = generateFirstAiderPassword(employeeNumber, surname);
    const passwordHash = await hashPassword(plainPassword);
    const { encrypted, iv } = encryptPassword(plainPassword);

    const userResult = await client.query(
      `
      INSERT INTO users (
        email, password_hash, role, status,
        password_encrypted, password_iv, created_by
      )
      VALUES ($1,$2,'first_aider','active',$3,$4,$5)
      RETURNING id,email
      `,
      [username, passwordHash, encrypted, iv, createdBy],
    );

    const user = userResult.rows[0];

    await client.query(
      `
      INSERT INTO first_aider_profiles
      (user_id, employee_number, full_name, surname)
      VALUES ($1,$2,$3,$4)
      `,
      [user.id, employeeNumber, fullName, surname],
    );

    for (const siteId of siteIds) {
      await client.query(
        `INSERT INTO first_aider_assignments (user_id, site_id) VALUES ($1,$2)`,
        [user.id, siteId],
      );
    }

    await client.query("COMMIT");

    return { id: user.id, username: user.email, plainPassword };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteFirstAider(userId: number) {
  await pool.query(`DELETE FROM users WHERE id = $1 AND role = 'first_aider'`, [
    userId,
  ]);
}