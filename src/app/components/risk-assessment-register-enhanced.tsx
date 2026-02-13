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

  const [assessments, setAssessments] =
    useState<RiskAssessment[]>(initialAssessments);

  const [creatingRA, setCreatingRA] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<RiskAssessment | null>(null);

  const expiredCount = assessments.filter(
    (a) => a.status === "expired"
  ).length;

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

  /* ================= IF CREATING RA → SHOW PAGE ================= */

  if (creatingRA) {
    return (
      <div
        className="h-full w-full p-6 overflow-y-auto"
        style={{ backgroundColor: colors.background }}
      >
        <div className="max-w-[1400px] mx-auto">
          <NewRiskAssessment
            onCancel={() => setCreatingRA(false)}
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

              setCreatingRA(false);
            }}
          />
        </div>
      </div>
    );
  }

  /* ================= REGISTER PAGE ================= */

  return (
    <div
      className="h-full w-full p-6 overflow-y-auto"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Risk Assessment Register
          </h1>

          <button
            onClick={() => setCreatingRA(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-4" />
            New Risk Assessment
          </button>
        </div>

        {/* ALERT */}
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

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden text-gray-900">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-100">
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

      {/* CONFIRM MODAL */}
      <ConfirmDeactivationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmArchive}
        itemName={selectedAssessment?.assessmentName}
      />
    </div>
  );
}
