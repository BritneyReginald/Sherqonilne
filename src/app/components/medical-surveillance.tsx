import { useState } from "react";
import { Plus, Filter, ShieldCheck, Lock, EyeOff, FileText, X, AlertTriangle, Info } from "lucide-react";

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
    id: "MED-002",
    employeeName: "Michael Chen",
    employeeId: "EMP-1156",
    department: "Operations",
    examType: "periodic",
    practitioner: "Sr. M. van der Merwe",
    practitionerType: "OHNP",
    examDate: "2024-06-20",
    expiryDate: "2025-06-20",
    isExpired: true,
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
    site: "Pretoria East",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-004",
    employeeName: "David Botha",
    employeeId: "EMP-1201",
    department: "Electrical",
    examType: "pre-placement",
    practitioner: "Dr. P. Naidoo",
    practitionerType: "OMP",
    examDate: "2026-01-05",
    expiryDate: "2027-01-05",
    isExpired: false,
    fitnessStatus: "fit",
    site: "JHB South",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-005",
    employeeName: "Zanele Dlamini",
    employeeId: "EMP-1045",
    department: "Health & Safety",
    examType: "periodic",
    practitioner: "Sr. M. van der Merwe",
    practitionerType: "OHNP",
    examDate: "2025-12-28",
    expiryDate: "2026-12-28",
    isExpired: false,
    fitnessStatus: "fit",
    site: "Durban North",
    company: "XYZ Industries",
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
    site: "JHB South",
    company: "ABC Manufacturing",
  },
  {
    id: "MED-007",
    employeeName: "Lerato Khumalo",
    employeeId: "EMP-1092",
    department: "Production",
    examType: "periodic",
    practitioner: "Dr. J. Pillay",
    practitionerType: "OMP",
    examDate: "2024-12-05",
    expiryDate: "2025-12-05",
    isExpired: true,
    fitnessStatus: "fit",
    site: "Pretoria East",
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
    id: "MED-009",
    employeeName: "Nomsa Sibiya",
    employeeId: "EMP-1067",
    department: "Administration",
    examType: "periodic",
    practitioner: "Sr. M. van der Merwe",
    practitionerType: "OHNP",
    examDate: "2025-09-18",
    expiryDate: "2026-09-18",
    isExpired: false,
    fitnessStatus: "fit",
    site: "Durban North",
    company: "XYZ Industries",
  },
  {
    id: "MED-010",
    employeeName: "Pieter van Zyl",
    employeeId: "EMP-1203",
    department: "Civil Works",
    examType: "pre-placement",
    practitioner: "Dr. K. Reddy",
    practitionerType: "OMP",
    examDate: "2025-12-22",
    expiryDate: "2026-12-22",
    isExpired: false,
    fitnessStatus: "fit",
    site: "Cape Town",
    company: "DEF Construction",
  },
  {
    id: "MED-011",
    employeeName: "Sipho Mthembu",
    employeeId: "EMP-1088",
    department: "Operations",
    examType: "exit",
    practitioner: "Dr. J. Pillay",
    practitionerType: "OMP",
    examDate: "2025-12-30",
    expiryDate: "N/A",
    isExpired: false,
    fitnessStatus: "fit",
    site: "Pretoria East",
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
    site: "JHB South",
    company: "ABC Manufacturing",
  },
];

type FitnessFilter = "all" | "fit" | "fit-with-restrictions" | "unfit";

type ViewMode = "certificate" | "clinical" | null;

