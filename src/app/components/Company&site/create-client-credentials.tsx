import { useState } from "react";
import { ArrowLeft, KeyRound, Mail, User } from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { toast } from "sonner";
import { createClientCredentials } from "../../../api/clientAPI";

interface Site {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  contactPerson?: string;
  contactNumber?: string;
}

interface CreateClientCredentialsProps {
  site: Site;
  onBack: () => void;
}

export function CreateClientCredentials({
  site,
  onBack,
}: CreateClientCredentialsProps) {
  const { colors } = useTheme();

  const [email, setEmail] = useState(site.email || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Client email is required.");
      return;
    }

    try {
      setLoading(true);

      const result = await createClientCredentials(
        email.trim(),
        Number(site.id),
      );

      console.log("Client credentials created:", result);

      toast.success(
        `Login details for ${site.name} have been sent to milly.reginald@gmail.com.`,
      );

      onBack();
    } catch (error) {
      console.error("Create credentials error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create client credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-full p-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm font-medium"
        style={{ color: "var(--brand-blue)" }}
      >
        <ArrowLeft className="size-4" />
        Back to Site Details
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <KeyRound className="size-6" style={{ color: "var(--brand-blue)" }} />

          <h1
            className="text-2xl font-bold"
            style={{ color: colors.primaryText }}
          >
            Create Client Login
          </h1>
        </div>

        <p className="text-sm" style={{ color: colors.subText }}>
          Create portal credentials for <strong>{site.name}</strong>.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg p-6 max-w-2xl"
        style={{
          backgroundColor: colors.surface,
          boxShadow:
            colors.background === "#0F172A"
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Site */}
        <div className="mb-5">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.primaryText }}
          >
            Client Site
          </label>

          <div
            className="w-full px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: colors.background,
              color: colors.primaryText,
            }}
          >
            {site.name}
          </div>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.primaryText }}
          >
            Client Email
          </label>

          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
              style={{ color: colors.subText }}
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none"
              style={{
                backgroundColor: colors.background,
                color: colors.primaryText,
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{
            backgroundColor: "rgba(59,130,246,0.08)",
          }}
        >
          <div className="flex gap-3">
            <User
              className="size-5 shrink-0"
              style={{ color: "var(--brand-blue)" }}
            />

            <div className="text-sm" style={{ color: colors.subText }}>
              <p className="mb-2">
                A temporary password will be generated automatically.
              </p>

              <p>
                The login details for <strong>{site.name}</strong> will be sent
                to <strong>milly.reginald@sherq.co.za</strong>. The client's
                account will only have access to information associated with{" "}
                <strong>{site.name}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-lg font-medium border"
            style={{
              color: colors.primaryText,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: "var(--brand-blue)",
              color: "white",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <KeyRound className="size-4" />

            {loading ? "Creating..." : "Create Client Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
