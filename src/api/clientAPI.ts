const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createClientCredentials(
  email: string,
  siteId: number,
) {
  const response = await fetch(
    `${API_BASE}/auth/credentials/client`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        email,
        siteId,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create client credentials",
    );
  }

  return data;
}