"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const db_1 = __importDefault(require("./db"));
async function initializeDatabase() {
  const client = await db_1.default.connect();
  try {
    await client.query("BEGIN");
    /*
     * ============================================================
     * EMPLOYEES
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY
      );
    `);
    await client.query(`
      ALTER TABLE employees
        ADD COLUMN IF NOT EXISTS employee_number VARCHAR(20),
        ADD COLUMN IF NOT EXISTS full_name TEXT,
        ADD COLUMN IF NOT EXISTS date_of_birth DATE,
        ADD COLUMN IF NOT EXISTS id_number VARCHAR(20),
        ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
        ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS mobile VARCHAR(50),
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS reporting_manager TEXT,
        ADD COLUMN IF NOT EXISTS reporting_manager_id TEXT,
        ADD COLUMN IF NOT EXISTS reporting_manager_job_title TEXT,
        ADD COLUMN IF NOT EXISTS reporting_manager_legal_appointment TEXT,
        ADD COLUMN IF NOT EXISTS department TEXT,
        ADD COLUMN IF NOT EXISTS division TEXT,
        ADD COLUMN IF NOT EXISTS organisational_level TEXT,
        ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
        ADD COLUMN IF NOT EXISTS relationship TEXT,
        ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
        ADD COLUMN IF NOT EXISTS job_title TEXT,
        ADD COLUMN IF NOT EXISTS site_location TEXT,
        ADD COLUMN IF NOT EXISTS employment_type TEXT,
        ADD COLUMN IF NOT EXISTS start_date DATE,
        ADD COLUMN IF NOT EXISTS contract_end_date DATE,
        ADD COLUMN IF NOT EXISTS salary_grade TEXT,
        ADD COLUMN IF NOT EXISTS work_schedule TEXT,
        ADD COLUMN IF NOT EXISTS compliance_status TEXT,
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
    `);
    /*
     * ============================================================
     * COMPANIES
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        registration_number VARCHAR(100),
        logo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    /*
     * ============================================================
     * SITES
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL
          REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        workers_active INTEGER DEFAULT 0,
        incidents_this_month INTEGER DEFAULT 0,
        compliance_status VARCHAR(20) DEFAULT 'compliant',
        has_manager BOOLEAN DEFAULT FALSE,
        map_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    /*
     * ============================================================
     * USERS
     * ============================================================
     *
     * The old Azure users table has:
     *
     * user_id
     * employee_number
     * username
     * password_hash
     *
     * It is currently EMPTY, so we can migrate its structure.
     */
    const usersColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
    `);
    const existingUserColumns = usersColumns.rows.map((row) => row.column_name);
    if (existingUserColumns.length > 0 && !existingUserColumns.includes("id")) {
      await client.query(`DROP TABLE users CASCADE`);
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,

        email VARCHAR(255) UNIQUE NOT NULL,

        password_hash VARCHAR(255) NOT NULL,
        password_encrypted TEXT,
        password_iv TEXT,

        role VARCHAR(20) NOT NULL CHECK (
          role IN ('rss_staff', 'client', 'inspector')
        ),

        status VARCHAR(20)
          DEFAULT 'invited'
          CHECK (status IN ('invited', 'active', 'disabled')),

        must_change_password BOOLEAN DEFAULT FALSE,

        is_super_admin BOOLEAN DEFAULT FALSE,

        created_by INTEGER REFERENCES users(id)
          ON DELETE SET NULL,

        last_login_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    /*
     * ============================================================
     * CLIENT USERS
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_users (
        id SERIAL PRIMARY KEY,

        user_id INTEGER UNIQUE NOT NULL
          REFERENCES users(id) ON DELETE CASCADE,

        company_id INTEGER NOT NULL
          REFERENCES companies(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    /*
     * ============================================================
     * INSPECTOR ASSIGNMENTS
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspector_assignments (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id) ON DELETE CASCADE,

        site_id INTEGER NOT NULL
          REFERENCES sites(id) ON DELETE CASCADE,

        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, site_id)
      );
    `);
    /*
     * ============================================================
     * CREDENTIAL ISSUANCE LOG
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS credential_issuance_log (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id) ON DELETE CASCADE,

        issued_by INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        delivery_method VARCHAR(20) DEFAULT 'email',

        delivery_status VARCHAR(20) DEFAULT 'sent',

        notes TEXT,

        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    /*
     * ============================================================
     * INSPECTOR PROFILES
     * ============================================================
     */
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspector_profiles (
        id SERIAL PRIMARY KEY,

        user_id INTEGER UNIQUE NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        employee_number VARCHAR(50) UNIQUE NOT NULL,

        full_name VARCHAR(255) NOT NULL,

        surname VARCHAR(255) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query("COMMIT");
    console.log("✅ Database initialization/migration successful");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database initialization failed");
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}
