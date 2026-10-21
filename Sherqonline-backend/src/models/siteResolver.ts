// models/siteResolver.ts
//
// Turns whatever the frontend sends (a site id, or a site NAME from
// older forms) into a real sites row. Everything that stores a site
// goes through here so site_id and the display name never drift.

import pool from "../config/db";

export class SiteResolutionError extends Error {
  status = 400;
}

type Queryable = {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
};

export interface ResolvedSite {
  id: number | null;
  name: string | null;
}

export async function getSiteById(id: number, db: Queryable = pool) {
  const result = await db.query("SELECT id, name FROM sites WHERE id = $1", [
    id,
  ]);
  return result.rows[0] as { id: number; name: string } | undefined;
}

export async function resolveSite(
  input: { siteId?: unknown; siteLocation?: unknown },
  db: Queryable = pool,
): Promise<ResolvedSite> {
  const rawId = input.siteId;

  if (rawId !== undefined && rawId !== null && rawId !== "") {
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new SiteResolutionError("Invalid site");
    }
    const site = await getSiteById(id, db);
    if (!site) throw new SiteResolutionError("Site not found");
    return { id: site.id, name: site.name };
  }

  const name =
    typeof input.siteLocation === "string" ? input.siteLocation.trim() : "";
  if (!name) return { id: null, name: null };

  const result = await db.query(
    "SELECT id, name FROM sites WHERE LOWER(TRIM(name)) = LOWER($1)",
    [name],
  );

  if (result.rows.length === 0) {
    throw new SiteResolutionError(`No site named "${name}"`);
  }
  if (result.rows.length > 1) {
    throw new SiteResolutionError(
      `More than one site is named "${name}". Please pick the site by id.`,
    );
  }

  return { id: result.rows[0].id, name: result.rows[0].name };
}