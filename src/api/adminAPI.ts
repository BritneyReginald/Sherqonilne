const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Throws an Error carrying the server's `error` message when there is one,
// otherwise the fallback text. The status is attached for callers that care.
async function throwApiError(res: Response, fallback: string): Promise<never> {
  let message = fallback;

  try {
    const body = await res.json();
    if (typeof body?.error === "string" && body.error) {
      message = body.error;
    }
  } catch {
    // response had no JSON body — keep the fallback
  }

  const error = new Error(message) as Error & { status?: number };
  error.status = res.status;
  throw error;
}

export async function createInspector(data: any) {
  const res = await fetch(`${API_URL}/admin/inspectors`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to create inspector");
  }

  return res.json();
}

export async function getInspectors() {
  const res = await fetch(`${API_URL}/admin/inspectors`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to load inspectors");
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
    await throwApiError(res, "Failed to reset password");
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
    await throwApiError(res, "Failed to update inspector sites");
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
    await throwApiError(res, "Failed to update status");
  }

  return res.json();
}

export async function deleteInspector(id: number) {
  const res = await fetch(`${API_URL}/admin/inspectors/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to delete inspector");
  }

  return res.json();
}

export async function createFirstAider(data: any) {
  const res = await fetch(`${API_URL}/admin/first-aiders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await throwApiError(res, "Failed to create first aider");
  return res.json();
}

export async function getFirstAiders() {
  const res = await fetch(`${API_URL}/admin/first-aiders`, {
    headers: authHeaders(),
  });
  if (!res.ok) await throwApiError(res, "Failed to load first aiders");
  return res.json();
}

export async function resetFirstAiderPassword(id: number, newPassword: string) {
  const res = await fetch(
    `${API_URL}/admin/first-aiders/${id}/reset-password`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ newPassword }),
    },
  );
  if (!res.ok) await throwApiError(res, "Failed to reset password");
  return res.json();
}

export async function updateFirstAiderSites(id: number, siteIds: number[]) {
  const res = await fetch(`${API_URL}/admin/first-aiders/${id}/sites`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ siteIds }),
  });
  if (!res.ok) await throwApiError(res, "Failed to update sites");
  return res.json();
}

export async function updateFirstAiderStatus(
  id: number,
  status: "active" | "disabled",
) {
  const res = await fetch(`${API_URL}/admin/first-aiders/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await throwApiError(res, "Failed to update status");
  return res.json();
}

export async function deleteFirstAider(id: number) {
  const res = await fetch(`${API_URL}/admin/first-aiders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) await throwApiError(res, "Failed to delete first aider");
  return res.json();
}
