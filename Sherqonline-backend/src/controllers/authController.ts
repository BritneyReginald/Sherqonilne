// controllers/authController.ts
import { Request, Response } from "express";
import { findUserByEmailAndRole } from "../models/user";
import {
  verifyPassword,
  buildTokenForUser,
  issueCredentials,
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

async function handleLogin(
  req: Request,
  res: Response,
  role: "rss_staff" | "client" | "inspector" | "first_aider",
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await findUserByEmailAndRole(email, role);

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

    const validPassword = await verifyPassword(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
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
  } catch (err) {
    console.error("Issue client credentials error:", err);

    return res.status(500).json({
      error: "Failed to create client account",
    });
  }
}

export async function issueInspectorCredentials(req: Request, res: Response) {
  try {
    const { email, siteIds } = req.body;
    if (!email || !Array.isArray(siteIds) || siteIds.length === 0) {
      return res
        .status(400)
        .json({ error: "email and a non-empty siteIds array are required" });
    }

    const issuedByUserId = req.user!.id;

    const { user, deliveryStatus } = await issueCredentials({
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
  } catch (err) {
    console.error("Issue inspector credentials error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create inspector account" });
  }
}