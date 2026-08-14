import { useState, useEffect } from "react";
import { MapPin, Users, AlertTriangle, Search } from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useSiteFilter } from "@/app/contexts/site-filter-context";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { toast } from "sonner";
import { getMySites } from "@/api/siteAPI";

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

export function MySites() {
  const { colors } = useTheme();
  const { selectedSite, setSelectedSite } = useSiteFilter();
  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const siteData = await getMySites();
      setSites(
        siteData.map((site: any) => ({
          id: String(site.id),
          companyId: String(site.company_id),
          name: site.name,
          location: site.location,
          workersActive: site.workers_active,
          incidentsThisMonth: site.incidents_this_month,
          complianceStatus: site.compliance_status,
          hasManager: site.has_manager,
          mapImage: site.map_image,
        })),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your sites.");
    }
  };

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSiteClick = (site: Site) => {
    setSelectedSite({ id: site.id, name: site.name });
  };

  const getComplianceStyle = (status: Site["complianceStatus"]) => {
    switch (status) {
      case "compliant":
        return {
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          color: "var(--compliance-success)",
          icon: "🟢",
          label: "Fully Compliant",
        };
      case "warning":
        return {
          backgroundColor: "rgba(251, 191, 36, 0.1)",
          color: "var(--compliance-warning)",
          icon: "🟠",
          label: "Review Required",
        };
      case "danger":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
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
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: colors.primaryText }}
      >
        My Sites
      </h1>
      <p className="text-sm mb-6" style={{ color: colors.subText }}>
        {sites.length} site{sites.length !== 1 ? "s" : ""} registered under your
        company
      </p>

      {selectedSite && (
        <div
          className="mb-6 px-4 py-2 rounded-lg inline-flex items-center gap-2"
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
                    colors.background === "#0F172A"
                      ? "0 4px 6px -1px rgba(0,0,0,0.3)"
                      : "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
                onClick={() => handleSiteClick(site)}
              >
                <div className="relative h-32 overflow-hidden">
                  <ImageWithFallback
                    src={site.mapImage || "https://placehold.co/600x300"}
                    alt={`${site.name} location`}
                    className="w-full h-full object-cover"
                  />
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

                <div className="p-4">
                  <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: colors.primaryText }}
                  >
                    {site.name}
                  </h3>

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

                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: complianceStyle?.backgroundColor,
                      color: complianceStyle?.color,
                    }}
                  >
                    <span>{complianceStyle?.icon}</span>
                    <span>{complianceStyle?.label}</span>
                  </div>

                  {!site.hasManager && (
                    <div
                      className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
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
  );
}
