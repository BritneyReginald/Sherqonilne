import pool from "./db";

export async function initializeDatabase() {
  await pool.query(`
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
  `);

  console.log("Employees table ready");
}
