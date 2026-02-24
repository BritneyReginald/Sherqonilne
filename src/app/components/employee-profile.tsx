import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Download,
  CheckCircle2,
} from "lucide-react";

interface EmployeeProfileProps {
  employee: any;
  onBack: () => void;
}

type TabType =
  | "personal"
  | "appointments"
  | "training"
  | "medical"
  | "ppe"
  | "documents";

const tabs = [
  { id: "personal" as TabType, label: "Personal Details" },
  { id: "appointments" as TabType, label: "Legal Appointments" },
  { id: "training" as TabType, label: "Training Matrix" },
  { id: "medical" as TabType, label: "Medical Surveillance" },
  { id: "ppe" as TabType, label: "PPE Issued" },
  { id: "documents" as TabType, label: "Scanned Documents" },
];

// Mock employee data - in a real app this would come from an API
// const employeeData = {
//   EMP001: {
//     employeeId: "EMP001",
//     fullName: "Sarah Johnson",
//     jobTitle: "Site Safety Officer",
//     status: "Active",
//     email: "sarah.johnson@sherq.com",
//     phone: "+27 11 555 0123",
//     mobile: "+27 82 555 0123",
//     dateOfBirth: "1985-04-15",
//     idNumber: "8504155678089",
//     gender: "Female",
//     nationality: "South African",
//     address: "45 Sandton Drive, Sandton, Johannesburg, 2196",
//     emergencyContact: "John Johnson",
//     emergencyPhone: "+27 83 555 0124",
//     relationship: "Spouse",
//     siteLocation: "Johannesburg Main",
//     department: "Health & Safety",
//     reportingManager: "Michael Chen",
//     employmentType: "Permanent",
//     startDate: "2018-03-01",
//     contractEndDate: null,
//     salaryGrade: "Grade 5",
//     workSchedule: "Monday - Friday, 08:00 - 17:00",
//   },
//   EMP002: {
//     employeeId: "EMP002",
//     fullName: "Michael Chen",
//     jobTitle: "Construction Supervisor",
//     status: "Active",
//     email: "michael.chen@sherq.com",
//     phone: "+27 21 555 0456",
//     mobile: "+27 84 555 0456",
//     dateOfBirth: "1982-09-22",
//     idNumber: "8209225789090",
//     gender: "Male",
//     nationality: "South African",
//     address: "12 Ocean View Road, Cape Town, 8001",
//     emergencyContact: "Lisa Chen",
//     emergencyPhone: "+27 83 555 0457",
//     relationship: "Spouse",
//     siteLocation: "Cape Town Depot",
//     department: "Construction",
//     reportingManager: "David van der Merwe",
//     employmentType: "Permanent",
//     startDate: "2015-06-15",
//     contractEndDate: null,
//     salaryGrade: "Grade 7",
//     workSchedule: "Monday - Friday, 07:00 - 16:00",
//   },
// };

export function EmployeeProfile({ employee, onBack }: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  
  // Get employee data or use default
  

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Back Button */}
      <div className="px-8 py-4 border-b" style={{ borderColor: "var(--grey-200)" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm hover:underline"
          style={{ color: "var(--brand-blue)" }}
        >
          <ArrowLeft className="size-4" />
          Back to Workforce
        </button>
      </div>

      {/* Profile Header */}
      <div
        className="px-8 py-6 border-b"
        style={{
          backgroundColor: "white",
          borderColor: "var(--grey-200)",
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            {/* Employee Photo */}
            <div
              className="size-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              {employee.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            {/* Employee Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl" style={{ color: "var(--grey-900)" }}>
                  {employee.fullName}
                </h1>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 text-white"
                  style={{ backgroundColor: "var(--compliance-success)" }}
                >
                  <CheckCircle2 className="size-4" />
                  {employee.status}
                </span>
              </div>
              <p className="text-lg mb-3" style={{ color: "var(--grey-600)" }}>
                {employee.jobTitle}
              </p>
              <div className="flex items-center gap-6 text-sm" style={{ color: "var(--grey-600)" }}>
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {employee.mobile}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {employee.siteLocation}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-100)";
              }}
            >
              <Download className="size-4" />
              Export Profile
            </button>
            <button
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Edit className="size-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div
        className="border-b"
        style={{
          backgroundColor: "white",
          borderColor: "var(--grey-200)",
        }}
      >
        <div className="px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative`}
                style={{
                  color:
                    activeTab === tab.id
                      ? "var(--brand-blue)"
                      : "var(--grey-600)",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = "var(--grey-900)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = "var(--grey-600)";
                  }
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "var(--brand-blue)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === "personal" && <PersonalDetailsTab employee={employee} />}
        {activeTab === "appointments" && <PlaceholderTab title="Legal Appointments" />}
        {activeTab === "training" && <PlaceholderTab title="Training Matrix" />}
        {activeTab === "medical" && <PlaceholderTab title="Medical Surveillance" />}
        {activeTab === "ppe" && <PlaceholderTab title="PPE Issued" />}
        {activeTab === "documents" && <PlaceholderTab title="Scanned Documents" />}
      </div>
    </div>
  );
}

