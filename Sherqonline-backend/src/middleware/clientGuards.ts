// middleware/clientGuards.ts
//
// Guards that work WITHOUT touching controller code. Mount them after
// authenticate + scopeSites (and after multer on multipart routes).
// RSS staff pass through untouched; everyone else is fenced to their sites.

import { Request, Response, NextFunction } from "express";
import pool from "../config/db";
import { siteIdsFor, inScope } from "./siteScope";
import { getSiteById } from "../models/siteResolver";

/**
 * Overwrites whatever site the browser sent with the caller's own site.
 * A client can never create or move a record onto another client's site,
 * whatever they put in the request body.
 */
export async function forceClientSite(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = siteIdsFor(req);
    if (ids === undefined) return next(); // RSS staff

    if (ids.length !== 1) {
      return res
        .status(403)
        .json({ error: "Your account must be linked to exactly one site" });
    }

    const site = await getSiteById(ids[0]);
    if (!site) {
      return res.status(403).json({ error: "No site linked to this account" });
    }

    req.body = req.body ?? {};
    req.body.siteId = site.id;
    req.body.siteLocation = site.name;
    req.body.siteName = site.name;
    delete req.body.site_id;
    next();
  } catch (err) {
    next(err);
  }
}

interface GuardOptions {
  /** When true, a missing/empty field is allowed (the check only runs if a value is sent). */
  optional?: boolean;
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || v === "null";

/** The employee named in the body must belong to one of the caller's sites. */
export const requireEmployeeInScope =
  (field = "employeeId", opts: GuardOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (siteIdsFor(req) === undefined) return next();

      const raw = req.body?.[field];
      if (isEmpty(raw)) {
        return opts.optional
          ? next()
          : res.status(400).json({ error: "A valid employee is required" });
      }

      const employeeId = Number(raw);
      if (!Number.isInteger(employeeId)) {
        return res.status(400).json({ error: "A valid employee is required" });
      }

      const r = await pool.query("SELECT site_id FROM employees WHERE id = $1", [
        employeeId,
      ]);
      if (r.rows.length === 0 || !inScope(req, r.rows[0].site_id)) {
        return res.status(404).json({ message: "Not found" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };

/** The document folder named in the body must belong to one of the caller's sites. */
export const requireFolderInScope =
  (field = "folderId", opts: GuardOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (siteIdsFor(req) === undefined) return next();

      const raw = req.body?.[field];
      if (isEmpty(raw)) {
        return opts.optional
          ? next()
          : res.status(400).json({ error: "A folder is required" });
      }

      const folderId = Number(raw);
      if (!Number.isInteger(folderId)) {
        return res.status(400).json({ error: "A valid folder is required" });
      }

      const r = await pool.query(
        "SELECT site_id FROM document_folders WHERE id = $1",
        [folderId],
      );
      if (r.rows.length === 0 || !inScope(req, r.rows[0].site_id)) {
        return res.status(404).json({ message: "Not found" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };

/**
 * Every catalogue item in body.items[].itemId must belong to the caller's site,
 * so a client can't issue (and drain the stock of) another client's PPE.
 */
export async function requireCatalogueItemsInScope(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (siteIdsFor(req) === undefined) return next();

    const items: any[] = Array.isArray(req.body?.items) ? req.body.items : [];
    const ids = items.map((i) => Number(i.itemId));
    if (ids.length === 0 || ids.some((n) => !Number.isInteger(n))) {
      return res.status(400).json({ error: "No valid PPE items supplied" });
    }

    const r = await pool.query(
      "SELECT id, site_id FROM ppe_catalogue_items WHERE id = ANY($1::int[])",
      [ids],
    );
    const ok =
      r.rows.length === new Set(ids).size &&
      r.rows.every((row) => inScope(req, row.site_id));

    if (!ok) return res.status(404).json({ message: "Not found" });
    next();
  } catch (err) {
    next(err);
  }
}