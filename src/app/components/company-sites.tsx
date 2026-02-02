import { useState } from "react";
import { Building2, MapPin, Users, AlertTriangle, Plus, Edit, Filter, X } from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useSiteFilter } from "@/app/contexts/site-filter-context";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { AddSiteModal } from "@/app/components/add-site-modal";
import { toast } from "sonner";

interface Site {
  id: string;
  name: string;
  workersActive: number;
  incidentsThisMonth: number;
  complianceStatus: "compliant" | "warning" | "danger";
  hasManager: boolean;
  location: string;
  mapImage: string;
}

const mockSites: Site[] = [
  {
    id: "1",
    name: "Sasol Secunda",
    workersActive: 24,
    incidentsThisMonth: 2,
    complianceStatus: "compliant",
    hasManager: true,
    location: "Secunda, Mpumalanga",
    mapImage: "https://images.unsplash.com/photo-1723598492850-5c537060be86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmFjaWxpdHklMjBtYXB8ZW58MXx8fHwxNzY5NDExMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "2",
    name: "Harmony Gold Mine",
    workersActive: 156,
    incidentsThisMonth: 0,
    complianceStatus: "compliant",
    hasManager: false,
    location: "Welkom, Free State",
    mapImage: "https://images.unsplash.com/photo-1595871332770-248454368ae6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwc2F0ZWxsaXRlJTIwdmlld3xlbnwxfHx8fDE3Njk0MTEzNjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "3",
    name: "Transnet Port Terminal",
    workersActive: 89,
    incidentsThisMonth: 1,
    complianceStatus: "warning",
    hasManager: true,
    location: "Durban, KwaZulu-Natal",
    mapImage: "https://images.unsplash.com/photo-1669837783743-4450b160c701?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc2OTM1MDczNnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "4",
    name: "ArcelorMittal Steel",
    workersActive: 203,
    incidentsThisMonth: 5,
    complianceStatus: "danger",
    hasManager: true,
    location: "Vanderbijlpark, Gauteng",
    mapImage: "https://images.unsplash.com/photo-1723598492850-5c537060be86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmFjaWxpdHklMjBtYXB8ZW58MXx8fHwxNzY5NDExMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "5",
    name: "Eskom Koeberg Station",
    workersActive: 312,
    incidentsThisMonth: 0,
    complianceStatus: "compliant",
    hasManager: true,
    location: "Cape Town, Western Cape",
    mapImage: "https://images.unsplash.com/photo-1595871332770-248454368ae6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwc2F0ZWxsaXRlJTIwdmlld3xlbnwxfHx8fDE3Njk0MTEzNjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "6",
    name: "BMW Rosslyn Plant",
    workersActive: 67,
    incidentsThisMonth: 0,
    complianceStatus: "compliant",
    hasManager: true,
    location: "Pretoria, Gauteng",
    mapImage: "https://images.unsplash.com/photo-1669837783743-4450b160c701?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc2OTM1MDczNnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function CompanySites() {
  const { colors } = useTheme();
  const { selectedSite, setSelectedSite } = useSiteFilter();
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSiteClick = (site: Site) => {
    setSelectedSite({ id: site.id, name: site.name });
  };

  const handleAddSite = (siteData: any) => {
    const newSite: Site = {
      id: (sites.length + 1).toString(),
      name: siteData.name,
      location: siteData.location,
      workersActive: 0,
      incidentsThisMonth: 0,
      complianceStatus: "compliant",
      hasManager: false,
      mapImage: "https://images.unsplash.com/photo-1723598492850-5c537060be86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmFjaWxpdHklMjBtYXB8ZW58MXx8fHwxNzY5NDExMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    };
    setSites([...sites, newSite]);
    
    // Show success toast
    toast.success(
      `Site '${siteData.name}' successfully initialized. Site Manager notified via SMS/Email.`,
      {
        duration: 5000,
      }
    );
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
                src="https://images.unsplash.com/photo-1713176988815-47bb84f325b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBsb2dvJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzY5NDExMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="RSS Compliance Hub Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Company Details */}
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: colors.primaryText }}
              >
                RSS Compliance Hub
              </h1>
              <p className="text-sm" style={{ color: colors.subText }}>
                Registration Number: 2024/000/00
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Building2
                    className="size-4"
                    style={{ color: colors.subText }}
                  />
                  <span className="text-sm" style={{ color: colors.subText }}>
                    {sites.length} Active Sites
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4" style={{ color: colors.subText }} />
                  <span className="text-sm" style={{ color: colors.subText }}>
                    {sites.reduce((sum, site) => sum + site.workersActive, 0)}{" "}
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
            >
              <Filter className="size-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Site Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => {
            const complianceStyle = getComplianceStyle(site.complianceStatus);

            return (
              <div
                key={site.id}
                className="rounded-lg overflow-hidden transition-all cursor-pointer"
                style={{
                  backgroundColor: colors.surface,
                  boxShadow:
                    colors.background === "#0F172A"
                      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
                    src={site.mapImage}
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
          })}
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
    </div>
  );
}