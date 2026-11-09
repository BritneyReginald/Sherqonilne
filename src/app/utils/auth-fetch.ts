// app/utils/auth-fetch.ts
// Shared helpers so every module sends the login token and compares site names the same way.

export function authHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("sherq_auth");
    const token = stored ? JSON.parse(stored).token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/** fetch() that always carries the Bearer token (works with JSON and FormData bodies). */
export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const auth = authHeaders();
  if (auth.Authorization && !headers.has("Authorization")) {
    headers.set("Authorization", auth.Authorization);
  }
  return fetch(input, { ...init, headers });
}

/** Case/whitespace-insensitive site name match. Missing values never match. */
export function sameSite(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}