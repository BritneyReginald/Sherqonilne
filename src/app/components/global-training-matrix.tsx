import { useState } from "react";
import {
  Upload,
  Filter,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";

interface TrainingModule {
  id: string;
  name: string;
}

interface EmployeeTraining {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  site: string;
  department: string;
  training: Record<
    string,
    {
      status: "valid" | "expiring" | "expired" | "missing" | "not-required";
      expiryDate?: string;
    }
  >;
}

const trainingModules: TrainingModule[] = [
  { id: "sheq-induction", name: "SHEQ Induction" },
  { id: "first-aid", name: "First Aid Level 1" },
  { id: "fire-fighter", name: "Fire Fighter (Basic)" },
  { id: "hira", name: "HIRA / Risk Assessment" },
  { id: "heights", name: "Working at Heights" },
  { id: "confined-spaces", name: "Confined Spaces" },
  { id: "incident-investigation", name: "Incident Investigation" },
];

const employeeTrainingData: EmployeeTraining[] = [
  {
    employeeId: "EMP001",
    employeeName: "Sarah Johnson",
    jobTitle: "Site Safety Officer",
    site: "Johannesburg Main",
    department: "Health & Safety",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-03-15" },
      "first-aid": { status: "valid", expiryDate: "2026-01-20" },
      "fire-fighter": { status: "valid", expiryDate: "2025-11-10" },
      "hira": { status: "valid", expiryDate: "2026-05-30" },
      "heights": { status: "not-required" },
      "confined-spaces": { status: "expiring", expiryDate: "2024-03-15" },
      "incident-investigation": { status: "valid", expiryDate: "2025-12-05" },
    },
  },
  {
    employeeId: "EMP002",
    employeeName: "Michael Chen",
    jobTitle: "Construction Supervisor",
    site: "Cape Town Depot",
    department: "Construction",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-02-10" },
      "first-aid": { status: "expiring", expiryDate: "2024-02-28" },
      "fire-fighter": { status: "valid", expiryDate: "2025-08-15" },
      "hira": { status: "valid", expiryDate: "2025-10-20" },
      "heights": { status: "valid", expiryDate: "2026-04-12" },
      "confined-spaces": { status: "valid", expiryDate: "2025-09-25" },
      "incident-investigation": { status: "expired", expiryDate: "2023-11-30" },
    },
  },
  {
    employeeId: "EMP003",
    employeeName: "John Smith",
    jobTitle: "Electrician",
    site: "Johannesburg Main",
    department: "Maintenance",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2025-12-01" },
      "first-aid": { status: "valid", expiryDate: "2026-06-15" },
      "fire-fighter": { status: "expiring", expiryDate: "2024-03-10" },
      "hira": { status: "not-required" },
      "heights": { status: "valid", expiryDate: "2025-07-22" },
      "confined-spaces": { status: "missing" },
      "incident-investigation": { status: "not-required" },
    },
  },
  {
    employeeId: "EMP004",
    employeeName: "Emma Thompson",
    jobTitle: "Environmental Officer",
    site: "Durban Plant",
    department: "Environmental",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-01-18" },
      "first-aid": { status: "valid", expiryDate: "2025-11-05" },
      "fire-fighter": { status: "valid", expiryDate: "2026-02-28" },
      "hira": { status: "valid", expiryDate: "2026-03-12" },
      "heights": { status: "not-required" },
      "confined-spaces": { status: "not-required" },
      "incident-investigation": { status: "valid", expiryDate: "2025-10-17" },
    },
  },
  {
    employeeId: "EMP005",
    employeeName: "David van der Merwe",
    jobTitle: "Operations Manager",
    site: "Johannesburg Main",
    department: "Operations",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-04-20" },
      "first-aid": { status: "expired", expiryDate: "2023-09-15" },
      "fire-fighter": { status: "valid", expiryDate: "2025-12-08" },
      "hira": { status: "valid", expiryDate: "2025-11-22" },
      "heights": { status: "not-required" },
      "confined-spaces": { status: "not-required" },
      "incident-investigation": { status: "valid", expiryDate: "2026-01-30" },
    },
  },
  {
    employeeId: "EMP006",
    employeeName: "Lisa Botha",
    jobTitle: "Rigger / Scaffolder",
    site: "Cape Town Depot",
    department: "Construction",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2025-10-12" },
      "first-aid": { status: "valid", expiryDate: "2026-05-28" },
      "fire-fighter": { status: "expiring", expiryDate: "2024-02-20" },
      "hira": { status: "valid", expiryDate: "2025-09-10" },
      "heights": { status: "valid", expiryDate: "2026-06-15" },
      "confined-spaces": { status: "valid", expiryDate: "2025-08-05" },
      "incident-investigation": { status: "not-required" },
    },
  },
  {
    employeeId: "EMP007",
    employeeName: "James Ndlovu",
    jobTitle: "Plant Operator",
    site: "Durban Plant",
    department: "Operations",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-02-25" },
      "first-aid": { status: "missing" },
      "fire-fighter": { status: "valid", expiryDate: "2025-10-30" },
      "hira": { status: "valid", expiryDate: "2025-12-18" },
      "heights": { status: "not-required" },
      "confined-spaces": { status: "expired", expiryDate: "2023-07-22" },
      "incident-investigation": { status: "not-required" },
    },
  },
  {
    employeeId: "EMP008",
    employeeName: "Peter van Zyl",
    jobTitle: "Mechanical Technician",
    site: "Johannesburg Main",
    department: "Maintenance",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2025-11-08" },
      "first-aid": { status: "valid", expiryDate: "2026-03-14" },
      "fire-fighter": { status: "valid", expiryDate: "2025-09-20" },
      "hira": { status: "expiring", expiryDate: "2024-03-05" },
      "heights": { status: "valid", expiryDate: "2025-10-12" },
      "confined-spaces": { status: "valid", expiryDate: "2026-01-25" },
      "incident-investigation": { status: "not-required" },
    },
  },
  {
    employeeId: "EMP009",
    employeeName: "Thandi Mkhize",
    jobTitle: "Quality Inspector",
    site: "Durban Plant",
    department: "Quality Assurance",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-05-10" },
      "first-aid": { status: "valid", expiryDate: "2025-12-20" },
      "fire-fighter": { status: "valid", expiryDate: "2026-04-05" },
      "hira": { status: "valid", expiryDate: "2026-02-15" },
      "heights": { status: "not-required" },
      "confined-spaces": { status: "not-required" },
      "incident-investigation": { status: "expiring", expiryDate: "2024-02-18" },
    },
  },
  {
    employeeId: "EMP010",
    employeeName: "Robert Malan",
    jobTitle: "Safety Representative",
    site: "Cape Town Depot",
    department: "Health & Safety",
    training: {
      "sheq-induction": { status: "valid", expiryDate: "2026-06-22" },
      "first-aid": { status: "valid", expiryDate: "2026-04-18" },
      "fire-fighter": { status: "valid", expiryDate: "2025-11-28" },
      "hira": { status: "valid", expiryDate: "2026-03-30" },
      "heights": { status: "valid", expiryDate: "2025-10-05" },
      "confined-spaces": { status: "valid", expiryDate: "2026-02-12" },
      "incident-investigation": { status: "valid", expiryDate: "2025-09-25" },
    },
  },
];

