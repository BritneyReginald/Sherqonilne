import { useEffect, useState } from "react";
import { Building2, Users, Plus, Edit, Search } from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { useSiteFilter } from "../../contexts/site-filter-context";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { AddClientModal } from "../add-client-modal";
import { toast } from "sonner";
import { getSites, createSite } from "../../../api/siteAPI";
import { SiteDetails } from "./site-details";

interface Site {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  contactPerson?: string;
  contactNumber?: string;
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

  /*
   * Load all sites that RSS is responsible for inspecting.
   */
  useEffect(() => {
    loadSites();
  }, []);

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
            {/* RSS Logo */}
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
                src="https://placehold.co/200x200"
                alt="RSS Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* RSS Details */}
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: colors.primaryText }}
              >
                RSS
              </h1>

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

          {/* Edit RSS Details */}
          <button
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

            <span className="text-sm font-medium">Edit Company Details</span>
          </button>
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
                      src={site.logo || "https://placehold.co/200x200"}
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

                    <p className="text-sm" style={{ color: colors.subText }}>
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
