import { useState } from "react";
import { Plus, Filter, Trash2, AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";
import { ConfirmDeactivationModal } from "@/app/components/confirm-deactivation-modal";

interface RiskAssessment {
  id: string;
  assessmentName: string;
  referenceNo: string;
  linkedSite: string;
  linkedDept: string;
  revision: string;
  reviewDate: string;
  expiryDate: string;
  status: "approved" | "draft" | "under-review" | "expired";
  signOffRate: number;
  assignedEmployees: number;
  signedEmployees: number;
  category: "baseline" | "task-based" | "issue-based";
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
    expiryDate: "2023-12-31",
    status: "expired",
    assignedEmployees: 28,
    signedEmployees: 24,
    signOffRate: 86,
    category: "task-based",
  },
  {
    id: "RA-002",
    assessmentName: "Working at Heights - General",
    referenceNo: "RA-WAH-012",
    linkedSite: "JHB South",
    linkedDept: "Operations",
    revision: "v3.0",
    reviewDate: "2026-08-20",
    expiryDate: "2027-08-20",
    status: "approved",
    assignedEmployees: 45,
    signedEmployees: 45,
    signOffRate: 100,
    category: "baseline",
  },
  {
    id: "RA-003",
    assessmentName: "Confined Space Entry - Tank Cleaning",
    referenceNo: "RA-CSE-007",
    linkedSite: "Pretoria East",
    linkedDept: "Production",
    revision: "v1.5",
    reviewDate: "2026-03-15",
    expiryDate: "2027-03-15",
    status: "under-review",
    assignedEmployees: 12,
    signedEmployees: 8,
    signOffRate: 67,
    category: "task-based",
  },
  {
    id: "RA-004",
    assessmentName: "Electrical Isolation Procedures",
    referenceNo: "RA-EI-009",
    linkedSite: "Cape Town Depot",
    linkedDept: "Electrical",
    revision: "v2.0",
    reviewDate: "2026-10-01",
    expiryDate: "2027-10-01",
    status: "approved",
    assignedEmployees: 16,
    signedEmployees: 14,
    signOffRate: 88,
    category: "baseline",
  },
  {
    id: "RA-005",
    assessmentName: "Chemical Spill Response",
    referenceNo: "RA-CS-015",
    linkedSite: "Durban Operations",
    linkedDept: "SHEQ",
    revision: "v1.0",
    reviewDate: "2026-05-15",
    expiryDate: "2027-05-15",
    status: "draft",
    assignedEmployees: 0,
    signedEmployees: 0,
    signOffRate: 0,
    category: "issue-based",
  },
];

const sites = [
  "All Sites",
  "JHB South",
  "Pretoria East",
  "Cape Town Depot",
  "Durban Operations",
];

const departments = [
  "All Departments",
  "Maintenance",
  "Operations",
  "Production",
  "Electrical",
  "SHEQ",
];

const categories = [
  { id: "all", label: "All Assessments" },
  { id: "baseline", label: "Baseline RAs" },
  { id: "task-based", label: "Task-Based RAs" },
  { id: "issue-based", label: "Issue-Based RAs" },
];

