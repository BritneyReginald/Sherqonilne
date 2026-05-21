import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { EmployeeProfile } from "@/app/components/employee-profile";
import { useTheme } from "@/app/contexts/theme-context";
import { employees } from "@/app/components/data/employees";

const sites = [
  "All Sites",
  "Johannesburg Main",
  "Cape Town Depot",
  "Durban Operations",
  "Pretoria Branch",
];

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "compliant", label: "Compliant" },
  { value: "review", label: "Review Needed" },
  { value: "action", label: "Action Required" },
];

export function Workforce() {
  const { colors } = useTheme();
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [employeeList, setEmployeeList] = useState(employees);

  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 5;

  const steps = ["Personal", "Contact", "Reporting", "Employment", "Emergency"];

  const filteredEmployees = employeeList.filter((employee) => {
    const matchesSite =
      selectedSite === "All Sites" || employee.siteLocation === selectedSite;
    const matchesStatus =
      selectedStatus === "all" || employee.complianceStatus === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSite && matchesStatus && matchesSearch;
  });

  const handleAddEmployee = () => {
    const employee = {
      id: crypto.randomUUID(),
      ...newEmployee,
    };

    setEmployeeList((prev) => [...prev, employee]);

    setNewEmployee({
      employeeId: `EMP-${Date.now().toString().slice(-6)}`,
      fullName: "",
      dateOfBirth: "",
      idNumber: "",
      gender: "",
      nationality: "",

      email: "",
      phone: "",
      mobile: "",
      address: "",

      reportingManager: "",
      reportingManagerId: "",
      reportingManagerJobTitle: "",
      reportingManagerLegalAppointment: "",
      department: "",
      division: "",
      organisationalLevel: "",

      emergencyContact: "",
      relationship: "",
      emergencyPhone: "",

      jobTitle: "",
      siteLocation: "Johannesburg Main",
      employmentType: "",

      startDate: "",
      contractEndDate: "",

      salaryGrade: "",
      workSchedule: "",

      complianceStatus: "compliant",

      status: "Active",
    });
    setCurrentStep(1);

    setShowAddModal(false);
  };

  const [showAddModal, setShowAddModal] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    // Personal Information
    employeeId: `EMP-${Date.now().toString().slice(-6)}`,
    fullName: "",
    dateOfBirth: "",
    idNumber: "",
    gender: "",
    nationality: "",

    // Contact Information
    email: "",
    phone: "",
    mobile: "",
    address: "",

    // Reporting Structure
    reportingManager: "",
    reportingManagerId: "",
    reportingManagerJobTitle: "",
    reportingManagerLegalAppointment: "",
    department: "",
    division: "",
    organisationalLevel: "",

    // Emergency Contact
    emergencyContact: "",
    relationship: "",
    emergencyPhone: "",

    // Employment Details
    jobTitle: "",
    siteLocation: "Johannesburg Main",
    employmentType: "",

    // Timeline
    startDate: "",
    contractEndDate: "",

    // Compensation
    salaryGrade: "",
    workSchedule: "",

    // Compliance
    complianceStatus: "compliant" as "compliant" | "review" | "action",

    // Extra
    status: "Active",
  });

  // Show employee profile if one is selected
  if (selectedEmployee) {
    return (
      <EmployeeProfile
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
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
        {/* Header Section */}
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

          {/* Filter Section */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="size-5" style={{ color: colors.subText }} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: colors.surface,
                color: colors.primaryText,
                border: "none",
              }}
            >
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
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

            {/* Search Box */}
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

            {/* Export Button */}
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <p className="text-sm mb-2" style={{ color: colors.subText }}>
                Total Employees
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: colors.primaryText }}
              >
                {employeeList.length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: colors.surface,
              }}
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
              style={{
                backgroundColor: colors.surface,
              }}
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
              style={{
                backgroundColor: colors.surface,
              }}
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

        {/* Data Table */}
        <div className="px-8 pb-6">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: colors.surface,
            }}
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
                          {employee.fullName}
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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

          {/* Results Count */}
          <div className="mt-4 text-sm" style={{ color: colors.subText }}>
            Showing {filteredEmployees.length} of {employeeList.length}{" "}
            employees
          </div>
        </div>
      </div>
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

            {/* Progress Section */}
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

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(currentStep / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={labelClass}
                        style={{ color: colors.primaryText }}
                      >
                        Employee ID
                      </label>

                      <input
                        type="text"
                        value={newEmployee.employeeId}
                        readOnly
                        className={inputClass}
                        style={{
                          ...inputStyle,
                          opacity: 0.7,
                          cursor: "not-allowed",
                        }}
                      />
                    </div>

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
                        ID Number
                      </label>
                      <input
                        type="text"
                        placeholder="ID Number"
                        value={newEmployee.idNumber}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            idNumber: e.target.value,
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
                  </div>
                </div>
              )}

              {/* CONTACT INFORMATION */}
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
                      className="w-full px-4 py-2 rounded-lg col-span-2"
                    />
                  </div>
                </div>
              )}

              {/* REPORTING STRUCTURE */}
              {currentStep === 3 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Reporting Structure
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
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

                    <input
                      type="text"
                      placeholder="Reporting Manager ID"
                      value={newEmployee.reportingManagerId}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          reportingManagerId: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />

                    <input
                      type="text"
                      placeholder="Supervisor Job Title"
                      value={newEmployee.reportingManagerJobTitle}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          reportingManagerJobTitle: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />

                    <input
                      type="text"
                      placeholder="Legal Appointment"
                      value={newEmployee.reportingManagerLegalAppointment}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          reportingManagerLegalAppointment: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />

                    <input
                      type="text"
                      placeholder="Department"
                      value={newEmployee.department}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          department: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />

                    <input
                      type="text"
                      placeholder="Division"
                      value={newEmployee.division}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          division: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />

                    <input
                      type="text"
                      placeholder="Organisational Level"
                      value={newEmployee.organisationalLevel}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          organisationalLevel: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* EMPLOYMENT DETAILS */}
              {currentStep === 4 && (
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
                      {sites
                        .filter((site) => site !== "All Sites")
                        .map((site) => (
                          <option key={site}>{site}</option>
                        ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Employment Type"
                      value={newEmployee.employmentType}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          employmentType: e.target.value,
                        })
                      }
                      className={inputClass}
                      style={inputStyle}
                    />

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

                    <textarea
                      placeholder="Work Schedule"
                      value={newEmployee.workSchedule}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          workSchedule: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg col-span-2"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* EMERGENCY CONTACT */}
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
                    onClick={() => setShowAddModal(false)}
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
                      onClick={handleAddEmployee}
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

  const config = badgeConfig[status];

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
