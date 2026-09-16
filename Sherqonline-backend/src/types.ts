export interface Employee {
  id?: number;
  employeeNumber?: string;

  // Personal
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;

  // Contact
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;

  // Employment
  reportingManager?: string;
  jobTitle?: string;
  siteLocation?: string;
  employmentType?: string;

  // Timeline
  startDate?: string;
  contractEndDate?: string;

  // Compensation
  salaryGrade?: string;
  workSchedule?: string;

  // Compliance / status
  complianceStatus?: "compliant" | "review" | "action";
  status?: string;

  // Emergency contact
  emergencyContact?: string;
  relationship?: string;
  emergencyPhone?: string;

  // ID document (Azure Blob)
  idDocumentBlobName?: string;
  idDocumentFileName?: string;
  idDocumentSize?: number;
  idDocumentMimeType?: string;

  // Profile picture (Azure Blob)
  profilePictureBlobName?: string;
  profilePictureFileName?: string;
  profilePictureSize?: number;
  profilePictureMimeType?: string;
}

export interface RiskAssessmentInput {
  assessmentName?: string;
  linkedSite?: string;
  linkedDept?: string;
  revision?: string;
  reviewDate?: string | null;
  expiryDate?: string | null;
  status?: "approved" | "draft" | "under-review" | "expired";
  signOffRate?: number;
  assignedEmployees?: number;
  signedEmployees?: number;
  category?: "baseline" | "task-based" | "issue-based";

  companyName: string;
  taskDescription: string;
  assessors: string[];
  assessmentDate: string;

  beforeControls: unknown; // BeforeControlsData shape from the frontend
  afterControls?: unknown | null; // AfterControlsData shape, or null
}
