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
  assignInspectorToSites,
  logCredentialIssuance,
  markUserActiveAndLogin,
  updateLastLogin,
  getClientSiteId,
  getInspectorSiteIds,
} from "../models/user";
import pool from "../config/db";
// import { encryptPassword } from "./authServices";

const JWT_SECRET = process.env.JWT_SECRET as string;
// const JWT_EXPIRES_IN : jwt.SignOptions["expiresIn"]= process.env.JWT_EXPIRES_IN || "8h";
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

// --- Temp password generation (for RSS-issued client/inspector accounts) ---

export function generateTempPassword(): string {
  // 12 random bytes -> readable base64-ish string, trimmed of ambiguous chars
  return crypto
    .randomBytes(9)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, 12);
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

// --- Login (shared logic used by all 3 role-specific controllers) ---

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

// --- Credential issuance (RSS-only) ---

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface IssueCredentialsParams {
  email: string;
  role: "client" | "inspector";
  issuedByUserId: number;
  siteId?: number; // required if role = client
  siteIds?: number[]; // required if role = inspector
  siteName?: string; // for the email copy
  loginUrl: string; // e.g. https://yourapp.com/login/client
}

export async function issueCredentials(params: IssueCredentialsParams) {
  const { email, role, issuedByUserId, siteId, siteIds, siteName, loginUrl } =
    params;

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await createUser(email, passwordHash, role, issuedByUserId);

  if (role === "client") {
    if (!siteId) {
      throw new Error("siteId is required for client accounts");
    }

    await linkClientToSite(user.id, siteId);
  }

  let deliveryStatus = "sent";
  try {
    await sendCredentialsEmail({
      email,
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

async function sendCredentialsEmail(args: {
  email: string;
  tempPassword: string;
  loginUrl: string;
  role: "client" | "inspector";
  siteName?: string;
}) {
  const { email, tempPassword, loginUrl, role, siteName } = args;

  const subject =
    role === "client"
      ? `Your ${siteName ?? "client"} portal login`
      : `Your Fire Equipment Inspector login`;

  const html = `
    <p>Hello,</p>
    <p>An account has been created for you on the SHERQ Online platform.</p>
    <p><strong>Login link:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary password:</strong> ${tempPassword}</p>
    <p>Please keep these details secure.</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html,
  });
}

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

    // Assign sites
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

export async function deleteInspector(userId: number) {
  await pool.query(
    `DELETE FROM users
     WHERE id = $1
       AND role = 'inspector'`,
    [userId],
  );
}
