"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const db_1 = __importDefault(require("./db"));
async function initializeDatabase() {
    await db_1.default.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(20),

      full_name TEXT,
      date_of_birth DATE,
      id_number VARCHAR(20),
      gender VARCHAR(20),
      nationality VARCHAR(100),

      email VARCHAR(255),
      phone VARCHAR(50),
      mobile VARCHAR(50),
      address TEXT,

      reporting_manager TEXT,
      reporting_manager_id TEXT,
      reporting_manager_job_title TEXT,
      reporting_manager_legal_appointment TEXT,

      department TEXT,
      division TEXT,
      organisational_level TEXT,

      emergency_contact TEXT,
      relationship TEXT,
      emergency_phone TEXT,

      job_title TEXT,
      site_location TEXT,
      employment_type TEXT,

      start_date DATE,
      contract_end_date DATE,

      salary_grade TEXT,
      work_schedule TEXT,
      compliance_status TEXT,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    workers_active INTEGER DEFAULT 0,
    incidents_this_month INTEGER DEFAULT 0,
    compliance_status VARCHAR(20) DEFAULT 'compliant',
    has_manager BOOLEAN DEFAULT FALSE,
    map_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,
    password_encrypted TEXT,
    password_iv TEXT,

    role VARCHAR(20) NOT NULL CHECK (
        role IN ('rss_staff','client','inspector')
    ),

    status VARCHAR(20)
        DEFAULT 'invited'
        CHECK (status IN ('invited','active','disabled')),

    must_change_password BOOLEAN DEFAULT FALSE,

    is_super_admin BOOLEAN DEFAULT FALSE,

    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

    last_login_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspector_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, site_id)
);

CREATE TABLE IF NOT EXISTS credential_issuance_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issued_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    delivery_method VARCHAR(20) DEFAULT 'email',
    delivery_status VARCHAR(20) DEFAULT 'sent',
    notes TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    // console.log("Employees table ready");
}