export function RiskAssessmentRegisterEnhanced() {
  const { colors } = useTheme();
  const { dismissAlert } = useAlerts();
  const [assessments, setAssessments] = useState(riskAssessments);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);

  const expiredCount = assessments.filter((a) => a.status === "expired").length;

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesCategory = selectedCategory === "all" || assessment.category === selectedCategory;
    const matchesSite = selectedSite === "All Sites" || assessment.linkedSite === selectedSite;
    const matchesDept = selectedDept === "All Departments" || assessment.linkedDept === selectedDept;
    return matchesCategory && matchesSite && matchesDept;
  });

  const totalAssessments = filteredAssessments.length;
  const approvedCount = filteredAssessments.filter((a) => a.status === "approved").length;
  const draftCount = filteredAssessments.filter((a) => a.status === "draft").length;
  const underReviewCount = filteredAssessments.filter((a) => a.status === "under-review").length;
  const expiredOrOverdueCount = filteredAssessments.filter((a) => a.status === "expired").length;
  const avgSignOffRate =
    filteredAssessments.length > 0
      ? Math.round(filteredAssessments.reduce((sum, a) => sum + a.signOffRate, 0) / filteredAssessments.length)
      : 0;

  const handleDeleteClick = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (selectedAssessment) {
      setAssessments((prev) => prev.filter((a) => a.id !== selectedAssessment.id));
      setSelectedAssessment(null);
    }
  };

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `${expiredCount} risk assessments expired`, "critical");
  };

  const getStatusIcon = (status: RiskAssessment["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="size-4" style={{ color: "var(--compliance-success)" }} />;
      case "expired":
        return <XCircle className="size-4" style={{ color: "var(--compliance-danger)" }} />;
      case "under-review":
        return <AlertTriangle className="size-4" style={{ color: "var(--compliance-warning)" }} />;
      case "draft":
        return <XCircle className="size-4" style={{ color: "var(--grey-500)" }} />;
    }
  };

  const getStatusColor = (status: RiskAssessment["status"]) => {
    switch (status) {
      case "approved":
        return "var(--compliance-success)";
      case "expired":
        return "var(--compliance-danger)";
      case "under-review":
        return "var(--compliance-warning)";
      case "draft":
        return "var(--grey-500)";
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: colors.background }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Notification Bar - Full Width */}
        {expiredCount > 0 && (
          <AlertBanner
            id="risk-assessment-expired-alert"
            type="critical"
            icon={<AlertTriangle className="size-5" />}
            title={`${expiredCount} risk assessment${expiredCount !== 1 ? "s" : ""} expired`}
            description="These assessments require urgent review and re-approval"
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: colors.primaryText }}>
                Risk Assessment Repository
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                <p className="text-sm" style={{ color: colors.subText }}>
                  ISO 45001 Compliant: Controlled Document Management
                </p>
              </div>
            </div>
            <button
              className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Plus className="size-4" />
              Create/Upload New Assessment
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-5 py-2.5 rounded-lg font-medium transition-all text-sm"
                style={{
                  backgroundColor: selectedCategory === cat.id ? "var(--brand-blue)" : colors.surface,
                  color: selectedCategory === cat.id ? "white" : colors.primaryText,
                  border: "none",
                }}
              >
                {cat.label}
              </button>
            ))}
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
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
                border: "none",
              }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Total Assessments
              </p>
              <p className="text-3xl font-bold" style={{ color: colors.primaryText }}>
                {totalAssessments}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Approved
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {approvedCount}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Under Review
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-warning)" }}
              >
                {underReviewCount}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Drafts
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {draftCount}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Expired / Overdue
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-danger)" }}
              >
                {expiredOrOverdueCount}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Avg. Sign-off Rate
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-warning)" }}
              >
                {avgSignOffRate}%
              </p>
            </div>
          </div>

          {/* Table */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      colors.background === "#0F172A"
                        ? "rgba(15, 23, 42, 0.6)"
                        : "var(--grey-100)",
                  }}
                >
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Assessment Name
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Reference No
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Linked Site / Dept
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Revision / Category
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Review Date
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Sign-off Rate
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.subText }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment, index) => (
                  <tr
                    key={assessment.id}
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? colors.surface
                          : colors.background === "#0F172A"
                          ? "rgba(30, 41, 59, 0.5)"
                          : "var(--grey-50)",
                    }}
                  >
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colors.primaryText }}
                    >
                      {assessment.assessmentName}
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-mono"
                      style={{ color: colors.subText }}
                    >
                      {assessment.referenceNo}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colors.subText }}
                    >
                      {assessment.linkedSite} / {assessment.linkedDept}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colors.subText }}
                    >
                      {assessment.revision} / {assessment.category}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colors.subText }}
                    >
                      {assessment.reviewDate}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(assessment.status)}
                        <span style={{ color: getStatusColor(assessment.status) }}>
                          {assessment.status === "under-review"
                            ? "Under Review"
                            : assessment.status.charAt(0).toUpperCase() +
                              assessment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        style={{
                          color:
                            assessment.signOffRate >= 90
                              ? "var(--compliance-success)"
                              : assessment.signOffRate >= 70
                              ? "var(--compliance-warning)"
                              : "var(--compliance-danger)",
                        }}
                      >
                        {assessment.signOffRate}%
                      </span>
                      <span
                        className="ml-2"
                        style={{ color: colors.subText }}
                      >
                        ({assessment.signedEmployees}/{assessment.assignedEmployees})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleDeleteClick(assessment)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--compliance-danger)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.background === "#0F172A"
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(239, 68, 68, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      <ConfirmDeactivationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAssessment(null);
        }}
        onConfirm={handleConfirmArchive}
        title="Archive Risk Assessment?"
        message={
          selectedAssessment
            ? `Are you sure you want to archive "${selectedAssessment.assessmentName}"? This assessment will be moved to the Recycle Bin and can be restored later.`
            : ""
        }
        actionLabel="Archive Assessment"
      />
    </div>
  );
}
