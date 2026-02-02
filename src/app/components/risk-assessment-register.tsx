import { useState } from "react";
import { Plus, Filter, X, Users, FileText, Calendar, CheckCircle } from "lucide-react";

interface RiskAssessment {
  id: string;
  assessmentName: string;
  referenceNo: string;
  linkedSite: string;
  linkedDept: string;
  revision: string;
  reviewDate: string;
  status: "approved" | "draft" | "under-review";
  signOffRate: number;
  assignedEmployees: number;
  signedEmployees: number;
  category: "baseline" | "task-based" | "issue-based";
  requiredRoles: Array<{
    role: string;
    totalEmployees: number;
    signedEmployees: number;
  }>;
  isExpired?: boolean;
}

const riskAssessments: RiskAssessment[] = [
  {
    id: "RA-001",
    assessmentName: "Hot Work & Welding - Workshop A",
    referenceNo: "RA-HW-004",
    linkedSite: "JHB South",
    linkedDept: "Maintenance",
    revision: "v2.1",
    reviewDate: "2026-06-12",
    status: "approved",
    assignedEmployees: 28,
    signedEmployees: 24,
    signOffRate: 86,
    category: "task-based",
    requiredRoles: [
      { role: "Welder", totalEmployees: 10, signedEmployees: 8 },
      { role: "Supervisor", totalEmployees: 2, signedEmployees: 2 },
    ],
  },
  {
    id: "RA-002",
    assessmentName: "Working at Heights - General",
    referenceNo: "RA-WAH-012",
    linkedSite: "JHB South",
    linkedDept: "Operations",
    revision: "v3.0",
    reviewDate: "2026-08-20",
    status: "approved",
    assignedEmployees: 45,
    signedEmployees: 45,
    signOffRate: 100,
    category: "baseline",
    requiredRoles: [
      { role: "Worker", totalEmployees: 30, signedEmployees: 30 },
      { role: "Supervisor", totalEmployees: 15, signedEmployees: 15 },
    ],
  },
  {
    id: "RA-003",
    assessmentName: "Confined Space Entry - Tank Cleaning",
    referenceNo: "RA-CSE-007",
    linkedSite: "Pretoria East",
    linkedDept: "Production",
    revision: "v1.5",
    reviewDate: "2026-03-15",
    status: "under-review",
    assignedEmployees: 12,
    signedEmployees: 8,
    signOffRate: 67,
    category: "task-based",
    requiredRoles: [
      { role: "Technician", totalEmployees: 5, signedEmployees: 4 },
      { role: "Supervisor", totalEmployees: 2, signedEmployees: 1 },
    ],
  },
  {
    id: "RA-004",
    assessmentName: "Electrical Work - Sub-station Maintenance",
    referenceNo: "RA-EL-019",
    linkedSite: "JHB South",
    linkedDept: "Electrical",
    revision: "v2.3",
    reviewDate: "2026-05-10",
    status: "approved",
    assignedEmployees: 15,
    signedEmployees: 13,
    signOffRate: 87,
    category: "task-based",
    requiredRoles: [
      { role: "Electrician", totalEmployees: 10, signedEmployees: 9 },
      { role: "Supervisor", totalEmployees: 5, signedEmployees: 4 },
    ],
  },
  {
    id: "RA-005",
    assessmentName: "Chemical Handling & Storage - Site Wide",
    referenceNo: "RA-CH-002",
    linkedSite: "Durban North",
    linkedDept: "Health & Safety",
    revision: "v1.0",
    reviewDate: "2026-09-30",
    status: "draft",
    assignedEmployees: 0,
    signedEmployees: 0,
    signOffRate: 0,
    category: "baseline",
    requiredRoles: [
      { role: "Chemist", totalEmployees: 5, signedEmployees: 0 },
      { role: "Supervisor", totalEmployees: 2, signedEmployees: 0 },
    ],
  },
  {
    id: "RA-006",
    assessmentName: "Mobile Plant Operations - Forklifts",
    referenceNo: "RA-MPO-008",
    linkedSite: "JHB South",
    linkedDept: "Logistics",
    revision: "v4.2",
    reviewDate: "2026-07-18",
    status: "approved",
    assignedEmployees: 22,
    signedEmployees: 22,
    signOffRate: 100,
    category: "baseline",
    requiredRoles: [
      { role: "Operator", totalEmployees: 15, signedEmployees: 15 },
      { role: "Supervisor", totalEmployees: 7, signedEmployees: 7 },
    ],
  },
  {
    id: "RA-007",
    assessmentName: "Emergency Response - Fire Incident",
    referenceNo: "RA-ER-015",
    linkedSite: "Pretoria East",
    linkedDept: "Health & Safety",
    revision: "v2.0",
    reviewDate: "2026-04-25",
    status: "approved",
    assignedEmployees: 58,
    signedEmployees: 52,
    signOffRate: 90,
    category: "issue-based",
    requiredRoles: [
      { role: "Firefighter", totalEmployees: 30, signedEmployees: 26 },
      { role: "Supervisor", totalEmployees: 28, signedEmployees: 26 },
    ],
  },
  {
    id: "RA-008",
    assessmentName: "Excavation Works - Trenching",
    referenceNo: "RA-EX-011",
    linkedSite: "Cape Town",
    linkedDept: "Civil Works",
    revision: "v1.2",
    reviewDate: "2026-02-14",
    status: "under-review",
    assignedEmployees: 18,
    signedEmployees: 14,
    signOffRate: 78,
    category: "task-based",
    requiredRoles: [
      { role: "Excavator Operator", totalEmployees: 10, signedEmployees: 8 },
      { role: "Supervisor", totalEmployees: 8, signedEmployees: 6 },
    ],
  },
  {
    id: "RA-009",
    assessmentName: "Lifting Operations - Crane Work",
    referenceNo: "RA-LO-006",
    linkedSite: "Durban North",
    linkedDept: "Operations",
    revision: "v3.1",
    reviewDate: "2026-10-08",
    status: "approved",
    assignedEmployees: 9,
    signedEmployees: 7,
    signOffRate: 78,
    category: "task-based",
    requiredRoles: [
      { role: "Crane Operator", totalEmployees: 5, signedEmployees: 4 },
      { role: "Supervisor", totalEmployees: 4, signedEmployees: 3 },
    ],
  },
  {
    id: "RA-010",
    assessmentName: "COVID-19 Exposure Management",
    referenceNo: "RA-COVID-001",
    linkedSite: "All Sites",
    linkedDept: "Health & Safety",
    revision: "v5.3",
    reviewDate: "2026-01-30",
    status: "approved",
    assignedEmployees: 234,
    signedEmployees: 198,
    signOffRate: 85,
    category: "issue-based",
    requiredRoles: [
      { role: "Health Officer", totalEmployees: 50, signedEmployees: 42 },
      { role: "Supervisor", totalEmployees: 184, signedEmployees: 156 },
    ],
  },
  {
    id: "RA-011",
    assessmentName: "Asbestos Removal - Building Demolition",
    referenceNo: "RA-ASB-003",
    linkedSite: "JHB South",
    linkedDept: "Maintenance",
    revision: "v1.0",
    reviewDate: "2026-11-12",
    status: "draft",
    assignedEmployees: 0,
    signedEmployees: 0,
    signOffRate: 0,
    category: "issue-based",
    requiredRoles: [
      { role: "Removal Specialist", totalEmployees: 5, signedEmployees: 0 },
      { role: "Supervisor", totalEmployees: 2, signedEmployees: 0 },
    ],
  },
  {
    id: "RA-012",
    assessmentName: "Noise Exposure - Production Floor",
    referenceNo: "RA-NE-009",
    linkedSite: "Pretoria East",
    linkedDept: "Production",
    revision: "v2.4",
    reviewDate: "2026-06-05",
    status: "approved",
    assignedEmployees: 67,
    signedEmployees: 61,
    signOffRate: 91,
    category: "baseline",
    requiredRoles: [
      { role: "Worker", totalEmployees: 50, signedEmployees: 46 },
      { role: "Supervisor", totalEmployees: 17, signedEmployees: 15 },
    ],
  },
];

