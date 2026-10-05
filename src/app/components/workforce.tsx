import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  UserX,
  Camera,
} from "lucide-react";
import { createPortal } from "react-dom";
import { EmployeeProfile } from "../components/employee-profile";
import { useTheme } from "../contexts/theme-context";
import { useRecycleBin } from "../contexts/recycle-bin-context";
import { Employee } from "@/app/types";
import { useSiteFilter } from "../contexts/site-filter-context";
import { getSites } from "../../api/siteAPI";

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "compliant", label: "Compliant" },
  { value: "review", label: "Review Needed" },
  { value: "action", label: "Action Required" },
];

const complianceOptions = statuses.filter((s) => s.value !== "all");
const employmentTypes = ["Permanent", "Contract", "Temporary"];

interface SiteOption {
  id: string;
  name: string;
}

/**
 * Maps a raw DB row (snake_case, as returned by the /employees API)
 * into the frontend Employee shape (camelCase). This is the single
 * source of truth for that mapping — every place that turns an API
 * response into an Employee (fetch list, create, upload picture,
 * upload document) should route through this function so nothing
 * gets silently dropped again.
 */
function mapApiEmployee(employee: any): Employee {
  return {
    id: employee.id.toString(),
    employeeId: employee.employee_number ?? "",
    fullName: employee.full_name,
    dateOfBirth: employee.date_of_birth,
    gender: employee.gender,
    nationality: employee.nationality,
    email: employee.email,
    phone: employee.phone,
    mobile: employee.mobile,
    address: employee.address,
    reportingManager: employee.reporting_manager,
    jobTitle: employee.job_title,
    siteLocation: employee.site_location,
    employmentType: employee.employment_type,
    startDate: employee.start_date,
    contractEndDate: employee.contract_end_date,
    salaryGrade: employee.salary_grade,
    workSchedule: employee.work_schedule,
    complianceStatus: employee.compliance_status,
    status: employee.status,
    emergencyContact: employee.emergency_contact,
    relationship: employee.relationship,
    emergencyPhone: employee.emergency_phone,
    idDocumentFileName: employee.id_document_file_name,
    idDocumentUrl: employee.id_document_url,
    profilePictureFileName: employee.profile_picture_file_name,
    profilePictureUrl: employee.profile_picture_url,
  };
}

