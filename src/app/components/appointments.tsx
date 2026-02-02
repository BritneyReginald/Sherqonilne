import { useState } from "react";
import { Calendar, Clock, Search, Filter, Plus, List, CalendarDays, AlertCircle, User } from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useSiteFilter } from "@/app/contexts/site-filter-context";

interface Appointment {
  id: string;
  employeeName: string;
  workId: string;
  appointmentType: "Medical" | "Training" | "Induction";
  practitioner: string;
  dateTime: Date;
  status: "Confirmed" | "Pending" | "Urgent" | "Overdue";
  hasRestrictions?: boolean;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    employeeName: "Thabo Molefe",
    workId: "EMP-2451",
    appointmentType: "Medical",
    practitioner: "Dr. Sarah van Zyl",
    dateTime: new Date("2026-01-28T09:00:00"),
    status: "Confirmed",
  },
  {
    id: "2",
    employeeName: "Zanele Dlamini",
    workId: "EMP-2398",
    appointmentType: "Training",
    practitioner: "John Smith (Safety Officer)",
    dateTime: new Date("2026-01-27T14:00:00"),
    status: "Pending",
  },
  {
    id: "3",
    employeeName: "David van der Merwe",
    workId: "EMP-2501",
    appointmentType: "Medical",
    practitioner: "Dr. Michael Chen",
    dateTime: new Date("2026-01-26T11:30:00"),
    status: "Overdue",
    hasRestrictions: true,
  },
  {
    id: "4",
    employeeName: "Nandi Khumalo",
    workId: "EMP-2467",
    appointmentType: "Induction",
    practitioner: "Emma Thompson (HR)",
    dateTime: new Date("2026-01-29T08:00:00"),
    status: "Confirmed",
  },
  {
    id: "5",
    employeeName: "Peter Naidoo",
    workId: "EMP-2489",
    appointmentType: "Medical",
    practitioner: "Dr. Sarah van Zyl",
    dateTime: new Date("2026-01-30T10:00:00"),
    status: "Pending",
  },
  {
    id: "6",
    employeeName: "Lerato Mokoena",
    workId: "EMP-2512",
    appointmentType: "Training",
    practitioner: "John Smith (Safety Officer)",
    dateTime: new Date("2026-01-27T15:30:00"),
    status: "Confirmed",
  },
  {
    id: "7",
    employeeName: "Johan Botha",
    workId: "EMP-2334",
    appointmentType: "Medical",
    practitioner: "Dr. Michael Chen",
    dateTime: new Date("2026-01-25T09:00:00"),
    status: "Urgent",
    hasRestrictions: true,
  },
  {
    id: "8",
    employeeName: "Sipho Mthembu",
    workId: "EMP-2445",
    appointmentType: "Induction",
    practitioner: "Emma Thompson (HR)",
    dateTime: new Date("2026-02-01T13:00:00"),
    status: "Pending",
  },
  {
    id: "9",
    employeeName: "Anna Pretorius",
    workId: "EMP-2478",
    appointmentType: "Training",
    practitioner: "David Johnson (Trainer)",
    dateTime: new Date("2026-01-31T10:30:00"),
    status: "Confirmed",
  },
  {
    id: "10",
    employeeName: "Mandla Ngwenya",
    workId: "EMP-2523",
    appointmentType: "Medical",
    practitioner: "Dr. Sarah van Zyl",
    dateTime: new Date("2026-02-02T11:00:00"),
    status: "Pending",
  },
];

