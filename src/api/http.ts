
// Attaches the logged-in user's token to every request that goes to
// the backend, so no component has to remember to do it. Install once
// (see App.tsx). Requests to other origins (e.g. Azure blob SAS URLs)
// are left alone. FormData uploads work because Content-Type is never
// touched.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "sherq_auth";

let installed = false;

function readAuth(): { token: string | null; role: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { token: null, role: null };
    const parsed = JSON.parse(stored);
    return { token: parsed.token ?? null, role: parsed.user?.role ?? null };
  } catch {
    return { token: null, role: null };
  }
}

export function installAuthFetch() {
  if (installed) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (!url.startsWith(API_URL)) return originalFetch(input, init);

    const { token, role } = readAuth();

    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await originalFetch(input, { ...init, headers });

    // Expired or invalid session: clear it and go back to the right login.
    // Login calls themselves are excluded so a wrong password isn't a logout.
    if (res.status === 401 && token && !url.includes("/auth/login/")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = role === "client" ? "/login/client" : "/login/staff";
    }

    return res;
  };
}