export function Workforce() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { colors } = useTheme();
  const { selectedSite } = useSiteFilter();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    type: "deactivate" | "delete";
    employee: Employee;
  } | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const { moveToRecycleBin } = useRecycleBin();
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSites, setAvailableSites] = useState<SiteOption[]>([]);

  const [menuAnchor, setMenuAnchor] = useState<{
    employee: Employee;
    x: number;
    y: number;
  } | null>(null);

  const totalSteps = 5;
  const steps = ["Personal", "Contact", "Employment", "Timeline", "Emergency"];

  useEffect(() => {
    fetchEmployees();
    getSites()
      .then((data: any[]) =>
        setAvailableSites(
          data.map((s) => ({ id: String(s.id), name: s.name })),
        ),
      )
      .catch((err) => console.error("Failed to load sites:", err));
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();

      setEmployeeList(data.map(mapApiEmployee));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const filteredEmployees = employeeList.filter((employee) => {
    const matchesSite =
      !selectedSite || employee.siteLocation === selectedSite.name;
    const matchesStatus =
      selectedStatus === "all" || employee.complianceStatus === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSite && matchesStatus && matchesSearch;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);

  const emptyNewEmployee = {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",

    email: "",
    phone: "",
    mobile: "",
    address: "",

    jobTitle: "",
    siteLocation: selectedSite?.name ?? "",
    reportingManager: "",
    employmentType: "",
    complianceStatus: "compliant" as "compliant" | "review" | "action",

    startDate: "",
    contractEndDate: "",
    salaryGrade: "",
    workSchedule: "",

    emergencyContact: "",
    relationship: "",
    emergencyPhone: "",

    status: "Active",
  };

  const [newEmployee, setNewEmployee] = useState(emptyNewEmployee);

  const resetAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    setIdDocumentFile(null);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    setNewEmployee(emptyNewEmployee);
  };

  const handleSaveEmployee = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(
          `Failed to save employee (${response.status}): ${responseText}`,
        );
      }

      let savedEmployee = JSON.parse(responseText);

      // The employee number and DB id only exist once the record is
      // created, so both file uploads always happen second.
      if (idDocumentFile) {
        try {
          const formData = new FormData();
          formData.append("idDocument", idDocumentFile);
          const uploadRes = await fetch(
            `${API_URL}/employees/${savedEmployee.id}/id-document`,
            { method: "POST", body: formData },
          );
          if (uploadRes.ok) {
            savedEmployee = await uploadRes.json();
          } else {
            console.error("Employee saved, but ID document upload failed");
          }
        } catch (uploadErr) {
          console.error("ID document upload error:", uploadErr);
        }
      }

      if (profilePictureFile) {
        try {
          const formData = new FormData();
          formData.append("profilePicture", profilePictureFile);
          const uploadRes = await fetch(
            `${API_URL}/employees/${savedEmployee.id}/profile-picture`,
            { method: "POST", body: formData },
          );
          if (uploadRes.ok) {
            savedEmployee = await uploadRes.json();
          } else {
            console.error("Employee saved, but profile picture upload failed");
          }
        } catch (uploadErr) {
          console.error("Profile picture upload error:", uploadErr);
        }
      }

      const formattedEmployee = mapApiEmployee(savedEmployee);

      setEmployeeList((prev) => [...prev, formattedEmployee]);
      resetAddModal();
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  const handleDeactivate = async (employee: Employee) => {
    setIsActioning(true);
    try {
      const response = await fetch(
        `${API_URL}/employees/${employee.id}/deactivate`,
        { method: "PATCH", headers: { "Content-Type": "application/json" } },
      );
      if (!response.ok) throw new Error("Failed");

      setEmployeeList((prev) =>
        prev.map((e) =>
          e.id === employee.id ? { ...e, status: "Inactive" } : e,
        ),
      );
      setConfirmModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActioning(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    setIsActioning(true);
    try {
      const response = await fetch(`${API_URL}/employees/${employee.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed");

      moveToRecycleBin({
        id: employee.id,
        name: employee.fullName,
        type: "Employee",
        data: employee,
        deletedAt: new Date().toISOString(),
      });

      setEmployeeList((prev) => prev.filter((e) => e.id !== employee.id));
      setConfirmModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActioning(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("workforce:openAddModal") === "1") {
      sessionStorage.removeItem("workforce:openAddModal");
      setShowAddModal(true);
    }
  }, []);

  if (selectedEmployee) {
    return (
      <EmployeeProfile
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
        onEmployeeUpdate={(updated: any) => {
          if (updated._deleted) {
            setEmployeeList((prev) => prev.filter((e) => e.id !== updated.id));
            setSelectedEmployee(null);
          } else {
            setEmployeeList((prev) =>
              prev.map((e) => (e.id === updated.id ? updated : e)),
            );
            setSelectedEmployee(updated);
          }
        }}
      />
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border outline-none transition-all";
  const inputStyle = {
    backgroundColor: colors.background,
    color: colors.primaryText,
    border: `1px solid ${colors.border || "rgba(255,255,255,0.1)"}`,
  };
  const labelClass = "block text-sm font-medium mb-2";

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1
                className="text-3xl mb-2"
                style={{ color: colors.primaryText }}
              >
                Workforce Management
              </h1>
              <p className="text-sm" style={{ color: colors.subText }}>
                Manage employee records and monitor compliance status
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <UserPlus className="size-4" />
              Add Employee
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="size-5" style={{ color: colors.subText }} />
            <div
              className="px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
              }}
            >
              Site: {selectedSite?.name ?? "All Sites"}
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
                border: "none",
              }}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                style={{ color: colors.subText }}
              />
              <input
                type="text"
                placeholder="Search by name, ID, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.primaryText,
                  border: "none",
                }}
              />
            </div>

            <button
              className="px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
              }}
            >
              <Download className="size-4" />
              Export
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div
              className="px-6 py-4 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Total Employees
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {filteredEmployees.length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Compliant
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {
                  employeeList.filter((e) => e.complianceStatus === "compliant")
                    .length
                }
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Review Needed
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-warning)" }}
              >
                {
                  employeeList.filter((e) => e.complianceStatus === "review")
                    .length
                }
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Action Required
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-danger)" }}
              >
                {
                  employeeList.filter((e) => e.complianceStatus === "action")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-8 pb-6">
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      backgroundColor:
                        colors.background === "#0F172A"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Employee ID
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Full Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Job Title
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Site Location
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Overall Compliance Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: colors.subText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        className="transition-opacity cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? "transparent"
                              : colors.background === "#0F172A"
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(0, 0, 0, 0.01)",
                        }}
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <td
                          className="px-6 py-4 text-sm font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {employee.employeeId}
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.primaryText }}
                        >
                          <div className="flex items-center gap-2">
                            {employee.profilePictureUrl ? (
                              <img
                                src={employee.profilePictureUrl}
                                alt={employee.fullName}
                                className="size-7 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="size-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                style={{ backgroundColor: "var(--brand-blue)" }}
                              >
                                {employee.fullName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                            )}
                            {employee.fullName}
                            {employee.status === "Inactive" && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: "#F3F4F6",
                                  color: "#6B7280",
                                }}
                              >
                                Inactive
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.subText }}
                        >
                          {employee.jobTitle}
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.subText }}
                        >
                          {employee.siteLocation}
                        </td>
                        <td className="px-6 py-4">
                          <ComplianceBadge status={employee.complianceStatus} />
                        </td>
                        <td
                          className="px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setMenuAnchor(
                                menuAnchor?.employee.id === employee.id
                                  ? null
                                  : { employee, x: rect.right, y: rect.bottom },
                              );
                            }}
                            className="px-2 py-1 rounded text-lg leading-none"
                            style={{ color: colors.subText }}
                          >
                            ⋮
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm"
                        style={{ color: colors.subText }}
                      >
                        No employee found matching the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm" style={{ color: colors.subText }}>
            Showing {filteredEmployees.length} of {employeeList.length}{" "}
            employees
          </div>
        </div>
      </div>

      {/* Row action menu — portal, fixed position, immune to table clipping */}
      {menuAnchor &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuAnchor(null)}
            />
            <div
              className="fixed w-52 rounded-lg border shadow-lg z-50 overflow-hidden"
              style={{
                top: menuAnchor.y + 4,
                left: Math.max(8, menuAnchor.x - 208),
                backgroundColor: colors.surface,
                borderColor: colors.border || "var(--grey-200)",
              }}
            >
              <button
                onClick={() => {
                  const employee = menuAnchor.employee;
                  setMenuAnchor(null);
                  setConfirmModal({ type: "deactivate", employee });
                }}
                className="w-full px-4 py-3 text-sm text-left flex items-center gap-2"
                style={{ color: "#B45309" }}
              >
                <UserX className="size-4" />
                Deactivate Employee
              </button>
              <div
                style={{
                  borderTop: `1px solid ${colors.border || "var(--grey-100)"}`,
                }}
              />
              <button
                onClick={() => {
                  const employee = menuAnchor.employee;
                  setMenuAnchor(null);
                  setConfirmModal({ type: "delete", employee });
                }}
                className="w-full px-4 py-3 text-sm text-left flex items-center gap-2"
                style={{ color: "#DC2626" }}
              >
                <Trash2 className="size-4" />
                Delete Permanently
              </button>
            </div>
          </>,
          document.body,
        )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="w-full max-w-5xl rounded-xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: colors.primaryText }}
            >
              Add Employee
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        currentStep >= index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="text-xs mt-2"
                      style={{ color: colors.subText }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* PERSONAL */}
              {currentStep === 1 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Personal Information
                  </h3>
                  <p className="text-xs mb-4" style={{ color: colors.subText }}>
                    Employee ID (e.g. EMP004) is generated automatically once
                    you save.
                  </p>

                  {/* Profile picture picker */}
                  <div className="flex items-center gap-4 mb-6">
                    <label className="relative cursor-pointer group shrink-0">
                      <div
                        className="size-20 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
                        style={{ backgroundColor: "var(--brand-blue)" }}
                      >
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="size-7 opacity-80" />
                        )}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 size-7 rounded-full flex items-center justify-center border-2"
                        style={{
                          backgroundColor: "#3B82F6",
                          borderColor: colors.surface,
                        }}
                      >
                        <Camera className="size-3.5 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setProfilePictureFile(file);
                          if (file) {
                            setProfilePicturePreview(URL.createObjectURL(file));
                          } else {
                            setProfilePicturePreview(null);
                          }
                        }}
                      />
                    </label>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        Profile Picture
                      </p>
                      <p className="text-xs" style={{ color: colors.subText }}>
                        Optional — click the camera icon to upload
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newEmployee.fullName}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            fullName: e.target.value,
                          })
                        }
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Date Of Birth
                      </label>
                      <input
                        type="date"
                        value={newEmployee.dateOfBirth}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Gender
                      </label>
                      <select
                        value={newEmployee.gender}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            gender: e.target.value,
                          })
                        }
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Nationality
                      </label>
                      <input
                        type="text"
                        placeholder="Nationality"
                        value={newEmployee.nationality}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            nationality: e.target.value,
                          })
                        }
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Employee ID Document (upload)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setIdDocumentFile(e.target.files?.[0] ?? null)
                        }
                        className={inputClass}
                        style={inputStyle}
                      />
                      {idDocumentFile && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: colors.subText }}
                        >
                          Selected: {idDocumentFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {currentStep === 2 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={newEmployee.email}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          email: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Office Phone"
                      value={newEmployee.phone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          phone: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Mobile Phone"
                      value={newEmployee.mobile}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          mobile: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={newEmployee.address}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          address: e.target.value,
                        })
                      }
                      className={`${inputClass} col-span-2`}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* EMPLOYMENT */}
              {currentStep === 3 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newEmployee.jobTitle}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          jobTitle: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <select
                      value={newEmployee.siteLocation}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          siteLocation: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    >
                      <option value="">Select Site</option>
                      {availableSites.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Reporting Manager"
                      value={newEmployee.reportingManager}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          reportingManager: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <select
                      value={newEmployee.employmentType}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          employmentType: e.target.value,
                          contractEndDate:
                            e.target.value === "Contract"
                              ? newEmployee.contractEndDate
                              : "",
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    >
                      <option value="">Select Employment Type</option>
                      {employmentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="col-span-2">
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Compliance Status
                      </label>
                      <select
                        value={newEmployee.complianceStatus}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            complianceStatus: e.target.value as any,
                          })
                        }
                        className={inputClass}
                        style={inputStyle}
                      >
                        {complianceOptions.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TIMELINE & COMPENSATION */}
              {currentStep === 4 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Employment Timeline & Compensation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newEmployee.startDate}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            startDate: e.target.value,
                          })
                        }
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    {newEmployee.employmentType === "Contract" && (
                      <div>
                        <label
                          className={labelClass}
                          style={{ color: colors.primaryText }}
                        >
                          Contract End Date
                        </label>
                        <input
                          type="date"
                          value={newEmployee.contractEndDate}
                          onChange={(e) =>
                            setNewEmployee({
                              ...newEmployee,
                              contractEndDate: e.target.value,
                            })
                          }
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Salary Grade"
                      value={newEmployee.salaryGrade}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          salaryGrade: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <textarea
                      placeholder="Work Schedule"
                      value={newEmployee.workSchedule}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          workSchedule: e.target.value,
                        })
                      }
                      className={`${inputClass} col-span-2`}
                      style={inputStyle}
                      rows={3}
                    />
                    <p
                      className="text-xs col-span-2"
                      style={{ color: colors.subText }}
                    >
                      Length of service is calculated automatically from the
                      start date once the employee is saved — no need to enter
                      it here.
                    </p>
                  </div>
                </div>
              )}

              {/* EMERGENCY */}
              {currentStep === 5 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newEmployee.emergencyContact}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          emergencyContact: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={newEmployee.relationship}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          relationship: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={newEmployee.emergencyPhone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          emergencyPhone: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t mt-6">
                <button
                  onClick={() =>
                    currentStep > 1 && setCurrentStep(currentStep - 1)
                  }
                  disabled={currentStep === 1}
                  className="px-5 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primaryText,
                    opacity: currentStep === 1 ? 0.5 : 1,
                  }}
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={resetAddModal}
                    className="px-5 py-2 rounded-lg"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.primaryText,
                    }}
                  >
                    Cancel
                  </button>
                  {currentStep < totalSteps ? (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-5 py-2 rounded-lg text-white bg-blue-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveEmployee}
                      className="px-5 py-2 rounded-lg text-white bg-green-600"
                    >
                      Save Employee
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md rounded-xl shadow-xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="size-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    confirmModal.type === "delete" ? "#FEE2E2" : "#FEF3C7",
                }}
              >
                {confirmModal.type === "delete" ? (
                  <Trash2 className="size-5" style={{ color: "#DC2626" }} />
                ) : (
                  <UserX className="size-5" style={{ color: "#B45309" }} />
                )}
              </div>
              <h2
                className="text-lg font-medium"
                style={{ color: colors.primaryText }}
              >
                {confirmModal.type === "delete"
                  ? "Delete Permanently"
                  : "Deactivate Employee"}
              </h2>
            </div>
            <p className="text-sm mb-1" style={{ color: colors.primaryText }}>
              Are you sure you want to{" "}
              {confirmModal.type === "delete"
                ? "permanently delete"
                : "deactivate"}{" "}
              <strong>{confirmModal.employee.fullName}</strong>?
            </p>
            <p
              className="text-sm mb-6"
              style={{
                color:
                  confirmModal.type === "delete" ? "#DC2626" : colors.subText,
              }}
            >
              {confirmModal.type === "delete"
                ? "⚠ This cannot be undone. All data will be removed from the database."
                : "Their record will be kept but marked as Inactive."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.background,
                  color: colors.primaryText,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmModal.type === "delete"
                    ? handleDelete(confirmModal.employee)
                    : handleDeactivate(confirmModal.employee)
                }
                disabled={isActioning}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60"
                style={{
                  backgroundColor:
                    confirmModal.type === "delete" ? "#DC2626" : "#D97706",
                }}
              >
                {isActioning
                  ? "Processing…"
                  : confirmModal.type === "delete"
                    ? "Yes, Delete"
                    : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ComplianceBadgeProps {
  status: "compliant" | "review" | "action";
}

function ComplianceBadge({ status }: ComplianceBadgeProps) {
  const badgeConfig = {
    compliant: {
      label: "Compliant",
      color: "var(--compliance-success)",
      icon: <CheckCircle2 className="size-4" />,
    },
    review: {
      label: "Review Needed",
      color: "var(--compliance-warning)",
      icon: <AlertTriangle className="size-4" />,
    },
    action: {
      label: "Action Required",
      color: "var(--compliance-danger)",
      icon: <XCircle className="size-4" />,
    },
  };

  const config =
    badgeConfig[status as keyof typeof badgeConfig] ?? badgeConfig.compliant;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.icon}
      {config.label}
    </div>
  );
}
