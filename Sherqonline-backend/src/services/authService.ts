// services/authServices.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  User,
  UserRole,
  createUser,
  linkClientToCompany,
  assignInspectorToSites,
  logCredentialIssuance,
  markUserActiveAndLogin,
  updateLastLogin,
  getClientCompanyId,
  getInspectorSiteIds,
} from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "8h"; // adjust to your session length preference
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
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
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
  companyId?: number; // present only for 'client'
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

// --- Login (shared logic used by all 3 role-specific controllers) ---

export async function buildTokenForUser(user: User): Promise<string> {
  const payload: AuthTokenPayload = { userId: user.id, role: user.role };

  if (user.role === "client") {
    const companyId = await getClientCompanyId(user.id);
    if (companyId) payload.companyId = companyId;
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
  companyId?: number; // required if role = client
  siteIds?: number[]; // required if role = inspector
  companyName?: string; // for the email copy
  loginUrl: string; // e.g. https://yourapp.com/login/client
}

export async function issueCredentials(params: IssueCredentialsParams) {
  const { email, role, issuedByUserId, companyId, siteIds, companyName, loginUrl } = params;

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await createUser(email, passwordHash, role, issuedByUserId);

  if (role === "client") {
    if (!companyId) throw new Error("companyId is required for client accounts");
    await linkClientToCompany(user.id, companyId);
  }

  if (role === "inspector") {
    if (!siteIds || siteIds.length === 0)
      throw new Error("siteIds are required for inspector accounts");
    await assignInspectorToSites(user.id, siteIds);
  }

  let deliveryStatus = "sent";
  try {
    await sendCredentialsEmail({ email, tempPassword, loginUrl, role, companyName });
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
  companyName?: string;
}) {
  const { email, tempPassword, loginUrl, role, companyName } = args;

  const subject =
    role === "client"
      ? `Your ${companyName ?? "company"} portal login`
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