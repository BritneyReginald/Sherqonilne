const API_URL = "http://localhost:3000";

export async function getSites() {
  const res = await fetch(`${API_URL}/sites`);

  if (!res.ok) {
    throw new Error("Failed to load sites");
  }

  return res.json();
}

export async function createSite(site: any) {
  const res = await fetch(`${API_URL}/sites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(site),
  });

  return res.json();
}