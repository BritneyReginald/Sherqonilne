// models/user.ts
import pool from "../config/db";

export type UserRole = "rss_staff" | "client" | "inspector";
export type UserStatus = "invited" | "active" | "disabled";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  must_change_password: boolean;
  created_by: number | null;
  last_login_at: Date | null;
  created_at: Date;
}

// --- Core lookups ---

// Used by each of the 3 login endpoints — role is baked into the query,
// so a client credential can't authenticate on the inspector endpoint even
// if the password happened to match some other row.
export async function findUserByEmailAndRole(
  email: string,
  role: UserRole,
): Promise<User | null> {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND role = $2`,
    [email, role],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

// --- Creation (RSS-only actions) ---

export async function createUser(
  email: string,
  passwordHash: string,
  role: UserRole,
  createdBy: number,
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  /*
   * Find an existing account with this email.
   *
   * We also check whether the account is currently linked
   * to a client site.
   */
  const existingResult = await pool.query(
    `
    SELECT
      u.*,
      cu.site_id
    FROM users u
    LEFT JOIN client_users cu
      ON cu.user_id = u.id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1
    `,
    [normalizedEmail],
  );

  const existingUser = existingResult.rows[0];

  /*
   * ============================================================
   * NO EXISTING USER
   * ============================================================
   */

  if (!existingUser) {
    const result = await pool.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        role,
        status,
        created_by
      )
      VALUES ($1, $2, $3, 'invited', $4)
      RETURNING *
      `,
      [normalizedEmail, passwordHash, role, createdBy],
    );

    return result.rows[0];
  }

  /*
   * ============================================================
   * REUSE OLD CLIENT ACCOUNT
   * ============================================================
   *
   * We allow this when:
   *
   * 1. It is a client account
   * 2. The new account being created is also a client
   * 3. The old account is disabled
   *
   * OR:
   *
   * 4. The old client account no longer has a site attached.
   *
   * The second condition handles clients that were deleted
   * before we introduced the new disabled-account behaviour.
   */

  const isReusableClient =
    existingUser.role === "client" &&
    role === "client" &&
    (existingUser.status === "disabled" || existingUser.site_id === null);

  if (isReusableClient) {
    const result = await pool.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        role = 'client',
        status = 'invited',
        must_change_password = TRUE,
        created_by = $2,
        last_login_at = NULL
      WHERE id = $3
      RETURNING *
      `,
      [passwordHash, createdBy, existingUser.id],
    );

    return result.rows[0];
  }

  /*
   * ============================================================
   * EXISTING ACTIVE ACCOUNT
   * ============================================================
   *
   * Do not overwrite a real active account.
   */

  throw new Error(`A user with email ${normalizedEmail} already exists.`);
}

export async function linkClientToSite(
  userId: number,
  siteId: number,
): Promise<void> {
  await pool.query(
    `INSERT INTO client_users (user_id, site_id) VALUES ($1, $2)`,
    [userId, siteId],
  );
}

export async function assignInspectorToSites(
  userId: number,
  siteIds: number[],
): Promise<void> {
  if (siteIds.length === 0) return;
  const values = siteIds.map((_, i) => `($1, $${i + 2})`).join(", ");
  await pool.query(
    `INSERT INTO inspector_assignments (user_id, site_id)
     VALUES ${values}
     ON CONFLICT (user_id, site_id) DO NOTHING`,
    [userId, ...siteIds],
  );
}

// --- Scoping lookups (used by auth middleware on every request) ---

export async function getClientSiteId(userId: number): Promise<number | null> {
  const result = await pool.query(
    `SELECT site_id FROM client_users WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0]?.site_id ?? null;
}

export async function getInspectorSiteIds(userId: number): Promise<number[]> {
  const result = await pool.query(
    `SELECT site_id FROM inspector_assignments WHERE user_id = $1`,
    [userId],
  );
  return result.rows.map((r) => r.site_id);
}

// --- Login bookkeeping ---

export async function markUserActiveAndLogin(userId: number): Promise<void> {
  await pool.query(
    `UPDATE users SET status = 'active', last_login_at = NOW() WHERE id = $1`,
    [userId],
  );
}

export async function updateLastLogin(userId: number): Promise<void> {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [
    userId,
  ]);
}

// --- Credential issuance logging ---

export async function logCredentialIssuance(
  userId: number,
  issuedBy: number,
  deliveryMethod: string = "email",
  deliveryStatus: string = "sent",
  notes?: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO credential_issuance_log (user_id, issued_by, delivery_method, delivery_status, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, issuedBy, deliveryMethod, deliveryStatus, notes ?? null],
  );
}

export async function replaceInspectorSites(userId: number, siteIds: number[]) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Remove existing assignments
    await client.query(
      `DELETE FROM inspector_assignments
        WHERE user_id = $1`,
      [userId],
    );

    // Add the new assignments
    for (const siteId of siteIds) {
      await client.query(
        `INSERT INTO inspector_assignments
   (user_id, site_id)
   VALUES ($1, $2)
   ON CONFLICT (user_id, site_id) DO NOTHING`,
        [userId, siteId],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getClientCompany(userId: number) {
  const result = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.logo,
      s.email,
      s.contact_person,
      s.contact_number
    FROM client_users cu
    INNER JOIN sites s
      ON s.id = cu.site_id
    WHERE cu.user_id = $1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}
