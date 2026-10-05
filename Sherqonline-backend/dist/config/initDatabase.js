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
        ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
        ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS mobile VARCHAR(50),
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS reporting_manager TEXT,
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
        ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'compliant',
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
    `);
        /*
         * ------------------------------------------------------------
         * MIGRATION: Reporting Structure fields and ID Number are
         * removed from the product. ID Number is replaced by an
         * uploaded ID document (Azure Blob, see columns below).
         * Reporting Structure (manager ID/job title/legal appointment,
         * department, division, organisational level) is dropped
         * entirely — "reporting_manager" (plain text name) is the only
         * survivor and lives under Employment Details now.
         * ------------------------------------------------------------
         */
        await client.query(`
      ALTER TABLE employees
        DROP COLUMN IF EXISTS id_number,
        DROP COLUMN IF EXISTS reporting_manager_id,
        DROP COLUMN IF EXISTS reporting_manager_job_title,
        DROP COLUMN IF EXISTS reporting_manager_legal_appointment,
        DROP COLUMN IF EXISTS department,
        DROP COLUMN IF EXISTS division,
        DROP COLUMN IF EXISTS organisational_level;
    `);
        /*
         * ------------------------------------------------------------
         * ID DOCUMENT + PROFILE PICTURE (Azure Blob Storage)
         * ------------------------------------------------------------
         * Same pattern as medical_records / training_records: only
         * blob metadata lives in Postgres, the file itself lives in
         * Azure Blob Storage behind a short-lived SAS URL.
         */
        await client.query(`
      ALTER TABLE employees
        ADD COLUMN IF NOT EXISTS id_document_blob_name TEXT,
        ADD COLUMN IF NOT EXISTS id_document_file_name TEXT,
        ADD COLUMN IF NOT EXISTS id_document_size INTEGER,
        ADD COLUMN IF NOT EXISTS id_document_mime_type VARCHAR(255),
        ADD COLUMN IF NOT EXISTS profile_picture_blob_name TEXT,
        ADD COLUMN IF NOT EXISTS profile_picture_file_name TEXT,
        ADD COLUMN IF NOT EXISTS profile_picture_size INTEGER,
        ADD COLUMN IF NOT EXISTS profile_picture_mime_type VARCHAR(255);
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
        /*
         * ============================================================
         * INCIDENT RECORDS (Incidents / NCR / Injuries register)
         * ============================================================
         *
         * One row = one incident, NCR, or injury report. `type` tells you
         * which. employee_id is nullable because NCRs aren't necessarily
         * tied to a specific employee (they use identified_by instead).
         *
         * Employee name/site are read live via JOIN on employees, same
         * as medical_records/appointments — not snapshotted, since this
         * is a live register, not an immutable audit log like PPE.
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS incident_records (
    id SERIAL PRIMARY KEY
  );
`);
        await client.query(`
  ALTER TABLE incident_records
    ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'incident'
      CHECK (type IN ('incident', 'ncr', 'injury')),

    ADD COLUMN IF NOT EXISTS employee_id INTEGER
      REFERENCES employees(id) ON DELETE SET NULL,

    ADD COLUMN IF NOT EXISTS division TEXT,
    ADD COLUMN IF NOT EXISTS site TEXT,

    ADD COLUMN IF NOT EXISTS incident_date DATE,
    ADD COLUMN IF NOT EXISTS incident_time TIME,

    -- incident classification (incident) / NCR category (ncr)
    ADD COLUMN IF NOT EXISTS category TEXT,

    -- NCR No. (ncr) / free title, otherwise unused
    ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',

    ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',

    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'Created'
      CHECK (status IN ('Created', 'Under Investigation', 'Complete')),

    -- NCR-specific
    ADD COLUMN IF NOT EXISTS ncr_type VARCHAR(20)
      CHECK (ncr_type IN ('Internal', 'External')),
    ADD COLUMN IF NOT EXISTS identified_by TEXT,
    ADD COLUMN IF NOT EXISTS department TEXT,

    -- Injury-specific
    ADD COLUMN IF NOT EXISTS body_part TEXT,
    ADD COLUMN IF NOT EXISTS effect TEXT,
    ADD COLUMN IF NOT EXISTS disablement TEXT,

    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`);
        await client.query(`
  CREATE INDEX IF NOT EXISTS idx_incident_records_type ON incident_records(type);
  CREATE INDEX IF NOT EXISTS idx_incident_records_employee_id ON incident_records(employee_id);
  CREATE INDEX IF NOT EXISTS idx_incident_records_status ON incident_records(status);
`);
        /*
         * ------------------------------------------------------------
         * MIGRATION: injury_type — distinguishes First Aid Case
         * Dressing logs from Hospital-case injury reports. Both are
         * type='injury' in incident_records so they share one registry
         * row and one set of statuses; injury_type is what tells the
         * frontend/PDF view which shape of detail to render.
         * ------------------------------------------------------------
         */
        await client.query(`
      ALTER TABLE incident_records
        ADD COLUMN IF NOT EXISTS injury_type VARCHAR(20)
          CHECK (injury_type IN ('firstAid', 'hospital'));
    `);
        /*
         * ============================================================
         * FIRST AID ENTRIES
         * ============================================================
         *
         * One row = one treatment record within a First Aid Case
         * Dressing log. A single incident_records row (type='injury',
         * injury_type='firstAid') can have many entries — same
         * one-header/many-children shape as incident_evidence_files.
         *
         * employee_id is nullable + employee_name/number are also
         * stored directly: unlike incident_records' live JOIN pattern,
         * an entry's employee selection is made at log time and the
         * name/number are meant to reflect who was treated then, not
         * whoever currently holds that employee_id (matches the
         * PPE-transaction snapshot reasoning, at small scale).
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS first_aid_entries (
    id SERIAL PRIMARY KEY
  );
`);
        await client.query(`
  ALTER TABLE first_aid_entries
    ADD COLUMN IF NOT EXISTS record_id INTEGER NOT NULL
      REFERENCES incident_records(id) ON DELETE CASCADE,

    ADD COLUMN IF NOT EXISTS employee_id INTEGER
      REFERENCES employees(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS employee_name TEXT,
    ADD COLUMN IF NOT EXISTS employee_number TEXT,

    ADD COLUMN IF NOT EXISTS entry_date DATE,
    ADD COLUMN IF NOT EXISTS entry_time TIME,

    ADD COLUMN IF NOT EXISTS injury TEXT,
    ADD COLUMN IF NOT EXISTS treatment TEXT,
    ADD COLUMN IF NOT EXISTS comments TEXT,

    ADD COLUMN IF NOT EXISTS first_aider TEXT,
    ADD COLUMN IF NOT EXISTS further_medical_attention BOOLEAN NOT NULL DEFAULT FALSE,

    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'AWAITING_EMPLOYEE', 'AWAITING_FIRST_AIDER', 'AWAITING_SAFETY', 'closed')),

    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`);
        await client.query(`
  CREATE INDEX IF NOT EXISTS idx_first_aid_entries_record_id
    ON first_aid_entries(record_id);
`);
        /*
         * ============================================================
         * INVESTIGATIONS
         * ============================================================
         *
         * One row per incident_records row (1:1). corrective_actions is
         * a TEXT[] — same array-column technique as
         * medical_records.restriction_type — so it can hold a repeatable
         * list of actions while responsible_person/due_date stay shared
         * single fields, same as you'd expect from the register.
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS investigations (
    id SERIAL PRIMARY KEY
  );
`);
        await client.query(`
  ALTER TABLE investigations
    ADD COLUMN IF NOT EXISTS record_id INTEGER UNIQUE NOT NULL
      REFERENCES incident_records(id) ON DELETE CASCADE,

    ADD COLUMN IF NOT EXISTS investigator TEXT,
    ADD COLUMN IF NOT EXISTS investigation_date DATE,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS department TEXT,

    ADD COLUMN IF NOT EXISTS immediate_cause TEXT,
    ADD COLUMN IF NOT EXISTS root_cause TEXT,
    ADD COLUMN IF NOT EXISTS contributing_factors TEXT,

    ADD COLUMN IF NOT EXISTS corrective_actions TEXT[],
    ADD COLUMN IF NOT EXISTS responsible_person TEXT,
    ADD COLUMN IF NOT EXISTS due_date DATE,

    ADD COLUMN IF NOT EXISTS preventive_actions TEXT,

    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`);
        await client.query(`
  CREATE INDEX IF NOT EXISTS idx_investigations_record_id ON investigations(record_id);
`);
        /*
         * ============================================================
         * INCIDENT EVIDENCE FILES
         * ============================================================
         *
         * Same pattern as medical_records / training_records: only Blob
         * metadata lives in Postgres, the file itself lives in Azure Blob
         * Storage behind a short-lived SAS URL. Unlike medicals (one file
         * per record), an incident can have many evidence files, so this
         * is its own table rather than columns on incident_records.
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS incident_evidence_files (
    id SERIAL PRIMARY KEY
  );
`);
        await client.query(`
  ALTER TABLE incident_evidence_files
    ADD COLUMN IF NOT EXISTS record_id INTEGER NOT NULL
      REFERENCES incident_records(id) ON DELETE CASCADE,

    ADD COLUMN IF NOT EXISTS file_blob_name TEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS file_name TEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS file_size INTEGER,
    ADD COLUMN IF NOT EXISTS file_mime_type VARCHAR(255),

    ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`);
        await client.query(`
  CREATE INDEX IF NOT EXISTS idx_incident_evidence_files_record_id
    ON incident_evidence_files(record_id);
`);
        // ============================================================
        // MIGRATION: REMOVE TRAINING NAME
        // ============================================================
        await client.query(`
  ALTER TABLE training_records
    DROP COLUMN IF EXISTS training_name;
`);
        /*
         * ============================================================
         * RISK ASSESSMENTS
         * ============================================================
         *
         * One row = one Risk Assessment register entry. The hazard
         * arrays (before/after controls) are stored as JSONB because
         * they're a nested, variably-shaped list (hazard, risks[],
         * controls[], severity, probability) that the frontend already
         * treats as one document per step — same reasoning as storing
         * a whole form as one unit rather than normalizing into a
         * hazards child table.
         *
         * The logo and generated PDF are stored the same way as
         * medical_records / training_records: only Blob metadata lives
         * in Postgres, the file itself lives in Azure Blob Storage
         * behind a short-lived SAS URL.
         */
        await client.query(`
      CREATE TABLE IF NOT EXISTS risk_assessments (
        id SERIAL PRIMARY KEY
      );
    `);
        await client.query(`
      ALTER TABLE risk_assessments
        ADD COLUMN IF NOT EXISTS reference_no VARCHAR(50) UNIQUE,
        ADD COLUMN IF NOT EXISTS assessment_name TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS linked_site TEXT NOT NULL DEFAULT 'TBD',
        ADD COLUMN IF NOT EXISTS linked_dept TEXT NOT NULL DEFAULT 'TBD',
        ADD COLUMN IF NOT EXISTS revision VARCHAR(20) NOT NULL DEFAULT 'v1.0',
        ADD COLUMN IF NOT EXISTS review_date DATE,
        ADD COLUMN IF NOT EXISTS expiry_date DATE,
        ADD COLUMN IF NOT EXISTS saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'draft'
          CHECK (status IN ('approved', 'draft', 'under-review', 'expired')),

        ADD COLUMN IF NOT EXISTS sign_off_rate INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS assigned_employees INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS signed_employees INTEGER NOT NULL DEFAULT 0,

        ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'task-based'
          CHECK (category IN ('baseline', 'task-based', 'issue-based')),

        ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS company_logo_blob_name TEXT,
        ADD COLUMN IF NOT EXISTS company_logo_file_name TEXT,
        ADD COLUMN IF NOT EXISTS company_logo_size INTEGER,
        ADD COLUMN IF NOT EXISTS company_logo_mime_type TEXT,

        ADD COLUMN IF NOT EXISTS task_description TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS assessors TEXT[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS assessment_date DATE,

        ADD COLUMN IF NOT EXISTS before_controls JSONB NOT NULL DEFAULT '{"hazards":[]}',
        ADD COLUMN IF NOT EXISTS after_controls JSONB,

        ADD COLUMN IF NOT EXISTS pdf_blob_name TEXT,
        ADD COLUMN IF NOT EXISTS pdf_file_name TEXT,
        ADD COLUMN IF NOT EXISTS pdf_size INTEGER,
        ADD COLUMN IF NOT EXISTS pdf_mime_type TEXT,

        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risk_assessments_status
        ON risk_assessments(status);
      CREATE INDEX IF NOT EXISTS idx_risk_assessments_category
        ON risk_assessments(category);
    `);
        /*
         * ============================================================
         * LEGAL APPOINTMENTS
         * ============================================================
         *
         * One row = one Legal Appointment letter issued to one employee.
         * employee_name / employee_number / job_title / site_name are
         * SNAPSHOTTED at appointment time (same reasoning as
         * ppe_transactions). site_id links to sites so the letter can pull
         * the site's registered logo. The signed/uploaded letter lives in
         * Azure Blob Storage; only its metadata is stored here.
         */
        await client.query(`
  CREATE TABLE IF NOT EXISTS legal_appointments (
    id SERIAL PRIMARY KEY
  );
`);
        await client.query(`
  ALTER TABLE legal_appointments
    ADD COLUMN IF NOT EXISTS employee_id INTEGER
      REFERENCES employees(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS employee_name TEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS employee_number TEXT,
    ADD COLUMN IF NOT EXISTS job_title TEXT,

    ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(40) NOT NULL
      CHECK (appointment_type IN (
        'First Aid Officer',
        'HSE/SHE Representative',
        'Incident Investigator'
      )),

    ADD COLUMN IF NOT EXISTS legal_section TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'Health & Safety',

    ADD COLUMN IF NOT EXISTS site_id INTEGER
      REFERENCES sites(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS site_name TEXT,

    ADD COLUMN IF NOT EXISTS appointer_name TEXT,

    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE,

    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active'
      CHECK (status IN ('Active', 'Expired', 'Pending')),

    ADD COLUMN IF NOT EXISTS signature_status VARCHAR(20) NOT NULL DEFAULT 'Pending'
      CHECK (signature_status IN ('Signed', 'Pending', 'Not Required')),

    ADD COLUMN IF NOT EXISTS reports_to TEXT,
    ADD COLUMN IF NOT EXISTS reports_to_id TEXT,

    ADD COLUMN IF NOT EXISTS delegated_authority_scope TEXT NOT NULL DEFAULT 'Health & Safety',
    ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER NOT NULL DEFAULT 4,

    ADD COLUMN IF NOT EXISTS document_blob_name TEXT,
    ADD COLUMN IF NOT EXISTS document_file_name TEXT,
    ADD COLUMN IF NOT EXISTS document_size INTEGER,
    ADD COLUMN IF NOT EXISTS document_mime_type TEXT,

    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`);
        /*
         * MIGRATION: company name + logo now come from the selected site,
         * so the old per-appointment columns are removed.
         */
        await client.query(`
  ALTER TABLE legal_appointments
    DROP COLUMN IF EXISTS responsible_area,
    DROP COLUMN IF EXISTS company_name,
    DROP COLUMN IF EXISTS logo_blob_name,
    DROP COLUMN IF EXISTS logo_file_name,
    DROP COLUMN IF EXISTS logo_size,
    DROP COLUMN IF EXISTS logo_mime_type;
`);
        await client.query(`
  CREATE INDEX IF NOT EXISTS idx_legal_appointments_employee_id
    ON legal_appointments(employee_id);
  CREATE INDEX IF NOT EXISTS idx_legal_appointments_status
    ON legal_appointments(status);
  CREATE INDEX IF NOT EXISTS idx_legal_appointments_appointment_type
    ON legal_appointments(appointment_type);
  CREATE INDEX IF NOT EXISTS idx_legal_appointments_site_id
    ON legal_appointments(site_id);
`);
        /*
         * ------------------------------------------------------------
         * MIGRATION: LEGAL APPOINTMENTS — ELECTRONIC SIGNATURE
         * ------------------------------------------------------------
         */
        await client.query(`
  ALTER TABLE legal_appointments
    ADD COLUMN IF NOT EXISTS signature_data TEXT,
    ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;
`);
        /*
         * ============================================================
         * MIGRATION: FIRST AIDER ROLE
         * ============================================================
         *
         * Adds 'first_aider' as a valid users.role, alongside the new
         * first_aider_profiles / first_aider_assignments tables (mirrors
         * inspector_profiles / inspector_assignments exactly) and a
         * first_aider_user_id link on first_aid_entries so a treatment
         * record's sign-off is tied to a real account, not just the
         * free-text first_aider name.
         */
        await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('rss_staff', 'client', 'inspector', 'first_aider'));
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS first_aider_profiles (
        id SERIAL PRIMARY KEY
      );
    `);
        await client.query(`
      ALTER TABLE first_aider_profiles
        ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE
          REFERENCES users(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS employee_number VARCHAR(50) UNIQUE NOT NULL,
        ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS surname VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS first_aider_assignments (
        id SERIAL PRIMARY KEY
      );
    `);
        await client.query(`
      ALTER TABLE first_aider_assignments
        ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL
          REFERENCES users(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS site_id INTEGER NOT NULL
          REFERENCES sites(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
        await client.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS uniq_first_aider_assignment
    ON first_aider_assignments (user_id, site_id);
`);
        await client.query(`
  ALTER TABLE first_aid_entries
  ADD COLUMN IF NOT EXISTS first_aider_signature JSONB;`);
        /*
         * ============================================================
         * DOCUMENT LIBRARY
         * ============================================================
         *
         * document_folders : self-referencing tree (parent_id NULL = top level)
         * documents        : one row per logical document (current state)
         * document_versions: one row per uploaded file. Every revision is
         *                    kept forever for audit; only Blob metadata is
         *                    stored here, the file lives in Azure Blob Storage.
         *
         * "status" (valid / expiring / expired) is NOT stored. It is derived
         * from expiry_date at read time so it can never go stale.
         */
        await client.query(`
      CREATE TABLE IF NOT EXISTS document_folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES document_folders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // No two sibling folders with the same name (case-insensitive)
        await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_document_folder_name
        ON document_folders (COALESCE(parent_id, 0), LOWER(name));
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        folder_id INTEGER NOT NULL
          REFERENCES document_folders(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        current_version INTEGER NOT NULL DEFAULT 1,
        updated_by_employee_id INTEGER
          REFERENCES employees(id) ON DELETE SET NULL,
        updated_by_name TEXT,
        last_updated_date DATE NOT NULL DEFAULT CURRENT_DATE,
        expiry_date DATE,
        is_archived BOOLEAN NOT NULL DEFAULT FALSE,
        archived_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS document_versions (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL
          REFERENCES documents(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        file_blob_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        file_mime_type VARCHAR(255),
        updated_by_employee_id INTEGER
          REFERENCES employees(id) ON DELETE SET NULL,
        updated_by_name TEXT,
        updated_date DATE,
        change_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (document_id, version_number)
      );
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
      CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);
      CREATE INDEX IF NOT EXISTS idx_document_folders_parent_id ON document_folders(parent_id);
      CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
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
