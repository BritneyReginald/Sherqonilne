import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Filter,
  X,
  User,
  Calendar,
  Shield,
  FileCheck,
  Network,
} from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useLegalAppointments } from "@/app/contexts/legal-appointments-context";
import { appointmentTemplates } from "../templates/appointment-templates";

interface LegalAppointment {
  id: string;
  employeeName: string;
  jobTitle: string;
  appointmentType: string;
  legalSection: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Expired" | "Pending";
  documentUploaded: boolean;
  employeeId: string;
  department: string;
  signatureStatus: "Signed" | "Pending" | "Not Required";
  documentStatus:
    | "Not Generated"
    | "Generated"
    | "Downloaded"
    | "Uploaded"
    | "Signed";
  reportsTo?: string;
  reportsToId?: string;
  delegatedAuthorityScope: string;
  hierarchyLevel: number;
  templateKey?: string;
  documentName?: string;
  documentUrl?: string;
}

// const mockAppointments: LegalAppointment[] = [
//   {
//     id: "1",
//     employeeName: "Sarah Johnson",
//     jobTitle: "Safety Officer",
//     appointmentType: "Section 16.2 - Safety Officer",
//     legalSection: "OHS Act Section 16.2",
//     startDate: new Date("2024-01-15"),
//     endDate: new Date("2027-01-14"),
//     status: "Active",
//     documentUploaded: true,
//     employeeId: "EMP001",
//     department: "Health & Safety",
//     signatureStatus: "Signed",
//     reportsTo: "John Doe",
//     reportsToId: "EMP-1234",
//     delegatedAuthorityScope: "Health & Safety",
//     hierarchyLevel: 2,
//   },
//   {
//     id: "2",
//     employeeName: "Zanele Dlamini",
//     jobTitle: "SHE Representative",
//     appointmentType: "Section 17 - SHE Rep",
//     legalSection: "OHS Act Section 17",
//     startDate: new Date("2025-06-01"),
//     endDate: new Date("2027-05-31"),
//     status: "Active",
//     documentUploaded: true,
//     employeeId: "EMP002",
//     department: "Operations",
//     signatureStatus: "Signed",
//     reportsTo: "Jane Smith",
//     reportsToId: "EMP-5678",
//     delegatedAuthorityScope: "Operations",
//     hierarchyLevel: 3,
//   },
//   {
//     id: "3",
//     employeeName: "David van der Merwe",
//     jobTitle: "First Aider",
//     appointmentType: "First Aid Officer",
//     legalSection: "OHS Act Regulation 3",
//     startDate: new Date("2023-03-10"),
//     endDate: new Date("2026-01-20"),
//     status: "Expired",
//     documentUploaded: false,
//     employeeId: "EMP003",
//     department: "Production",
//     signatureStatus: "Pending",
//     reportsTo: "Alice Johnson",
//     reportsToId: "EMP-9012",
//     delegatedAuthorityScope: "Production",
//     hierarchyLevel: 4,
//   },
//   {
//     id: "4",
//     employeeName: "Nandi Khumalo",
//     jobTitle: "Fire Marshal",
//     appointmentType: "Fire Safety Officer",
//     legalSection: "OHS Act Regulation 4",
//     startDate: new Date("2025-09-01"),
//     endDate: new Date("2027-08-31"),
//     status: "Active",
//     documentUploaded: true,
//     employeeId: "EMP004",
//     department: "Facilities",
//     signatureStatus: "Signed",
//     reportsTo: "Bob Brown",
//     reportsToId: "EMP-3456",
//     delegatedAuthorityScope: "Facilities",
//     hierarchyLevel: 2,
//   },
//   {
//     id: "5",
//     employeeName: "Peter Naidoo",
//     jobTitle: "Construction Manager",
//     appointmentType: "Section 16.1 - Construction Work",
//     legalSection: "OHS Act Section 16.1",
//     startDate: new Date("2026-02-15"),
//     endDate: new Date("2028-02-14"),
//     status: "Pending",
//     documentUploaded: false,
//     employeeId: "EMP005",
//     department: "Engineering",
//     signatureStatus: "Pending",
//     reportsTo: "Charlie Davis",
//     reportsToId: "EMP-7890",
//     delegatedAuthorityScope: "Engineering",
//     hierarchyLevel: 3,
//   },
//   {
//     id: "6",
//     employeeName: "Lerato Mokoena",
//     jobTitle: "Environmental Officer",
//     appointmentType: "Environmental Management",
//     legalSection: "NEMA Section 24G",
//     startDate: new Date("2024-11-01"),
//     endDate: new Date("2026-10-31"),
//     status: "Active",
//     documentUploaded: true,
//     employeeId: "EMP006",
//     department: "Environmental",
//     signatureStatus: "Signed",
//     reportsTo: "Diana White",
//     reportsToId: "EMP-2345",
//     delegatedAuthorityScope: "Environmental",
//     hierarchyLevel: 2,
//   },
//   {
//     id: "7",
//     employeeName: "Johan Botha",
//     jobTitle: "Safety Officer",
//     appointmentType: "Section 16.2 - Safety Officer",
//     legalSection: "OHS Act Section 16.2",
//     startDate: new Date("2023-05-01"),
//     endDate: new Date("2026-04-30"),
//     status: "Active",
//     documentUploaded: true,
//     employeeId: "EMP-2334",
//     department: "Health & Safety",
//     signatureStatus: "Signed",
//     reportsTo: "Ethan Black",
//     reportsToId: "EMP007",
//     delegatedAuthorityScope: "Health & Safety",
//     hierarchyLevel: 3,
//   },
//   {
//     id: "8",
//     employeeName: "Sipho Mthembu",
//     jobTitle: "Occupational Hygienist",
//     appointmentType: "Occupational Hygiene",
//     legalSection: "OHS Act Section 13",
//     startDate: new Date("2025-01-10"),
//     endDate: new Date("2027-01-09"),
//     status: "Active",
//     documentUploaded: true,
//     employeeId: "EMP-2445",
//     department: "Health & Safety",
//     signatureStatus: "Signed",
//     reportsTo: "Fiona Green",
//     reportsToId: "EMP008",
//     delegatedAuthorityScope: "Health & Safety",
//     hierarchyLevel: 4,
//   },
// ];

