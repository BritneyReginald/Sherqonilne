import pool from "../config/db";

export interface Site {
  id?: number;
  name: string;
  logo?: string;
  email?: string;
  contactPerson?: string;
  contactNumber?: string;
}

/*
 * ============================================================
 * CREATE SITE
 * ============================================================
 *
 * A site represents the client/company in SHERQ Online.
 *
 * There is NO companyId.
 */

export const createSite = async (site: Site) => {
  const result = await pool.query(
    `
    INSERT INTO sites (
      name,
      logo,
      email,
      contact_person,
      contact_number
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [
      site.name,
      site.logo ?? null,
      site.email ?? null,
      site.contactPerson ?? null,
      site.contactNumber ?? null,
    ],
  );

  return result.rows[0];
};

/*
 * ============================================================
 * GET ALL SITES
 * ============================================================
 *
 * RSS staff can see all client sites they are responsible
 * for inspecting.
 */

export const getSites = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      logo,
      email,
      contact_person,
      contact_number,
      created_at
    FROM sites
    ORDER BY name;
    `,
  );

  return result.rows;
};

/*
 * ============================================================
 * GET SITE BY ID
 * ============================================================
 */

export const getSiteById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      logo,
      email,
      contact_person,
      contact_number,
      created_at
    FROM sites
    WHERE id = $1;
    `,
    [id],
  );

  return result.rows[0];
};

/*
 * ============================================================
 * UPDATE SITE
 * ============================================================
 */

export const updateSite = async (
  id: number,
  site: Partial<Site>,
) => {
  const fieldMap: Record<string, string> = {
    name: "name",
    logo: "logo",
    email: "email",
    contactPerson: "contact_person",
    contactNumber: "contact_number",
  };

  const updates: string[] = [];
  const values: any[] = [];

  let index = 1;

  for (const [key, value] of Object.entries(site)) {
    if (value !== undefined && fieldMap[key]) {
      updates.push(`${fieldMap[key]} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No fields supplied.");
  }

  values.push(id);

  const result = await pool.query(
    `
    UPDATE sites
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `,
    values,
  );

  return result.rows[0];
};

/*
 * ============================================================
 * DELETE SITE
 * ============================================================
 */

export const deleteSite = async (id: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find the client user linked to this site
    const clientUserResult = await client.query(
      `
      SELECT user_id
      FROM client_users
      WHERE site_id = $1
      `,
      [id],
    );

    const clientUserIds = clientUserResult.rows.map(
      (row) => row.user_id,
    );

    // Delete the client users first
    // This will also cascade to:
    // - client_users
    // - credential_issuance_log
    await client.query(
      `
      DELETE FROM users
      WHERE id = ANY($1::int[])
      AND role = 'client'
      `,
      [clientUserIds],
    );

    // Now delete the site
    const siteResult = await client.query(
      `
      DELETE FROM sites
      WHERE id = $1
      RETURNING id;
      `,
      [id],
    );

    await client.query("COMMIT");

    return siteResult.rows[0];

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};