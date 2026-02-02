import { useState } from "react";
import { Plus, Filter, ShieldCheck, Lock, EyeOff, FileText, X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";

interface MedicalRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  examType: "pre-placement" | "periodic" | "exit" | "return-to-work";
  practitioner: string;
  practitionerType: "OMP" | "OHNP";
  examDate: string;
  expiryDate: string;
  isExpired: boolean;
  fitnessStatus: "fit" | "fit-with-restrictions" | "unfit";
  restrictions?: string;
  restrictionType?: string[];
  site: string;
  company: string;
}

const medicalRecords: MedicalRecord[] = [
  {
    id: "MED-001",
    employeeName: "Sarah Johnson",
    employeeId: "EMP-1024",
    department: "Maintenance",
    examType: "periodic",
    practitioner: "Dr. P. Naidoo",
    practitionerType: "OMP",
    examDate: "2025-11-15",
    expiryDate: "2026-11-15",
    isExpired: false,
    fitnessStatus: "fit",
    site: "JHB South",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-003",
    employeeName: "Thandi Mokoena",
    employeeId: "EMP-1089",
    department: "Production",
    examType: "return-to-work",
    practitioner: "Dr. J. Pillay",
    practitionerType: "OMP",
    examDate: "2026-01-10",
    expiryDate: "2027-01-10",
    isExpired: false,
    fitnessStatus: "fit-with-restrictions",
    restrictions: "No heavy lifting (max 10kg) for 3 months",
    restrictionType: ["heavy-lifting"],
    site: "Pretoria East",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-006",
    employeeName: "Johan Pretorius",
    employeeId: "EMP-1178",
    department: "Logistics",
    examType: "periodic",
    practitioner: "Dr. K. Reddy",
    practitionerType: "OMP",
    examDate: "2025-10-12",
    expiryDate: "2026-10-12",
    isExpired: false,
    fitnessStatus: "fit-with-restrictions",
    restrictions: "Hearing protection mandatory - mild hearing loss detected",
    restrictionType: ["hearing"],
    site: "JHB South",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-008",
    employeeName: "Robert Williams",
    employeeId: "EMP-1134",
    department: "Maintenance",
    examType: "return-to-work",
    practitioner: "Dr. P. Naidoo",
    practitionerType: "OMP",
    examDate: "2025-11-20",
    expiryDate: "2026-05-20",
    isExpired: false,
    fitnessStatus: "unfit",
    restrictions: "Temporarily unfit - follow-up required in 30 days",
    site: "JHB South",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-012",
    employeeName: "Anna Coetzee",
    employeeId: "EMP-1112",
    department: "Quality Control",
    examType: "periodic",
    practitioner: "Sr. M. van der Merwe",
    practitionerType: "OHNP",
    examDate: "2024-08-14",
    expiryDate: "2025-08-14",
    isExpired: true,
    fitnessStatus: "fit-with-restrictions",
    restrictions: "Ergonomic workstation required - back condition",
    restrictionType: ["ergonomic"],
    site: "JHB South",
    company: "ABC Manufacturing",
  },
];

type FitnessFilter = "all" | "fit" | "fit-with-restrictions" | "unfit";
type ViewMode = "certificate" | "clinical" | null;