interface LegalAppointmentsProps {
  employeeId?: string;
  sidebarOpen?: boolean;
}

export const generateAppointmentLetter = (appointment) => {
  const template = appointmentTemplates[appointment.templateKey || ""];

  if (!template) {
    return {
      title: "No Template",
      body: "No template found for this appointment type.",
    };
  }

  return {
    title: template.title,
    body: template.body(appointment),
  };
};

const appointmentTypeMap = {
  "Section 16.1 - CEO": {
    legalSection: "OHS Act Section 16.1",
    department: "Executive",
    templateKey: "ceo",
  },
  "Section 16.2 - Safety Officer": {
    legalSection: "OHS Act Section 16.2",
    department: "Health & Safety",
    templateKey: "safetyOfficer",
  },
  "Section 17 - SHE Rep": {
    legalSection: "OHS Act Section 17",
    department: "Health & Safety",
    templateKey: "hseRep",
  },
  "First Aid Officer": {
    legalSection: "OHS Act General Safety Regulation 3",
    department: "Health & Safety",
    templateKey: "firstAid",
  },
  "Fire Marshal": {
    legalSection: "OHS Act General Safety Regulation 4",
    department: "Facilities",
    templateKey: "fireMarshal",
  },
  "Incident Investigator": {
    legalSection: "OHS Act Section 24",
    department: "Health & Safety",
    templateKey: "investigator",
  },
};

