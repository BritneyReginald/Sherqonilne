import { useState, useEffect } from "react";
import { Calendar, Clock, Search, Plus, List, CalendarDays, AlertCircle, User, Loader2 } from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { useSiteFilter } from "../../contexts/site-filter-context";
import { ScheduleAppointmentModal, EmployeeOption } from "./schedule-appointment-modal";

interface Appointment {
  id: number;
  employeeName: string;
  workId: string;
  siteLocation: string;
  appointmentType: "Medical" | "Training" | "Induction";
  practitioner: string;
  dateTime: Date;
  status: "Confirmed" | "Pending" | "Urgent" | "Overdue";
  hasRestrictions: boolean;
  notes: string | null;
}

export function Appointments() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { colors } = useTheme();
  const { selectedSite } = useSiteFilter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSiteFilter, setSelectedSiteFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await Promise.all([fetchAppointments(), fetchEmployees()]);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setLoadError("Couldn't load appointments. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    const response = await fetch(`${API_URL}/appointments`);
    if (!response.ok) throw new Error("Failed to fetch appointments");
    const data = await response.json();

    const formatted: Appointment[] = data.map((a: any) => ({
      id: a.id,
      employeeName: a.employee_name,
      workId: a.work_id,
      siteLocation: a.site_location,
      appointmentType: a.appointment_type,
      practitioner: a.practitioner,
      dateTime: new Date(a.appointment_date),
      status: a.status,
      hasRestrictions: a.has_restrictions,
      notes: a.notes,
    }));

    setAppointments(formatted);
  };

  const fetchEmployees = async () => {
    const response = await fetch(`${API_URL}/employees`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    const data = await response.json();

    const formatted: EmployeeOption[] = data
      .filter((e: any) => e.status !== "Inactive")
      .map((e: any) => ({
        id: e.id,
        fullName: e.full_name,
        employeeNumber: e.employee_number,
        jobTitle: e.job_title,
        siteLocation: e.site_location,
      }));

    setEmployees(formatted);
  };

  const handleScheduleAppointment = async (data: {
    employeeId: number;
    appointmentType: "Medical" | "Training" | "Induction";
    practitioner: string;
    appointmentDate: string;
    status: "Confirmed" | "Pending" | "Urgent" | "Overdue";
    notes: string;
  }) => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Failed to schedule appointment");
    }

    await fetchAppointments();
    setShowScheduleModal(false);
  };

  const sites = [
    "all",
    ...(Array.from(new Set(employees.map((e) => e.siteLocation).filter(Boolean))).sort() as string[]),
  ];

  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.workId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = selectedSiteFilter === "all" || appt.siteLocation === selectedSiteFilter;
    const matchesType = selectedType === "all" || appt.appointmentType === selectedType;
    return matchesSearch && matchesSite && matchesType;
  });

  const upcomingCount = filteredAppointments.filter(
    (appt) => appt.status === "Confirmed" || appt.status === "Pending",
  ).length;
  const pendingCount = filteredAppointments.filter((appt) => appt.status === "Pending").length;
  const overdueCount = filteredAppointments.filter(
    (appt) => appt.status === "Overdue" || appt.status === "Urgent",
  ).length;

  const restrictedAppointments = filteredAppointments.filter((appt) => appt.hasRestrictions);
  const restrictedEmployeeCount = new Set(restrictedAppointments.map((a) => a.employeeName)).size;

  const getStatusStyle = (status: Appointment["status"]) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#10B981", color: "white" };
      case "Pending":
        return { backgroundColor: "#F59E0B", color: "#0F172A" };
      case "Urgent":
      case "Overdue":
        return { backgroundColor: "#EF4444", color: "white" };
    }
  };

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { date: dateStr, time: timeStr };
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: colors.background }}>
      {restrictedEmployeeCount > 0 && (
        <div className="w-full py-3 px-6 flex items-center gap-3" style={{ backgroundColor: "white", color: "#0F172A" }}>
          <AlertCircle className="size-5" />
          <span className="text-sm font-medium">
            System Alert: {restrictedEmployeeCount} worker{restrictedEmployeeCount !== 1 ? "s" : ""} with appointments {restrictedEmployeeCount !== 1 ? "have" : "has"} active medical restrictions. Review appointments marked as "Urgent" immediately.
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primaryText }}>Scheduling & Appointments</h1>
          <p className="text-sm" style={{ color: colors.subText }}>
            Manage medical examinations, training sessions, and site inductions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-lg p-5"
            style={{ backgroundColor: colors.surface, boxShadow: colors.background === "#0F172A" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.subText }}>Total Upcoming</p>
                <p className="text-3xl font-bold" style={{ color: colors.primaryText }}>{upcomingCount}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                <Calendar className="size-6" style={{ color: "#3B82F6" }} />
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-5"
            style={{ backgroundColor: colors.surface, boxShadow: colors.background === "#0F172A" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.subText }}>Pending Confirmation</p>
                <p className="text-3xl font-bold" style={{ color: "#F59E0B" }}>{pendingCount}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
                <Clock className="size-6" style={{ color: "#F59E0B" }} />
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-5"
            style={{ backgroundColor: colors.surface, boxShadow: colors.background === "#0F172A" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.subText }}>Overdue / Missed</p>
                <p className="text-3xl font-bold" style={{ color: "#EF4444" }}>{overdueCount}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                <AlertCircle className="size-6" style={{ color: "#EF4444" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowScheduleModal(true)}
            disabled={employees.length === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-lg transition-all text-base font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#3B82F6", color: "white", boxShadow: "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)" }}
          >
            <Plus className="size-5" />
            <span>Schedule Appointment</span>
          </button>
        </div>

        <div
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: colors.surface, boxShadow: colors.background === "#0F172A" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4" style={{ color: "#64748B" }} />
                <input
                  type="text"
                  placeholder="Search by Employee"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "#F8FAFC", border: "none" }}
                />
              </div>

              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "#F8FAFC", border: "none" }}
              >
                {sites.map((site) => (
                  <option key={site} value={site}>{site === "all" ? "All Sites" : site}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "#F8FAFC", border: "none" }}
              >
                <option value="all">All Types</option>
                <option value="Medical">Medical</option>
                <option value="Training">Training</option>
                <option value="Induction">Induction</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
                style={{ backgroundColor: viewMode === "list" ? "#3B82F6" : "rgba(255, 255, 255, 0.05)", color: viewMode === "list" ? "white" : colors.subText }}
              >
                <List className="size-4" />
                <span className="text-sm font-medium">List</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
                style={{ backgroundColor: viewMode === "calendar" ? "#3B82F6" : "rgba(255, 255, 255, 0.05)", color: viewMode === "calendar" ? "white" : colors.subText }}
              >
                <CalendarDays className="size-4" />
                <span className="text-sm font-medium">Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === "list" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.surface, boxShadow: colors.background === "#0F172A" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
          >
            <div
              className="grid grid-cols-6 gap-4 px-6 py-4"
              style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(15, 23, 42, 0.8)" : "rgba(0, 0, 0, 0.05)" }}
            >
              <div className="col-span-1"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.subText }}>Employee</span></div>
              <div className="col-span-1"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.subText }}>Type</span></div>
              <div className="col-span-2"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.subText }}>Practitioner / Provider</span></div>
              <div className="col-span-1"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.subText }}>Date & Time</span></div>
              <div className="col-span-1"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.subText }}>Status</span></div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2 className="size-5 animate-spin" style={{ color: colors.subText }} />
                <span className="text-sm" style={{ color: colors.subText }}>Loading appointments…</span>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertCircle className="size-6" style={{ color: "#EF4444" }} />
                <span className="text-sm" style={{ color: colors.primaryText }}>{loadError}</span>
                <button onClick={fetchAll} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#3B82F6" }}>
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && (
              <div>
                {filteredAppointments.map((appointment, index) => {
                  const { date, time } = formatDateTime(appointment.dateTime);
                  const isEven = index % 2 === 0;

                  return (
                    <div
                      key={appointment.id}
                      className="grid grid-cols-6 gap-4 px-6 py-4 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isEven ? colors.surface : colors.background === "#0F172A" ? "rgba(15, 23, 42, 0.4)" : "rgba(0, 0, 0, 0.02)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.08)"; }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isEven ? colors.surface : colors.background === "#0F172A" ? "rgba(15, 23, 42, 0.4)" : "rgba(0, 0, 0, 0.02)";
                      }}
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        <div className="size-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}>
                          <User className="size-4" style={{ color: "#3B82F6" }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.primaryText }}>{appointment.employeeName}</p>
                          <p className="text-xs" style={{ color: colors.subText }}>{appointment.workId}</p>
                        </div>
                      </div>

                      <div className="col-span-1 flex items-center">
                        <p className="text-sm" style={{ color: colors.primaryText }}>{appointment.appointmentType}</p>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <p className="text-sm" style={{ color: colors.primaryText }}>{appointment.practitioner}</p>
                      </div>

                      <div className="col-span-1 flex flex-col justify-center">
                        <p className="text-sm font-medium" style={{ color: colors.primaryText }}>{date}</p>
                        <p className="text-xs" style={{ color: colors.subText }}>{time}</p>
                      </div>

                      <div className="col-span-1 flex items-center">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={getStatusStyle(appointment.status)}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredAppointments.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <Calendar className="size-12 mx-auto mb-3" style={{ color: colors.subText, opacity: 0.5 }} />
                    <p className="text-sm" style={{ color: colors.subText }}>
                      {appointments.length === 0
                        ? 'No appointments yet. Click "Schedule Appointment" to add one.'
                        : "No appointments found matching your filters"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === "calendar" && (
          <div
            className="rounded-lg p-12 text-center"
            style={{ backgroundColor: colors.surface, boxShadow: colors.background === "#0F172A" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
          >
            <CalendarDays className="size-16 mx-auto mb-4" style={{ color: "#3B82F6" }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.primaryText }}>Calendar View</h3>
            <p className="text-sm" style={{ color: colors.subText }}>
              Interactive calendar view coming soon. View appointments by day, week, or month.
            </p>
          </div>
        )}
      </div>

      <ScheduleAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        employees={employees}
        onSubmit={handleScheduleAppointment}
      />
    </div>
  );
}