export function Appointments() {
  const { colors } = useTheme();
  const { selectedSite } = useSiteFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSiteFilter, setSelectedSiteFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Filter appointments
  const filteredAppointments = mockAppointments.filter((appt) => {
    const matchesSearch =
      appt.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.workId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || appt.appointmentType === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const upcomingCount = filteredAppointments.filter(
    (appt) => appt.status === "Confirmed" || appt.status === "Pending"
  ).length;
  const pendingCount = filteredAppointments.filter(
    (appt) => appt.status === "Pending"
  ).length;
  const overdueCount = filteredAppointments.filter(
    (appt) => appt.status === "Overdue" || appt.status === "Urgent"
  ).length;

  // Check for active restrictions
  const hasActiveRestrictions = mockAppointments.some(
    (appt) => appt.hasRestrictions
  );

  const getStatusStyle = (status: Appointment["status"]) => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: "#10B981",
          color: "white",
        };
      case "Pending":
        return {
          backgroundColor: "#F59E0B",
          color: "#0F172A",
        };
      case "Urgent":
      case "Overdue":
        return {
          backgroundColor: "#EF4444",
          color: "white",
        };
    }
  };

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { date: dateStr, time: timeStr };
  };

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: colors.background }}
    >
      {/* Alert Bar for Active Restrictions */}
      {hasActiveRestrictions && (
        <div
          className="w-full py-3 px-6 flex items-center gap-3"
          style={{
            backgroundColor: "white",
            color: "#0F172A",
          }}
        >
          <AlertCircle className="size-5" />
          <span className="text-sm font-medium">
            System Alert: 2 workers have active medical restrictions. Review appointments marked as "Urgent" immediately.
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.primaryText }}
          >
            Scheduling & Appointments
          </h1>
          <p className="text-sm" style={{ color: colors.subText }}>
            Manage medical examinations, training sessions, and site inductions
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Upcoming */}
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: colors.surface,
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.subText }}>
                  Total Upcoming
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: colors.primaryText }}
                >
                  {upcomingCount}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
              >
                <Calendar className="size-6" style={{ color: "#3B82F6" }} />
              </div>
            </div>
          </div>

          {/* Pending Confirmation */}
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: colors.surface,
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.subText }}>
                  Pending Confirmation
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "#F59E0B" }}
                >
                  {pendingCount}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                }}
              >
                <Clock className="size-6" style={{ color: "#F59E0B" }} />
              </div>
            </div>
          </div>

          {/* Overdue/Missed */}
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: colors.surface,
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.subText }}>
                  Overdue / Missed
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "#EF4444" }}
                >
                  {overdueCount}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                }}
              >
                <AlertCircle className="size-6" style={{ color: "#EF4444" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mb-6">
          <button
            className="flex items-center gap-3 px-8 py-4 rounded-lg transition-all text-base font-semibold"
            style={{
              backgroundColor: "#3B82F6",
              color: "white",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3B82F6";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)";
            }}
          >
            <Plus className="size-5" />
            <span>Schedule Appointment</span>
          </button>
        </div>

        {/* Filter & View Toggle Bar */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{
            backgroundColor: colors.surface,
            boxShadow:
              colors.background === "#0F172A"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Side: Filters */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4"
                  style={{ color: "#64748B" }}
                />
                <input
                  type="text"
                  placeholder="Search by Employee"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    color: "#F8FAFC",
                    border: "none",
                  }}
                />
              </div>

              {/* Site Dropdown */}
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  color: "#F8FAFC",
                  border: "none",
                }}
              >
                <option value="all">All Sites</option>
                <option value="sasol">Sasol Secunda</option>
                <option value="harmony">Harmony Gold Mine</option>
                <option value="transnet">Transnet Port Terminal</option>
              </select>

              {/* Appointment Type Dropdown */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  color: "#F8FAFC",
                  border: "none",
                }}
              >
                <option value="all">All Types</option>
                <option value="Medical">Medical</option>
                <option value="Training">Training</option>
                <option value="Induction">Induction</option>
              </select>
            </div>

            {/* Right Side: View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
                style={{
                  backgroundColor:
                    viewMode === "list"
                      ? "#3B82F6"
                      : "rgba(255, 255, 255, 0.05)",
                  color: viewMode === "list" ? "white" : colors.subText,
                }}
              >
                <List className="size-4" />
                <span className="text-sm font-medium">List</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
                style={{
                  backgroundColor:
                    viewMode === "calendar"
                      ? "#3B82F6"
                      : "rgba(255, 255, 255, 0.05)",
                  color: viewMode === "calendar" ? "white" : colors.subText,
                }}
              >
                <CalendarDays className="size-4" />
                <span className="text-sm font-medium">Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table (List View) */}
        {viewMode === "list" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Table Header */}
            <div
              className="grid grid-cols-6 gap-4 px-6 py-4"
              style={{
                backgroundColor:
                  colors.background === "#0F172A"
                    ? "rgba(15, 23, 42, 0.8)"
                    : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="col-span-1">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.subText }}
                >
                  Employee
                </span>
              </div>
              <div className="col-span-1">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.subText }}
                >
                  Type
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.subText }}
                >
                  Practitioner / Provider
                </span>
              </div>
              <div className="col-span-1">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.subText }}
                >
                  Date & Time
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
            </div>

            {/* Table Body */}
            <div>
              {filteredAppointments.map((appointment, index) => {
                const { date, time } = formatDateTime(appointment.dateTime);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={appointment.id}
                    className="grid grid-cols-6 gap-4 px-6 py-4 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isEven
                        ? colors.surface
                        : colors.background === "#0F172A"
                        ? "rgba(15, 23, 42, 0.4)"
                        : "rgba(0, 0, 0, 0.02)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(59, 130, 246, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isEven
                        ? colors.surface
                        : colors.background === "#0F172A"
                        ? "rgba(15, 23, 42, 0.4)"
                        : "rgba(0, 0, 0, 0.02)";
                    }}
                  >
                    {/* Employee Name & Work ID */}
                    <div className="col-span-1 flex items-center gap-2">
                      <div
                        className="size-9 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(59, 130, 246, 0.15)",
                        }}
                      >
                        <User className="size-4" style={{ color: "#3B82F6" }} />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {appointment.employeeName}
                        </p>
                        <p className="text-xs" style={{ color: colors.subText }}>
                          {appointment.workId}
                        </p>
                      </div>
                    </div>

                    {/* Appointment Type */}
                    <div className="col-span-1 flex items-center">
                      <p
                        className="text-sm"
                        style={{ color: colors.primaryText }}
                      >
                        {appointment.appointmentType}
                      </p>
                    </div>

                    {/* Practitioner */}
                    <div className="col-span-2 flex items-center">
                      <p
                        className="text-sm"
                        style={{ color: colors.primaryText }}
                      >
                        {appointment.practitioner}
                      </p>
                    </div>

                    {/* Date & Time */}
                    <div className="col-span-1 flex flex-col justify-center">
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {date}
                      </p>
                      <p className="text-xs" style={{ color: colors.subText }}>
                        {time}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex items-center">
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={getStatusStyle(appointment.status)}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredAppointments.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Calendar
                  className="size-12 mx-auto mb-3"
                  style={{ color: colors.subText, opacity: 0.5 }}
                />
                <p className="text-sm" style={{ color: colors.subText }}>
                  No appointments found matching your filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* Calendar View Placeholder */}
        {viewMode === "calendar" && (
          <div
            className="rounded-lg p-12 text-center"
            style={{
              backgroundColor: colors.surface,
              boxShadow:
                colors.background === "#0F172A"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CalendarDays
              className="size-16 mx-auto mb-4"
              style={{ color: "#3B82F6" }}
            />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: colors.primaryText }}
            >
              Calendar View
            </h3>
            <p className="text-sm" style={{ color: colors.subText }}>
              Interactive calendar view coming soon. View appointments by day, week, or month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