export function LegalAppointments({
  employeeId,
  sidebarOpen = true,
}: LegalAppointmentsProps) {
  const isEmployeeView = !!employeeId;
  const { appointments, addAppointment, updateAppointment } =
    useLegalAppointments();

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailPanel, setShowDetailPanel] = useState(true);

  const filteredAppointments = appointments
    .filter((appt) => (employeeId ? appt.employeeId === employeeId : true))
    .filter((appt) => {
      const matchesType =
        filterType === "all" || appt.appointmentType.includes(filterType);

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

  const [selectedAppointment, setSelectedAppointment] = useState(
    filteredAppointments[0] || null,
  );
  const letter = selectedAppointment
    ? generateAppointmentLetter(selectedAppointment)
    : { title: "", body: "" };
  useEffect(() => {
    if (!filteredAppointments.find((a) => a.id === selectedAppointment?.id)) {
      setSelectedAppointment(filteredAppointments[0] || null);
    }
  }, [filteredAppointments]);
  const { colors } = useTheme();

  const getStatusStyle = (status: LegalAppointment["status"]) => {
    switch (status) {
      case "Active":
        return {
          backgroundColor: "#10B981",
          color: "white",
        };
      case "Expired":
        return {
          backgroundColor: "#EF4444",
          color: "white",
        };
      case "Pending":
        return {
          backgroundColor: "#F59E0B",
          color: "#0F172A",
        };
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate: Date | string) => {
    const today = new Date();
    const d = new Date(endDate);
    const diff = d.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    appointmentType: "",
    department: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "appointmentType") {
      const selected = appointmentTypeMap[value];

      setFormData((prev) => ({
        ...prev,
        appointmentType: value,
        department: selected?.department || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.employeeName || !formData.appointmentType) {
      alert("Please fill all required fields");
      return;
    }
    const selected = appointmentTypeMap[formData.appointmentType];

    const newAppointment = {
      id: Date.now().toString(),
      employeeName: formData.employeeName,
      employeeId: formData.employeeId,
      appointmentType: formData.appointmentType,
      department: selected?.department || formData.department,
      legalSection: selected?.legalSection || "N/A",
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),

      jobTitle: "N/A",
      status: "Active",
      documentUploaded: false,
      signatureStatus: "Pending",
      delegatedAuthorityScope: selected?.department || formData.department,
      hierarchyLevel: 3,
      templateKey: selected?.templateKey || "",
    };
    addAppointment(newAppointment);

    setShowAddModal(false);

    // reset form
    setFormData({
      employeeName: "",
      employeeId: "",
      appointmentType: "",
      department: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAppointment) return;

    const updatedAppointment = {
      ...selectedAppointment,
      documentUploaded: true,
      documentName: file.name,
      documentUrl: URL.createObjectURL(file),
    };

    updateAppointment(updatedAppointment);
    setSelectedAppointment(updatedAppointment);
  };

  const downloadLetter = (appointment) => {
    const { title, body } = generateAppointmentLetter(appointment);

    const blob = new Blob([`${title}\n\n${body}`], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${appointment.employeeName}_Appointment.txt`;
    link.click();
  };

  const downloadPDF = (appointment) => {
    const doc = new jsPDF();
    const { title, body } = generateAppointmentLetter(appointment);

    doc.text(title, 10, 10);
    const splitText = doc.splitTextToSize(body, 180);
    doc.text(splitText, 10, 20);

    doc.save(`Appointment_${appointment.employeeName}.pdf`);
  };

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
              {/* Total Appointments */}
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

              {/* Active Appointments */}
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

              {/* Expired Appointments */}
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

              {/* Pending Signatures */}
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

                  {/* Appointment Type Filter */}
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
                    <option value="16.1">Section 16.1</option>
                    <option value="16.2">Section 16.2</option>
                    <option value="17">SHE Rep</option>
                    <option value="First Aid">First Aid</option>
                    <option value="Fire">Fire Safety</option>
                    <option value="Environmental">Environmental</option>
                  </select>

                  {/* Status Filter */}
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

                  {/* Clear Filters */}
                  {(filterType !== "all" || filterStatus !== "all") && (
                    <button
                      onClick={() => {
                        setFilterType("all");
                        setFilterStatus("all");
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
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

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3">
                  <button onClick={() => handleFileUpload()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "#3B82F6",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(59, 130, 246, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(59, 130, 246, 0.1)";
                    }}
                    
                  >
                    <Upload className="size-4" />
                    <span>Upload Letter</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "#3B82F6",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(59, 130, 246, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(59, 130, 246, 0.1)";
                    }}
                  >
                    <Download className="size-4" />
                    <span>Export Register</span>
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
                    style={{
                      backgroundColor: "#3B82F6",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563EB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#3B82F6";
                    }}
                  >
                    <Plus className="size-4" />

                    <span>Add Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area: Table + Detail Panel */}
        <div className="grid grid-cols-12 gap-6">
          {/* Legal Appointments Table */}
          <div className={showDetailPanel ? "col-span-7" : "col-span-12"}>
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

              {/* Table Body */}
              <div>
                {filteredAppointments.map((appointment, index) => {
                  const isEven = index % 2 === 0;
                  const isSelected = selectedAppointment?.id === appointment.id;

                  return (
                    <div
                      key={appointment.id}
                      className="grid grid-cols-8 gap-3 px-4 py-4 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(59, 130, 246, 0.15)"
                          : isEven
                            ? colors.surface
                            : colors.background === "#0F172A"
                              ? "rgba(15, 23, 42, 0.4)"
                              : "rgba(0, 0, 0, 0.02)",
                      }}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailPanel(true);
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(59, 130, 246, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = isEven
                            ? colors.surface
                            : colors.background === "#0F172A"
                              ? "rgba(15, 23, 42, 0.4)"
                              : "rgba(0, 0, 0, 0.02)";
                        }
                      }}
                    >
                      {/* Employee */}
                      <div className="col-span-2 flex items-center gap-2">
                        <div
                          className="size-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: "rgba(59, 130, 246, 0.15)",
                          }}
                        >
                          <User
                            className="size-4"
                            style={{ color: "#3B82F6" }}
                          />
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

                      {/* Appointment Type */}
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

                      {/* End Date */}
                      <div className="col-span-1 flex items-center">
                        <p
                          className="text-sm"
                          style={{ color: colors.primaryText }}
                        >
                          {formatDate(appointment.endDate)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex items-center">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={getStatusStyle(appointment.status)}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      {/* Document */}
                      <div className="col-span-1 flex items-center">
                        {appointment.documentUploaded ? (
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

                      {/* Actions */}
                      <div className="col-span-1 flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(appointment);
                            setShowDetailPanel(true);
                          }}
                          title="View Details"
                        >
                          <Eye
                            className="size-4"
                            style={{ color: "#3B82F6" }}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointment Detail Panel */}
          {showDetailPanel && selectedAppointment && (
            <div className="col-span-5">
              <div
                className="rounded-lg p-6 sticky top-6"
                style={{
                  backgroundColor: colors.surface,
                  boxShadow:
                    colors.background === "#0F172A"
                      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(59, 130, 246, 0.15)",
                      }}
                    >
                      <User className="size-6" style={{ color: "#3B82F6" }} />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: colors.primaryText }}
                      >
                        {selectedAppointment.employeeName}
                      </h3>
                      <p className="text-sm" style={{ color: colors.subText }}>
                        {selectedAppointment.employeeId} •{" "}
                        {selectedAppointment.jobTitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <X className="size-4" style={{ color: colors.subText }} />
                  </button>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Appointment Type
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      {selectedAppointment.appointmentType}
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Legal Section
                    </p>
                    <div className="flex items-center gap-2">
                      <Shield className="size-4" style={{ color: "#3B82F6" }} />
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {selectedAppointment.legalSection}
                      </p>
                    </div>
                  </div>

                  {/* Reporting Relationship */}
                  {selectedAppointment.reportsTo && (
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: colors.subText }}
                      >
                        Reports To
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: "var(--brand-blue)" }}
                        >
                          {selectedAppointment.reportsTo
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: colors.primaryText }}
                          >
                            {selectedAppointment.reportsTo}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.subText }}
                          >
                            {selectedAppointment.reportsToId}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delegated Authority Scope */}
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Delegated Authority Scope
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: colors.primaryText }}
                    >
                      {selectedAppointment.delegatedAuthorityScope}
                    </p>
                  </div>

                  {/* Appointment Hierarchy Level */}
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Appointment Hierarchy Level
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          color: "#3B82F6",
                        }}
                      >
                        Level {selectedAppointment.hierarchyLevel}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: colors.subText }}
                      >
                        {selectedAppointment.hierarchyLevel === 1
                          ? "Principal Appointment"
                          : selectedAppointment.hierarchyLevel === 2
                            ? "Senior Authority"
                            : selectedAppointment.hierarchyLevel === 3
                              ? "Mid-level Authority"
                              : "Operational Level"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: colors.subText }}
                      >
                        Start Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar
                          className="size-4"
                          style={{ color: colors.subText }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: colors.primaryText }}
                        >
                          {formatDate(selectedAppointment.startDate)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: colors.subText }}
                      >
                        End Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar
                          className="size-4"
                          style={{ color: colors.subText }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: colors.primaryText }}
                        >
                          {formatDate(selectedAppointment.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Days Remaining
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color:
                          calculateDaysRemaining(selectedAppointment.endDate) <
                          90
                            ? "#F59E0B"
                            : "#10B981",
                      }}
                    >
                      {calculateDaysRemaining(selectedAppointment.endDate)} days
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Status
                    </p>
                    <span
                      className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={getStatusStyle(selectedAppointment.status)}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>

                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: colors.subText }}
                    >
                      Department
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: colors.primaryText }}
                    >
                      {selectedAppointment.department}
                    </p>
                  </div>
                </div>

                {/* Document Section */}
                <div
                  className="rounded-lg p-4 mb-6"
                  style={{
                    backgroundColor:
                      colors.background === "#0F172A"
                        ? "rgba(15, 23, 42, 0.6)"
                        : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <h3 className="text-md font-semibold mb-2">
                    Generated Appointment Letter
                  </h3>

                  <div className="p-4 rounded-lg bg-gray-100 text-sm whitespace-pre-line text-gray-900">
                    <strong>{letter.title}</strong>
                    {"\n\n"}
                    {letter.body}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    Appointment Letter
                  </p>
                  {selectedAppointment.documentUploaded ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className="size-4"
                        style={{ color: "#10B981" }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#10B981" }}
                      >
                        Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle
                        className="size-4"
                        style={{ color: "#EF4444" }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#EF4444" }}
                      >
                        Missing
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadPDF(selectedAppointment)}
                    className="p-5"
                  >
                    <Download /> Download Letter
                  </button>

                  <button className="p-2">Sign Electronically</button>
                </div>
                {selectedAppointment.documentUploaded ? (
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <FileCheck
                      className="size-8"
                      style={{ color: "#3B82F6" }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {selectedAppointment.documentName ||
                          `Appointment_Letter_${selectedAppointment.employeeId}.pdf`}
                      </p>
                      <p className="text-xs" style={{ color: colors.subText }}>
                        Uploaded: {formatDate(selectedAppointment.startDate)}
                      </p>
                    </div>
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    >
                      <Download
                        className="size-4"
                        style={{ color: "#3B82F6" }}
                      />
                    </button>
                  </div>
                ) : (
                  <label className="w-full py-3 rounded-lg border-2 border-dashed text-sm font-medium cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="size-5 mb-1" />
                    Upload Document
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>

              {/* Signature Status */}
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  backgroundColor:
                    selectedAppointment.signatureStatus === "Signed"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(245, 158, 11, 0.1)",
                }}
              >
                <div className="flex items-center gap-3">
                  <FileText
                    className="size-5"
                    style={{
                      color:
                        selectedAppointment.signatureStatus === "Signed"
                          ? "#10B981"
                          : "#F59E0B",
                    }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.primaryText }}
                    >
                      Signature Status
                    </p>
                    <p className="text-xs" style={{ color: colors.subText }}>
                      {selectedAppointment.signatureStatus === "Signed"
                        ? "Appointment letter signed and acknowledged"
                        : "Awaiting employee signature"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all text-sm font-medium"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    color: "#3B82F6",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(59, 130, 246, 0.1)";
                  }}
                >
                  <RefreshCw className="size-4" />
                  <span>Renew</span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all text-sm font-medium"
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3B82F6";
                  }}
                >
                  <Upload className="size-4" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Add Appointment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-gray-900">
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                placeholder="Employee Name"
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Employee ID"
                className="w-full border p-2 rounded"
              />

              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Appointment Type</option>
                {Object.keys(appointmentTypeMap).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                readOnly
                className="w-full border p-2 rounded bg-gray-100"
              />

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                placeholder="Start Date"
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                placeholder="End Date"
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
