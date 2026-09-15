import { IncidentRecord, InvestigationData, RecordStatus, RecordType } from "../app/components/incidents/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE_URL = `${API_URL}/api/incidents`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

function normalizeRecord(row: any): IncidentRecord {
  return {
    id: row.id,
    type: row.type,

    employeeId: row.employee_id ?? null,
    employeeNumber: row.employee_number ?? undefined,
    employeeName: row.employee_name ?? undefined,
    employeeSiteLocation: row.employee_site_location ?? undefined,

    division: row.division ?? undefined,
    site: row.site ?? undefined,
    incidentDate: row.incident_date ?? undefined,
    incidentTime: row.incident_time ?? undefined,

    category: row.category ?? undefined,
    title: row.title ?? "",
    description: row.description ?? "",
    status: row.status,

    injuryType: row.injury_type ?? undefined,

    ncrType: row.ncr_type ?? undefined,
    identifiedBy: row.identified_by ?? undefined,
    department: row.department ?? undefined,

    bodyPart: row.body_part ?? undefined,
    effect: row.effect ?? undefined,
    disablement: row.disablement ?? undefined,

    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,

    investigation: row.investigation as InvestigationData | undefined,
    firstAidEntries: row.firstAidEntries ?? undefined,
  };
}

export async function fetchIncidentRecords(filters?: {
  type?: RecordType;
  status?: RecordStatus;
  site?: string;
}): Promise<IncidentRecord[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.site) params.set("site", filters.site);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  const rows = await handle<any[]>(res);
  return rows.map(normalizeRecord);
}

export async function fetchIncidentRecord(id: number): Promise<IncidentRecord> {
  const res = await fetch(`${BASE_URL}/${id}`);
  const row = await handle<any>(res);
  return normalizeRecord(row);
}

export interface FirstAidEntryPayload {
  employeeId?: string;
  employeeName?: string;
  employeeNumber?: string;
  date?: string;
  time?: string;
  injury?: string;
  treatment?: string;
  comments?: string;
  firstAider?: string;
  furtherMedicalAttention?: boolean;
  status?: string;
}

export async function createIncidentRecord(input: {
  type: RecordType;
  employeeId?: number;
  division?: string;
  site?: string;
  incidentDate?: string;
  incidentTime?: string;
  category?: string;
  title?: string;
  description?: string;
  injuryType?: "firstAid" | "hospital";
  entries?: FirstAidEntryPayload[];
  ncrType?: "Internal" | "External";
  identifiedBy?: string;
  department?: string;
  bodyPart?: string;
  effect?: string;
  disablement?: string;
}): Promise<IncidentRecord> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const row = await handle<any>(res);
  return normalizeRecord(row);
}

export async function updateIncidentStatus(id: number, status: RecordStatus): Promise<IncidentRecord> {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const row = await handle<any>(res);
  return normalizeRecord(row);
}

export async function deleteIncidentRecord(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  await handle(res);
}

export async function patchInvestigationField(
  id: number,
  field: keyof InvestigationData,
  value: unknown,
): Promise<IncidentRecord> {
  const res = await fetch(`${BASE_URL}/${id}/investigation`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: value }),
  });

  const row = await handle<any>(res);
  return normalizeRecord(row);
}

export async function uploadEvidenceFiles(id: number, files: File[]): Promise<IncidentRecord> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${BASE_URL}/${id}/evidence`, {
    method: "POST",
    body: formData,
  });

  const row = await handle<any>(res);
  return normalizeRecord(row);
}

export async function getEvidenceFileUrl(
  recordId: number,
  fileId: number,
): Promise<{ url: string; fileName: string }> {
  const res = await fetch(`${BASE_URL}/${recordId}/evidence/${fileId}/url`);
  return handle(res);
}

// Scans existing records of a given type for titles like "INC-007"
// and returns the next number in sequence ("INC-008"). Based on the
// max found, not the count, so it stays correct even after deletions.
export function getNextRecordNumber(
  records: IncidentRecord[],
  type: RecordType,
  prefix: string,
): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;

  for (const record of records) {
    if (record.type !== type) continue;
    const match = record.title?.match(pattern);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }

  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}