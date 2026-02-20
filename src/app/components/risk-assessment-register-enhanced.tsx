import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Pencil,
  Printer,
} from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useAlerts } from "@/app/contexts/alert-context";
import { ConfirmDeactivationModal } from "@/app/components/confirm-deactivation-modal";
import { AfterControlsData, BeforeControlsData, DetailsData, NewRiskAssessment } from "@/app/components/new-risk-assessment";

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
  pdfBlob?: string;
  rawData?: {
  beforeControls: BeforeControlsData;
  afterControls: AfterControlsData | null;
  details: DetailsData;
};

}

export function RiskAssessmentRegisterEnhanced() {
  
  const { colors } = useTheme();
  const { dismissAlert } = useAlerts();
  

  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [creatingRA, setCreatingRA] = useState(false);
  const [editingRA, setEditingRA] = useState<RiskAssessment | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<RiskAssessment | null>(null);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("riskRegister") || "[]"
    );
    setAssessments(stored);
  }, []);

  const saveToStorage = (data: RiskAssessment[]) => {
    localStorage.setItem("riskRegister", JSON.stringify(data));
  };

  /* ===============================
     CREATE / EDIT VIEW
  =============================== */

  if (creatingRA || editingRA) {
    return (
      <div className="h-full w-full p-6 overflow-y-auto">
        <NewRiskAssessment
          existingData={editingRA?.rawData}
          onCancel={() => {
            setCreatingRA(false);
            setEditingRA(null);
          }}
          onSave={(newRA) => {
  if (editingRA) {
    // ✅ UPDATE EXISTING
    const updated = assessments.map((a) =>
      a.id === editingRA.id
        ? {
            ...a,
            assessmentName:
              newRA.details.taskDescription,
            reviewDate:
              newRA.details.assessmentDate,
            expiryDate:
              newRA.details.assessmentDate,
            assignedEmployees:
              newRA.details.assessors.filter(Boolean)
                .length,
            pdfBlob: newRA.pdfBlob,
            rawData: {
              beforeControls:
                newRA.beforeControls,
              afterControls:
                newRA.afterControls,
              details: newRA.details,
            },
          }
        : a
    );

    setAssessments(updated);
    saveToStorage(updated);
  } else {
    // ✅ CREATE NEW
    const newAssessment: RiskAssessment = {
      id: `RA-${(assessments.length + 1)
        .toString()
        .padStart(3, "0")}`,
      assessmentName:
        newRA.details.taskDescription,
      referenceNo: `RA-NEW-${
        assessments.length + 1
      }`,
      linkedSite: "TBD",
      linkedDept: "TBD",
      revision: "v1.0",
      reviewDate:
        newRA.details.assessmentDate,
      expiryDate:
        newRA.details.assessmentDate,
      status: "draft",
      assignedEmployees:
        newRA.details.assessors.filter(Boolean)
          .length,
      signedEmployees: 0,
      signOffRate: 0,
      category: "task-based",
      pdfBlob: newRA.pdfBlob,
      rawData: {
        beforeControls:
          newRA.beforeControls,
        afterControls:
          newRA.afterControls,
        details: newRA.details,
      },
    };

    const updated = [newAssessment, ...assessments];
    setAssessments(updated);
    saveToStorage(updated);
  }

  setCreatingRA(false);
  setEditingRA(null);
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
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-t">
                  <td className="px-4 py-3">
                    {assessment.assessmentName}
                  </td>
                  <td className="px-4 py-3">
                    {assessment.referenceNo}
                  </td>
                  <td className="px-4 py-3 flex gap-4">

                    {/* VIEW PDF */}
                    {assessment.pdfBlob && (
  <button
    onClick={() => {
      const byteString = atob(
        assessment.pdfBlob.split(",")[1]
      );

      const mimeString =
        assessment.pdfBlob.split(",")[0].split(":")[1].split(";")[0];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    }}
    className="text-blue-600"
  >
    <FileText className="size-4" />
  </button>
)}


                    {/* PRINT */}
                    {assessment.pdfBlob && (
                      <button
                        onClick={() => {
  if (!assessment.pdfBlob) return;

  // Convert base64 back to Blob
  const byteString = atob(
    assessment.pdfBlob.split(",")[1]
  );

  const mimeString =
    assessment.pdfBlob.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url);

  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}}

                        className="text-green-600"
                        title="Print"
                      >
                        <Printer className="size-4" />
                      </button>
                    )}

                    {/* EDIT */}
                    <button
  onClick={() => {
    setEditingRA(assessment);
    setCreatingRA(true);
  }}
  className="text-green-600"
>
  Edit
</button>


                    {/* DELETE */}
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
        onConfirm={() => {
          if (selectedAssessment) {
            const updated = assessments.filter(
              (a) => a.id !== selectedAssessment.id
            );

            setAssessments(updated);
            saveToStorage(updated);
          }

          setModalOpen(false);
        }}
      />
    </div>
  );
}
