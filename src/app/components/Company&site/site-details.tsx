import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Trash2,
  KeyRound,
  LogIn,
  Edit,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { deleteSite, updateSite } from "../../../api/siteAPI";
import { getSiteClientAccess } from "../../../api/clientAPI";
import { AddClientModal } from "../add-client-modal";
import { CreateClientCredentials } from "./create-client-credentials";

interface Site {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  contactPerson?: string;
  contactNumber?: string;
}

interface ClientAccess {
  id: number;
  email: string;
  status: "invited" | "active" | "disabled";
  last_login_at: string | null;
}

interface SiteDetailsProps {
  site: Site;
  onBack: () => void;
  onDeleted: () => void;
}

export function SiteDetails({ site, onBack, onDeleted }: SiteDetailsProps) {
  const { colors } = useTheme();

  const [showCredentials, setShowCredentials] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // The client login (if any) that already exists for this site
  const [clientAccess, setClientAccess] = useState<ClientAccess | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);

  // Reload whenever we open a site or come back from the "create login" screen
  useEffect(() => {
    if (showCredentials) return;

    let cancelled = false;
    setAccessLoading(true);

    getSiteClientAccess(site.id)
      .then((data) => {
        if (!cancelled) setClientAccess(data);
      })
      .catch((err) => {
        console.error("Failed to load client access:", err);
        if (!cancelled) setClientAccess(null);
      })
      .finally(() => {
        if (!cancelled) setAccessLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [site.id, showCredentials]);

  const cardStyle = {
    backgroundColor: colors.surface,
    boxShadow:
      colors.background === "#0F172A"
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const handleDeleteSite = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${site.name}"? This will also delete the client login for this site. This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteSite(site.id);

      toast.success("Site deleted successfully");

      onDeleted();
    } catch (error) {
      console.error("Delete site error:", error);
      toast.error("Failed to delete site.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * Go to the client login page.
   *
   * The staff session and the client session are stored under the same
   * "sherq_auth" key, so logging in as the client would silently replace
   * the RSS staff session. We clear it explicitly (after confirming) and
   * do a full page load so no staff state is left in memory.
   */
  const handleClientLogin = () => {
    if (!clientAccess) return;

    const confirmed = window.confirm(
      `You will be signed out of your RSS staff account and taken to the client login for "${site.name}". Continue?`,
    );
    if (!confirmed) return;

    localStorage.removeItem("sherq_auth");

    const params = new URLSearchParams({ email: clientAccess.email });
    window.location.assign(`/login/client?${params.toString()}`);
  };

  if (showCredentials) {
    return (
      <CreateClientCredentials
        site={site}
        onBack={() => setShowCredentials(false)}
      />
    );
  }

  const statusLabel =
    clientAccess?.status === "active"
      ? "Active"
      : clientAccess?.status === "disabled"
        ? "Disabled"
        : "Invited (has not logged in yet)";

  return (
    <div
      className="min-h-full p-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm font-medium"
        style={{ color: "var(--brand-blue)" }}
      >
        <ArrowLeft className="size-4" />
        Back to Sites
      </button>

      {/* Site header */}
      <div className="rounded-lg p-6 mb-6" style={cardStyle}>
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div
            className="size-24 rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: colors.background,
            }}
          >
            <ImageWithFallback
              src={site.logo || "https://placehold.co/200x200"}
              alt={`${site.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Site name */}
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.primaryText }}
            >
              {site.name}
            </h1>

            <p className="text-sm mt-1" style={{ color: colors.subText }}>
              Client Inspection Site
            </p>
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="rounded-lg p-6 mb-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-semibold"
            style={{ color: colors.primaryText }}
          >
            Client Details
          </h2>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ color: "var(--brand-blue)" }}
          >
            <Edit className="size-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="size-4" style={{ color: colors.subText }} />

              <span
                className="text-xs font-medium"
                style={{ color: colors.subText }}
              >
                EMAIL
              </span>
            </div>

            <p className="text-sm" style={{ color: colors.primaryText }}>
              {site.email || "Not provided"}
            </p>
          </div>

          {/* Contact person */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="size-4" style={{ color: colors.subText }} />

              <span
                className="text-xs font-medium"
                style={{ color: colors.subText }}
              >
                CONTACT PERSON
              </span>
            </div>

            <p className="text-sm" style={{ color: colors.primaryText }}>
              {site.contactPerson || "Not provided"}
            </p>
          </div>

          {/* Contact number */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Phone className="size-4" style={{ color: colors.subText }} />

              <span
                className="text-xs font-medium"
                style={{ color: colors.subText }}
              >
                CONTACT NUMBER
              </span>
            </div>

            <p className="text-sm" style={{ color: colors.primaryText }}>
              {site.contactNumber || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Client Access */}
      <div className="rounded-lg p-6 mb-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-2">
          <KeyRound
            className="size-5"
            style={{ color: "var(--brand-blue)" }}
          />

          <h2
            className="text-lg font-semibold"
            style={{ color: colors.primaryText }}
          >
            Client Access
          </h2>
        </div>

        {accessLoading ? (
          <p className="text-sm" style={{ color: colors.subText }}>
            Checking client login...
          </p>
        ) : clientAccess ? (
          <>
            <div
              className="rounded-lg p-4 mb-5 flex items-start gap-3"
              style={{ backgroundColor: "rgba(59,130,246,0.08)" }}
            >
              <CheckCircle2
                className="size-5 shrink-0 mt-0.5"
                style={{ color: "var(--compliance-success)" }}
              />

              <div className="text-sm" style={{ color: colors.subText }}>
                <p>
                  A client login exists for <strong>{site.name}</strong>.
                </p>
                <p className="mt-1">
                  Login email:{" "}
                  <strong style={{ color: colors.primaryText }}>
                    {clientAccess.email}
                  </strong>
                </p>
                <p className="mt-1">Status: {statusLabel}</p>
                {clientAccess.last_login_at && (
                  <p className="mt-1">
                    Last login:{" "}
                    {new Date(clientAccess.last_login_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleClientLogin}
              disabled={clientAccess.status === "disabled"}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium disabled:opacity-60"
              style={{
                backgroundColor: "var(--brand-blue)",
                color: "white",
              }}
            >
              <LogIn className="size-4" />
              Login
            </button>

            <p className="text-xs mt-3" style={{ color: colors.subText }}>
              Opens the client login page. You will need the password that was
              emailed when the login was created. You'll be signed out of your
              RSS staff account.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: colors.subText }}>
              Create login credentials so the client can access their SHERQ
              Online portal. Once created, a Login button will appear here.
            </p>

            <button
              onClick={() => setShowCredentials(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: "var(--brand-blue)",
                color: "white",
              }}
            >
              <KeyRound className="size-4" />
              Create Client Login
            </button>
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: colors.surface,
          border: "1px solid rgba(239,68,68,0.25)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: "#EF4444" }}
        >
          Danger Zone
        </h2>

        <p className="text-sm mb-5" style={{ color: colors.subText }}>
          Deleting this site will remove it from the sites managed by RSS and
          delete its client login.
        </p>

        <button
          onClick={handleDeleteSite}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: "#EF4444",
            color: "white",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <Trash2 className="size-4" />

          {deleting ? "Deleting..." : "Delete Site"}
        </button>
      </div>

      {/* Edit Site Modal */}
      {showEditModal && (
        <AddClientModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={{
            name: site.name,
            logo: site.logo,
            email: site.email,
            contactPerson: site.contactPerson,
            contactNumber: site.contactNumber,
          }}
          onSave={async (updated) => {
            try {
              await updateSite(site.id, updated);
              toast.success("Site updated successfully");
              setShowEditModal(false);
              onDeleted(); // refreshes the sites list and returns to the grid
            } catch (error) {
              console.error("Update site error:", error);
              toast.error("Failed to update site.");
              throw error; // keeps the modal open so the user can retry
            }
          }}
        />
      )}
    </div>
  );
}