import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Printer } from "lucide-react";
import { useTheme } from "../contexts/theme-context";
import { ConfirmDeactivationModal } from "../components/confirm-deactivation-modal";
import { NewRiskAssessment } from "../components/new-risk-assessment";
import {
  RiskAssessmentRecord,
  getRiskAssessments,
  saveRiskAssessmentToRegister,
  deleteRiskAssessmentRecord,
} from "../utils/risk-assessment-api";

export function RiskAssessmentRegisterEnhanced() {
  const { colors } = useTheme();

  const [assessments, setAssessments] = useState<RiskAssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [creatingRA, setCreatingRA] = useState(false);
  const [editingRA, setEditingRA] = useState<RiskAssessmentRecord | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<RiskAssessmentRecord | null>(null);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const rows = await getRiskAssessments();
      setAssessments(rows);
    } catch (err) {
      console.error("Failed to load risk assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  /* ===============================
     CREATE / EDIT VIEW
  =============================== */

  if (creatingRA || editingRA) {
    return (
      <div className="h-full w-full p-6 overflow-y-auto">
        {saving && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
            Saving risk assessment…
          </div>
        )}

        <NewRiskAssessment
          existingData={editingRA?.rawData}
          onCancel={() => {
            setCreatingRA(false);
            setEditingRA(null);
          }}
          onSave={async (newRA) => {
            try {
              setSaving(true);
              await saveRiskAssessmentToRegister({
                id: editingRA?.id,
                beforeControls: newRA.beforeControls,
                afterControls: newRA.afterControls,
                details: newRA.details,
                pdfBlob: newRA.pdfBlob,
              });
              await loadAssessments();
              setCreatingRA(false);
              setEditingRA(null);
            } catch (err) {
              console.error("Failed to save risk assessment:", err);
              alert("Failed to save the risk assessment. Please try again.");
            } finally {
              setSaving(false);
            }
          }}
        />
      </div>
    );
  }

  /* ===============================
     MAIN REGISTER VIEW
  =============================== */

  return (
    <div className="h-full w-full p-6 overflow-y-auto text-gray-900">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Risk Assessment Register
          </h1>

          <button
            onClick={() => setCreatingRA(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            <Plus className="size-4 inline mr-2" />
            New Risk Assessment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Assessment</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Saved Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-3" colSpan={4}>
                    Loading…
                  </td>
                </tr>
              )}

              {!loading && assessments.length === 0 && (
                <tr>
                  <td className="px-4 py-3" colSpan={4}>
                    No risk assessments yet.
                  </td>
                </tr>
              )}

              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-t">
                  <td className="px-4 py-3">{assessment.assessmentName}</td>
                  <td className="px-4 py-3">{assessment.referenceNo}</td>
                  <td className="px-4 py-3">
                    {assessment.savedDate
                      ? new Date(assessment.savedDate).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-4">
                    {assessment.pdfUrl && (
                      <button
                        onClick={() => window.open(assessment.pdfUrl!, "_blank")}
                        className="text-blue-600"
                        title="View PDF"
                      >
                        <FileText className="size-4" />
                      </button>
                    )}

                    {assessment.pdfUrl && (
                      <button
                        onClick={() => {
                          const printWindow = window.open(assessment.pdfUrl!);
                          if (printWindow) {
                            printWindow.onload = () => printWindow.print();
                          }
                        }}
                        className="text-green-600"
                        title="Print"
                      >
                        <Printer className="size-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingRA(assessment);
                        setCreatingRA(true);
                      }}
                      className="text-green-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setModalOpen(true);
                      }}
                      className="text-red-600"
                      title="Delete"
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

      <ConfirmDeactivationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={async () => {
          if (selectedAssessment) {
            try {
              await deleteRiskAssessmentRecord(selectedAssessment.id);
              await loadAssessments();
            } catch (err) {
              console.error("Failed to delete risk assessment:", err);
              alert("Failed to delete the risk assessment.");
            }
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}