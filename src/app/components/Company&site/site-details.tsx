import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Trash2,
  KeyRound,
  Building2,
  Edit,
} from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { deleteSite, updateSite } from "../../../api/siteAPI";
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

  const handleDeleteSite = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${site.name}"? This action cannot be undone.`,
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

  if (showCredentials) {
    return (
      <CreateClientCredentials
        site={site}
        onBack={() => setShowCredentials(false)}
      />
    );
  }

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
      <div
        className="rounded-lg p-6 mb-6"
        style={{
          backgroundColor: colors.surface,
          boxShadow:
            colors.background === "#0F172A"
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
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
      <div
        className="rounded-lg p-6 mb-6"
        style={{
          backgroundColor: colors.surface,
          boxShadow:
            colors.background === "#0F172A"
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
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
      <div
        className="rounded-lg p-6 mb-6"
        style={{
          backgroundColor: colors.surface,
          boxShadow:
            colors.background === "#0F172A"
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
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

        <p className="text-sm mb-5" style={{ color: colors.subText }}>
          Create login credentials so the client can access their SHERQ
          Online portal.
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
          Deleting this site will remove it from the sites managed by RSS.
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