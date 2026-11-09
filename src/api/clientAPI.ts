const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const stored = localStorage.getItem("sherq_auth");
  const token = stored ? JSON.parse(stored).token : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createClientCredentials(email: string, siteId: number) {
  const response = await fetch(`${API_BASE}/auth/credentials/client`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email,
      siteId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to create client credentials");
  }

  return data;
}

/*
 * Returns the client login for a site, or null if none exists yet.
 */
export async function getSiteClientAccess(siteId: string) {
  const response = await fetch(`${API_BASE}/sites/${siteId}/client-access`, {
    headers: authHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to load client access");
  }

  return data.clientAccess ?? null;
}

/*
 * Returns the client login's password (RSS staff only), or null when
 * it isn't available (login created before passwords were stored).
 */
export async function getSiteClientPassword(
  siteId: string,
): Promise<string | null> {
  const response = await fetch(
    `${API_BASE}/auth/credentials/client/${siteId}/password`,
    { headers: authHeaders() },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to load client password");
  }

  return data.password ?? null;
}

/*
 * Generates a new password for the site's existing client login
 * (RSS staff only). The old password stops working.
 */
export async function resetSiteClientPassword(
  siteId: string,
): Promise<string> {
  const response = await fetch(
    `${API_BASE}/auth/credentials/client/${siteId}/reset-password`,
    { method: "POST", headers: authHeaders() },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset client password");
  }

  return data.password;
}