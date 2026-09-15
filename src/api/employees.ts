const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface EmployeeOption {
  id: string;
  employeeNumber: string;
  fullName: string;
  jobTitle: string;
  siteLocation: string;
  reportingManager: string;
}

function mapEmployeeOption(row: any): EmployeeOption {
  return {
    id: row.id?.toString() ?? "",
    employeeNumber: row.employee_number ?? "",
    fullName: row.full_name ?? "",
    jobTitle: row.job_title ?? "",
    siteLocation: row.site_location ?? "",
    reportingManager: row.reporting_manager ?? "",
  };
}

export async function getEmployees(): Promise<EmployeeOption[]> {
  const res = await fetch(`${API_URL}/employees`);
  if (!res.ok) {
    throw new Error(`Failed to fetch employees (${res.status})`);
  }
  const rows = await res.json();
  return rows.map(mapEmployeeOption);
}