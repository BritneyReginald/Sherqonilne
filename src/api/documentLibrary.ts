const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const BASE = `${API_BASE}/document-library`;

export interface ApiFolder {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface ApiDocument {
  id: number;
  folder_id: number;
  name: string;
  current_version: number;
  updated_by_name: string | null;
  last_updated_date: string; // YYYY-MM-DD
  expiry_date: string | null;
  status: "valid" | "expiring" | "expired";
  file_name: string;
  file_size: number | null;
  file_mime_type: string | null;
}

export interface ApiArchivedDocument {
  id: number;
  folder_id: number;
  name: string;
  current_version: number;
  updated_by_name: string | null;
  expiry_date: string | null;
  archived_at: string;
  folder_path: string | null;
  file_name: string;
  file_size: number | null;
  file_mime_type: string | null;
}

export interface ApiVersion {
  id: number;
  version_number: number;
  file_name: string;
  file_size: number | null;
  updated_by_name: string | null;
  updated_date: string | null;
  change_summary: string | null;
  created_at: string;
}

export interface ApiEmployee {
  id: number;
  full_name: string;
  status?: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const fetchFolders = () => request<ApiFolder[]>(`${BASE}/folders`);

export const createFolder = (name: string, parentId: number | null) =>
  request<ApiFolder>(`${BASE}/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentId }),
  });

export const fetchDocuments = (folderId: number) =>
  request<ApiDocument[]>(`${BASE}/folders/${folderId}/documents`);

export const uploadDocument = (formData: FormData) =>
  request<ApiDocument>(`${BASE}/documents`, { method: "POST", body: formData });

export const uploadNewVersion = (documentId: number, formData: FormData) =>
  request<ApiDocument>(`${BASE}/documents/${documentId}/versions`, {
    method: "POST",
    body: formData,
  });

export const fetchVersions = (documentId: number) =>
  request<ApiVersion[]>(`${BASE}/documents/${documentId}/versions`);

export const fetchFileUrl = async (
  documentId: number,
  mode: "view" | "download",
  versionId?: number,
) => {
  const qs = new URLSearchParams({ mode });
  if (versionId) qs.set("versionId", String(versionId));
  const { url } = await request<{ url: string }>(
    `${BASE}/documents/${documentId}/url?${qs}`,
  );
  return url;
};

export const archiveDocument = (documentId: number) =>
  request<{ id: number }>(`${BASE}/documents/${documentId}/archive`, {
    method: "PATCH",
  });

export const fetchEmployees = () =>
  request<ApiEmployee[]>(`${API_BASE}/employees`);

export async function downloadFolderZip(folder: ApiFolder) {
  const res = await fetch(`${BASE}/folders/${folder.id}/download`);
  if (!res.ok) throw new Error("Failed to download folder");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${folder.name}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const fetchArchivedDocuments = () =>
  request<ApiArchivedDocument[]>(`${BASE}/archived`);

export const restoreDocument = (documentId: number) =>
  request<{ id: number }>(`${BASE}/documents/${documentId}/restore`, {
    method: "PATCH",
  });
