// contexts/auth-context.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Role = "rss_staff" | "client" | "inspector" | "first_aider";

export interface ClientCompany {
  id: number;
  name: string;
  logo: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  company?: ClientCompany | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginStaff: (email: string, password: string) => Promise<void>;
  loginClient: (email: string, password: string) => Promise<void>;
  loginInspector: (email: string, password: string) => Promise<void>;
  loginFirstAider: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "sherq_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

    setLoading(false);
  }, []);

  async function performLogin(role: Role, email: string, password: string) {
    const endpoint =
      role === "rss_staff"
        ? "staff"
        : role === "first_aider"
          ? "first-aider"
          : role;

    const res = await fetch(`${API_BASE}/auth/login/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    const fullUser: AuthUser = data.user;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: data.token, user: fullUser }),
    );
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
        loading,
        loginStaff: (email, password) =>
          performLogin("rss_staff", email, password),
        loginClient: (email, password) =>
          performLogin("client", email, password),
        loginInspector: (email, password) =>
          performLogin("inspector", email, password),
        loginFirstAider: (email, password) =>
          performLogin("first_aider", email, password),
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
