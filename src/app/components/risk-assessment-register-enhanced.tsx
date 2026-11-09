import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Printer } from "lucide-react";
import { useTheme } from "../contexts/theme-context";
import { useAuth } from "../contexts/auth-context";
import { ConfirmDeactivationModal } from "../components/confirm-deactivation-modal";
import { NewRiskAssessment } from "../components/new-risk-assessment";
import { getSites } from "../../api/siteAPI";
import {
  RiskAssessmentRecord,
  getRiskAssessments,
  saveRiskAssessmentToRegister,
  deleteRiskAssessmentRecord,
} from "../utils/risk-assessment-api";

interface SiteOption {
  id: string;
  name: string;
}

export function RiskAssessmentRegisterEnhanced() {
  const { colors } = useTheme();
  const { user } = useAuth();
  // Clients have full access, but only for their own site(s).
  const clientCompany = user?.role === "client" ? user.company : null;
  const isClient = !!clientCompany;

  const [assessments, setAssessments] = useState<RiskAssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [creatingRA, setCreatingRA] = useState(false);
  const [editingRA, setEditingRA] = useState<RiskAssessmentRecord | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<RiskAssessmentRecord | null>(null);

  // Which site the assessment is for. Staff pick any site; clients are limited
  // to their own (auto-selected when they only have one).
  const [siteOptions, setSiteOptions] = useState<SiteOption[]>([]);
  const [siteId, setSiteId] = useState("");

  const clientSingleSite = isClient && siteOptions.length === 1;
  const effectiveSiteId =
    siteId || (clientSingleSite ? siteOptions[0].id : "");

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

  useEffect(() => {
    getSites()
      .then((data: any[]) => {
        const all = data.map((s) => ({ id: String(s.id), name: s.name }));

        if (clientCompany) {
          const mine = all.filter(
            (s) =>
              s.id === String(clientCompany.id) || s.name === clientCompany.name,
          );
          setSiteOptions(
            mine.length > 0
              ? mine
              : [{ id: String(clientCompany.id), name: clientCompany.name }],
          );
        } else {
          setSiteOptions(all);
        }
      })
      .catch((err) => console.error("Failed to load sites:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientCompany?.id]);

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

        {/* Clients with a single site don't need to choose */}
        {!clientSingleSite && (
          <div className="mb-4 max-w-md">
            <label className="block text-sm font-medium mb-1 text-white">
              Site this assessment is for *
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full border p-2 rounded text-gray-900 bg-white"
            >
              <option value="">Select Site</option>
              {siteOptions.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <NewRiskAssessment
          existingData={editingRA?.rawData}
          onCancel={() => {
            setCreatingRA(false);
            setEditingRA(null);
            setSiteId("");
          }}
          onSave={async (newRA) => {
            if (!effectiveSiteId) {
              alert("Please select the site this assessment is for.");
              return;
            }
            try {
              setSaving(true);
              await saveRiskAssessmentToRegister({
                id: editingRA?.id,
                siteId: effectiveSiteId,
                beforeControls: newRA.beforeControls,
                afterControls: newRA.afterControls,
                details: newRA.details,
                pdfBlob: newRA.pdfBlob,
              });
              await loadAssessments();
              setCreatingRA(false);
              setEditingRA(null);
              setSiteId("");
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

  // Clients with one site don't need a Site column
  const showSiteColumn = !clientSingleSite;

  return (
    <div className="h-full w-full p-6 overflow-y-auto text-gray-900">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Risk Assessment Register
          </h1>

          <button
            onClick={() => {
              setSiteId("");
              setCreatingRA(true);
            }}
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
                {showSiteColumn && (
                  <th className="px-4 py-3 text-left">Site</th>
                )}
                <th className="px-4 py-3 text-left">Saved Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-3" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              )}

              {!loading && assessments.length === 0 && (
                <tr>
                  <td className="px-4 py-3" colSpan={5}>
                    No risk assessments yet.
                  </td>
                </tr>
              )}

              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-t">
                  <td className="px-4 py-3">{assessment.assessmentName}</td>
                  <td className="px-4 py-3">{assessment.referenceNo}</td>
                  {showSiteColumn && (
                    <td className="px-4 py-3">
                      {assessment.siteId ? (
                        assessment.linkedSite
                      ) : (
                        <span className="text-red-600">No site set</span>
                      )}
                    </td>
                  )}
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
                        onClick={() =>
                          window.open(assessment.pdfUrl!, "_blank")
                        }
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
                        setSiteId(assessment.siteId);
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