import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export interface EmployeeOption {
  id: number;
  employeeId: string;
  fullName: string;
  siteLocation: string;
}

interface AddTrainingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeOption[];
  lockedEmployeeId?: number;
  onSubmit: (formData: FormData) => Promise<void>;
}

const TRAINING_CATEGORIES = ["Safety", "Technical", "Compliance", "Other"];

const emptyForm = {
  employeeId: "",
  trainingType: "" as "" | "internal" | "external",
  trainingName: "",
  certificateName: "",
  provider: "",
  trainingCategory: "Safety",
  isLegallyRequired: false,
  completionDate: "",
  expiryDate: "",
};

export function AddTrainingRecordModal({
  isOpen,
  onClose,
  employees,
  lockedEmployeeId,
  onSubmit,
}: AddTrainingRecordModalProps) {
  const [form, setForm] = useState({
    ...emptyForm,
    employeeId: lockedEmployeeId ? String(lockedEmployeeId) : "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-sm outline-none";
  const inputStyle = { backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" };
  const labelClass = "block text-xs font-medium mb-1.5";

  const closeAndReset = () => {
    if (isSaving) return;
    setForm({ ...emptyForm, employeeId: lockedEmployeeId ? String(lockedEmployeeId) : "" });
    setFile(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !form.employeeId ||
      !form.trainingName ||
      !form.certificateName ||
      !form.provider ||
      !form.completionDate ||
      !form.expiryDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("employeeId", form.employeeId);
      if (form.trainingType) formData.append("trainingType", form.trainingType);
      formData.append("trainingName", form.trainingName);
      formData.append("certificateName", form.certificateName);
      formData.append("provider", form.provider);
      formData.append("trainingCategory", form.trainingCategory);
      formData.append("isLegallyRequired", String(form.isLegallyRequired));
      formData.append("completionDate", form.completionDate);
      formData.append("expiryDate", form.expiryDate);
      if (file) formData.append("certificateFile", file);

      await onSubmit(formData);
      setForm({ ...emptyForm, employeeId: lockedEmployeeId ? String(lockedEmployeeId) : "" });
      setFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to save training record. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeAndReset} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
        <div className="w-full max-w-xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "white" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
            <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Add Training Record</h3>
            <button onClick={closeAndReset} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="size-5" style={{ color: "var(--grey-500)" }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                {error}
              </div>
            )}

            {!lockedEmployeeId && (
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
                      {emp.fullName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Training Type</label>
                <select
                  value={form.trainingType}
                  onChange={(e) => setForm({ ...form, trainingType: e.target.value as any })}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="">Select type…</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Category</label>
                <select
                  value={form.trainingCategory}
                  onChange={(e) => setForm({ ...form, trainingCategory: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                >
                  {TRAINING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Training Name *</label>
              <input
                type="text"
                placeholder="Hazard Identification & Risk Assessment"
                value={form.trainingName}
                onChange={(e) => setForm({ ...form, trainingName: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Certificate Name *</label>
              <input
                type="text"
                placeholder="First Aid Level 1"
                value={form.certificateName}
                onChange={(e) => setForm({ ...form, certificateName: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Training Provider *</label>
              <input
                type="text"
                placeholder="SafetyFirst Training"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Completion Date *</label>
                <input
                  type="date"
                  value={form.completionDate}
                  onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Expiry Date *</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLegallyRequired"
                checked={form.isLegallyRequired}
                onChange={(e) => setForm({ ...form, isLegallyRequired: e.target.checked })}
              />
              <label htmlFor="isLegallyRequired" className="text-sm" style={{ color: "var(--grey-700)" }}>
                This training is legally required
              </label>
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Upload Certificate</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition"
                style={{ borderColor: "var(--grey-300)" }}
              >
                <span className="text-sm" style={{ color: "var(--grey-700)" }}>Click to upload certificate</span>
                <span className="text-xs mt-1" style={{ color: "var(--grey-500)" }}>PDF, JPG or PNG. Max 15MB.</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {file && (
                <p className="text-sm mt-2" style={{ color: "var(--compliance-success)" }}>Selected: {file.name}</p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: "var(--grey-200)" }}>
            <button
              onClick={closeAndReset}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--grey-100)", color: "var(--grey-700)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center gap-2"
              style={{ backgroundColor: "#3B82F6" }}
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isSaving ? "Saving…" : "Save Training Record"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}