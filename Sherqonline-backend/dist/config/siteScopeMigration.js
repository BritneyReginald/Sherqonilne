"use strict";
// Gives every client-visible register a real site_id and backfills it
// from the old free-text site names. Safe to run on every startup:
// it only fills rows where site_id IS NULL, and it only matches a
// name when exactly one site has that name (so duplicates are never
// guessed). Anything it can't match is logged as a warning.
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateSiteScope = migrateSiteScope;
const UNIQUE_SITES = `
  WITH unique_sites AS (
    SELECT MIN(id) AS id, LOWER(TRIM(name)) AS key
    FROM sites
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) = 1
  )
`;
async function migrateSiteScope(client) {
    await client.query(`
    ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL;
    ALTER TABLE ppe_transactions
      ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL;
    ALTER TABLE incident_records
      ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL;
    ALTER TABLE risk_assessments
      ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_employees_site_id ON employees(site_id);
    CREATE INDEX IF NOT EXISTS idx_ppe_transactions_site_id ON ppe_transactions(site_id);
    CREATE INDEX IF NOT EXISTS idx_incident_records_site_id ON incident_records(site_id);
    CREATE INDEX IF NOT EXISTS idx_risk_assessments_site_id ON risk_assessments(site_id);
  `);
    const backfills = [
        // employees: from the old site_location text
        `${UNIQUE_SITES}
     UPDATE employees e SET site_id = u.id FROM unique_sites u
     WHERE e.site_id IS NULL AND LOWER(TRIM(e.site_location)) = u.key`,
        // legal appointments: inherit the employee's site, else match site_name
        `UPDATE legal_appointments la SET site_id = e.site_id
     FROM employees e
     WHERE la.site_id IS NULL AND la.employee_id = e.id AND e.site_id IS NOT NULL`,
        `${UNIQUE_SITES}
     UPDATE legal_appointments la SET site_id = u.id FROM unique_sites u
     WHERE la.site_id IS NULL AND LOWER(TRIM(la.site_name)) = u.key`,
        // PPE: employee's site, else the snapshot text
        `UPDATE ppe_transactions p SET site_id = e.site_id
     FROM employees e
     WHERE p.site_id IS NULL AND p.employee_id = e.id AND e.site_id IS NOT NULL`,
        `${UNIQUE_SITES}
     UPDATE ppe_transactions p SET site_id = u.id FROM unique_sites u
     WHERE p.site_id IS NULL AND LOWER(TRIM(p.site_location)) = u.key`,
        // incidents: the site text, else the employee's site
        `${UNIQUE_SITES}
     UPDATE incident_records r SET site_id = u.id FROM unique_sites u
     WHERE r.site_id IS NULL AND LOWER(TRIM(r.site)) = u.key`,
        `UPDATE incident_records r SET site_id = e.site_id
     FROM employees e
     WHERE r.site_id IS NULL AND r.employee_id = e.id AND e.site_id IS NOT NULL`,
        // risk assessments: the linked_site text
        `${UNIQUE_SITES}
     UPDATE risk_assessments ra SET site_id = u.id FROM unique_sites u
     WHERE ra.site_id IS NULL AND LOWER(TRIM(ra.linked_site)) = u.key`,
    ];
    for (const sql of backfills) {
        await client.query(sql);
    }
    // Anything still NULL is invisible to every client. Say so loudly.
    const gaps = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM employees         WHERE site_id IS NULL) AS employees,
      (SELECT COUNT(*) FROM legal_appointments WHERE site_id IS NULL) AS legal_appointments,
      (SELECT COUNT(*) FROM ppe_transactions   WHERE site_id IS NULL AND deleted_at IS NULL) AS ppe_transactions,
      (SELECT COUNT(*) FROM incident_records   WHERE site_id IS NULL) AS incident_records,
      (SELECT COUNT(*) FROM risk_assessments   WHERE site_id IS NULL) AS risk_assessments,
      (SELECT COUNT(*) FROM legal_appointments la
         JOIN employees e ON e.id = la.employee_id
        WHERE la.site_id IS DISTINCT FROM e.site_id) AS appointment_site_mismatches,
      (SELECT COUNT(*) FROM (
         SELECT 1 FROM sites GROUP BY LOWER(TRIM(name)) HAVING COUNT(*) > 1
       ) d) AS duplicate_site_names
  `);
    const row = gaps.rows[0];
    const problems = Object.entries(row).filter(([, n]) => Number(n) > 0);
    if (problems.length > 0) {
        console.warn("⚠️  Site scoping: rows with no site_id (invisible to clients) or " +
            "data issues that need a manual fix:", Object.fromEntries(problems));
    }
}
