// src/api/companyAPI.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  try {
    const stored = localStorage.getItem("sherq_auth");
    const token = stored ? JSON.parse(stored).token : null;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return { "Content-Type": "application/json" };
  }
}

export interface CompanyProfile {
  name: string;
  logo: string | null;
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const res = await fetch(`${API_URL}/company`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to load company profile");
  }

  return res.json();
}

/**
 * Send only the fields you want to change (name and/or logo).
 */
export async function updateCompanyProfile(changes: {
  name?: string;
  logo?: string;
}): Promise<CompanyProfile> {
  const res = await fetch(`${API_URL}/company`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(changes),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Failed to update company profile");
  }

  return data;
}
