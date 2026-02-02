import { useState } from "react";
import { FileText, Download, FileSpreadsheet, Calendar, Filter, Building2, Archive, CheckCircle, Clock, Users, ShieldCheck, ClipboardCheck } from "lucide-react";

interface ExportLog {
  id: string;
  reportName: string;
  generatedBy: string;
  date: string;
  status: "completed" | "generating" | "failed";
  progress?: number;
  fileSize?: string;
}

const exportLogs: ExportLog[] = [
  {
    id: "EXP-005",
    reportName: "Q1 2026 Training Compliance Report",
    generatedBy: "Admin User",
    date: "2026-01-21 09:42",
    status: "generating",
    progress: 75,
  },
  {
    id: "EXP-004",
    reportName: "JHB South - Full Site Audit Pack",
    generatedBy: "Sarah Johnson",
    date: "2026-01-20 14:23",
    status: "completed",
    fileSize: "12.4 MB",
  },
  {
    id: "EXP-003",
    reportName: "Medical Surveillance Annual Report",
    generatedBy: "Admin User",
    date: "2026-01-19 11:15",
    status: "completed",
    fileSize: "8.7 MB",
  },
  {
    id: "EXP-002",
    reportName: "PPE Register - December 2025",
    generatedBy: "John Smith",
    date: "2026-01-18 16:50",
    status: "completed",
    fileSize: "3.2 MB",
  },
  {
    id: "EXP-001",
    reportName: "Employee Compliance File - Thandi Mokoena",
    generatedBy: "Sarah Johnson",
    date: "2026-01-17 10:30",
    status: "completed",
    fileSize: "2.1 MB",
  },
];

