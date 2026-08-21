// siteAPI.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getSites() {
  const res = await fetch(`${API_URL}/sites`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to load sites");
  }

  return res.json();
}

export async function createSite(site: {
  name: string;
  logo: string;
  email: string;
  contactPerson: string;
  contactNumber: string;
}) {
  const res = await fetch(`${API_URL}/sites`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: site.name,
      logo: site.logo,
      email: site.email,
      contact_person: site.contactPerson,
      contact_number: site.contactNumber,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Failed to create site");
  }

  return data;
}

export async function deleteSite(siteId: string) {
  const res = await fetch(`${API_URL}/sites/${siteId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete site");
  }

  return res.json();
}
