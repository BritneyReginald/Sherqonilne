import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

const initialEmployees = [
  {
    id: "1",
    employeeId: "EMP001",
    fullName: "Sarah Johnson",
    jobTitle: "Site Safety Officer",
    siteLocation: "Johannesburg Main",
    complianceStatus: "compliant",
  },
  {
    id: "2",
    employeeId: "EMP002",
    fullName: "Michael Chen",
    jobTitle: "Construction Supervisor",
    siteLocation: "Cape Town Depot",
    complianceStatus: "action",
  },
  {
    id: "3",
    employeeId: "EMP003",
    fullName: "Thandiwe Mthembu",
    jobTitle: "Health & Safety Manager",
    siteLocation: "Durban Operations",
    complianceStatus: "compliant",
  },
  {
    id: "4",
    employeeId: "EMP004",
    fullName: "David van der Merwe",
    jobTitle: "Equipment Operator",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
  {
    id: "5",
    employeeId: "EMP005",
    fullName: "Precious Ndlovu",
    jobTitle: "Environmental Officer",
    siteLocation: "Pretoria Branch",
    complianceStatus: "compliant",
  },
  {
    id: "6",
    employeeId: "EMP006",
    fullName: "James Anderson",
    jobTitle: "Foreman",
    siteLocation: "Cape Town Depot",
    complianceStatus: "action",
  },
  {
    id: "7",
    employeeId: "EMP007",
    fullName: "Nomvula Dlamini",
    jobTitle: "Quality Inspector",
    siteLocation: "Durban Operations",
    complianceStatus: "review",
  },
  {
    id: "8",
    employeeId: "EMP008",
    fullName: "Peter Williams",
    jobTitle: "Site Manager",
    siteLocation: "Johannesburg Main",
    complianceStatus: "compliant",
  },
  {
    id: "9",
    employeeId: "EMP009",
    fullName: "Lindiwe Khumalo",
    jobTitle: "Safety Coordinator",
    siteLocation: "Pretoria Branch",
    complianceStatus: "action",
  },
  {
    id: "10",
    employeeId: "EMP010",
    fullName: "Robert Smith",
    jobTitle: "Maintenance Technician",
    siteLocation: "Cape Town Depot",
    complianceStatus: "compliant",
  },
  {
    id: "11",
    employeeId: "EMP011",
    fullName: "Zanele Nkosi",
    jobTitle: "Compliance Officer",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
  {
    id: "12",
    employeeId: "EMP012",
    fullName: "Andrew Brown",
    jobTitle: "Project Engineer",
    siteLocation: "Durban Operations",
    complianceStatus: "compliant",
  },
  {
    id: "13",
    employeeId: "EMP013",
    fullName: "Thabo Mokoena",
    jobTitle: "Safety Supervisor",
    siteLocation: "Pretoria Branch",
    complianceStatus: "action",
  },
  {
    id: "14",
    employeeId: "EMP014",
    fullName: "Emma Davis",
    jobTitle: "Training Coordinator",
    siteLocation: "Cape Town Depot",
    complianceStatus: "compliant",
  },
  {
    id: "15",
    employeeId: "EMP015",
    fullName: "Sipho Zulu",
    jobTitle: "Equipment Operator",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
];
interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  jobTitle: string;
  siteLocation: string;
  complianceStatus: "compliant" | "review" | "action";

  // Profile details
  email: string;
  phone: string;
  mobile: string;
  dateOfBirth: string;
  idNumber: string;
  gender: "male" | "female" | "other" | "";
  nationality: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  relationship: string;
  department: string;
  reportingManager: string;
  employmentType: "permanent" | "contract" | "temporary" | "intern" | "";
  startDate: string;
  contractEndDate: string;
  lengthOfService: string;
  salaryGrade: string;
  workSchedule: string;
}

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

const STORAGE_KEY = "workforce_employees";


export function Workforce() {
  const getStoredEmployees = (): Employee[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialEmployees;

    return JSON.parse(stored);
  } catch {
    return initialEmployees;
  }
};

  const { colors } = useTheme();
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee[]>(getStoredEmployees());
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}, [employees]);



  const filteredEmployees = employees.filter((employee) => {
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

  // Show employee profile if one is selected
  if (isAddingEmployee) {
    return (
      <AddEmployeeForm
        existingEmployees={employees}
        onCancel={() => setIsAddingEmployee(false)}
        onSave={(newEmployee) => {
  setEmployees((prev) => {
    const updated = [...prev, newEmployee];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  });

  setIsAddingEmployee(false);
}}
      />
    );
  }

  if (selectedEmployeeId) {
    const selectedEmployee = employees.find(
      (emp) => emp.employeeId === selectedEmployeeId,
    );

    if (!selectedEmployee) return null;

    return (
      <EmployeeProfile
        employee={selectedEmployee}
        onBack={() => setSelectedEmployeeId(null)}
      />
    );
  }

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
              onClick={() => setIsAddingEmployee(true)}
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
                {employees.length}
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
                  employees.filter((e) => e.complianceStatus === "compliant")
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
                  employees.filter((e) => e.complianceStatus === "review")
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
                  employees.filter((e) => e.complianceStatus === "action")
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
                        onClick={() =>
                          setSelectedEmployeeId(employee.employeeId)
                        }
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
                        No employees found matching the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm" style={{ color: colors.subText }}>
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComplianceBadgeProps {
  status: "compliant" | "review" | "action";
}

interface AddEmployeeFormProps {
  onCancel: () => void;
  onSave: (employee: Employee) => void;
  existingEmployees: Employee[];
}

function FormSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition"
      >
        {title}
      </button>

      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

function AddEmployeeForm({
  onCancel,
  onSave,
  existingEmployees,
}: AddEmployeeFormProps) {
  const [step, setStep] = useState(1);
  const canProceed = () => {
    if (step === 1) {
      return formData.employeeId && formData.fullName;
    }
    if (step === 2) {
      return formData.email;
    }
    return true;
  };
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const totalSteps = 6;
  const [openSection, setOpenSection] = useState<string>("personal");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const generateEmployeeId = () => {
    const numbers = existingEmployees.map((emp) =>
      parseInt(emp.employeeId.replace("EMP", ""), 10),
    );

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;

    return `EMP${String(nextNumber).padStart(3, "0")}`;
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }

      if (!formData.idNumber.trim()) {
        newErrors.idNumber = "ID number is required";
      }

      if (!formData.gender.trim()) {
        newErrors.gender = "Gender is required";
      }

      if (!formData.nationality.trim()) {
        newErrors.nationality = "Nationality is required";
      }
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }

      if (!formData.mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "office number is required";
      }

      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }
    }

    if (step === 3) {
      if (!formData.emergencyContact.trim()) {
        newErrors.emergencyContact = "Emergency contact Name is required";
      }

      if (!formData.relationship.trim()) {
        newErrors.relationship = "Relationship is required";
      }

      if (!formData.emergencyPhone.trim()) {
        newErrors.emergencyPhone = "Emergency number required";
      }
    }

    if (step === 4) {
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = "Job Title is required Name is required";
      }

      if (!formData.department.trim()) {
        newErrors.department = "Department is required";
      }

      if (!formData.siteLocation.trim()) {
        newErrors.siteLocation = "Site Location is required";
      }

      if (!formData.reportingManager.trim()) {
        newErrors.reportingManager = "The reporting manager is required";
      }

      if (!formData.employmentType.trim()) {
        newErrors.employmentType = "Employment type is required";
      }
    }

    if (step === 5) {
      if (!formData.startDate.trim()) {
        newErrors.startDate = "Start date is required";
      }

      if (!formData.contractEndDate.trim()) {
        newErrors.contractEndDate = "Contract end is required";
      }
    }

    if (step === 6) {
      if (!formData.salaryGrade.trim()) {
        newErrors.salaryGrade = "Salary grade is required";
      }

      if (!formData.workSchedule.trim()) {
        newErrors.workSchedule = "Work schedule is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string" && !value.trim()) {
        if (
          key !== "id" &&
          key !== "employeeId" &&
          key !== "complianceStatus"
        ) {
          newErrors[key] = "This field is required";
        }
      }
    });

    // Extra email format check
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [formData, setFormData] = useState<Employee>({
    id: crypto.randomUUID(),
    employeeId: generateEmployeeId(),
    fullName: "",
    jobTitle: "",
    siteLocation: "",
    complianceStatus: "compliant",

    email: "",
    phone: "",
    mobile: "",
    dateOfBirth: "",
    idNumber: "",
    gender: "",
    nationality: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    relationship: "",
    department: "",
    reportingManager: "",
    employmentType: "",
    startDate: "",
    contractEndDate: "",
    lengthOfService: "",
    salaryGrade: "",
    workSchedule: "",
  });

 const handleChange = (field: keyof Employee, value: string) => {
  if (field === "startDate") {
    setFormData((prev) => {
      const start = new Date(value);
      const today = new Date();

      let service = "";

      if (!isNaN(start.getTime())) {
        let years = today.getFullYear() - start.getFullYear();
        let months = today.getMonth() - start.getMonth();

        if (today.getDate() < start.getDate()) {
          months--;
        }

        if (months < 0) {
          years--;
          months += 12;
        }

        service = `${Math.max(0, years)} years ${Math.max(0, months)} months`;
      }

      return {
        ...prev,
        startDate: value,
        lengthOfService: service,
      };
    });

    return;
  }

  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [field]: "",
  }));
};

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const resetForm = () => {
    setStep(1);
    setDirection(1);
    setOpenSection("personal");

    setFormData({
      id: crypto.randomUUID(),
      employeeId: generateEmployeeId(),
      fullName: "",
      jobTitle: "",
      siteLocation: "",
      complianceStatus: "compliant",
      email: "",
      phone: "",
      mobile: "",
      dateOfBirth: "",
      idNumber: "",
      gender: "",
      nationality: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      relationship: "",
      department: "",
      reportingManager: "",
      employmentType: "",
      startDate: "",
      contractEndDate: "",
      lengthOfService: "",
      salaryGrade: "",
      workSchedule: "",
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6">Add New Employee</h2>

      <div className="space-y-6 max-w-2xl text-gray-900">
        {/* Personal Information
        employee id, full name, date of birth, id number, gender, nationality
        */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Step {step} of {totalSteps}
          </p>

          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute w-full"
            >
              {step === 1 && (
                <>
                  <FormSection
                    title="Personal Information"
                    isOpen={openSection === "personal"}
                    onToggle={() => setOpenSection("personal")}
                  >
                    <input
                      value={formData.employeeId}
                      readOnly
                      className="w-full border p-2 rounded bg-gray-100"
                    />

                    <select
                      value={formData.complianceStatus}
                      onChange={(e) =>
                        handleChange("complianceStatus", e.target.value as any)
                      }
                      className="w-full border p-2 rounded text-white"
                    >
                      <option value="compliant" className="text-gray-900">
                        Compliant
                      </option>
                      <option value="review" className="text-gray-900">
                        Review Needed
                      </option>
                      <option value="action" className="text-gray-900">
                        Action Required
                      </option>
                    </select>

                    <input
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.fullName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}

                    <div>
                      <label className="block text-sm mb-1 text-white">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        placeholder="Date of birth"
                        onChange={(e) =>
                          handleChange("dateOfBirth", e.target.value)
                        }
                        className={`w-full border p-2 rounded text-white ${
                          errors.dateOfBirth ? "border-red-500" : ""
                        }`}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    <input
                      placeholder="ID Number"
                      value={formData.idNumber}
                      onChange={(e) => handleChange("idNumber", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.idNumber ? "border-red-500" : ""
                      }`}
                    />
                    {errors.idNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.idNumber}
                      </p>
                    )}

                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleChange(
                          "gender",
                          e.target.value as Employee["gender"],
                        )
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.gender ? "border-red-500" : ""
                      }`}
                    >
                      <option value="" className="text-gray-900">
                        Select Gender
                      </option>
                      <option value="male" className="text-gray-900">
                        Male
                      </option>
                      <option value="female" className="text-gray-900">
                        Female
                      </option>
                      <option value="other" className="text-gray-900">
                        Other
                      </option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.gender}
                      </p>
                    )}

                    <input
                      placeholder="Nationality"
                      value={formData.nationality}
                      onChange={(e) =>
                        handleChange("nationality", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.nationality ? "border-red-500" : ""
                      }`}
                    />
                    {errors.nationality && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.nationality}
                      </p>
                    )}
                  </FormSection>
                </>
              )}

              {/* Contact details */}
              {/* email,office phone, mobile phone, address */}
              {step === 2 && (
                <>
                  <FormSection
                    title="Contact Details"
                    isOpen={openSection === "contact"}
                    onToggle={() => setOpenSection("contact")}
                  >
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}

                    <input
                      type="tel"
                      placeholder="Office Phone numbers"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}

                    <input
                      type="tel"
                      placeholder="Mobile numbers"
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.mobile ? "border-red-500" : ""
                      }`}
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobile}
                      </p>
                    )}

                    <input
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.address ? "border-red-500" : ""
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </FormSection>
                </>
              )}

              {/* Emergency contacts
        contact name, relationship, phone number
         */}
              {step === 3 && (
                <>
                  <FormSection
                    title="Emergency Contact"
                    isOpen={openSection === "emergency"}
                    onToggle={() => setOpenSection("emergency")}
                  >
                    <input
                      placeholder="Emergency Contact Name"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        handleChange("emergencyContact", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.emergencyContact ? "border-red-500" : ""
                      }`}
                    />
                    {errors.emergencyContact && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.emergencyContact}
                      </p>
                    )}

                    <input
                      placeholder="Relationship"
                      value={formData.relationship}
                      onChange={(e) =>
                        handleChange("relationship", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.relationship ? "border-red-500" : ""
                      }`}
                    />
                    {errors.relationship && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.relationship}
                      </p>
                    )}

                    <input
                      type="tel"
                      placeholder="Emegency contact number"
                      value={formData.emergencyPhone}
                      onChange={(e) =>
                        handleChange("emergencyPhone", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.emergencyPhone ? "border-red-500" : ""
                      }`}
                    />
                    {errors.emergencyPhone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.emergencyPhone}
                      </p>
                    )}
                  </FormSection>
                </>
              )}

              {/* Emplployment details
         Job Tite, department, site location, reporting manager, employment type
          */}
              {step === 4 && (
                <>
                  <FormSection
                    title="Employment Details"
                    isOpen={openSection === "employment"}
                    onToggle={() => setOpenSection("employment")}
                  >
                    <input
                      placeholder="Job Title"
                      value={formData.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      className={`w-full border p-2 rounded text-white ${
                        errors.jobTitle ? "border-red-500" : ""
                      }`}
                    />
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.jobTitle}
                      </p>
                    )}

                    <input
                      placeholder="Department"
                      value={formData.department}
                      onChange={(e) =>
                        handleChange("department", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-gray-900 ${
                        errors.department ? "border-red-500" : ""
                      }`}
                    />
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.department}
                      </p>
                    )}

                    <select
                      value={formData.siteLocation}
                      onChange={(e) =>
                        handleChange("siteLocation", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.siteLocation ? "border-red-500" : ""
                      }`}
                    >
                      <option value="" className="text-gray-900">
                        Select Site
                      </option>
                      {sites.slice(1).map((site) => (
                        <option
                          key={site}
                          value={site}
                          className="text-gray-900"
                        >
                          {site}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder="Reporting manager"
                      value={formData.reportingManager}
                      onChange={(e) =>
                        handleChange("reportingManager", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.reportingManager ? "border-red-500" : ""
                      }`}
                    />
                    {errors.reportingManager && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.reportingManager}
                      </p>
                    )}

                    <select
                      value={formData.employmentType}
                      onChange={(e) =>
                        handleChange(
                          "employmentType",
                          e.target.value as Employee["employmentType"],
                        )
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.employmentType ? "border-red-500" : ""
                      }`}
                    >
                      <option value="" className="text-gray-900">
                        Select Employment Type
                      </option>
                      <option value="permanent" className="text-gray-900">
                        Permanent
                      </option>
                      <option value="contract" className="text-gray-900">
                        Contract
                      </option>
                      <option value="temporary" className="text-gray-900">
                        Temporary
                      </option>
                      <option value="intern" className="text-gray-900">
                        Intern
                      </option>
                    </select>
                    {errors.employmentType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.employmentType}
                      </p>
                    )}
                  </FormSection>
                </>
              )}

              {/* Employment timeline
          start date, contract end date, length of service
           */}
              {step === 5 && (
                <>
                  <FormSection
                    title="Employment Timeline"
                    isOpen={openSection === "timeline"}
                    onToggle={() => setOpenSection("timeline")}
                  >
                    <div>
                      <label className="block text-sm mb-1 text-white">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleChange("startDate", e.target.value)
                        }
                        className={`w-full border p-2 rounded text-white ${
                          errors.startDate ? "border-red-500" : ""
                        }`}
                      />
                      {errors.startDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-white">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.contractEndDate}
                        onChange={(e) =>
                          handleChange("contractEndDate", e.target.value)
                        }
                        className={`w-full border p-2 rounded text-white ${
                          errors.contractEndDate ? "border-red-500" : ""
                        }`}
                      />
                      {errors.contractEndDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.contractEndDate}
                        </p>
                      )}
                    </div>

                    {formData.startDate && (
                      <input
                        value={formData.lengthOfService}
                        readOnly
                        className="w-full border p-2 rounded bg-gray-100 text-gray-700"
                      />
                    )}
                  </FormSection>
                </>
              )}

              {/* compensation and schedule
            salary grade, work schedule
            */}
              {step === 6 && (
                <>
                  <FormSection
                    title="Compensation & Schedule"
                    isOpen={openSection === "compensation"}
                    onToggle={() => setOpenSection("compensation")}
                  >
                    <input
                      placeholder="Salary Grade"
                      value={formData.salaryGrade}
                      onChange={(e) =>
                        handleChange("salaryGrade", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.salaryGrade ? "border-red-500" : ""
                      }`}
                    />
                    {errors.salaryGrade && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.salaryGrade}
                      </p>
                    )}

                    <input
                      placeholder="Work Schedule"
                      value={formData.workSchedule}
                      onChange={(e) =>
                        handleChange("workSchedule", e.target.value)
                      }
                      className={`w-full border p-2 rounded text-white ${
                        errors.workSchedule ? "border-red-500" : ""
                      }`}
                    />
                    {errors.workSchedule && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.workSchedule}
                      </p>
                    )}
                  </FormSection>
                </>
              )}

              <div className="flex justify-between items-center mt-8">
                {/* Left side */}
                <div>
                  {step > 1 && (
                    <button
                      onClick={() => {
                        setDirection(-1);
                        setStep((prev) => prev - 1);
                      }}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Back
                    </button>
                  )}
                </div>

                {/* Right side */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      resetForm();
                      onCancel();
                    }}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>

                  {step < totalSteps ? (
                    <button
                      onClick={() => {
                        if (validateStep()) {
                          setDirection(1);
                          setStep((prev) => prev + 1);
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const isCurrentStepValid = validateStep();
                        const isFormValid = validateAllSteps();

                        if (isCurrentStepValid && isFormValid) {
                          onSave(formData);
                          resetForm();
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Save Employee
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
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
