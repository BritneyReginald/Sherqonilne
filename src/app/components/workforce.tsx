import { useState } from "react";
import { Search, Filter, Download, UserPlus, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { EmployeeProfile } from "@/app/components/employee-profile";
import { useTheme } from "@/app/contexts/theme-context";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  jobTitle: string;
  siteLocation: string;
  complianceStatus: "compliant" | "review" | "action";
}

const employees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP001",
    fullName: "Sarah Johnson",
    jobTitle: "Site Safety Officer",
    siteLocation: "Johannesburg Main",
    complianceStatus: "compliant",
  },
  {
    id: "2",
    employeeId: "EMP002",
    fullName: "Michael Chen",
    jobTitle: "Construction Supervisor",
    siteLocation: "Cape Town Depot",
    complianceStatus: "action",
  },
  {
    id: "3",
    employeeId: "EMP003",
    fullName: "Thandiwe Mthembu",
    jobTitle: "Health & Safety Manager",
    siteLocation: "Durban Operations",
    complianceStatus: "compliant",
  },
  {
    id: "4",
    employeeId: "EMP004",
    fullName: "David van der Merwe",
    jobTitle: "Equipment Operator",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
  {
    id: "5",
    employeeId: "EMP005",
    fullName: "Precious Ndlovu",
    jobTitle: "Environmental Officer",
    siteLocation: "Pretoria Branch",
    complianceStatus: "compliant",
  },
  {
    id: "6",
    employeeId: "EMP006",
    fullName: "James Anderson",
    jobTitle: "Foreman",
    siteLocation: "Cape Town Depot",
    complianceStatus: "action",
  },
  {
    id: "7",
    employeeId: "EMP007",
    fullName: "Nomvula Dlamini",
    jobTitle: "Quality Inspector",
    siteLocation: "Durban Operations",
    complianceStatus: "review",
  },
  {
    id: "8",
    employeeId: "EMP008",
    fullName: "Peter Williams",
    jobTitle: "Site Manager",
    siteLocation: "Johannesburg Main",
    complianceStatus: "compliant",
  },
  {
    id: "9",
    employeeId: "EMP009",
    fullName: "Lindiwe Khumalo",
    jobTitle: "Safety Coordinator",
    siteLocation: "Pretoria Branch",
    complianceStatus: "action",
  },
  {
    id: "10",
    employeeId: "EMP010",
    fullName: "Robert Smith",
    jobTitle: "Maintenance Technician",
    siteLocation: "Cape Town Depot",
    complianceStatus: "compliant",
  },
  {
    id: "11",
    employeeId: "EMP011",
    fullName: "Zanele Nkosi",
    jobTitle: "Compliance Officer",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
  {
    id: "12",
    employeeId: "EMP012",
    fullName: "Andrew Brown",
    jobTitle: "Project Engineer",
    siteLocation: "Durban Operations",
    complianceStatus: "compliant",
  },
  {
    id: "13",
    employeeId: "EMP013",
    fullName: "Thabo Mokoena",
    jobTitle: "Safety Supervisor",
    siteLocation: "Pretoria Branch",
    complianceStatus: "action",
  },
  {
    id: "14",
    employeeId: "EMP014",
    fullName: "Emma Davis",
    jobTitle: "Training Coordinator",
    siteLocation: "Cape Town Depot",
    complianceStatus: "compliant",
  },
  {
    id: "15",
    employeeId: "EMP015",
    fullName: "Sipho Zulu",
    jobTitle: "Equipment Operator",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
];

const sites = [
  "All Sites",
  "Johannesburg Main",
  "Cape Town Depot",
  "Durban Operations",
  "Pretoria Branch",
];

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "compliant", label: "Compliant" },
  { value: "review", label: "Review Needed" },
  { value: "action", label: "Action Required" },
];

export function Workforce() {
  const { colors } = useTheme();
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSite =
      selectedSite === "All Sites" || employee.siteLocation === selectedSite;
    const matchesStatus =
      selectedStatus === "all" || employee.complianceStatus === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSite && matchesStatus && matchesSearch;
  });

  // Show employee profile if one is selected
  if (selectedEmployeeId) {
    return (
      <EmployeeProfile
        employeeId={selectedEmployeeId}
        onBack={() => setSelectedEmployeeId(null)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: colors.background }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: colors.primaryText }}>
                Workforce Management
              </h1>
              <p className="text-sm" style={{ color: colors.subText }}>
                Manage employee records and monitor compliance status
              </p>
            </div>
            <button
              className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <UserPlus className="size-4" />
              Add Employee
            </button>
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="size-5" style={{ color: colors.subText }} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
                border: "none",
              }}
            >
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
                border: "none",
              }}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                style={{ color: colors.subText }}
              />
              <input
                type="text"
                placeholder="Search by name, ID, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.primaryText,
                  border: "none",
                }}
              />
            </div>

            {/* Export Button */}
            <button
              className="px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
              }}
            >
              <Download className="size-4" />
              Export
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Total Employees
              </p>
              <p className="text-3xl font-bold" style={{ color: colors.primaryText }}>
                {employees.length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Compliant
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {employees.filter((e) => e.complianceStatus === "compliant").length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Review Needed
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-warning)" }}
              >
                {employees.filter((e) => e.complianceStatus === "review").length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Action Required
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-danger)" }}
              >
                {employees.filter((e) => e.complianceStatus === "action").length}
              </p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="px-8 pb-6">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: colors.surface,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Employee ID
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Full Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Job Title
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Site Location
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Overall Compliance Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        className="transition-opacity cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: index % 2 === 0 ? "transparent" : colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                        }}
                        onClick={() => setSelectedEmployeeId(employee.employeeId)}
                      >
                        <td
                          className="px-6 py-4 text-sm font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {employee.employeeId}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: colors.primaryText }}>
                          {employee.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: colors.subText }}>
                          {employee.jobTitle}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: colors.subText }}>
                          {employee.siteLocation}
                        </td>
                        <td className="px-6 py-4">
                          <ComplianceBadge status={employee.complianceStatus} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm"
                        style={{ color: colors.subText }}
                      >
                        No employees found matching the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm" style={{ color: colors.subText }}>
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComplianceBadgeProps {
  status: "compliant" | "review" | "action";
}

function ComplianceBadge({ status }: ComplianceBadgeProps) {
  const badgeConfig = {
    compliant: {
      label: "Compliant",
      color: "var(--compliance-success)",
      icon: <CheckCircle2 className="size-4" />,
    },
    review: {
      label: "Review Needed",
      color: "var(--compliance-warning)",
      icon: <AlertTriangle className="size-4" />,
    },
    action: {
      label: "Action Required",
      color: "var(--compliance-danger)",
      icon: <XCircle className="size-4" />,
    },
  };

  const config = badgeConfig[status];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.icon}
      {config.label}
    </div>
  );
}