export function MedicalSurveillanceEnhanced() {
  const { dismissAlert } = useAlerts();
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedFitness, setSelectedFitness] = useState<FitnessFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRetentionInfo, setShowRetentionInfo] = useState(false);

  const sites = ["All Sites", ...Array.from(new Set(medicalRecords.map((r) => r.site))).sort()];

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSite = selectedSite === "All Sites" || record.site === selectedSite;
    const matchesFitness = selectedFitness === "all" || record.fitnessStatus === selectedFitness;
    return matchesSite && matchesFitness;
  });

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case "pre-placement":
        return { label: "Pre-Placement", color: "var(--brand-blue)", bgColor: "var(--brand-blue)15" };
      case "periodic":
        return { label: "Periodic (Annual)", color: "var(--grey-700)", bgColor: "var(--grey-100)" };
      case "exit":
        return { label: "Exit", color: "var(--grey-600)", bgColor: "var(--grey-100)" };
      case "return-to-work":
        return { label: "Return to Work", color: "var(--compliance-warning)", bgColor: "var(--compliance-warning)15" };
      default:
        return { label: type, color: "var(--grey-700)", bgColor: "var(--grey-100)" };
    }
  };

  const getFitnessStatusBadge = (status: string) => {
    switch (status) {
      case "fit":
        return {
          label: "✅ Fit for Duty",
          color: "var(--compliance-success)",
          bgColor: "var(--compliance-success)15",
        };
      case "fit-with-restrictions":
        return {
          label: "⚠️ Fit with Restrictions",
          color: "var(--compliance-warning)",
          bgColor: "var(--compliance-warning)15",
        };
      case "unfit":
        return {
          label: "❌ Unfit for Duty",
          color: "var(--compliance-danger)",
          bgColor: "var(--compliance-danger)15",
        };
      default:
        return {
          label: status,
          color: "var(--grey-700)",
          bgColor: "var(--grey-100)",
        };
    }
  };

  const handleViewCertificate = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewMode("certificate");
  };

  const handleViewClinical = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewMode("clinical");
  };

  const closeModal = () => {
    setViewMode(null);
    setSelectedRecord(null);
  };

  const totalRecords = filteredRecords.length;
  const fitCount = filteredRecords.filter((r) => r.fitnessStatus === "fit").length;
  const restrictedCount = filteredRecords.filter((r) => r.fitnessStatus === "fit-with-restrictions").length;
  const unfitCount = filteredRecords.filter((r) => r.fitnessStatus === "unfit").length;
  const expiredCount = filteredRecords.filter((r) => r.isExpired).length;

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `${restrictedCount} employee${restrictedCount !== 1 ? "s" : ""} with active restrictions`, "critical");
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "#0F172A" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Notification Bar - Full Width White */}
        {restrictedCount > 0 && (
          <AlertBanner
            id="medical-restrictions-alert"
            type="critical"
            icon={<AlertTriangle className="size-5" />}
            title={`${restrictedCount} employee${restrictedCount !== 1 ? "s" : ""} with active restrictions`}
            description="Check compatibility before assigning to high-risk tasks"
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: "white" }}>
                Medical Surveillance & Fitness for Duty
              </h1>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                <span className="text-sm font-medium" style={{ color: "white" }}>
                  POPI Act Compliant: Restricted Access
                </span>
              </div>
            </div>

            <button
              className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Plus className="size-4" />
              Record New Medical Exam
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4" style={{ color: "white" }} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-4 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: "white",
                  borderColor: "var(--grey-300)",
                  color: "var(--grey-900)",
                }}
              >
                {sites.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedFitness}
              onChange={(e) => setSelectedFitness(e.target.value as FitnessFilter)}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: "white",
                borderColor: "var(--grey-300)",
                color: "var(--grey-900)",
              }}
            >
              <option value="all">All Fitness Statuses</option>
              <option value="fit">Fit for Duty</option>
              <option value="fit-with-restrictions">Fit with Restrictions</option>
              <option value="unfit">Unfit for Duty</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-8 py-6">
          <div 
            className="grid grid-cols-1 md:grid-cols-5 gap-4 rounded-lg p-6"
            style={{ 
              backgroundColor: "#1E293B",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
            }}
          >
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Total Records
              </p>
              <p className="text-2xl font-bold" style={{ color: "white" }}>
                {totalRecords}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Fit for Duty
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-success)" }}>
                {fitCount}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                With Restrictions
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-warning)" }}>
                {restrictedCount}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Unfit for Duty
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-danger)" }}>
                {unfitCount}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Expired / Overdue
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-danger)" }}>
                {expiredCount}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Records Table */}
        <div className="px-8 pb-6">
          <div 
            className="rounded-lg overflow-hidden relative" 
            style={{ 
              backgroundColor: "#1E293B",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.03, zIndex: 0 }}>
              <Lock className="size-64" style={{ color: "white" }} />
            </div>

            <div className="overflow-x-auto relative" style={{ zIndex: 1 }}>
              <table className="border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <th 
                      className="sticky left-0 z-20 px-6 py-4 text-left"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        minWidth: "250px",
                      }}
                    >
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Employee
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Exam Type
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Practitioner
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Exam Date
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Expiry Date
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Fitness Status
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        Medical File
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const examTypeBadge = getExamTypeBadge(record.examType);
                    const fitnessBadge = getFitnessStatusBadge(record.fitnessStatus);

                    return (
                      <tr 
                        key={record.id} 
                        className="transition-colors" 
                        style={{ 
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td 
                          className="sticky left-0 z-10 px-6 py-4"
                          style={{
                            backgroundColor: "#1E293B",
                          }}
                        >
                          <div>
                            <div className="font-medium mb-1" style={{ color: "white" }}>
                              {record.employeeName}
                            </div>
                            <div className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                              {record.department}
                            </div>
                            <div className="text-xs font-mono" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                              {record.employeeId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: examTypeBadge.bgColor, color: examTypeBadge.color }}
                          >
                            {examTypeBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium" style={{ color: "white" }}>
                              {record.practitioner}
                            </div>
                            <div
                              className="text-xs inline-flex items-center px-1.5 py-0.5 rounded mt-1"
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.7)" }}
                            >
                              {record.practitionerType}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            {new Date(record.examDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {record.expiryDate === "N/A" ? (
                            <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                              N/A
                            </span>
                          ) : (
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: record.isExpired ? "var(--compliance-danger)" : "var(--compliance-success)",
                              }}
                            >
                              {new Date(record.expiryDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                              style={{ backgroundColor: fitnessBadge.bgColor, color: fitnessBadge.color }}
                            >
                              {fitnessBadge.label}
                            </span>
                            {record.restrictions && (
                              <div className="text-xs mt-2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                                {record.restrictions}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewCertificate(record)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ 
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                              }}
                              title="View Certificate (Public)"
                            >
                              <Lock className="size-4" style={{ color: "var(--compliance-success)" }} />
                            </button>
                            <button
                              onClick={() => handleViewClinical(record)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ 
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                              }}
                              title="Clinical Notes (Admin Only)"
                            >
                              <EyeOff className="size-4" style={{ color: "var(--compliance-danger)" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 40-Year Retention Footer */}
        <div
          className="px-8 py-3 border-t flex items-center justify-between"
          style={{ backgroundColor: "var(--grey-50)", borderColor: "var(--grey-200)" }}
        >
          <div className="flex items-center gap-2">
            <Info className="size-4" style={{ color: "var(--brand-blue)" }} />
            <span className="text-xs" style={{ color: "var(--grey-600)" }}>
              Records in this module are legally archived for <strong>40 years</strong> as per OHS Act requirements.
            </span>
            <button
              onClick={() => setShowRetentionInfo(!showRetentionInfo)}
              className="text-xs underline"
              style={{ color: "var(--brand-blue)" }}
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Certificate View Modal (Annexure 3) */}
        {viewMode === "certificate" && selectedRecord && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div
                className="w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]"
                style={{ backgroundColor: "white" }}
              >
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
                  <div className="flex items-center gap-3">
                    <Lock className="size-5" style={{ color: "var(--compliance-success)" }} />
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>
                        Certificate of Fitness (Annexure 3)
                      </h3>
                      <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                        Public Document - Auditor Access
                      </p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "var(--grey-50)" }}>
                  <div className="bg-white p-8 rounded border" style={{ borderColor: "var(--grey-300)" }}>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl mb-2" style={{ color: "var(--grey-900)" }}>
                        CERTIFICATE OF FITNESS
                      </h2>
                      <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                        Occupational Health and Safety Act, 1993 (Annexure 3)
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
                            EMPLOYEE NAME
                          </p>
                          <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                            {selectedRecord.employeeName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
                            EMPLOYEE NUMBER
                          </p>
                          <p className="font-mono" style={{ color: "var(--grey-900)" }}>
                            {selectedRecord.employeeId}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
                            EXAMINATION DATE
                          </p>
                          <p style={{ color: "var(--grey-900)" }}>
                            {new Date(selectedRecord.examDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
                            CERTIFICATE VALID UNTIL
                          </p>
                          <p style={{ color: "var(--grey-900)" }}>
                            {selectedRecord.expiryDate !== "N/A"
                              ? new Date(selectedRecord.expiryDate).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
                          EXAMINED BY
                        </p>
                        <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                          {selectedRecord.practitioner} ({selectedRecord.practitionerType})
                        </p>
                      </div>
                    </div>

                    <div
                      className="p-6 rounded-lg border-2 text-center"
                      style={{
                        backgroundColor:
                          selectedRecord.fitnessStatus === "fit"
                            ? "var(--compliance-success)10"
                            : selectedRecord.fitnessStatus === "fit-with-restrictions"
                            ? "var(--compliance-warning)10"
                            : "var(--compliance-danger)10",
                        borderColor:
                          selectedRecord.fitnessStatus === "fit"
                            ? "var(--compliance-success)"
                            : selectedRecord.fitnessStatus === "fit-with-restrictions"
                            ? "var(--compliance-warning)"
                            : "var(--compliance-danger)",
                      }}
                    >
                      <p className="text-xs font-medium mb-2" style={{ color: "var(--grey-600)" }}>
                        FITNESS DETERMINATION
                      </p>
                      <p
                        className="text-2xl font-bold mb-3"
                        style={{
                          color:
                            selectedRecord.fitnessStatus === "fit"
                              ? "var(--compliance-success)"
                              : selectedRecord.fitnessStatus === "fit-with-restrictions"
                              ? "var(--compliance-warning)"
                              : "var(--compliance-danger)",
                        }}
                      >
                        {selectedRecord.fitnessStatus === "fit"
                          ? "FIT FOR DUTY"
                          : selectedRecord.fitnessStatus === "fit-with-restrictions"
                          ? "FIT WITH RESTRICTIONS"
                          : "UNFIT FOR DUTY"}
                      </p>
                      {selectedRecord.restrictions && (
                        <p className="text-sm mt-3" style={{ color: "var(--grey-700)" }}>
                          <strong>Restrictions:</strong> {selectedRecord.restrictions}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--grey-200)" }}>
                      <p className="text-xs text-center" style={{ color: "var(--grey-500)" }}>
                        This certificate confirms the employee's fitness for the specified work as assessed on the examination date.
                        <br />
                        This is a public document available to auditors and management.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Clinical Record View Modal (Admin Only) */}
        {viewMode === "clinical" && selectedRecord && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div
                className="w-full max-w-3xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]"
                style={{ backgroundColor: "white" }}
              >
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ backgroundColor: "var(--compliance-danger)10", borderColor: "var(--compliance-danger)" }}
                >
                  <div className="flex items-center gap-3">
                    <EyeOff className="size-5" style={{ color: "var(--compliance-danger)" }} />
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>
                        Clinical Medical Records
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "var(--compliance-danger)" }}>
                        CONFIDENTIAL - Admin Only Access • POPI Act Protected
                      </p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h4 className="font-medium mb-2" style={{ color: "var(--grey-900)" }}>
                      Patient Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--grey-50)" }}>
                      <div>
                        <p className="text-xs mb-1" style={{ color: "var(--grey-600)" }}>
                          Name
                        </p>
                        <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                          {selectedRecord.employeeName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: "var(--grey-600)" }}>
                          Employee ID
                        </p>
                        <p className="font-mono" style={{ color: "var(--grey-900)" }}>
                          {selectedRecord.employeeId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-3" style={{ color: "var(--grey-900)" }}>
                      Clinical Test Results
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg border" style={{ borderColor: "var(--grey-200)", backgroundColor: "white" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                            Audiometry (Hearing Test)
                          </p>
                          <CheckCircle className="size-4" style={{ color: "var(--compliance-success)" }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p style={{ color: "var(--grey-600)" }}>Left Ear: 18 dB</p>
                          </div>
                          <div>
                            <p style={{ color: "var(--grey-600)" }}>Right Ear: 22 dB</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                              Result: Normal hearing threshold. No significant loss detected.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border" style={{ borderColor: "var(--grey-200)", backgroundColor: "white" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                            Spirometry (Lung Function)
                          </p>
                          <CheckCircle className="size-4" style={{ color: "var(--compliance-success)" }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p style={{ color: "var(--grey-600)" }}>FEV1: 3.8L (95%)</p>
                          </div>
                          <div>
                            <p style={{ color: "var(--grey-600)" }}>FVC: 4.5L (98%)</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                              Result: Normal lung function. No restrictive or obstructive patterns.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border" style={{ borderColor: "var(--grey-200)", backgroundColor: "white" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                            Vision Screening
                          </p>
                          <CheckCircle className="size-4" style={{ color: "var(--compliance-success)" }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p style={{ color: "var(--grey-600)" }}>Distance: 6/6 (both eyes)</p>
                          </div>
                          <div>
                            <p style={{ color: "var(--grey-600)" }}>Near: N5 (both eyes)</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                              Result: Normal visual acuity. Color vision normal.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border" style={{ borderColor: "var(--grey-200)", backgroundColor: "white" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                            Blood Pressure
                          </p>
                          <CheckCircle className="size-4" style={{ color: "var(--compliance-success)" }} />
                        </div>
                        <div className="text-sm">
                          <p style={{ color: "var(--grey-600)" }}>122/78 mmHg</p>
                          <p className="text-xs mt-1" style={{ color: "var(--grey-500)" }}>
                            Result: Normal blood pressure range.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-3" style={{ color: "var(--grey-900)" }}>
                      Medical Practitioner's Notes
                    </h4>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--grey-50)" }}>
                      <p className="text-sm mb-3" style={{ color: "var(--grey-700)" }}>
                        <strong>Assessment:</strong> Employee presents in good general health. All clinical assessments within
                        normal parameters for age and occupation.
                      </p>
                      <p className="text-sm" style={{ color: "var(--grey-700)" }}>
                        <strong>Recommendation:</strong> Certified fit for current duties without restrictions. Routine annual
                        surveillance recommended.
                      </p>
                      <p className="text-sm mt-3" style={{ color: "var(--grey-600)" }}>
                        <em>— {selectedRecord.practitioner}, {selectedRecord.practitionerType}</em>
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{ backgroundColor: "var(--compliance-danger)05", borderColor: "var(--compliance-danger)" }}
                  >
                    <p className="text-xs font-medium" style={{ color: "var(--compliance-danger)" }}>
                      ⚠️ POPI Act Confidentiality Notice
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--grey-600)" }}>
                      This clinical information is confidential and protected under the Protection of Personal Information Act
                      (POPI). Access is restricted to authorized medical personnel and RSS administrators only. Unauthorized
                      disclosure may result in legal action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 40-Year Retention Info Modal */}
        {showRetentionInfo && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowRetentionInfo(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div
                className="w-full max-w-lg rounded-lg shadow-2xl"
                style={{ backgroundColor: "white" }}
              >
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
                  <div className="flex items-center gap-3">
                    <Info className="size-5" style={{ color: "var(--brand-blue)" }} />
                    <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>
                      40-Year Retention Requirement
                    </h3>
                  </div>
                  <button onClick={() => setShowRetentionInfo(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>

                <div className="p-6">
                  <p className="text-sm mb-4" style={{ color: "var(--grey-700)" }}>
                    <strong>Legal Requirement:</strong> Under the Occupational Health and Safety Act (OHS Act, 1993), Section
                    43, all medical surveillance records must be retained for a period of <strong>40 years</strong> from the
                    date of the last medical examination.
                  </p>

                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "var(--grey-50)" }}>
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--grey-900)" }}>
                      Why 40 years?
                    </p>
                    <ul className="text-sm space-y-1" style={{ color: "var(--grey-700)" }}>
                      <li>• Occupational diseases often have long latency periods</li>
                      <li>• Enables long-term health trend analysis</li>
                      <li>• Supports compensation claims for work-related illnesses</li>
                      <li>• Provides historical baseline for medical conditions</li>
                    </ul>
                  </div>

                  <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                    SHERQ Online automatically archives all medical records in compliance with this requirement. Records are
                    securely stored and never permanently deleted, even when employees leave the organization.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}