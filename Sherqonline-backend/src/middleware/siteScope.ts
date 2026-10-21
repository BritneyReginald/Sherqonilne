
// Helpers that turn "who is calling" into "which sites may they see".
// Always mount authenticate + authorize + scopeSites on a router first.

import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const isStaff = (req: Request): boolean =>
  req.user?.role === "rss_staff";

/**
 * Sites the caller may see.
 *   undefined  -> unrestricted (RSS staff ONLY)
 *   number[]   -> restricted to these sites (empty = sees nothing)
 *
 * Fail-closed: any other role, or a missing user, gets [] rather
 * than "no filter", so a forgotten middleware can't leak data.
 */
export function siteIdsFor(req: Request): number[] | undefined {
  const user = req.user;
  if (!user) return [];
  if (user.role === "rss_staff") return undefined;
  if (user.siteIds) return user.siteIds;
  if (user.siteId) return [user.siteId];
  return [];
}

/** Can this caller see a row that belongs to rowSiteId? */
export function inScope(
  req: Request,
  rowSiteId: number | null | undefined,
): boolean {
  const ids = siteIdsFor(req);
  if (ids === undefined) return true;
  return rowSiteId != null && ids.includes(Number(rowSiteId));
}

/** Builds a lookup from SQL that returns a `site_id` column for `$1 = id`. */
export const lookupSite =
  (sql: string) =>
  async (id: number): Promise<{ found: boolean; siteId: number | null }> => {
    const result = await pool.query(sql, [id]);
    return {
      found: result.rows.length > 0,
      siteId: result.rows[0]?.site_id ?? null,
    };
  };

/**
 * router.param("id", scopeByIdParam(lookup))
 *
 * Runs for every route containing :id. Non-staff callers get a 404
 * (not 403) for records outside their sites, so ids of other
 * clients' records can't even be confirmed to exist.
 */
export function scopeByIdParam(
  lookup: (id: number) => Promise<{ found: boolean; siteId: number | null }>,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
    value: string,
  ) => {
    try {
      if (siteIdsFor(req) === undefined) return next(); // staff

      const id = Number(value);
      if (!Number.isInteger(id)) {
        return res.status(404).json({ message: "Not found" });
      }

      const row = await lookup(id);
      if (!row.found || !inScope(req, row.siteId)) {
        return res.status(404).json({ message: "Not found" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
