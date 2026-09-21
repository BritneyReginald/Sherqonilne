import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface FirstAiderIdentity {
  token: string;
  id: number;
  email: string;
  fullName?: string;
  surname?: string;
}

interface Props {
  onSuccess: (identity: FirstAiderIdentity) => void;
  onCancel: () => void;
}

export function FirstAiderLoginGate({ onSuccess, onCancel }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login/first-aider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      onSuccess({
        token: data.token,
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        surname: data.user.surname,
      });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md">
      <h2 className="text-lg font-semibold mb-1 text-gray-800">
        First Aider Login
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        This section is only available to registered first aiders. Please
        log in to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-gray-900 bg-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border text-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-medium text-white bg-blue-600 disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}