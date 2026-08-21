// pages/login-client.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { LoginLayout } from "../components/login-layout";
import { useTheme } from "../contexts/theme-context";

export function LoginClient() {
  const { loginClient } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginClient(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginLayout
      title="Client Portal Login"
      subtitle="Access your company's SHERQ dashboard"
      icon={<Building2 className="size-6 text-white" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--compliance-danger)" }}
          >
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.primaryText }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ backgroundColor: colors.background, color: colors.primaryText }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.primaryText }}>
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border outline-none"
            style={{ backgroundColor: colors.background, color: colors.primaryText }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-medium text-white transition-opacity"
          style={{ backgroundColor: "var(--brand-blue)", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </LoginLayout>
  );
}