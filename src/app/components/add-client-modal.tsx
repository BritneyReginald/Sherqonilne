import { useState } from "react";
import { X, Upload, Building2 } from "lucide-react";
import { useTheme } from "../contexts/theme-context";
import { toast } from "sonner";

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: {
    name: string;
    logo: string;
    email: string;
    contactPerson: string;
    contactNumber: string;
  }) => Promise<void> | void;
  initialData?: {
    name: string;
    logo?: string;
    email?: string;
    contactPerson?: string;
    contactNumber?: string;
  };
}

export function AddClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddSiteModalProps) {
  const { colors } = useTheme();

  const [name, setName] = useState(initialData?.name ?? "");
  const [logo, setLogo] = useState(initialData?.logo ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [contactPerson, setContactPerson] = useState(
    initialData?.contactPerson ?? "",
  );
  const [contactNumber, setContactNumber] = useState(
    initialData?.contactNumber ?? "",
  );
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(initialData);

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Convert image to Base64 so it can temporarily be stored
    // in the database TEXT column.
    const reader = new FileReader();

    reader.onloadend = () => {
      setLogo(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter the client name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter the client email.");
      return;
    }

    if (!contactPerson.trim()) {
      toast.error("Please enter the contact person's name.");
      return;
    }

    if (!contactNumber.trim()) {
      toast.error("Please enter the contact number.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        name: name.trim(),
        logo,
        email: email.trim(),
        contactPerson: contactPerson.trim(),
        contactNumber: contactNumber.trim(),
      });

      // Reset form (harmless in edit mode too, since the modal unmounts on close)
      setName("");
      setLogo("");
      setEmail("");
      setContactPerson("");
      setContactNumber("");

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor:
          colors.background === "#0F172A"
            ? "rgba(15, 23, 42, 0.8)"
            : "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            borderBottom: `1px solid ${
              colors.background === "#0F172A"
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)"
            }`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
              }}
            >
              <Building2
                className="size-5"
                style={{ color: "var(--brand-blue)" }}
              />
            </div>

            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                {isEditMode ? "Edit Site" : "Add New Site"}
              </h2>

              <p className="text-sm mt-1" style={{ color: colors.subText }}>
                {isEditMode
                  ? "Update the client/company profile"
                  : "Create a client/company profile"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.subText }}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Company Identity */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: colors.subText }}
            >
              {isEditMode ? "Client Details" : "Client Information"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="col-span-2">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Company / Client Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sasol Limited"
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primaryText,
                    borderColor: colors.subText + "33",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Email *
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.co.za"
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primaryText,
                    borderColor: colors.subText + "33",
                  }}
                />
              </div>

              {/* Contact Person */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Contact Person *
                </label>

                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Thabo Mokoena"
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primaryText,
                    borderColor: colors.subText + "33",
                  }}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Contact Number *
                </label>

                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 082 123 4567"
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primaryText,
                    borderColor: colors.subText + "33",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: colors.subText }}
            >
              Company Logo
            </h3>

            <div className="flex items-center gap-5">
              <div
                className="size-24 rounded-lg overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.subText}33`,
                }}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt="Company logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2
                    className="size-10"
                    style={{ color: colors.subText }}
                  />
                )}
              </div>

              <div>
                <label
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
                  style={{
                    backgroundColor: "var(--brand-blue)",
                    color: "white",
                  }}
                >
                  <Upload className="size-4" />

                  <span className="text-sm font-medium">Upload Logo</span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>

                <p className="text-xs mt-2" style={{ color: colors.subText }}>
                  PNG, JPG or WebP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3"
          style={{
            borderTop: `1px solid ${
              colors.background === "#0F172A"
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)"
            }`,
          }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{
              color: colors.subText,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={
              saving ||
              !name.trim() ||
              !email.trim() ||
              !contactPerson.trim() ||
              !contactNumber.trim()
            }
            className="px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--brand-blue)",
              color: "white",
            }}
          >
            {saving
              ? isEditMode
                ? "Saving..."
                : "Creating Client..."
              : isEditMode
                ? "Save Changes"
                : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
}