import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Download,
  Eye,
  Trash2,
  Filter,
  X,
  User,
} from "lucide-react";
import { useTheme } from "../contexts/theme-context";
import {
  useLegalAppointments,
  LegalAppointment,
} from "../contexts/legal-appointments-context";
import { appointmentTypeMap } from "../templates/appointment-templates";
import { LegalAppointmentDetailModal } from "../components/legal-appointment-detail-modal";
import { getEmployees, EmployeeOption } from "@/api/employees";
import { getSites } from "@/api/siteAPI";

interface LegalAppointmentsProps {
  employeeId?: string;
  sidebarOpen?: boolean;
}

interface SiteOption {
  id: string;
  name: string;
}

const appointmentTypeOptions = Object.keys(appointmentTypeMap);

export function LegalAppointments({ employeeId }: LegalAppointmentsProps) {
  const isEmployeeView = !!employeeId;
  const { appointments, loading, addAppointment, deleteAppointment } =
    useLegalAppointments();
  const { colors } = useTheme();

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [viewingAppointment, setViewingAppointment] =
    useState<LegalAppointment | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Keep the open modal in sync with the underlying context data —
  // uploadDocument/updateAppointment update `appointments`, but the
  // modal renders from this separate snapshot, so without this effect
  // a successful upload or renew won't visibly update until the modal
  // is closed and reopened.
  useEffect(() => {
    if (!viewingAppointment) return;
    const fresh = appointments.find((a) => a.id === viewingAppointment.id);
    if (fresh && fresh !== viewingAppointment) {
      setViewingAppointment(fresh);
    }
  }, [appointments, viewingAppointment]);

  const filteredAppointments = appointments
    .filter((appt) => (employeeId ? appt.employeeId === employeeId : true))
    .filter((appt) => {
      const matchesType =
        filterType === "all" || appt.appointmentType === filterType;
      const matchesStatus =
        filterStatus === "all" || appt.status === filterStatus;
      return matchesType && matchesStatus;
    });

  const totalAppointments = filteredAppointments.length;
  const activeAppointments = filteredAppointments.filter(
    (a) => a.status === "Active",
  ).length;
  const expiredAppointments = filteredAppointments.filter(
    (a) => a.status === "Expired",
  ).length;
  const pendingSignatures = filteredAppointments.filter(
    (a) => a.signatureStatus === "Pending",
  ).length;

  const getStatusStyle = (status: LegalAppointment["status"]) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#10B981", color: "white" };
      case "Expired":
        return { backgroundColor: "#EF4444", color: "white" };
      case "Pending":
        return { backgroundColor: "#F59E0B", color: "#0F172A" };
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (appointment: LegalAppointment) => {
    const confirmed = window.confirm(
      `Delete the legal appointment for ${appointment.employeeName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(appointment.id);
    try {
      await deleteAppointment(appointment.id);
      if (viewingAppointment?.id === appointment.id) {
        setViewingAppointment(null);
      }
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      alert("Failed to delete appointment. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  /* -------------------------------------------------------------- */
  /* Add Appointment modal                                          */
  /* -------------------------------------------------------------- */

  const [showAddModal, setShowAddModal] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [siteOptions, setSiteOptions] = useState<SiteOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const emptyForm = {
    employeeId: "",
    appointmentType: "",
    siteId: "",
    appointerName: "",
    startDate: "",
    endDate: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (showAddModal) {
      getEmployees()
        .then(setEmployeeOptions)
        .catch((err) => console.error("Failed to load employees:", err));

      getSites()
        .then((data: any[]) =>
          setSiteOptions(data.map((s) => ({ id: String(s.id), name: s.name }))),
        )
        .catch((err) => console.error("Failed to load sites:", err));
    }
  }, [showAddModal]);

  const selectedEmployeeOption = employeeOptions.find(
    (e) => e.id === formData.employeeId,
  );
  const selectedTypeConfig = appointmentTypeMap[formData.appointmentType];

  const resetAddModal = () => {
    setShowAddModal(false);
    setFormData(emptyForm);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.employeeId ||
      !formData.appointmentType ||
      !formData.siteId ||
      !formData.startDate
    ) {
      alert(
        "Please select an employee, appointment type, site, and start date.",
      );
      return;
    }

    const employee = employeeOptions.find(
      (emp) => emp.id === formData.employeeId,
    );
    const typeConfig = appointmentTypeMap[formData.appointmentType];
    const site = siteOptions.find((s) => s.id === formData.siteId);

    if (!employee || !typeConfig || !site) return;

    setIsSaving(true);
    try {
      await addAppointment({
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        jobTitle: employee.jobTitle,
        appointmentType: formData.appointmentType,
        legalSection: typeConfig.legalSection,
        department: typeConfig.department,
        siteId: site.id,
        siteName: site.name,
        appointerName: formData.appointerName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reportsTo: employee.reportingManager,
        delegatedAuthorityScope: typeConfig.department,
        hierarchyLevel: typeConfig.hierarchyLevel,
      });
      resetAddModal();
    } catch (err) {
      console.error("Failed to save appointment:", err);
      alert("Failed to save appointment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full border p-2 rounded";

  return (
    <div className="min-h-full" style={{ backgroundColor: colors.background }}>
      <div className="p-6">
        {!isEmployeeView && (
          <>
            {/* Header */}
            <div className="mb-6">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: colors.primaryText }}
              >
                Legal Appointments
              </h1>
              <p className="text-sm" style={{ color: colors.subText }}>
                Manage OHS Act appointments, legal designations, and compliance
                documentation
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: colors.subText }}
                    >
                      Total Appointments
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: colors.primaryText }}
                    >
                      {totalAppointments}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  >
                    <FileText className="size-6" style={{ color: "#3B82F6" }} />
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: colors.subText }}
                    >
                      Active Appointments
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: "#10B981" }}
                    >
                      {activeAppointments}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                  >
                    <CheckCircle
                      className="size-6"
                      style={{ color: "#10B981" }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: colors.subText }}
                    >
                      Expired Appointments
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: "#EF4444" }}
                    >
                      {expiredAppointments}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                  >
                    <XCircle className="size-6" style={{ color: "#EF4444" }} />
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: colors.subText }}
                    >
                      Pending Signatures
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: "#F59E0B" }}
                    >
                      {pendingSignatures}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                  >
                    <Clock className="size-6" style={{ color: "#F59E0B" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Actions Bar */}
            <div
              className="rounded-lg p-4 mb-6"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter
                      className="size-4"
                      style={{ color: colors.subText }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      Filters:
                    </span>
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      color: "#F8FAFC",
                      border: "none",
                    }}
                  >
                    <option value="all">All Types</option>
                    {appointmentTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      color: "#F8FAFC",
                      border: "none",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Pending">Pending</option>
                  </select>

                  {(filterType !== "all" || filterStatus !== "all") && (
                    <button
                      onClick={() => {
                        setFilterType("all");
                        setFilterStatus("all");
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "#EF4444",
                      }}
                    >
                      <X className="size-4" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "#3B82F6",
                    }}
                  >
                    <Download className="size-4" />
                    <span>Export Register</span>
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: "#3B82F6", color: "white" }}
                  >
                    <Plus className="size-4" />
                    <span>Add Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Legal Appointments Table (always full width — detail view is now a modal) */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          <div
            className="grid grid-cols-8 gap-3 px-4 py-4"
            style={{
              backgroundColor:
                colors.background === "#0F172A"
                  ? "rgba(15, 23, 42, 0.8)"
                  : "rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="col-span-2">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.subText }}
              >
                Employee
              </span>
            </div>
            <div className="col-span-2">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.subText }}
              >
                Appointment Type
              </span>
            </div>
            <div className="col-span-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.subText }}
              >
                End Date
              </span>
            </div>
            <div className="col-span-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.subText }}
              >
                Status
              </span>
            </div>
            <div className="col-span-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.subText }}
              >
                Document
              </span>
            </div>
            <div className="col-span-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.subText }}
              >
                Actions
              </span>
            </div>
          </div>

          <div>
            {loading && (
              <div
                className="px-4 py-8 text-center text-sm"
                style={{ color: colors.subText }}
              >
                Loading appointments…
              </div>
            )}

            {!loading && filteredAppointments.length === 0 && (
              <div
                className="px-4 py-8 text-center text-sm"
                style={{ color: colors.subText }}
              >
                No legal appointments found.
              </div>
            )}

            {filteredAppointments.map((appointment, index) => {
              const isEven = index % 2 === 0;
              const isDeleting = deletingId === appointment.id;
              return (
                <div
                  key={appointment.id}
                  className="grid grid-cols-8 gap-3 px-4 py-4 cursor-pointer"
                  style={{
                    backgroundColor: isEven
                      ? colors.surface
                      : colors.background === "#0F172A"
                        ? "rgba(15, 23, 42, 0.4)"
                        : "rgba(0, 0, 0, 0.02)",
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                  onClick={() => setViewingAppointment(appointment)}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <div
                      className="size-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                    >
                      <User className="size-4" style={{ color: "#3B82F6" }} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: colors.primaryText }}
                      >
                        {appointment.employeeName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: colors.subText }}
                      >
                        {appointment.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: colors.primaryText }}
                      >
                        {appointment.appointmentType}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: colors.subText }}
                      >
                        {appointment.legalSection}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <p
                      className="text-sm"
                      style={{ color: colors.primaryText }}
                    >
                      {formatDate(appointment.endDate)}
                    </p>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={getStatusStyle(appointment.status)}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center">
                    {/* Fulfilled by either an electronic signature or an
                        uploaded signed document — either one satisfies it */}
                    {appointment.documentUploaded ||
                    appointment.signatureData ? (
                      <CheckCircle
                        className="size-5"
                        style={{ color: "#10B981" }}
                      />
                    ) : (
                      <XCircle
                        className="size-5"
                        style={{ color: "#EF4444" }}
                      />
                    )}
                  </div>

                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingAppointment(appointment);
                      }}
                      title="View Details"
                    >
                      <Eye className="size-4" style={{ color: "#3B82F6" }} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg disabled:opacity-60"
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      disabled={isDeleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(appointment);
                      }}
                      title="Delete Appointment"
                    >
                      <Trash2 className="size-4" style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Details — modal, not a side panel */}
      {viewingAppointment && (
        <LegalAppointmentDetailModal
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
        />
      )}

      {/* Add Appointment modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-[520px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Add Appointment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-gray-900">
              {/* Employee — fetched from Workforce */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Employee</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee ID — auto-filled from Workforce, read-only */}
              <input
                type="text"
                placeholder="Employee ID"
                value={selectedEmployeeOption?.employeeNumber || ""}
                readOnly
                className={`${inputClass} bg-gray-100`}
              />

              {/* Appointment type FIRST — department is derived from it */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Appointment Type
                </label>
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Appointment Type</option>
                  {appointmentTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department — auto-filled from the appointment type, read-only */}
              <input
                type="text"
                placeholder="Department"
                value={selectedTypeConfig?.department || ""}
                readOnly
                className={`${inputClass} bg-gray-100`}
              />

              {/* Site — pulled from the Company & Sites page. Its name and
                  registered logo are used on the generated letter/PDF. */}
              <div>
                <label className="block text-sm font-medium mb-1">Site</label>
                <select
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Site</option>
                  {siteOptions.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                name="appointerName"
                placeholder="Appointer Name (16(2) appointee)"
                value={formData.appointerName}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={inputClass}
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={resetAddModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
