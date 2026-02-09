import { useState } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";
import { ConfirmDeactivationModal } from "@/app/components/confirm-deactivation-modal";
import { NewRiskAssessment } from "@/app/components/new-risk-assessment";

/* ================= TYPES ================= */

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

/* ================= MOCK DATA ================= */

const initialAssessments: RiskAssessment[] = [
  {
    id: "RA-001",
    assessmentName: "Hot Work & Welding - Workshop A",
    referenceNo: "RA-HW-004",
    linkedSite: "JHB South",
    linkedDept: "Maintenance",
    revision: "v2.1",
    reviewDate: "2026-06-12",
    expiryDate: "2026-12-31",
    status: "expired",
    assignedEmployees: 28,
    signedEmployees: 24,
    signOffRate: 86,
    category: "task-based",
  },
];

/* ================= COMPONENT ================= */

export function RiskAssessmentRegisterEnhanced() {
  const { colors } = useTheme();
  const { dismissAlert } = useAlerts();

  /* ---------- STATE ---------- */
  const [assessments, setAssessments] =
    useState<RiskAssessment[]>(initialAssessments);

  const [showNewRAWizard, setShowNewRAWizard] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<RiskAssessment | null>(null);

  /* ---------- DERIVED ---------- */
  const expiredCount = assessments.filter(
    (a) => a.status === "expired"
  ).length;

  /* ---------- HANDLERS ---------- */
  const handleDeleteClick = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (selectedAssessment) {
      setAssessments((prev) =>
        prev.filter((a) => a.id !== selectedAssessment.id)
      );
    }
    setModalOpen(false);
  };

  const getStatusIcon = (status: RiskAssessment["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="size-4 text-green-600" />;
      case "expired":
        return <XCircle className="size-4 text-red-600" />;
      case "under-review":
        return <AlertTriangle className="size-4 text-yellow-600" />;
      case "draft":
        return <XCircle className="size-4 text-gray-400" />;
    }
  };

  /* ================= RENDER ================= */

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* -------- PAGE HEADER -------- */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Risk Assessment Register
          </h1>

          <button
            onClick={() => setShowNewRAWizard(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-4" />
            New Risk Assessment
          </button>
        </div>

        {/* -------- EXPIRED ALERT -------- */}
        {expiredCount > 0 && (
          <AlertBanner
            id="risk-assessment-expired-alert"
            type="critical"
            icon={<AlertTriangle className="size-5" />}
            title={`${expiredCount} risk assessment${
              expiredCount !== 1 ? "s" : ""
            } expired`}
            description="These assessments require urgent review and re-approval"
            onDismiss={() =>
              dismissAlert(
                "risk-assessment-expired-alert",
                `${expiredCount} risk assessments expired`,
                "critical"
              )
            }
          />
        )}

        {/* -------- TABLE -------- */}
        <div className="bg-white rounded-lg shadow overflow-hidden text-gray-900">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="px-4 py-3 text-left">Assessment</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No risk assessments found
                  </td>
                </tr>
              )}

              {assessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    {assessment.assessmentName}
                  </td>
                  <td className="px-4 py-3">
                    {assessment.referenceNo}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {getStatusIcon(assessment.status)}
                    {assessment.status}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteClick(assessment)}
                      className="text-red-600 hover:text-red-800"
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

      {/* -------- NEW RA WIZARD MODAL -------- */}
      {showNewRAWizard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowNewRAWizard(false)}
            >
              ✕
            </button>

            <NewRiskAssessment
              onSave={(newRA) => {
                setAssessments((prev) => [
                  {
                    id: `RA-${(prev.length + 1)
                      .toString()
                      .padStart(3, "0")}`,
                    assessmentName: newRA.hazard,
                    referenceNo: `RA-NEW-${prev.length + 1}`,
                    linkedSite: "TBD",
                    linkedDept: "TBD",
                    revision: "v1.0",
                    reviewDate: newRA.assessmentDate,
                    expiryDate: newRA.assessmentDate,
                    status: "draft",
                    assignedEmployees:
                      newRA.assignedEmployees.length,
                    signedEmployees: 0,
                    signOffRate: 0,
                    category: "task-based",
                  },
                  ...prev,
                ]);

                setShowNewRAWizard(false);
              }}
            />
          </div>
        </div>
      )}

      {/* -------- CONFIRM ARCHIVE MODAL -------- */}
      <ConfirmDeactivationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmArchive}
        itemName={selectedAssessment?.assessmentName}
      />
    </div>
  );
}
