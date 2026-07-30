// scripts/seed-test-users.ts
// One-off script to create test accounts for manual login testing.
// Run with: npx ts-node src/scripts/seed-test-users.ts
// (adjust the path below to match wherever you place this file)

import bcrypt from "bcrypt";
import pool from "../config/db"; // adjust path to match your project structure

const TEST_PASSWORD = "Test1234!"; // same password for all 3, for convenience in dev only

async function seed() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  // --- 1. RSS Staff account ---
  const staffResult = await pool.query(
    `INSERT INTO users (email, password_hash, role, status)
     VALUES ($1, $2, 'rss_staff', 'active')
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email`,
    ["staff@sherq.co.za", passwordHash]
  );
  console.log(
    staffResult.rows[0]
      ? `✅ Created staff user: ${staffResult.rows[0].email}`
      : "⚠️  staff@sherq.co.za already exists, skipped"
  );

  // --- 2. Client account, linked to the first company found ---
  const companyResult = await pool.query(`SELECT id, name FROM companies LIMIT 1`);
  if (companyResult.rows.length === 0) {
    console.log("❌ No companies found — add a company first before seeding a client user.");
  } else {
    const company = companyResult.rows[0];

    const clientResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, 'client', 'active')
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      ["client@sherq.co.za", passwordHash]
    );

    if (clientResult.rows[0]) {
      await pool.query(
        `INSERT INTO client_users (user_id, company_id) VALUES ($1, $2)`,
        [clientResult.rows[0].id, company.id]
      );
      console.log(
        `✅ Created client user: ${clientResult.rows[0].email} → linked to company "${company.name}"`
      );
    } else {
      console.log("⚠️  client@sherq.co.za already exists, skipped");
    }
  }

  // --- 3. Inspector account, linked to the first site found ---
  const siteResult = await pool.query(`SELECT id, name FROM sites LIMIT 1`);
  if (siteResult.rows.length === 0) {
    console.log("❌ No sites found — add a site first before seeding an inspector user.");
  } else {
    const site = siteResult.rows[0];

    const inspectorResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, 'inspector', 'active')
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      ["inspector@sherq.co.za", passwordHash]
    );

    if (inspectorResult.rows[0]) {
      await pool.query(
        `INSERT INTO inspector_assignments (user_id, site_id) VALUES ($1, $2)`,
        [inspectorResult.rows[0].id, site.id]
      );
      console.log(
        `✅ Created inspector user: ${inspectorResult.rows[0].email} → assigned to site "${site.name}"`
      );
    } else {
      console.log("⚠️  inspector@sherq.co.za already exists, skipped");
    }
  }

  console.log("\nDone. All test accounts use the password: " + TEST_PASSWORD);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});