import { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  ShieldCheck,
  Lock,
  EyeOff,
  X,
  AlertTriangle,
  Info,
  Loader2,
  Download,
} from "lucide-react";
import { AlertBanner } from "../components/alert-banner";
import { useAlerts } from "../contexts/alert-context";

interface MedicalRecord {
  id: number;
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  department: string;
  siteLocation: string;
  examType: "pre-placement" | "periodic" | "exit" | "return-to-work";
  practitionerName: string;
  practitionerType: "OMP" | "OHNP";
  examDate: string;
  expiryDate: string | null;
  isExpired: boolean;
  fitnessStatus: "fit" | "fit-with-restrictions" | "unfit";
  restrictions: string | null;
  restrictionType: string[] | null;
  fileName: string | null;
  fileMimeType: string | null;
}

interface EmployeeOption {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  siteLocation: string;
}

type FitnessFilter = "all" | "fit" | "fit-with-restrictions" | "unfit";
type ViewMode = "certificate" | "clinical" | null;

const EXAM_TYPES = [
  { value: "pre-placement", label: "Pre-Placement" },
  { value: "periodic", label: "Periodic (Annual)" },
  { value: "exit", label: "Exit" },
  { value: "return-to-work", label: "Return to Work" },
];

const FITNESS_STATUSES = [
  { value: "fit", label: "Fit for Duty" },
  { value: "fit-with-restrictions", label: "Fit with Restrictions" },
  { value: "unfit", label: "Unfit for Duty" },
];

