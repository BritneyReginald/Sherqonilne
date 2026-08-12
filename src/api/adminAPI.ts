const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function createInspector(data: any) {
  const res = await fetch(`${API_URL}/admin/inspectors`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create inspector");
  }

  return res.json();
}

export async function getInspectors() {
  const res = await fetch(`${API_URL}/admin/inspectors`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load inspectors");
  }

  return res.json();
}

export async function resetInspectorPassword(id: number, newPassword: string) {
  const res = await fetch(`${API_URL}/admin/inspectors/${id}/reset-password`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ newPassword }),
  });

  if (!res.ok) {
    throw new Error("Failed to reset password");
  }

  return res.json();
}

export async function updateInspectorSites(
  inspectorId: number,
  siteIds: number[],
) {
  const res = await fetch(`${API_URL}/admin/inspectors/${inspectorId}/sites`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ siteIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to update inspector sites");
  }

  return res.json();
}

export async function updateInspectorStatus(
  id: number,
  status: "active" | "disabled",
) {
  const res = await fetch(`${API_URL}/admin/inspectors/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update status");
  }

  return res.json();
}

export async function deleteInspector(id: number) {
  const res = await fetch(`${API_URL}/admin/inspectors/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete inspector");
  }

  return res.json();
}