export function ReportsAnalytics() {
  const [selectedModule, setSelectedModule] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);

  const sites = ["JHB South", "Pretoria East", "Cape Town", "Durban Central"];

  const toggleSite = (site: string) => {
    setSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]
    );
  };

  const handleGenerateCustomReport = () => {
    // Handle custom report generation
    console.log("Generating custom report...", {
      module: selectedModule,
      startDate,
      endDate,
      sites: selectedSites,
      includeArchived,
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div
        className="px-8 py-6 border-b"
        style={{
          backgroundColor: "white",
          borderColor: "var(--grey-200)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: "var(--grey-900)" }}>
              Reports & Compliance Exports
            </h1>
            <p className="text-sm" style={{ color: "var(--grey-600)" }}>
              Generate auditor-ready documentation in seconds
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Section 1: Quick-Export Compliance Packs */}
        <div className="mb-8">
          <h2 className="text-xl mb-4" style={{ color: "var(--grey-900)" }}>
            One-Click Audit Packs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Full Site Audit Pack */}
            <div
              className="p-6 rounded-lg border hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "white",
                borderColor: "var(--grey-200)",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--brand-blue)15",
                  }}
                >
                  <Building2 className="size-6" style={{ color: "var(--brand-blue)" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1" style={{ color: "var(--grey-900)" }}>
                    Full Site Audit Pack
                  </h3>
                  <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                    All valid RAs, Training, and Medicals for a specific site
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Risk Assessments & Controls
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Training Matrix & Certificates
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Medical Surveillance Records
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  PPE Issuance History
                </div>
              </div>

              <select
                className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
                style={{
                  borderColor: "var(--grey-300)",
                  color: "var(--grey-900)",
                  backgroundColor: "var(--grey-50)",
                }}
              >
                <option value="">Select Site...</option>
                {sites.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <FileText className="size-4" />
                  Generate PDF
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2"
                  style={{
                    borderColor: "var(--grey-300)",
                    color: "var(--grey-700)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--grey-100)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FileSpreadsheet className="size-4" />
                  Excel
                </button>
              </div>
            </div>

            {/* Employee Compliance File */}
            <div
              className="p-6 rounded-lg border hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "white",
                borderColor: "var(--grey-200)",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--compliance-success)15",
                  }}
                >
                  <Users className="size-6" style={{ color: "var(--compliance-success)" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1" style={{ color: "var(--grey-900)" }}>
                    Employee Compliance File
                  </h3>
                  <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                    Single PDF containing all records for one person
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Personal Details & History
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Training Certificates
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Medical Fitness Certificates
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  PPE Issue Records
                </div>
              </div>

              <input
                type="text"
                placeholder="Search employee name or ID..."
                className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
                style={{
                  borderColor: "var(--grey-300)",
                  color: "var(--grey-900)",
                  backgroundColor: "var(--grey-50)",
                }}
              />

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <FileText className="size-4" />
                  Generate PDF
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2"
                  style={{
                    borderColor: "var(--grey-300)",
                    color: "var(--grey-700)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--grey-100)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FileSpreadsheet className="size-4" />
                  Excel
                </button>
              </div>
            </div>

            {/* PPE & Equipment Register */}
            <div
              className="p-6 rounded-lg border hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "white",
                borderColor: "var(--grey-200)",
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--compliance-warning)15",
                  }}
                >
                  <ShieldCheck className="size-6" style={{ color: "var(--compliance-warning)" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1" style={{ color: "var(--grey-900)" }}>
                    PPE & Equipment Register
                  </h3>
                  <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                    Full inventory and issuance history
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Current Inventory Levels
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Issuance History by Employee
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Expiry & Replacement Tracking
                </div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                  <CheckCircle className="size-3" style={{ color: "var(--compliance-success)" }} />
                  Digital Signature Records
                </div>
              </div>

              <select
                className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
                style={{
                  borderColor: "var(--grey-300)",
                  color: "var(--grey-900)",
                  backgroundColor: "var(--grey-50)",
                }}
              >
                <option value="all">All Sites</option>
                {sites.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <FileText className="size-4" />
                  Generate PDF
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2"
                  style={{
                    borderColor: "var(--grey-300)",
                    color: "var(--grey-700)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--grey-100)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FileSpreadsheet className="size-4" />
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Custom Report Builder */}
        <div className="mb-8">
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{
                backgroundColor: "var(--grey-50)",
                borderColor: "var(--grey-200)",
              }}
            >
              <h2 className="text-xl flex items-center gap-2" style={{ color: "var(--grey-900)" }}>
                <ClipboardCheck className="size-5" style={{ color: "var(--brand-blue)" }} />
                Custom Report Builder
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Module Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--grey-700)" }}>
                    <Filter className="size-4 inline mr-1" />
                    Module Selection
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{
                      borderColor: "var(--grey-300)",
                      color: "var(--grey-900)",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="all">All Modules</option>
                    <option value="training">Training & Competency</option>
                    <option value="medicals">Medical Surveillance</option>
                    <option value="appointments">Appointments & Licenses</option>
                    <option value="ppe">PPE & Equipment</option>
                    <option value="risk-assessments">Risk Assessments</option>
                    <option value="incidents">Incidents & Near Misses</option>
                  </select>
                </div>

                {/* Site/Company Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--grey-700)" }}>
                    <Building2 className="size-4 inline mr-1" />
                    Site/Company Filter
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowSiteDropdown(!showSiteDropdown)}
                      className="w-full px-4 py-2.5 rounded-lg border text-left flex items-center justify-between"
                      style={{
                        borderColor: "var(--grey-300)",
                        color: selectedSites.length > 0 ? "var(--grey-900)" : "var(--grey-500)",
                        backgroundColor: "white",
                      }}
                    >
                      {selectedSites.length > 0
                        ? `${selectedSites.length} site${selectedSites.length !== 1 ? "s" : ""} selected`
                        : "Select sites..."}
                      <Filter className="size-4" style={{ color: "var(--grey-400)" }} />
                    </button>

                    {showSiteDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg z-10 overflow-hidden"
                        style={{
                          backgroundColor: "white",
                          borderColor: "var(--grey-200)",
                        }}
                      >
                        <div className="p-2">
                          {sites.map((site) => (
                            <label
                              key={site}
                              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-secondary cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSites.includes(site)}
                                onChange={() => toggleSite(site)}
                                className="size-4"
                                style={{ accentColor: "var(--brand-blue)" }}
                              />
                              <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                                {site}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div
                          className="px-3 py-2 border-t flex justify-between"
                          style={{ borderColor: "var(--grey-200)", backgroundColor: "var(--grey-50)" }}
                        >
                          <button
                            onClick={() => setSelectedSites([])}
                            className="text-xs"
                            style={{ color: "var(--brand-blue)" }}
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => setSelectedSites([...sites])}
                            className="text-xs"
                            style={{ color: "var(--brand-blue)" }}
                          >
                            Select All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range - Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--grey-700)" }}>
                    <Calendar className="size-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{
                      borderColor: "var(--grey-300)",
                      color: "var(--grey-900)",
                      backgroundColor: "white",
                    }}
                  />
                </div>

                {/* Date Range - End Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--grey-700)" }}>
                    <Calendar className="size-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{
                      borderColor: "var(--grey-300)",
                      color: "var(--grey-900)",
                      backgroundColor: "white",
                    }}
                  />
                </div>
              </div>

              {/* Include Archived Records Toggle */}
              <div className="mt-6 flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--grey-50)" }}>
                <div className="flex items-center gap-3">
                  <Archive className="size-5" style={{ color: "var(--grey-600)" }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--grey-900)" }}>
                      Include Archived Records
                    </p>
                    <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                      Include records that have been archived or marked as inactive
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIncludeArchived(!includeArchived)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{
                    backgroundColor: includeArchived ? "var(--brand-blue)" : "var(--grey-300)",
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{
                      transform: includeArchived ? "translateX(24px)" : "translateX(4px)",
                    }}
                  />
                </button>
              </div>

              {/* Generate Button */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 rounded-lg font-medium border transition-colors"
                  style={{
                    borderColor: "var(--grey-300)",
                    color: "var(--grey-700)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--grey-100)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleGenerateCustomReport}
                  className="px-6 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <Download className="size-4" />
                  Generate Custom Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Recent Exports Log */}
        <div>
          <h2 className="text-xl mb-4" style={{ color: "var(--grey-900)" }}>
            Recent Exports
          </h2>
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "var(--grey-50)", borderColor: "var(--grey-200)" }}>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Report Name
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Generated By
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Date
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {exportLogs.map((log) => (
                  <tr key={log.id} className="border-b" style={{ borderColor: "var(--grey-200)" }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5" style={{ color: "var(--brand-blue)" }} />
                        <span className="font-medium text-sm" style={{ color: "var(--grey-900)" }}>
                          {log.reportName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                        {log.generatedBy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                        {log.date}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "generating" ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" style={{ color: "var(--compliance-warning)" }} />
                            <span className="text-sm font-medium" style={{ color: "var(--compliance-warning)" }}>
                              Generating ({log.progress}%)
                            </span>
                          </div>
                          <div className="w-48 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--grey-200)" }}>
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${log.progress}%`,
                                backgroundColor: "var(--compliance-warning)",
                              }}
                            />
                          </div>
                        </div>
                      ) : log.status === "completed" ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-4" style={{ color: "var(--compliance-success)" }} />
                          <span className="text-sm" style={{ color: "var(--compliance-success)" }}>
                            Completed
                          </span>
                          <span className="text-xs" style={{ color: "var(--grey-500)" }}>
                            ({log.fileSize})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: "var(--compliance-danger)" }}>
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.status === "completed" ? (
                        <button
                          className="px-4 py-2 rounded-lg font-medium border transition-colors inline-flex items-center gap-2"
                          style={{
                            borderColor: "var(--brand-blue)",
                            color: "var(--brand-blue)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--brand-blue)10";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Download className="size-4" />
                          Download
                        </button>
                      ) : log.status === "generating" ? (
                        <span className="text-xs" style={{ color: "var(--grey-500)" }}>
                          Please wait...
                        </span>
                      ) : (
                        <button
                          className="text-sm"
                          style={{ color: "var(--brand-blue)" }}
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
