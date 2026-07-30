import { useState } from "react";
import {
  Building2,
  MapPin,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useSiteFilter } from "@/app/contexts/site-filter-context";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { AddSiteModal } from "@/app/components/add-site-modal";
import { toast } from "sonner";
import { useEffect } from "react";
import { getCompanies } from "@/api/companyAPI";
import { getSites, createSite } from "@/api/siteAPI";
import { FilterSitesModal } from "./filter-sites-modal";
import { SiteFilters } from "@/app/types/site-filter";


interface Company {
  id: string;
  name: string;
  logo?: string;
  registrationNumber?: string;
}

interface Site {
  id: string;
  companyId: string;
  name: string;
  workersActive: number;
  incidentsThisMonth: number;
  complianceStatus: "compliant" | "warning" | "danger";
  hasManager: boolean;
  location: string;
  mapImage: string;
}


export function CompanySites() {
  const { colors } = useTheme();
  const { selectedSite, setSelectedSite } = useSiteFilter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filters, setFilters] = useState<SiteFilters>({
  complianceStatus: "all",
  manager: "all",
});

  const companySites = sites.filter(
    site => site.companyId === selectedCompany?.id
);

  const filteredSites = companySites.filter((site) => {
    const matchesCompany = site.companyId === selectedCompany?.id;

    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompliance =
      filters.complianceStatus === "all" ||
      site.complianceStatus === filters.complianceStatus;

    const matchesManager =
      filters.manager === "all" ||
      (filters.manager === "yes" && site.hasManager) ||
      (filters.manager === "no" && !site.hasManager);

    return (
      matchesCompany && matchesSearch && matchesCompliance && matchesManager
    );
  });

  const [showAddModal, setShowAddModal] = useState(false);

  const handleSiteClick = (site: Site) => {
    setSelectedSite({ id: site.id, name: site.name });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companyData = await getCompanies();
      const siteData = await getSites();

      const formattedCompanies = companyData.map((company: any) => ({
        id: String(company.id),
        name: company.name,
        registrationNumber: company.registration_number,
        logo: company.logo,
      }));

      const formattedSites = siteData.map((site: any) => ({
        id: String(site.id),
        companyId: String(site.company_id),
        name: site.name,
        location: site.location,
        workersActive: site.workers_active,
        incidentsThisMonth: site.incidents_this_month,
        complianceStatus: site.compliance_status,
        hasManager: site.has_manager,
        mapImage: site.map_image,
      }));

      setCompanies(formattedCompanies);
      setSites(formattedSites);

      if (formattedCompanies.length > 0) {
        setSelectedCompany(formattedCompanies[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load companies and sites.");
    }
  };

  const handleAddSite = async (siteData: any) => {
    if (!selectedCompany) {
      toast.error("Please select a company first.");
      return;
    }
    try {
      await createSite({
        companyId: selectedCompany.id,
        name: siteData.name,
        location: siteData.location,
      });

      await loadData();

      toast.success("Site created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create site.");
    }
  };

  const getComplianceStyle = (status: Site["complianceStatus"]) => {
    switch (status) {
      case "compliant":
        return {
          backgroundColor:
            colors.background === "#0F172A"
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(16, 185, 129, 0.1)",
          color: "var(--compliance-success)",
          icon: "🟢",
          label: "Fully Compliant",
        };
      case "warning":
        return {
          backgroundColor:
            colors.background === "#0F172A"
              ? "rgba(251, 191, 36, 0.1)"
              : "rgba(251, 191, 36, 0.1)",
          color: "var(--compliance-warning)",
          icon: "🟠",
          label: "Review Required",
        };
      case "danger":
        return {
          backgroundColor:
            colors.background === "#0F172A"
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
          color: "var(--compliance-danger)",
          icon: "🔴",
          label: "Non-Compliant",
        };
    }
  };

  return (
    <div
      className="min-h-full p-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Section 1: Company Profile */}
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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Company Logo */}
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
                src={selectedCompany?.logo || "https://placehold.co/200x200"}
                alt={selectedCompany?.name ?? "Company Logo"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Company Details */}
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: colors.primaryText }}
              >
                {selectedCompany?.name}
              </h1>
              <p className="text-sm" style={{ color: colors.subText }}>
                Registration Number:{" "}
                {selectedCompany?.registrationNumber ?? "Not Available"}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Building2
                    className="size-4"
                    style={{ color: colors.subText }}
                  />
                  <span className="text-sm" style={{ color: colors.subText }}>
                    {companySites.length} Active Sites
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4" style={{ color: colors.subText }} />
                  <span className="text-sm" style={{ color: colors.subText }}>
                    {companySites.reduce(
                      (sum, site) => sum + site.workersActive,
                      0,
                    )}{" "}
                    Total Workers
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
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

      {selectedSite && (
        <div
          className="mt-4 px-4 py-2 rounded-lg inline-flex items-center gap-2"
          style={{
            backgroundColor: "rgba(59,130,246,0.1)",
            color: "var(--brand-blue)",
          }}
        >
          <MapPin className="size-4" />
          Active Site: {selectedSite.name}
        </div>
      )}

      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.primaryText }}
        >
          Select Client
        </label>

        <select
          value={selectedCompany?.id ?? ""}
          onChange={(e) => {
            const company = companies.find((c) => c.id === e.target.value);
            if (company) {
              setSelectedCompany(company);
            }
          }}
          className="px-4 py-2 rounded-lg border w-80"
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      {/*Search button */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
            style={{ color: colors.subText }}
          />

          <input
            type="text"
            placeholder="Search sites by name or location..."
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

      {/* Section 2: Sites Overview */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Active Sites
          </h2>
          <div className="flex items-center gap-2">
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
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="size-5" />
              <span>Add New Site</span>
            </button>
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
              onClick={() => setShowFilterModal(true)}
            >
              <Filter className="size-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Site Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.length === 0 ? (
            <div
              className="col-span-full text-center py-10"
              style={{ color: colors.subText }}
            >
              No sites found.
            </div>
          ) : (
            filteredSites.map((site) => {
              const complianceStyle = getComplianceStyle(site.complianceStatus);

              return (
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
                        ? "0 10px 20px -5px rgba(0, 0, 0, 0.5)"
                        : "0 10px 20px -5px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      colors.background === "#0F172A"
                        ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }}
                  onClick={() => handleSiteClick(site)}
                >
                  {/* Map Thumbnail */}
                  <div className="relative h-32 overflow-hidden">
                    <ImageWithFallback
                      src={site.mapImage || "https://placehold.co/600x300"}
                      alt={`${site.name} location`}
                      className="w-full h-full object-cover"
                      style={{
                        filter:
                          colors.background === "#0F172A"
                            ? "brightness(0.6) contrast(1.1)"
                            : "brightness(0.9)",
                      }}
                    />
                    {/* Location Overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-1.5"
                      style={{
                        backgroundColor:
                          colors.background === "#0F172A"
                            ? "rgba(15, 23, 42, 0.8)"
                            : "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <MapPin
                        className="size-3"
                        style={{ color: "var(--brand-blue)" }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: colors.primaryText }}
                      >
                        {site.location}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Site Name */}
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: colors.primaryText }}
                    >
                      {site.name}
                    </h3>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users
                            className="size-4"
                            style={{ color: colors.subText }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: colors.subText }}
                          >
                            Workers Active
                          </span>
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: colors.primaryText }}
                        >
                          {site.workersActive}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className="size-4"
                            style={{
                              color:
                                site.incidentsThisMonth > 0
                                  ? "var(--compliance-warning)"
                                  : colors.subText,
                            }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: colors.subText }}
                          >
                            Incidents This Month
                          </span>
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color:
                              site.incidentsThisMonth > 0
                                ? "var(--compliance-warning)"
                                : colors.primaryText,
                          }}
                        >
                          {site.incidentsThisMonth}
                        </span>
                      </div>
                    </div>

                    {/* Compliance Status Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: complianceStyle.backgroundColor,
                        color: complianceStyle.color,
                      }}
                    >
                      <span>{complianceStyle.icon}</span>
                      <span>{complianceStyle.label}</span>
                    </div>

                    {/* Manager Warning */}
                    {!site.hasManager && (
                      <div
                        className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
                        style={{
                          backgroundColor: "rgba(251, 191, 36, 0.1)",
                        }}
                      >
                        <AlertTriangle
                          className="size-4"
                          style={{ color: "var(--compliance-warning)" }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--compliance-warning)" }}
                        >
                          No Manager Assigned
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <AddSiteModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSite}
        />
      )}

      <FilterSitesModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setShowFilterModal(false);
        }}
      />
    </div>
  );
}
