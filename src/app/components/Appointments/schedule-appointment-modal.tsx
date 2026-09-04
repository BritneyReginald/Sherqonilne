import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export interface EmployeeOption {
  id: number;
  fullName: string;
  employeeNumber: string;
  jobTitle: string;
  siteLocation: string;
}

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeOption[];
  onSubmit: (data: {
    employeeId: number;
    appointmentType: "Medical" | "Training" | "Induction";
    practitioner: string;
    appointmentDate: string;
    status: "Confirmed" | "Pending" | "Urgent" | "Overdue";
    notes: string;
  }) => Promise<void>;
}

const emptyForm = {
  employeeId: "",
  appointmentType: "Medical" as "Medical" | "Training" | "Induction",
  practitioner: "",
  date: "",
  time: "",
  status: "Pending" as "Confirmed" | "Pending" | "Urgent" | "Overdue",
  notes: "",
};

export function ScheduleAppointmentModal({
  isOpen,
  onClose,
  employees,
  onSubmit,
}: ScheduleAppointmentModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-sm outline-none";
  const inputStyle = { backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" };
  const labelClass = "block text-xs font-medium mb-1.5";

  const closeAndReset = () => {
    if (isSaving) return;
    setForm(emptyForm);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.appointmentType || !form.practitioner || !form.date || !form.time) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSubmit({
        employeeId: Number(form.employeeId),
        appointmentType: form.appointmentType,
        practitioner: form.practitioner,
        appointmentDate: new Date(`${form.date}T${form.time}`).toISOString(),
        status: form.status,
        notes: form.notes,
      });
      setForm(emptyForm);
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment. Please try again.");
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
            <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Schedule Appointment</h3>
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
                    {emp.fullName} ({emp.employeeNumber}) — {emp.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Appointment Type *</label>
                <select
                  value={form.appointmentType}
                  onChange={(e) => setForm({ ...form, appointmentType: e.target.value as any })}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="Medical">Medical</option>
                  <option value="Training">Training</option>
                  <option value="Induction">Induction</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Practitioner / Provider *</label>
              <input
                type="text"
                placeholder="Dr. Sarah van Zyl"
                value={form.practitioner}
                onChange={(e) => setForm({ ...form, practitioner: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--grey-700)" }}>Time *</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Notes</label>
              <textarea
                placeholder="Optional context for this appointment"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass}
                style={{ ...inputStyle, minHeight: "72px" }}
              />
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
              {isSaving ? "Scheduling…" : "Schedule Appointment"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}