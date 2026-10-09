import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Users,
  Plus,
  Edit,
  Search,
  Camera,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { useSiteFilter } from "../../contexts/site-filter-context";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { AddClientModal } from "../add-client-modal";
import { toast } from "sonner";
import { getSites, createSite } from "../../../api/siteAPI";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "../../../api/companyAPI";
import { SiteDetails } from "./site-details";

interface Site {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  contactPerson?: string;
  contactNumber?: string;
}

interface CompanyProfile {
  name: string;
  logo: string;
}

const PLACEHOLDER_LOGO = "https://placehold.co/200x200";

const DEFAULT_COMPANY: CompanyProfile = {
  name: "RSS",
  logo: PLACEHOLDER_LOGO,
};

/*
 * Reads an image file and shrinks it so it can be stored safely.
 */
function readAndResizeImage(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function CompanySites() {
  const { colors } = useTheme();
  const { selectedSite, setSelectedSite } = useSiteFilter();

  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedSiteDetails, setSelectedSiteDetails] = useState<Site | null>(
    null,
  );

  // Company profile (name + logo), stored on the backend
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [draftName, setDraftName] = useState(DEFAULT_COMPANY.name);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /*
   * Load the company profile and all sites that RSS is responsible
   * for inspecting.
   */
  useEffect(() => {
    loadCompany();
    loadSites();
  }, []);

  const loadCompany = async () => {
    try {
      const profile = await getCompanyProfile();
      const loaded: CompanyProfile = {
        name: profile.name || DEFAULT_COMPANY.name,
        logo: profile.logo || PLACEHOLDER_LOGO,
      };
      setCompany(loaded);
      setDraftName(loaded.name);
    } catch (err) {
      console.error("Failed to load company profile:", err);
      toast.error("Failed to load company details.");
    }
  };

  const loadSites = async () => {
    try {
      const siteData = await getSites();

      const formattedSites = siteData.map((site: any) => ({
        id: String(site.id),
        name: site.name,
        logo: site.logo,
        email: site.email,
        contactPerson: site.contact_person,
        contactNumber: site.contact_number,
      }));

      setSites(formattedSites);
    } catch (err) {
      console.error("Failed to load sites:", err);
      toast.error("Failed to load sites.");
    }
  };

  /*
   * Company profile editing
   */
  const startEditingCompany = () => {
    setDraftName(company.name);
    setIsEditingCompany(true);
  };

  const cancelEditingCompany = () => {
    if (isSavingCompany) return;
    setDraftName(company.name);
    setIsEditingCompany(false);
  };

  const saveCompanyName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      toast.error("Company name can't be empty.");
      return;
    }

    setIsSavingCompany(true);
    try {
      const saved = await updateCompanyProfile({ name: trimmed });
      setCompany((prev) => ({ ...prev, name: saved.name }));
      setIsEditingCompany(false);
      toast.success("Company details updated");
    } catch (err: any) {
      console.error("Failed to save company name:", err);
      toast.error(err.message || "Couldn't save the company name.");
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setIsSavingCompany(true);
    try {
      const logo = await readAndResizeImage(file);
      const saved = await updateCompanyProfile({ logo });
      setCompany((prev) => ({
        ...prev,
        logo: saved.logo || PLACEHOLDER_LOGO,
      }));
      toast.success("Logo updated");
    } catch (err: any) {
      console.error("Failed to save logo:", err);
      toast.error(
        err.message || "Couldn't use that image. Try a different file.",
      );
    } finally {
      setIsSavingCompany(false);
    }
  };

  /*
   * Add a new site/client.
   *
   * This does NOT create a company.
   * It creates a site that RSS is responsible for inspecting.
   */
  const handleAddSite = async (siteData: {
    name: string;
    email: string;
    logo: string;
    contactPerson: string;
    contactNumber: string;
  }) => {
    try {
      await createSite(siteData);

      await loadSites();

      toast.success("Site added successfully");
    } catch (err) {
      console.error("Failed to create site:", err);
      toast.error("Failed to add site.");
      throw err;
    }
  };

  /*
   * Search sites by name, email or contact person.
   */
  const filteredSites = sites.filter((site) => {
    const search = searchTerm.toLowerCase();

    return (
      site.name.toLowerCase().includes(search) ||
      site.email?.toLowerCase().includes(search) ||
      site.contactPerson?.toLowerCase().includes(search)
    );
  });

  const handleSiteClick = (site: Site) => {
    setSelectedSite({
      id: site.id,
      name: site.name,
    });

    setSelectedSiteDetails(site);
  };

  const handleBackToSites = () => {
    setSelectedSiteDetails(null);
  };

  return (
    <div
      className="min-h-full p-6"
      style={{ backgroundColor: colors.background }}
    >
      {selectedSiteDetails ? (
        <SiteDetails
          site={selectedSiteDetails}
          onBack={handleBackToSites}
          onDeleted={async () => {
            setSelectedSiteDetails(null);
            setSelectedSite(null);
            await loadSites();
          }}
        />
      ) : (
        <>
          {/* =========================================================
              RSS COMPANY PROFILE
              ========================================================= */}
          <div
            className="rounded-lg p-6 mb-8"
            style={{
              backgroundColor: colors.surface,
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Company Logo + camera */}
                <div className="relative size-24 shrink-0">
                  <div
                    className="size-24 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor:
                        colors.background === "#0F172A"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "var(--grey-100)",
                    }}
                  >
                    <ImageWithFallback
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isSavingCompany}
                    className="absolute -bottom-2 -right-2 size-8 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 disabled:opacity-60"
                    style={{
                      backgroundColor: "var(--brand-blue)",
                      color: "white",
                      border: `2px solid ${colors.surface}`,
                    }}
                    aria-label="Change company logo"
                    title="Change logo"
                  >
                    {isSavingCompany && !isEditingCompany ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </button>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelected}
                  />
                </div>

                {/* Company Details */}
                <div>
                  {isEditingCompany ? (
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCompanyName();
                          if (e.key === "Escape") cancelEditingCompany();
                        }}
                        autoFocus
                        disabled={isSavingCompany}
                        className="text-2xl font-bold px-3 py-1 rounded-lg border outline-none"
                        style={{
                          backgroundColor: colors.background,
                          color: colors.primaryText,
                          borderColor: "var(--brand-blue)",
                        }}
                        aria-label="Company name"
                      />
                      <button
                        onClick={saveCompanyName}
                        disabled={isSavingCompany}
                        className="p-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: "var(--compliance-success)" }}
                        aria-label="Save company name"
                        title="Save"
                      >
                        {isSavingCompany ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                      </button>
                      <button
                        onClick={cancelEditingCompany}
                        disabled={isSavingCompany}
                        className="p-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{
                          backgroundColor: colors.background,
                          color: colors.subText,
                        }}
                        aria-label="Cancel editing"
                        title="Cancel"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <h1
                      className="text-2xl font-bold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {company.name}
                    </h1>
                  )}

                  <p className="text-sm" style={{ color: colors.subText }}>
                    SHERQ Consulting & Compliance
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <Building2
                      className="size-4"
                      style={{ color: colors.subText }}
                    />

                    <span className="text-sm" style={{ color: colors.subText }}>
                      {sites.length} Registered Sites
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Company Details */}
              {!isEditingCompany && (
                <button
                  onClick={startEditingCompany}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: "var(--brand-blue)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--brand-blue)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Edit className="size-4" />

                  <span className="text-sm font-medium">
                    Edit Company Details
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================
              ACTIVE SITE
              ========================================================= */}
          {selectedSite && (
            <div
              className="mb-6 px-4 py-2 rounded-lg inline-flex items-center gap-2"
              style={{
                backgroundColor: "rgba(59,130,246,0.1)",
                color: "var(--brand-blue)",
              }}
            >
              <Building2 className="size-4" />
              Active Site: {selectedSite.name}
            </div>
          )}

          {/* =========================================================
              SITES HEADER
              ========================================================= */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Sites We Inspect
              </h2>

              <p className="text-sm mt-1" style={{ color: colors.subText }}>
                Manage the client sites responsible for SHERQ inspections.
              </p>
            </div>

            <button
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all text-base font-medium"
              style={{
                backgroundColor: "var(--brand-blue)",
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(59, 130, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brand-blue)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => setShowAddClientModal(true)}
            >
              <Plus className="size-5" />

              <span>Add New Site</span>
            </button>
          </div>

          {/* =========================================================
              SEARCH
              ========================================================= */}
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                style={{ color: colors.subText }}
              />

              <input
                type="text"
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.primaryText,
                }}
              />
            </div>
          </div>

          {/* =========================================================
              SITE CARDS
              ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.length === 0 ? (
              <div
                className="col-span-full text-center py-10"
                style={{ color: colors.subText }}
              >
                {searchTerm
                  ? "No sites match your search."
                  : "No sites have been registered yet."}
              </div>
            ) : (
              filteredSites.map((site) => (
                <div
                  key={site.id}
                  className="rounded-lg overflow-hidden transition-all cursor-pointer"
                  style={{
                    backgroundColor: colors.surface,
                    border:
                      selectedSite?.id === site.id
                        ? "2px solid var(--brand-blue)"
                        : "2px solid transparent",
                    boxShadow:
                      selectedSite?.id === site.id
                        ? "0 0 0 3px rgba(59,130,246,0.15)"
                        : colors.background === "#0F172A"
                          ? "0 4px 6px -1px rgba(0,0,0,0.3)"
                          : "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      colors.background === "#0F172A"
                        ? "0 10px 20px -5px rgba(0,0,0,0.5)"
                        : "0 10px 20px -5px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      colors.background === "#0F172A"
                        ? "0 4px 6px -1px rgba(0,0,0,0.3)"
                        : "0 4px 6px -1px rgba(0,0,0,0.1)";
                  }}
                  onClick={() => handleSiteClick(site)}
                >
                  <div className="p-5">
                    {/* Logo + Site Name */}
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className="size-16 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: colors.background,
                        }}
                      >
                        <ImageWithFallback
                          src={site.logo || PLACEHOLDER_LOGO}
                          alt={`${site.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: colors.primaryText }}
                        >
                          {site.name}
                        </h3>

                        <p
                          className="text-sm"
                          style={{ color: colors.subText }}
                        >
                          Inspection Site
                        </p>
                      </div>
                    </div>

                    {/* Site Contact Details */}
                    <div className="space-y-3">
                      {site.email && (
                        <div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: colors.subText }}
                          >
                            EMAIL
                          </span>

                          <p
                            className="text-sm mt-1"
                            style={{ color: colors.primaryText }}
                          >
                            {site.email}
                          </p>
                        </div>
                      )}

                      {site.contactPerson && (
                        <div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: colors.subText }}
                          >
                            CONTACT PERSON
                          </span>

                          <div className="flex items-center gap-2 mt-1">
                            <Users
                              className="size-4"
                              style={{ color: colors.subText }}
                            />

                            <p
                              className="text-sm"
                              style={{ color: colors.primaryText }}
                            >
                              {site.contactPerson}
                            </p>
                          </div>
                        </div>
                      )}

                      {site.contactNumber && (
                        <div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: colors.subText }}
                          >
                            CONTACT NUMBER
                          </span>

                          <p
                            className="text-sm mt-1"
                            style={{ color: colors.primaryText }}
                          >
                            {site.contactNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* =========================================================
              ADD NEW SITE MODAL
              ========================================================= */}
          {showAddClientModal && (
            <AddClientModal
              isOpen={showAddClientModal}
              onClose={() => setShowAddClientModal(false)}
              onSave={handleAddSite}
            />
          )}
        </>
      )}
    </div>
  );
}