export function MedicalSurveillance() {
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedFitness, setSelectedFitness] = useState<FitnessFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRetentionInfo, setShowRetentionInfo] = useState(false);

  // Extract unique sites
  const sites = ["All Sites", ...Array.from(new Set(medicalRecords.map((r) => r.site))).sort()];

  // Filter records
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

  // Statistics
  const totalRecords = filteredRecords.length;
  const fitCount = filteredRecords.filter((r) => r.fitnessStatus === "fit").length;
  const restrictedCount = filteredRecords.filter((r) => r.fitnessStatus === "fit-with-restrictions").length;
  const unfitCount = filteredRecords.filter((r) => r.fitnessStatus === "unfit").length;
  const expiredCount = filteredRecords.filter((r) => r.isExpired).length;

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: "var(--grey-900)" }}>
              Medical Surveillance & Fitness for Duty
            </h1>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--grey-600)" }}>
                POPI Act Compliant: Restricted Access
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            <Plus className="size-4" />
            Record New Medical Exam
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4" style={{ color: "var(--grey-500)" }} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{
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
      <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
            Total Records
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--grey-900)" }}>
            {totalRecords}
          </p>
        </div>
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
            Fit for Duty
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--compliance-success)" }}>
            {fitCount}
          </p>
        </div>
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
            With Restrictions
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--compliance-warning)" }}>
            {restrictedCount}
          </p>
        </div>
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
            Unfit for Duty
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--compliance-danger)" }}>
            {unfitCount}
          </p>
        </div>
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: "white",
            borderColor: "var(--compliance-danger)20",
          }}
        >
          <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
            Expired / Overdue
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--compliance-danger)" }}>
            {expiredCount}
          </p>
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div
          className="rounded-lg border overflow-hidden relative"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          {/* Security Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.03, zIndex: 0 }}
          >
            <Lock className="size-64" style={{ color: "var(--grey-900)" }} />
          </div>

          <div className="overflow-auto relative" style={{ zIndex: 1 }}>
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: "var(--grey-50)",
                    borderColor: "var(--grey-200)",
                  }}
                >
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Employee
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Exam Type
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Practitioner
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Exam Date
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Expiry Date
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Fitness Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
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
                      className="border-b hover:bg-secondary transition-colors"
                      style={{ borderColor: "var(--grey-200)" }}
                    >
                      {/* Employee */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium mb-1" style={{ color: "var(--grey-900)" }}>
                            {record.employeeName}
                          </div>
                          <div className="text-sm" style={{ color: "var(--grey-600)" }}>
                            {record.department}
                          </div>
                          <div className="text-xs font-mono" style={{ color: "var(--grey-500)" }}>
                            {record.employeeId}
                          </div>
                        </div>
                      </td>

                      {/* Exam Type */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: examTypeBadge.bgColor,
                            color: examTypeBadge.color,
                          }}
                        >
                          {examTypeBadge.label}
                        </span>
                      </td>

                      {/* Practitioner */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                            {record.practitioner}
                          </div>
                          <div
                            className="text-xs inline-flex items-center px-1.5 py-0.5 rounded mt-1"
                            style={{
                              backgroundColor: "var(--grey-100)",
                              color: "var(--grey-600)",
                            }}
                          >
                            {record.practitionerType}
                          </div>
                        </div>
                      </td>

                      {/* Exam Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                          {new Date(record.examDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-6 py-4">
                        {record.expiryDate === "N/A" ? (
                          <span className="text-sm" style={{ color: "var(--grey-500)" }}>
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

                      {/* Fitness Status */}
                      <td className="px-6 py-4">
                        <div>
                          <span
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: fitnessBadge.bgColor,
                              color: fitnessBadge.color,
                            }}
                          >
                            {fitnessBadge.label}
                          </span>
                          {record.restrictions && (
                            <div className="text-xs mt-2" style={{ color: "var(--grey-600)" }}>
                              {record.restrictions}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Medical File */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 rounded-lg border transition-colors hover:bg-secondary group"
                            style={{ borderColor: "var(--grey-300)" }}
                            title="View Certificate (Public)"
                          >
                            <Lock
                              className="size-4"
                              style={{ color: "var(--compliance-success)" }}
                            />
                          </button>
                          <button
                            className="p-2 rounded-lg border transition-colors hover:bg-secondary group"
                            style={{ borderColor: "var(--grey-300)" }}
                            title="Clinical Notes (Admin Only)"
                          >
                            <EyeOff
                              className="size-4"
                              style={{ color: "var(--compliance-danger)" }}
                            />
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

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: "var(--grey-500)" }}>
              No medical records found matching the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}