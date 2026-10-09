// The RSS company profile (name + logo) shown at the top of the
// Company & Sites page. There is exactly ONE of these, so it lives in a
// single-row table (id is forced to 1). The logo is stored as a small
// image data URL in the same way sites.logo is.

import pool from "../config/db";

export interface CompanyProfile {
  name: string;
  logo: string | null;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "RSS",
  logo: null,
};

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const result = await pool.query(
    `SELECT name, logo FROM company_profile WHERE id = 1`,
  );

  return result.rows[0] || DEFAULT_COMPANY_PROFILE;
}

/**
 * Creates the row if it doesn't exist yet, otherwise updates only the
 * fields that were supplied (undefined = leave as is).
 */
export async function saveCompanyProfile(data: {
  name?: string;
  logo?: string;
}): Promise<CompanyProfile> {
  const result = await pool.query(
    `
    INSERT INTO company_profile (id, name, logo)
    VALUES (1, COALESCE($1::text, 'RSS'), $2::text)
    ON CONFLICT (id) DO UPDATE
      SET name = COALESCE($1::text, company_profile.name),
          logo = COALESCE($2::text, company_profile.logo),
          updated_at = CURRENT_TIMESTAMP
    RETURNING name, logo
    `,
    [data.name ?? null, data.logo ?? null],
  );

  return result.rows[0];
}