function PersonalDetailsTab({ employee }: { employee: any }) {
  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Personal Information
          </h2>
          <div className="space-y-4">
            <InfoField label="Employee ID" value={employee.employeeId} />
            <InfoField label="Full Name" value={employee.fullName} />
            <InfoField
              label="Date of Birth"
              value={new Date(employee.dateOfBirth).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoField label="ID Number" value={employee.idNumber} />
            <InfoField label="Gender" value={employee.gender} />
            <InfoField label="Nationality" value={employee.nationality} />
          </div>
        </div>

        {/* Contact Information */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Contact Information
          </h2>
          <div className="space-y-4">
            <InfoField label="Email" value={employee.email} />
            <InfoField label="Office Phone" value={employee.phone} />
            <InfoField label="Mobile Phone" value={employee.mobile} />
            <InfoField label="Address" value={employee.address} multiline />
          </div>
        </div>

        {/* Emergency Contact */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Emergency Contact
          </h2>
          <div className="space-y-4">
            <InfoField label="Contact Name" value={employee.emergencyContact} />
            <InfoField label="Relationship" value={employee.relationship} />
            <InfoField label="Phone Number" value={employee.emergencyPhone} />
          </div>
        </div>

        {/* Employment Details */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Employment Details
          </h2>
          <div className="space-y-4">
            <InfoField label="Job Title" value={employee.jobTitle} />
            <InfoField label="Department" value={employee.department} />
            <InfoField label="Site Location" value={employee.siteLocation} />
            <InfoField label="Reporting Manager" value={employee.reportingManager} />
            <InfoField label="Employment Type" value={employee.employmentType} />
          </div>
        </div>

        {/* Employment Timeline */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Employment Timeline
          </h2>
          <div className="space-y-4">
            <InfoField
              label="Start Date"
              value={new Date(employee.startDate).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoField
              label="Contract End Date"
              value={employee.contractEndDate || "N/A - Permanent"}
            />
            <InfoField
              label="Length of Service"
              value={calculateServiceLength(employee.startDate)}
            />
          </div>
        </div>

        {/* Compensation & Schedule */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Compensation & Schedule
          </h2>
          <div className="space-y-4">
            <InfoField label="Salary Grade" value={employee.salaryGrade} />
            <InfoField label="Work Schedule" value={employee.workSchedule} multiline />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
        {label}
      </p>
      <p
        className={multiline ? "" : ""}
        style={{ color: "var(--grey-900)" }}
      >
        {value}
      </p>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div
      className="rounded-lg border p-12"
      style={{
        backgroundColor: "white",
        borderColor: "var(--grey-200)",
      }}
    >
      <div className="text-center">
        <FileText
          className="size-12 mx-auto mb-4"
          style={{ color: "var(--grey-400)" }}
        />
        <h2 className="text-2xl mb-2" style={{ color: "var(--grey-700)" }}>
          {title}
        </h2>
        <p style={{ color: "var(--grey-500)" }}>
          This section is under development
        </p>
      </div>
    </div>
  );
}

function calculateServiceLength(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  
  let totalMonths = years * 12 + months;
  const yearsPart = Math.floor(totalMonths / 12);
  const monthsPart = totalMonths % 12;
  
  if (yearsPart === 0) {
    return `${monthsPart} month${monthsPart !== 1 ? "s" : ""}`;
  } else if (monthsPart === 0) {
    return `${yearsPart} year${yearsPart !== 1 ? "s" : ""}`;
  } else {
    return `${yearsPart} year${yearsPart !== 1 ? "s" : ""}, ${monthsPart} month${monthsPart !== 1 ? "s" : ""}`;
  }
}
