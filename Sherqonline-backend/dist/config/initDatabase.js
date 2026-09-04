"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
         * MEDICAL RECORDS
         * ============================================================
         *
         * Stores occupational medical surveillance records for employees.
         *
         * Each medical record belongs to one employee.
         *
         * Files themselves are stored in Azure Blob Storage.
         * The database only stores the Blob name and file metadata.
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL
      REFERENCES employees(id)
      ON DELETE CASCADE,

    exam_type VARCHAR(50) NOT NULL CHECK (
      exam_type IN (
        'pre-placement',
        'periodic',
        'exit',
        'return-to-work'
      )
    ),

    practitioner_name VARCHAR(255) NOT NULL,

    practitioner_type VARCHAR(20) NOT NULL CHECK (
      practitioner_type IN ('OMP', 'OHNP')
    ),

    exam_date DATE NOT NULL,

    expiry_date DATE,

    fitness_status VARCHAR(50) NOT NULL CHECK (
      fitness_status IN (
        'fit',
        'fit-with-restrictions',
        'unfit'
      )
    ),

    restrictions TEXT,

    restriction_type TEXT[],

    file_blob_name TEXT,

    file_name TEXT,

    file_size INTEGER,

    file_mime_type VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
        /*
         * ============================================================
         * SITES
         * ============================================================
         *
         * Sites are client locations that RSS is responsible for
         * inspecting.
         *
         * A site is NOT a company.
         *
         * Example:
         *   RSS = our company
         *   Secunda = site/client location we inspect
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logo TEXT,
    email VARCHAR(255),
    contact_person VARCHAR(255),
    contact_number VARCHAR(50)
  );
`);
        /*
         * ============================================================
         * SITES MIGRATION
         * ============================================================
         *
         * Remove the old company/site structure if it exists.
         */
        await client.query(`
  ALTER TABLE sites
    DROP COLUMN IF EXISTS company_id,
    DROP COLUMN IF EXISTS location,
    DROP COLUMN IF EXISTS workers_active,
    DROP COLUMN IF EXISTS incidents_this_month,
    DROP COLUMN IF EXISTS compliance_status,
    DROP COLUMN IF EXISTS has_manager,
    DROP COLUMN IF EXISTS map_image;
`);
        /*
         * Add the new site/client fields to an existing Azure table.
         */
        await client.query(`
  ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS logo TEXT,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
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
         *
         * A client user belongs directly to a site.
         *
         * The site itself represents the client/company in SHERQ Online.
         *
         * Example:
         *   Site: ABC Manufacturing
         *   Client login: client@abc.co.za
         *
         * The client user is linked directly to the ABC Manufacturing site.
         */
        await client.query(`
  DROP TABLE IF EXISTS client_users;
`);
        await client.query(`
  CREATE TABLE client_users (
    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,

    site_id INTEGER UNIQUE NOT NULL
      REFERENCES sites(id) ON DELETE CASCADE,

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

      -- ============================================================
-- PPE CATALOGUE ITEMS
-- ============================================================
--
-- The master list of PPE types RSS tracks and issues. Stock
-- levels live here and are decremented whenever a transaction
-- issues that item (see ppe_transactions below).

CREATE TABLE IF NOT EXISTS ppe_catalogue_items (
  id SERIAL PRIMARY KEY
);

ALTER TABLE ppe_catalogue_items
  ADD COLUMN IF NOT EXISTS item_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS requires_size BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sizes TEXT[],
  ADD COLUMN IF NOT EXISTS replacement_days INTEGER NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS stock_level INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock_level INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Note: "replacement cycle" labels like "Every 6 months" are NOT
-- stored — they're derived from replacement_days in the frontend,
-- so there's no risk of the label and the day count disagreeing.

-- ============================================================
-- PPE TRANSACTIONS (issue log)
-- ============================================================
--
-- One row = one PPE item issued to one employee on one occasion.
-- Employee name/job title and item name/category/brand are
-- SNAPSHOTTED at issue time (not joined live) — this is an audit
-- log, so a later rename or catalogue edit must never rewrite
-- history. employee_id / ppe_item_id are kept as FKs purely so
-- you can still filter/report by the current employee or item
-- when useful.

CREATE TABLE IF NOT EXISTS ppe_transactions (
  id SERIAL PRIMARY KEY
);

ALTER TABLE ppe_transactions
  ADD COLUMN IF NOT EXISTS employee_id INTEGER
    REFERENCES employees(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS employee_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS site_location TEXT,

  ADD COLUMN IF NOT EXISTS ppe_item_id INTEGER
    REFERENCES ppe_catalogue_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ppe_item_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS ppe_category TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS ppe_brand TEXT,
  ADD COLUMN IF NOT EXISTS ppe_size TEXT,

  ADD COLUMN IF NOT EXISTS issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS condition VARCHAR(20) NOT NULL
    CHECK (condition IN ('new', 're-issued-good')),
  ADD COLUMN IF NOT EXISTS replacement_due DATE NOT NULL,

  ADD COLUMN IF NOT EXISTS sign_off_status VARCHAR(10) NOT NULL DEFAULT 'pending'
    CHECK (sign_off_status IN ('signed', 'pending')),
  ADD COLUMN IF NOT EXISTS sign_off_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS signature_data TEXT,

  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_ppe_transactions_employee_id
  ON ppe_transactions(employee_id);

CREATE INDEX IF NOT EXISTS idx_ppe_transactions_ppe_item_id
  ON ppe_transactions(ppe_item_id);

CREATE INDEX IF NOT EXISTS idx_ppe_transactions_sign_off_status
  ON ppe_transactions(sign_off_status);


-- ============================================================
-- APPOINTMENTS
-- ============================================================
--
-- One row = one scheduled Medical/Training/Induction appointment
-- for one employee. Employee name/work ID/site are read live via
-- JOIN on employees (like medical_records) — an appointment is a
-- scheduling record tied to who the employee currently is, not a
-- permanent audit snapshot like a PPE issuance.
--
-- "has_restrictions" is NOT stored here at all — it's derived at
-- read time from medical_records.fitness_status for that employee.
-- This keeps it always accurate without anyone having to remember
-- to flag it manually. See models/appointment.ts.

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY
);

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS employee_id INTEGER NOT NULL
    REFERENCES employees(id) ON DELETE CASCADE,

  ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(20) NOT NULL
    CHECK (appointment_type IN ('Medical', 'Training', 'Induction')),

  ADD COLUMN IF NOT EXISTS practitioner TEXT NOT NULL,

  ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMP NOT NULL,

  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Confirmed', 'Pending', 'Urgent', 'Overdue')),

  ADD COLUMN IF NOT EXISTS notes TEXT,

  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_appointments_employee_id
  ON appointments(employee_id);

CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date
  ON appointments(appointment_date);

CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments(status);

-- ============================================================
-- TRAINING RECORDS
-- ============================================================
--
-- One row = one training/certification record for one employee.
-- Employee name/work ID/site are read live via JOIN on employees
-- (same as medical_records and appointments) — this is a
-- competency register tied to the employee's current identity,
-- not an immutable audit log like PPE issuance.
--
-- training_category and is_legally_required were hardcoded in the
-- old mock ("Safety" / false for every record, regardless of what
-- was entered). They're now real, user-editable fields.

CREATE TABLE IF NOT EXISTS training_records (
  id SERIAL PRIMARY KEY
);

ALTER TABLE training_records
  ADD COLUMN IF NOT EXISTS employee_id INTEGER NOT NULL
    REFERENCES employees(id) ON DELETE CASCADE,

  ADD COLUMN IF NOT EXISTS training_type VARCHAR(20)
    CHECK (training_type IN ('internal', 'external')),

  ADD COLUMN IF NOT EXISTS training_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS certificate_name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL,

  ADD COLUMN IF NOT EXISTS training_category TEXT NOT NULL DEFAULT 'Safety',
  ADD COLUMN IF NOT EXISTS is_legally_required BOOLEAN NOT NULL DEFAULT FALSE,

  ADD COLUMN IF NOT EXISTS completion_date DATE NOT NULL,
  ADD COLUMN IF NOT EXISTS expiry_date DATE NOT NULL,

  -- Same pattern as medical_records: only blob metadata is stored
  -- here, the file itself lives in Azure Blob Storage behind a
  -- short-lived SAS URL, never a public link.
  ADD COLUMN IF NOT EXISTS file_blob_name TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS file_mime_type TEXT,

  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_training_records_employee_id
  ON training_records(employee_id);

CREATE INDEX IF NOT EXISTS idx_training_records_expiry_date
  ON training_records(expiry_date);
    `);
        await client.query("COMMIT");
        console.log("✅ Database initialization/migration successful");
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Database initialization failed");
        console.error(error);
        throw error;
    }
    finally {
        client.release();
    }
}
