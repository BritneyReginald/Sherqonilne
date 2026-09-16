import type {
  BeforeControlsData,
  AfterControlsData,
  DetailsData,
} from "../components/new-risk-assessment";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface RiskAssessmentRecord {
  id: string;
  assessmentName: string;
  referenceNo: string;
  linkedSite: string;
  linkedDept: string;
  revision: string;
  reviewDate: string;
  expiryDate: string;
  savedDate: string;
  status: "approved" | "draft" | "under-review" | "expired";
  signOffRate: number;
  assignedEmployees: number;
  signedEmployees: number;
  category: "baseline" | "task-based" | "issue-based";
  pdfUrl: string | null;
  rawData: {
    beforeControls: BeforeControlsData;
    afterControls: AfterControlsData | null;
    details: DetailsData & { companyName?: string; companyLogo?: string };
  };
}

function mapRecord(row: any): RiskAssessmentRecord {
  return {
    id: row.id?.toString() ?? "",
    assessmentName: row.assessment_name ?? "",
    referenceNo: row.reference_no ?? "",
    linkedSite: row.linked_site ?? "",
    linkedDept: row.linked_dept ?? "",
    revision: row.revision ?? "",
    reviewDate: row.review_date ?? "",
    expiryDate: row.expiry_date ?? "",
    savedDate: row.saved_date ?? "",
    status: row.status ?? "draft",
    signOffRate: row.sign_off_rate ?? 0,
    assignedEmployees: row.assigned_employees ?? 0,
    signedEmployees: row.signed_employees ?? 0,
    category: row.category ?? "task-based",
    pdfUrl: row.pdf_url ?? null,
    rawData: {
      beforeControls: row.before_controls ?? { hazards: [] },
      afterControls: row.after_controls ?? null,
      details: {
        taskDescription: row.task_description ?? "",
        assessors: row.assessors ?? [""],
        assessmentDate: row.assessment_date ?? "",
        companyName: row.company_name ?? "",
        companyLogo: row.company_logo_url ?? undefined,
      },
    },
  };
}

async function request(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getRiskAssessments(): Promise<RiskAssessmentRecord[]> {
  const rows = await request(`${API_URL}/risk-assessments`);
  return rows.map(mapRecord);
}

export async function deleteRiskAssessmentRecord(id: string): Promise<void> {
  await request(`${API_URL}/risk-assessments/${id}`, { method: "DELETE" });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

/**
 * Creates or updates a risk assessment's metadata, then uploads
 * the logo (if a new one was picked) and the generated PDF.
 * Mirrors the employee module's pattern: metadata is JSON, files
 * are uploaded separately once the row (and its id) exists.
 */
export async function saveRiskAssessmentToRegister(params: {
  id?: string;
  beforeControls: BeforeControlsData;
  afterControls: AfterControlsData | null;
  details: DetailsData & { companyName: string; companyLogo: string };
  pdfBlob: Blob;
}): Promise<RiskAssessmentRecord> {
  const metadataPayload = {
    assessmentName: params.details.taskDescription,
    taskDescription: params.details.taskDescription,
    assessors: params.details.assessors,
    assessmentDate: params.details.assessmentDate,
    reviewDate: params.details.assessmentDate,
    expiryDate: params.details.assessmentDate,
    assignedEmployees: params.details.assessors.filter(Boolean).length,
    companyName: params.details.companyName,
    beforeControls: params.beforeControls,
    afterControls: params.afterControls,
  };

  let row = params.id
    ? await request(`${API_URL}/risk-assessments/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadataPayload),
      })
    : await request(`${API_URL}/risk-assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadataPayload),
      });

  // Only re-upload the logo if a new one was picked (a fresh data: URL).
  // If it's already an https SAS URL, it's unchanged, so skip it.
  if (params.details.companyLogo?.startsWith("data:")) {
    const logoBlob = dataUrlToBlob(params.details.companyLogo);
    const logoForm = new FormData();
    logoForm.append("logo", logoBlob, "logo.png");
    row = await request(`${API_URL}/risk-assessments/${row.id}/logo`, {
      method: "POST",
      body: logoForm,
    });
  }

  const pdfForm = new FormData();
  pdfForm.append("pdf", params.pdfBlob, "risk-assessment.pdf");
  row = await request(`${API_URL}/risk-assessments/${row.id}/pdf`, {
    method: "POST",
    body: pdfForm,
  });

  return mapRecord(row);
}