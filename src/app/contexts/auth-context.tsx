// contexts/auth-context.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "rss_staff" | "client" | "inspector";

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  companyId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginStaff: (email: string, password: string) => Promise<void>;
  loginClient: (email: string, password: string) => Promise<void>;
  loginInspector: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "sherq_auth";

// JWT payload isn't secret info (server always re-verifies via middleware),
// so decoding it client-side just for UI display (e.g. companyId) is safe.
function decodeCompanyId(token: string): number | undefined {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.companyId;
  } catch {
    return undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  async function performLogin(role: Role, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/${role === "rss_staff" ? "staff" : role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    const companyId = decodeCompanyId(data.token);
    const fullUser: AuthUser = { ...data.user, companyId };

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, user: fullUser }));
    setToken(data.token);
    setUser(fullUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loginStaff: (email, password) => performLogin("rss_staff", email, password),
        loginClient: (email, password) => performLogin("client", email, password),
        loginInspector: (email, password) => performLogin("inspector", email, password),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}