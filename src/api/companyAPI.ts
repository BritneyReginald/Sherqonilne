const API_URL = "http://localhost:3000";

export async function getCompanies() {
  const res = await fetch(`${API_URL}/companies`);

  if (!res.ok) {
    throw new Error("Failed to load companies");
  }

  return res.json();
}

export async function createCompany(company: any) {
  const res = await fetch(`${API_URL}/companies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(company),
  });

  return res.json();
}