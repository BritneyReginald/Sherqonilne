export interface Employee {
  id?: number;
  employeeId?: string;

  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  gender: string;
  nationality: string;

  email: string;
  phone: string;
  mobile: string;
  address: string;

  reportingManager: string;
  reportingManagerId: string;
  reportingManagerJobTitle: string;
  reportingManagerLegalAppointment: string;

  department: string;
  division: string;
  organisationalLevel: string;

  emergencyContact: string;
  relationship: string;
  emergencyPhone: string;

  jobTitle: string;
  siteLocation: string;
  employmentType: string;

  startDate: string;
  contractEndDate: string;

  salaryGrade: string;
  workSchedule: string;

  complianceStatus: string;
  status: string;
}