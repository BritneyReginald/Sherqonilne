// pages/login-inspector.tsx
import { useState } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { LoginLayout } from "@/app/components/login-layout";
import { useTheme } from "@/app/contexts/theme-context";

// Inspectors skip the main AppShell entirely — they land straight in
// Fire Equipment, per your access rules.
const FIRE_EQUIPMENT_URL =
  "https://ohs-online-fire-a2a2duhchxd2cjcg.southafricanorth-01.azurewebsites.net/";

export function LoginInspector() {
  const { loginInspector } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginInspector(email, password);
      // NOTE: this is a placeholder redirect only — see flag below about
      // the token handoff this still needs.
      window.location.href = FIRE_EQUIPMENT_URL;
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginLayout
      title="Inspector Login"
      subtitle="Fire Equipment Inspection System"
      icon={<Flame className="size-6 text-white" />}
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