type AssessmentCategory = "all" | "baseline" | "task-based" | "issue-based";

export function RiskAssessmentRegister() {
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategory>("all");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  // Extract unique sites and departments
  const sites = ["All Sites", ...Array.from(new Set(riskAssessments.map((ra) => ra.linkedSite))).sort()];
  const departments = [
    "All Departments",
    ...Array.from(new Set(riskAssessments.map((ra) => ra.linkedDept))).sort(),
  ];

  // Filter assessments
  const filteredAssessments = riskAssessments.filter((assessment) => {
    const matchesCategory = selectedCategory === "all" || assessment.category === selectedCategory;
    const matchesSite = selectedSite === "All Sites" || assessment.linkedSite === selectedSite;
    const matchesDept = selectedDept === "All Departments" || assessment.linkedDept === selectedDept;
    return matchesCategory && matchesSite && matchesDept;
  });

  const getStatusBadge = (status: "approved" | "draft" | "under-review") => {
    switch (status) {
      case "approved":
        return {
          color: "var(--compliance-success)",
          bgColor: "var(--compliance-success)15",
          label: "Approved",
        };
      case "draft":
        return {
          color: "var(--grey-600)",
          bgColor: "var(--grey-100)",
          label: "Draft",
        };
      case "under-review":
        return {
          color: "var(--compliance-warning)",
          bgColor: "var(--compliance-warning)15",
          label: "Under Review",
        };
    }
  };

  const getSignOffColor = (rate: number) => {
    if (rate >= 90) return "var(--compliance-success)";
    if (rate >= 70) return "var(--compliance-warning)";
    return "var(--compliance-danger)";
  };

  // Statistics
  const totalAssessments = filteredAssessments.length;
  const approvedCount = filteredAssessments.filter((ra) => ra.status === "approved").length;
  const draftCount = filteredAssessments.filter((ra) => ra.status === "draft").length;
  const underReviewCount = filteredAssessments.filter((ra) => ra.status === "under-review").length;
  const avgSignOffRate = filteredAssessments.length > 0
    ? Math.round(
        filteredAssessments.reduce((sum, ra) => sum + ra.signOffRate, 0) / filteredAssessments.length
      )
    : 0;

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
          <h1 className="text-3xl" style={{ color: "var(--grey-900)" }}>
            Risk Assessment Repository
          </h1>

          {/* Action Button */}
          <button
            className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            <Plus className="size-4" />
            Create/Upload New Assessment
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("all")}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor:
                selectedCategory === "all" ? "var(--brand-blue)" : "transparent",
              color: selectedCategory === "all" ? "white" : "var(--grey-700)",
              border: selectedCategory === "all" ? "none" : "1px solid var(--grey-300)",
            }}
          >
            All Assessments
          </button>
          <button
            onClick={() => setSelectedCategory("baseline")}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor:
                selectedCategory === "baseline" ? "var(--brand-blue)" : "transparent",
              color: selectedCategory === "baseline" ? "white" : "var(--grey-700)",
              border: selectedCategory === "baseline" ? "none" : "1px solid var(--grey-300)",
            }}
          >
            Baseline RAs
          </button>
          <button
            onClick={() => setSelectedCategory("task-based")}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor:
                selectedCategory === "task-based" ? "var(--brand-blue)" : "transparent",
              color: selectedCategory === "task-based" ? "white" : "var(--grey-700)",
              border: selectedCategory === "task-based" ? "none" : "1px solid var(--grey-300)",
            }}
          >
            Task-Based RAs
          </button>
          <button
            onClick={() => setSelectedCategory("issue-based")}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor:
                selectedCategory === "issue-based" ? "var(--brand-blue)" : "transparent",
              color: selectedCategory === "issue-based" ? "white" : "var(--grey-700)",
              border: selectedCategory === "issue-based" ? "none" : "1px solid var(--grey-300)",
            }}
          >
            Issue-Based RAs
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
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{
              borderColor: "var(--grey-300)",
              color: "var(--grey-900)",
            }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
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
            Total Assessments
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--grey-900)" }}>
            {totalAssessments}
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
            Approved
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--compliance-success)" }}>
            {approvedCount}
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
            Under Review
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--compliance-warning)" }}>
            {underReviewCount}
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
            Drafts
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--grey-600)" }}>
            {draftCount}
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
            Avg. Sign-off Rate
          </p>
          <p className="text-2xl font-bold" style={{ color: getSignOffColor(avgSignOffRate) }}>
            {avgSignOffRate}%
          </p>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <div className="overflow-auto">
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
                      Assessment Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Reference No.
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Linked Site / Dept
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Revision / Version
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Review Date
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                      Sign-off Rate
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => {
                  const statusBadge = getStatusBadge(assessment.status);
                  const signOffColor = getSignOffColor(assessment.signOffRate);

                  return (
                    <tr
                      key={assessment.id}
                      className="border-b hover:bg-secondary transition-colors cursor-pointer"
                      style={{ borderColor: "var(--grey-200)" }}
                    >
                      {/* Assessment Name */}
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: "var(--grey-900)" }}>
                          {assessment.assessmentName}
                        </div>
                      </td>

                      {/* Reference No */}
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-sm font-medium"
                          style={{ color: "var(--brand-blue)" }}
                        >
                          {assessment.referenceNo}
                        </span>
                      </td>

                      {/* Linked Site/Dept */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                            {assessment.linkedSite}
                          </div>
                          <div className="text-sm" style={{ color: "var(--grey-600)" }}>
                            {assessment.linkedDept}
                          </div>
                        </div>
                      </td>

                      {/* Revision/Version */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-medium"
                          style={{
                            backgroundColor: "var(--grey-100)",
                            color: "var(--grey-700)",
                          }}
                        >
                          {assessment.revision}
                        </span>
                      </td>

                      {/* Review Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                          {new Date(assessment.reviewDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusBadge.bgColor,
                            color: statusBadge.color,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Sign-off Rate */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Progress Bar */}
                          <div className="flex-1 max-w-[120px]">
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: "var(--grey-200)" }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${assessment.signOffRate}%`,
                                  backgroundColor: signOffColor,
                                }}
                              />
                            </div>
                          </div>
                          {/* Percentage & Count */}
                          <div className="flex-shrink-0">
                            <div
                              className="text-sm font-bold"
                              style={{ color: signOffColor }}
                            >
                              {assessment.signOffRate}%
                            </div>
                            <div className="text-xs" style={{ color: "var(--grey-500)" }}>
                              {assessment.signedEmployees}/{assessment.assignedEmployees}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: "var(--grey-500)" }}>
              No risk assessments found matching the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}