export function MedicalSurveillanceEnhanced({
  employeeId,
}: {
  employeeId?: string;
}) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { dismissAlert } = useAlerts();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedFitness, setSelectedFitness] = useState<FitnessFilter>("all");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] =
    useState("All Employees");

  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [showRetentionInfo, setShowRetentionInfo] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isFetchingFile, setIsFetchingFile] = useState(false);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const emptyForm = {
    employeeId: "",
    examType: "periodic",
    practitionerName: "",
    practitionerType: "OMP",
    examDate: "",
    expiryDate: "",
    fitnessStatus: "fit",
    restrictions: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchRecords();
    fetchEmployees();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${API_URL}/medicals`);
      if (!response.ok) throw new Error("Failed to fetch medical records");
      const data = await response.json();

      const formatted: MedicalRecord[] = data.map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeNumber: r.employee_number,
        employeeName: r.employee_name,
        department: r.department,
        siteLocation: r.site_location,
        examType: r.exam_type,
        practitionerName: r.practitioner_name,
        practitionerType: r.practitioner_type,
        examDate: r.exam_date,
        expiryDate: r.expiry_date,
        isExpired: r.is_expired,
        fitnessStatus: r.fitness_status,
        restrictions: r.restrictions,
        restrictionType: r.restriction_type,
        fileName: r.file_name,
        fileMimeType: r.file_mime_type,
      }));

      setRecords(formatted);
    } catch (error: any) {
      console.error("Error fetching medical records:", error);
      setLoadError(
        "Couldn't load medical records. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();

      const formatted: EmployeeOption[] = data
        .filter((e: any) => e.status !== "Inactive")
        .map((e: any) => ({
          id: e.id,
          employeeId: e.employee_number,
          fullName: e.full_name,
          department: e.department,
          siteLocation: e.site_location,
        }));

      setEmployees(formatted);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const employeeNames = [
    "All Employees",
    ...Array.from(new Set(records.map((r) => r.employeeName))).sort(),
  ];

  const sites = [
    "All Sites",
    ...Array.from(new Set(records.map((r) => r.siteLocation))).sort(),
  ];

  const filteredRecords = records.filter((record) => {
    const matchesEmployeeProp = employeeId
      ? String(record.employeeId) === employeeId
      : true;
    const matchesSite =
      selectedSite === "All Sites" || record.siteLocation === selectedSite;
    const matchesFitness =
      selectedFitness === "all" || record.fitnessStatus === selectedFitness;
    const matchesEmployeeFilter =
      selectedEmployeeFilter === "All Employees" ||
      record.employeeName === selectedEmployeeFilter;

    return (
      matchesEmployeeProp && matchesSite && matchesFitness && matchesEmployeeFilter
    );
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
        return { label: "✅ Fit for Duty", color: "var(--compliance-success)", bgColor: "var(--compliance-success)15" };
      case "fit-with-restrictions":
        return { label: "⚠️ Fit with Restrictions", color: "var(--compliance-warning)", bgColor: "var(--compliance-warning)15" };
      case "unfit":
        return { label: "❌ Unfit for Duty", color: "var(--compliance-danger)", bgColor: "var(--compliance-danger)15" };
      default:
        return { label: status, color: "var(--grey-700)", bgColor: "var(--grey-100)" };
    }
  };

  const handleViewCertificate = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewMode("certificate");
  };

  const handleViewClinical = async (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewMode("clinical");
    setFileUrl(null);

    if (record.fileName) {
      setIsFetchingFile(true);
      try {
        const response = await fetch(`${API_URL}/medicals/${record.id}/file`);
        if (response.ok) {
          const data = await response.json();
          setFileUrl(data.url);
        }
      } catch (error) {
        console.error("Error fetching file URL:", error);
      } finally {
        setIsFetchingFile(false);
      }
    }
  };

  const closeModal = () => {
    setViewMode(null);
    setSelectedRecord(null);
    setFileUrl(null);
  };

  const openRecordModal = () => {
    setForm(emptyForm);
    setFile(null);
    setSaveError(null);
    setShowRecordModal(true);
  };

  const closeRecordModal = () => {
    if (isSaving) return;
    setShowRecordModal(false);
  };

  const handleSubmitRecord = async () => {
    if (
      !form.employeeId ||
      !form.examType ||
      !form.practitionerName ||
      !form.examDate ||
      !form.fitnessStatus
    ) {
      setSaveError("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("employeeId", form.employeeId);
      formData.append("examType", form.examType);
      formData.append("practitionerName", form.practitionerName);
      formData.append("practitionerType", form.practitionerType);
      formData.append("examDate", form.examDate);
      if (form.expiryDate) formData.append("expiryDate", form.expiryDate);
      formData.append("fitnessStatus", form.fitnessStatus);
      if (form.restrictions) formData.append("restrictions", form.restrictions);
      if (file) formData.append("medicalFile", file);

      const response = await fetch(`${API_URL}/medicals`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to save medical record");
      }

      await fetchRecords();
      setShowRecordModal(false);
    } catch (error: any) {
      console.error("Error saving medical record:", error);
      setSaveError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalRecords = filteredRecords.length;
  const fitCount = filteredRecords.filter((r) => r.fitnessStatus === "fit").length;
  const restrictedCount = filteredRecords.filter((r) => r.fitnessStatus === "fit-with-restrictions").length;
  const unfitCount = filteredRecords.filter((r) => r.fitnessStatus === "unfit").length;
  const expiredCount = filteredRecords.filter((r) => r.isExpired).length;

  const handleDismissAlert = (id: string) => {
    dismissAlert(
      id,
      `${restrictedCount} employee${restrictedCount !== 1 ? "s" : ""} with active restrictions`,
      "critical",
    );
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-sm outline-none";
  const inputStyle = {
    backgroundColor: "white",
    borderColor: "var(--grey-300)",
    color: "var(--grey-900)",
  };
  const labelClass = "block text-xs font-medium mb-1.5";

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "#0F172A" }}>
      <div className="max-w-[1600px] mx-auto">
        {!employeeId && (
          <>
            {restrictedCount > 0 && (
              <AlertBanner
                id="medical-restrictions-alert"
                type="critical"
                icon={<AlertTriangle className="size-5" />}
                title={`${restrictedCount} employee${restrictedCount !== 1 ? "s" : ""} with active restrictions`}
                description="Check compatibility before assigning to high-risk tasks"
                onDismiss={handleDismissAlert}
              />
            )}

            <div className="px-8 pt-6 pb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl mb-2" style={{ color: "white" }}>
                    Medical Surveillance & Fitness for Duty
                  </h1>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                    <span className="text-sm font-medium" style={{ color: "white" }}>
                      POPI Act Compliant: Restricted Access
                    </span>
                  </div>
                </div>

                <button
                  onClick={openRecordModal}
                  className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <Plus className="size-4" />
                  Record New Medical Exam
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="size-4" style={{ color: "white" }} />
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm"
                    style={{ backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" }}
                  >
                    {sites.map((site) => (
                      <option key={site} value={site}>{site}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedFitness}
                  onChange={(e) => setSelectedFitness(e.target.value as FitnessFilter)}
                  className="px-4 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" }}
                >
                  <option value="all">All Fitness Statuses</option>
                  <option value="fit">Fit for Duty</option>
                  <option value="fit-with-restrictions">Fit with Restrictions</option>
                  <option value="unfit">Unfit for Duty</option>
                </select>

                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" }}
                >
                  {employeeNames.map((employee) => (
                    <option key={employee} value={employee}>{employee}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-8 py-6">
              <div
                className="grid grid-cols-1 md:grid-cols-5 gap-4 rounded-lg p-6"
                style={{ backgroundColor: "#1E293B", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)" }}
              >
                {[
                  { label: "Total Records", value: totalRecords, color: "white" },
                  { label: "Fit for Duty", value: fitCount, color: "var(--compliance-success)" },
                  { label: "With Restrictions", value: restrictedCount, color: "var(--compliance-warning)" },
                  { label: "Unfit for Duty", value: unfitCount, color: "var(--compliance-danger)" },
                  { label: "Expired / Overdue", value: expiredCount, color: "var(--compliance-danger)" },
                ].map((stat) => (
                  <div key={stat.label} className="px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-sm mb-1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>{stat.label}</p>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="px-8 pb-6">
          <div
            className="rounded-lg overflow-hidden relative"
            style={{ backgroundColor: "#1E293B", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)" }}
          >
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2 className="size-5 animate-spin" style={{ color: "rgba(255,255,255,0.6)" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Loading medical records…</span>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertTriangle className="size-6" style={{ color: "var(--compliance-danger)" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{loadError}</span>
                <button
                  onClick={fetchRecords}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.03, zIndex: 0 }}>
                  <Lock className="size-64" style={{ color: "white" }} />
                </div>

                <div className="overflow-x-auto relative" style={{ zIndex: 1 }}>
                  <table className="border-collapse w-full">
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                        <th className="sticky left-0 z-20 px-6 py-4 text-left" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", minWidth: "250px" }}>
                          <span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Employee</span>
                        </th>
                        <th className="px-6 py-4 text-left whitespace-nowrap"><span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Exam Type</span></th>
                        <th className="px-6 py-4 text-left whitespace-nowrap"><span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Practitioner</span></th>
                        <th className="px-6 py-4 text-left whitespace-nowrap"><span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Exam Date</span></th>
                        <th className="px-6 py-4 text-left whitespace-nowrap"><span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Expiry Date</span></th>
                        <th className="px-6 py-4 text-left whitespace-nowrap"><span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Fitness Status</span></th>
                        <th className="px-6 py-4 text-center whitespace-nowrap"><span className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Medical File</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                            No medical records found. Click "Record New Medical Exam" to add one.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record) => {
                          const examTypeBadge = getExamTypeBadge(record.examType);
                          const fitnessBadge = getFitnessStatusBadge(record.fitnessStatus);

                          return (
                            <tr
                              key={record.id}
                              className="transition-colors"
                              style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <td className="sticky left-0 z-10 px-6 py-4" style={{ backgroundColor: "#1E293B" }}>
                                <div>
                                  <div className="font-medium mb-1" style={{ color: "white" }}>{record.employeeName}</div>
                                  <div className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>{record.department}</div>
                                  <div className="text-xs font-mono" style={{ color: "rgba(255, 255, 255, 0.5)" }}>{record.employeeNumber}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: examTypeBadge.bgColor, color: examTypeBadge.color }}>
                                  {examTypeBadge.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium" style={{ color: "white" }}>{record.practitionerName}</div>
                                  <div className="text-xs inline-flex items-center px-1.5 py-0.5 rounded mt-1" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.7)" }}>
                                    {record.practitionerType}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                                  {new Date(record.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {!record.expiryDate ? (
                                  <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>N/A</span>
                                ) : (
                                  <span className="text-sm font-medium" style={{ color: record.isExpired ? "var(--compliance-danger)" : "var(--compliance-success)" }}>
                                    {new Date(record.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: fitnessBadge.bgColor, color: fitnessBadge.color }}>
                                    {fitnessBadge.label}
                                  </span>
                                  {record.restrictions && (
                                    <div className="text-xs mt-2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>{record.restrictions}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleViewCertificate(record)}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                                    title="View Certificate (Public)"
                                  >
                                    <Lock className="size-4" style={{ color: "var(--compliance-success)" }} />
                                  </button>
                                  <button
                                    onClick={() => handleViewClinical(record)}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                                    title="Clinical Notes (Admin Only)"
                                  >
                                    <EyeOff className="size-4" style={{ color: "var(--compliance-danger)" }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-8 py-3 border-t flex items-center justify-between" style={{ backgroundColor: "var(--grey-50)", borderColor: "var(--grey-200)" }}>
          <div className="flex items-center gap-2">
            <Info className="size-4" style={{ color: "var(--brand-blue)" }} />
            <span className="text-xs" style={{ color: "var(--grey-600)" }}>
              Records in this module are legally archived for <strong>40 years</strong> as per OHS Act requirements.
            </span>
            <button onClick={() => setShowRetentionInfo(!showRetentionInfo)} className="text-xs underline" style={{ color: "var(--brand-blue)" }}>
              Learn more
            </button>
          </div>
        </div>

        {/* Record New Medical Exam Modal */}
        {showRecordModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeRecordModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div className="w-full max-w-xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "white" }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
                  <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Record New Medical Exam</h3>
                  <button onClick={closeRecordModal} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {saveError && (
                    <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--compliance-danger)10", color: "var(--compliance-danger)" }}>
                      {saveError}
                    </div>
                  )}

                  <div>
                    <label className={labelClass} style={{ color: "var(--grey-700)" }}>Employee *</label>
                    <select
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                    >
                      <option value="">Select employee…</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.employeeId}) — {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Exam Type *</label>
                      <select
                        value={form.examType}
                        onChange={(e) => setForm({ ...form, examType: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      >
                        {EXAM_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Fitness Status *</label>
                      <select
                        value={form.fitnessStatus}
                        onChange={(e) => setForm({ ...form, fitnessStatus: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      >
                        {FITNESS_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Practitioner Name *</label>
                      <input
                        type="text"
                        placeholder="Dr. J. Smith"
                        value={form.practitionerName}
                        onChange={(e) => setForm({ ...form, practitionerName: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Practitioner Type *</label>
                      <select
                        value={form.practitionerType}
                        onChange={(e) => setForm({ ...form, practitionerType: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="OMP">OMP</option>
                        <option value="OHNP">OHNP</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Exam Date *</label>
                      <input
                        type="date"
                        value={form.examDate}
                        onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Expiry Date</label>
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {form.fitnessStatus !== "fit" && (
                    <div>
                      <label className={labelClass} style={{ color: "var(--grey-700)" }}>Restrictions / Notes</label>
                      <textarea
                        placeholder="e.g. No heavy lifting (max 10kg) for 3 months"
                        value={form.restrictions}
                        onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
                        className={inputClass}
                        style={{ ...inputStyle, minHeight: "72px" }}
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelClass} style={{ color: "var(--grey-700)" }}>Upload Medical File</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className={inputClass}
                      style={inputStyle}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--grey-500)" }}>
                      PDF, JPEG, PNG, or WEBP. Max 15MB. Stored securely and never publicly accessible.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: "var(--grey-200)" }}>
                  <button
                    onClick={closeRecordModal}
                    disabled={isSaving}
                    className="px-5 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: "var(--grey-100)", color: "var(--grey-700)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRecord}
                    disabled={isSaving}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center gap-2"
                    style={{ backgroundColor: "var(--brand-blue)" }}
                  >
                    {isSaving && <Loader2 className="size-4 animate-spin" />}
                    {isSaving ? "Saving…" : "Save Medical Exam"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Certificate View Modal (Annexure 3) */}
        {viewMode === "certificate" && selectedRecord && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div className="w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "white" }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
                  <div className="flex items-center gap-3">
                    <Lock className="size-5" style={{ color: "var(--compliance-success)" }} />
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Certificate of Fitness (Annexure 3)</h3>
                      <p className="text-xs" style={{ color: "var(--grey-600)" }}>Public Document - Auditor Access</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "var(--grey-50)" }}>
                  <div className="bg-white p-8 rounded border" style={{ borderColor: "var(--grey-300)" }}>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl mb-2" style={{ color: "var(--grey-900)" }}>CERTIFICATE OF FITNESS</h2>
                      <p className="text-sm" style={{ color: "var(--grey-600)" }}>Occupational Health and Safety Act, 1993 (Annexure 3)</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>EMPLOYEE NAME</p>
                          <p className="font-medium" style={{ color: "var(--grey-900)" }}>{selectedRecord.employeeName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>EMPLOYEE NUMBER</p>
                          <p className="font-mono" style={{ color: "var(--grey-900)" }}>{selectedRecord.employeeNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>EXAMINATION DATE</p>
                          <p style={{ color: "var(--grey-900)" }}>
                            {new Date(selectedRecord.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>CERTIFICATE VALID UNTIL</p>
                          <p style={{ color: "var(--grey-900)" }}>
                            {selectedRecord.expiryDate
                              ? new Date(selectedRecord.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>EXAMINED BY</p>
                        <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                          {selectedRecord.practitionerName} ({selectedRecord.practitionerType})
                        </p>
                      </div>
                    </div>

                    <div
                      className="p-6 rounded-lg border-2 text-center"
                      style={{
                        backgroundColor:
                          selectedRecord.fitnessStatus === "fit" ? "var(--compliance-success)10"
                          : selectedRecord.fitnessStatus === "fit-with-restrictions" ? "var(--compliance-warning)10"
                          : "var(--compliance-danger)10",
                        borderColor:
                          selectedRecord.fitnessStatus === "fit" ? "var(--compliance-success)"
                          : selectedRecord.fitnessStatus === "fit-with-restrictions" ? "var(--compliance-warning)"
                          : "var(--compliance-danger)",
                      }}
                    >
                      <p className="text-xs font-medium mb-2" style={{ color: "var(--grey-600)" }}>FITNESS DETERMINATION</p>
                      <p
                        className="text-2xl font-bold mb-3"
                        style={{
                          color:
                            selectedRecord.fitnessStatus === "fit" ? "var(--compliance-success)"
                            : selectedRecord.fitnessStatus === "fit-with-restrictions" ? "var(--compliance-warning)"
                            : "var(--compliance-danger)",
                        }}
                      >
                        {selectedRecord.fitnessStatus === "fit" ? "FIT FOR DUTY"
                          : selectedRecord.fitnessStatus === "fit-with-restrictions" ? "FIT WITH RESTRICTIONS"
                          : "UNFIT FOR DUTY"}
                      </p>
                      {selectedRecord.restrictions && (
                        <p className="text-sm mt-3" style={{ color: "var(--grey-700)" }}>
                          <strong>Restrictions:</strong> {selectedRecord.restrictions}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--grey-200)" }}>
                      <p className="text-xs text-center" style={{ color: "var(--grey-500)" }}>
                        This certificate confirms the employee's fitness for the specified work as assessed on the examination date.
                        <br />
                        This is a public document available to auditors and management.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Clinical Record View Modal (Admin Only) */}
        {viewMode === "clinical" && selectedRecord && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div className="w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "white" }}>
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ backgroundColor: "var(--compliance-danger)10", borderColor: "var(--compliance-danger)" }}
                >
                  <div className="flex items-center gap-3">
                    <EyeOff className="size-5" style={{ color: "var(--compliance-danger)" }} />
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Clinical Medical Record</h3>
                      <p className="text-xs font-medium" style={{ color: "var(--compliance-danger)" }}>
                        CONFIDENTIAL - Admin Only Access • POPI Act Protected
                      </p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h4 className="font-medium mb-2" style={{ color: "var(--grey-900)" }}>Patient Information</h4>
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--grey-50)" }}>
                      <div>
                        <p className="text-xs mb-1" style={{ color: "var(--grey-600)" }}>Name</p>
                        <p className="font-medium" style={{ color: "var(--grey-900)" }}>{selectedRecord.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: "var(--grey-600)" }}>Employee ID</p>
                        <p className="font-mono" style={{ color: "var(--grey-900)" }}>{selectedRecord.employeeNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-3" style={{ color: "var(--grey-900)" }}>Practitioner's Notes</h4>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--grey-50)" }}>
                      <p className="text-sm" style={{ color: "var(--grey-700)" }}>
                        {selectedRecord.restrictions || "No restrictions or additional notes recorded for this exam."}
                      </p>
                      <p className="text-sm mt-3" style={{ color: "var(--grey-600)" }}>
                        <em>— {selectedRecord.practitionerName}, {selectedRecord.practitionerType}</em>
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-3" style={{ color: "var(--grey-900)" }}>Uploaded Medical File</h4>
                    {selectedRecord.fileName ? (
                      isFetchingFile ? (
                        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--grey-600)" }}>
                          <Loader2 className="size-4 animate-spin" /> Generating secure link…
                        </div>
                      ) : fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                          style={{ backgroundColor: "var(--brand-blue)" }}
                        >
                          <Download className="size-4" />
                          {selectedRecord.fileName}
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--grey-500)" }}>Couldn't generate a secure link. Try reopening this record.</p>
                      )
                    ) : (
                      <p className="text-sm" style={{ color: "var(--grey-500)" }}>No file was uploaded for this exam.</p>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: "var(--compliance-danger)05", borderColor: "var(--compliance-danger)" }}>
                    <p className="text-xs font-medium" style={{ color: "var(--compliance-danger)" }}>⚠️ POPI Act Confidentiality Notice</p>
                    <p className="text-xs mt-1" style={{ color: "var(--grey-600)" }}>
                      This clinical information is confidential and protected under the Protection of Personal Information Act (POPI).
                      Access is restricted to authorized medical personnel and RSS administrators only. Unauthorized disclosure may result in legal action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 40-Year Retention Info Modal */}
        {showRetentionInfo && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowRetentionInfo(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
              <div className="w-full max-w-lg rounded-lg shadow-2xl" style={{ backgroundColor: "white" }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
                  <div className="flex items-center gap-3">
                    <Info className="size-5" style={{ color: "var(--brand-blue)" }} />
                    <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>40-Year Retention Requirement</h3>
                  </div>
                  <button onClick={() => setShowRetentionInfo(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <X className="size-5" style={{ color: "var(--grey-500)" }} />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm mb-4" style={{ color: "var(--grey-700)" }}>
                    <strong>Legal Requirement:</strong> Under the Occupational Health and Safety Act (OHS Act, 1993), Section 43, all
                    medical surveillance records must be retained for a period of <strong>40 years</strong> from the date of the last
                    medical examination.
                  </p>
                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "var(--grey-50)" }}>
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--grey-900)" }}>Why 40 years?</p>
                    <ul className="text-sm space-y-1" style={{ color: "var(--grey-700)" }}>
                      <li>• Occupational diseases often have long latency periods</li>
                      <li>• Enables long-term health trend analysis</li>
                      <li>• Supports compensation claims for work-related illnesses</li>
                      <li>• Provides historical baseline for medical conditions</li>
                    </ul>
                  </div>
                  <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                    SHERQ Online automatically archives all medical records in compliance with this requirement. Records are securely
                    stored and never permanently deleted, even when employees leave the organization.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}