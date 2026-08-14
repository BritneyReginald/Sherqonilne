// siteAPI.ts
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getSites() {
  const res = await fetch(`${API_URL}/sites`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load sites");
  return res.json();
}

export async function getMySites() {
  const res = await fetch(`${API_URL}/sites/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load your sites");
  return res.json();
}

export async function createSite(site: any) {
  const res = await fetch(`${API_URL}/sites`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(site),
  });
  return res.json();
}
