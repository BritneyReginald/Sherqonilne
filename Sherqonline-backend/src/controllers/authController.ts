// controllers/authController.ts
import { Request, Response } from "express";
import { findUserByEmailAndRole } from "../models/user";
import {
  verifyPassword,
  buildTokenForUser,
  issueCredentials,
  provisionInspector,
} from "../services/authService";
import pool from "../config/db";

export async function loginStaff(req: Request, res: Response) {
  return handleLogin(req, res, "rss_staff");
}

export async function loginClient(req: Request, res: Response) {
  return handleLogin(req, res, "client");
}

export async function loginInspector(req: Request, res: Response) {
  return handleLogin(req, res, "inspector");
}

export async function loginFirstAider(req: Request, res: Response) {
  return handleLogin(req, res, "first_aider");
}

// Returns the configured login URL, or null if it's missing. This avoids the
// old behaviour where a missing variable became the literal text "undefined"
// inside the credentials email.
function getLoginUrl(
  name: "CLIENT_LOGIN_URL" | "INSPECTOR_LOGIN_URL",
): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

async function handleLogin(
  req: Request,
  res: Response,
  role: "rss_staff" | "client" | "inspector" | "first_aider",
) {
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

    const user = await findUserByEmailAndRole(identifier, role);

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

    const validPassword = await verifyPassword(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: `Invalid ${identifierLabel} or password`,
      });
    }

    let company = null;
    let fullName: string | undefined;
    let surname: string | undefined;

    if (role === "client") {
      const companyResult = await pool.query(
        `
    SELECT
      s.id,
      s.name,
      s.logo
    FROM client_users cu
    JOIN sites s ON s.id = cu.site_id
    WHERE cu.user_id = $1
    LIMIT 1
    `,
        [user.id],
      );

      company = companyResult.rows[0] ?? null;
    }

    if (role === "first_aider") {
      const profileResult = await pool.query(
        `SELECT full_name, surname FROM first_aider_profiles WHERE user_id = $1`,
        [user.id],
      );

      fullName = profileResult.rows[0]?.full_name;
      surname = profileResult.rows[0]?.surname;
    }

    const token = await buildTokenForUser(user);

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
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}

export async function issueClientCredentials(req: Request, res: Response) {
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

    const siteResult = await pool.query(
      `SELECT name FROM sites WHERE id = $1`,
      [siteId],
    );

    if (siteResult.rows.length === 0) {
      return res.status(404).json({
        error: "Site not found",
      });
    }

    const siteName = siteResult.rows[0].name;

    const issuedByUserId = req.user!.id;

    const { user, deliveryStatus } = await issueCredentials({
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
  } catch (err) {
    console.error("Issue client credentials error:", err);

    return res.status(500).json({
      error: "Failed to create client account",
    });
  }
}

// Inspectors log in with a generated username (from their full name) and are
// assigned to one or more sites at creation time. The assignment is written to
// inspector_assignments, the same table the Security & Privacy page reads.
export async function issueInspectorCredentials(req: Request, res: Response) {
  try {
    const { employeeNumber, fullName, surname, siteIds } = req.body;

    if (
      !employeeNumber ||
      !fullName ||
      !surname ||
      !Array.isArray(siteIds) ||
      siteIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "employeeNumber, fullName, surname and a non-empty siteIds array are required",
      });
    }

    const cleanSiteIds: number[] = [...new Set<number>(siteIds.map(Number))];
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

    const siteResult = await pool.query(
      `SELECT id, name FROM sites WHERE id = ANY($1)`,
      [cleanSiteIds],
    );

    if (siteResult.rows.length !== cleanSiteIds.length) {
      return res.status(404).json({ error: "One or more sites not found" });
    }

    const issuedByUserId = req.user!.id;

    const { user, deliveryStatus } = await provisionInspector({
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
  } catch (err) {
    console.error("Issue inspector credentials error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create inspector account" });
  }
}