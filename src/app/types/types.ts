export interface Employee {
  id: string;
  employeeId: string; // EMP001, EMP002 … generated server-side

  // Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;

  // Contact
  email: string;
  phone: string;
  mobile: string;
  address: string;

  // Employment
  reportingManager: string;
  jobTitle: string;
  siteLocation: string;
  employmentType: string;
  workerType?: "Internal" | "External";

  // Timeline
  startDate: string;
  contractEndDate?: string;

  // Compensation
  salaryGrade: string;
  workSchedule: string;

  // Compliance / status
  complianceStatus: "compliant" | "review" | "action";
  status: string;

  // Emergency contact
  emergencyContact: string;
  relationship: string;
  emergencyPhone: string;

  // ID document
  idDocumentFileName?: string | null;
  idDocumentUrl?: string | null;

  // Profile picture
  profilePictureFileName?: string | null;
  profilePictureUrl?: string | null;
}