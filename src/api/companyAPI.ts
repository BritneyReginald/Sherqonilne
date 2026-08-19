const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getCompanies() {
  const res = await fetch(`${API_URL}/companies`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load companies");
  }

  return res.json();
}

export async function getMyCompany() {
  const res = await fetch(`${API_URL}/companies/me`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load your company");
  }

  return res.json();
}

export async function createCompany(company: {
  name: string;
  logo: string;
  email: string;
  contactPerson: string;
  contactNumber: string;
}) {
  const res = await fetch(`${API_URL}/companies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: company.name,
      logo: company.logo,
      email: company.email,
      contactPerson: company.contactPerson,
      contactNumber: company.contactNumber,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));

    throw new Error(error.error || "Failed to create company");
  }

  return res.json();
}