export function GlobalTrainingMatrix() {
  const { dismissAlert } = useAlerts();
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeTraining | null>(null);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(
    null
  );

  const sites = [
    "All Sites",
    ...Array.from(
      new Set(employeeTrainingData.map((emp) => emp.site))
    ).sort(),
  ];

  const filteredEmployees = employeeTrainingData.filter((emp) => {
    const matchesSite =
      selectedSite === "All Sites" || emp.site === selectedSite;
    const matchesSearch =
      searchQuery === "" ||
      emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  const handleCellClick = (
    employee: EmployeeTraining,
    module: TrainingModule
  ) => {
    setSelectedEmployee(employee);
    setSelectedModule(module);
    setShowUploadModal(true);
  };

  const getStatusCount = (status: string) => {
    let count = 0;
    filteredEmployees.forEach((emp) => {
      trainingModules.forEach((module) => {
        if (emp.training[module.id]?.status === status) {
          count++;
        }
      });
    });
    return count;
  };

  const validCount = getStatusCount("valid");
  const expiringCount = getStatusCount("expiring");
  const expiredCount = getStatusCount("expired");
  const missingCount = getStatusCount("missing");

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `Training Alert: ${expiredCount} expired training certificates require immediate renewal`, "warning");
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "#0F172A" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Global Notification Header - Full Width White Bar */}
        {expiredCount > 0 && (
          <AlertBanner
            id="training-matrix-expired-alert"
            type="warning"
            icon={<AlertTriangle className="size-5" />}
            title={`Training Alert: ${expiredCount} expired training certificates require immediate renewal`}
            description="Employees with expired training may not be compliant for their assigned tasks"
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>
                Global Training Matrix
              </h1>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Cross-site training compliance overview
              </p>
            </div>
            <button
              className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <Upload className="size-4" />
              Bulk Upload Certificates
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4" style={{ color: "#F8FAFC" }} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "white",
                  borderColor: "var(--grey-300)",
                  border: "none",
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

            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "white",
                  border: "none",
                  color: "var(--grey-900)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-8 pb-6">
          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-lg"
            style={{
              backgroundColor: "#1E293B",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
                Valid Certifications
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-success)" }}>
                {validCount}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
                Expiring Soon
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-warning)" }}>
                {expiringCount}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
                Expired / Overdue
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--compliance-danger)" }}>
                {expiredCount}
              </p>
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
                Missing / Required
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--grey-500)" }}>
                {missingCount}
              </p>
            </div>
          </div>
        </div>

        {/* Training Matrix Table */}
        <div className="px-8 pb-6">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: "#1E293B",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="overflow-auto">
              <div className="inline-block min-w-full">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      {/* Fixed Employee Column Header */}
                      <th
                        className="sticky left-0 z-20"
                        style={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          width: "280px",
                          minWidth: "280px",
                        }}
                      >
                        <div className="px-6 py-4">
                          <span
                            className="text-sm font-medium"
                            style={{ color: "#F8FAFC" }}
                          >
                            Employee Details
                          </span>
                        </div>
                      </th>

                      {/* Training Module Headers (Rotated) */}
                      {trainingModules.map((module) => (
                        <th
                          key={module.id}
                          className="relative"
                          style={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            height: "180px",
                            width: "100px",
                            minWidth: "100px",
                            padding: 0,
                          }}
                        >
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 origin-bottom-left transform -rotate-45 whitespace-nowrap">
                            <span
                              className="text-xs font-medium"
                              style={{ color: "#F8FAFC" }}
                            >
                              {module.name}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((employee, index) => (
                      <tr
                        key={employee.employeeId}
                        className="transition-colors"
                        style={{
                          backgroundColor: index % 2 === 0 ? "#1E293B" : "rgba(30, 41, 59, 0.7)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#1E293B" : "rgba(30, 41, 59, 0.7)";
                        }}
                      >
                        {/* Fixed Employee Info Column */}
                        <td
                          className="sticky left-0 z-10"
                          style={{
                            backgroundColor: index % 2 === 0 ? "#1E293B" : "rgba(30, 41, 59, 0.7)",
                          }}
                        >
                          <div className="px-6 py-4">
                            <div
                              className="font-medium mb-0.5"
                              style={{ color: "#F8FAFC" }}
                            >
                              {employee.employeeName}
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "#94A3B8" }}
                            >
                              {employee.jobTitle}
                            </div>
                          </div>
                        </td>

                        {/* Training Status Cells */}
                        {trainingModules.map((module) => (
                          <td
                            key={module.id}
                            className="text-center"
                            style={{
                              padding: "16px 8px",
                            }}
                          >
                            <TrainingStatusCell
                              status={employee.training[module.id]}
                              onClick={() =>
                                handleCellClick(
                                  employee,
                                  module
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Certificate Modal */}
      {selectedEmployee && selectedModule && (
        <UploadCertificateModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedEmployee(null);
            setSelectedModule(null);
          }}
          employeeName={selectedEmployee.employeeName}
          courseName={selectedModule.name}
          currentStatus={selectedEmployee.training[selectedModule.id].status}
          currentExpiryDate={
            selectedEmployee.training[selectedModule.id].expiryDate
          }
        />
      )}
    </div>
  );
}

interface TrainingStatus {
  status: "valid" | "expiring" | "expired" | "missing" | "not-required";
  expiryDate?: string;
}

function TrainingStatusCell({ status, onClick }: { status: TrainingStatus; onClick?: () => void }) {
  const isClickable = status.status === "expiring" || status.status === "expired" || status.status === "missing";

  if (status.status === "not-required") {
    return (
      <div className="flex flex-col items-center justify-center">
        <div
          className="size-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--grey-200)" }}
        >
          <span className="text-xs" style={{ color: "var(--grey-500)" }}>
            —
          </span>
        </div>
      </div>
    );
  }

  if (status.status === "valid") {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <div
          className="size-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--compliance-success)" }}
        >
          <CheckCircle2 className="size-5 text-white" />
        </div>
        {status.expiryDate && (
          <span className="text-xs" style={{ color: "var(--grey-600)" }}>
            Exp: {new Date(status.expiryDate).getFullYear()}
          </span>
        )}
      </div>
    );
  }

  if (status.status === "expiring") {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div
          className="size-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--compliance-warning)" }}
        >
          <AlertTriangle className="size-5 text-white" />
        </div>
        {status.expiryDate && (
          <span className="text-xs font-medium" style={{ color: "var(--grey-700)" }}>
            Exp:{" "}
            {new Date(status.expiryDate).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </button>
    );
  }

  if (status.status === "expired") {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div
          className="size-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--compliance-danger)" }}
        >
          <XCircle className="size-5 text-white" />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--compliance-danger)" }}
        >
          EXPIRED
        </span>
      </button>
    );
  }

  if (status.status === "missing") {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div
          className="size-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--compliance-danger)" }}
        >
          <XCircle className="size-5 text-white" />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--compliance-danger)" }}
        >
          MISSING
        </span>
      </button>
    );
  }

  return null;
}

function calculateComplianceRate(employees: EmployeeTraining[]): number {
  let totalRequired = 0;
  let totalValid = 0;

  employees.forEach((employee) => {
    Object.values(employee.training).forEach((training) => {
      if (training.status !== "not-required") {
        totalRequired++;
        if (training.status === "valid") {
          totalValid++;
        }
      }
    });
  });

  if (totalRequired === 0) return 100;
  return Math.round((totalValid / totalRequired) * 100);
}

function countStatusAcrossEmployees(
  employees: EmployeeTraining[],
  status: "valid" | "expiring" | "expired" | "missing" | "not-required"
): number {
  let count = 0;
  employees.forEach((employee) => {
    Object.values(employee.training).forEach((training) => {
      if (training.status === status) {
        count++;
      }
    });
  });
  return count;
}