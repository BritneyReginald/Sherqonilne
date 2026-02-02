import { useState } from "react";
import { Plus, Settings, CheckCircle2, Clock, Package, Filter, ShieldCheck } from "lucide-react";
import { IssuePPEModal } from "@/app/components/issue-ppe-modal";
import { PPECatalogue } from "@/app/components/ppe-catalogue";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";

interface PPETransaction {
  id: string;
  employeeName: string;
  jobTitle: string;
  ppeType: string;
  ppeBrand: string;
  ppeSize: string;
  ppeCategory: string;
  issueDate: string;
  condition: "new" | "re-issued-good";
  replacementDue: string;
  signOffStatus: "signed" | "pending";
  signOffDate?: string;
}

const ppeTransactions: PPETransaction[] = [
  {
    id: "PPE-24-089",
    employeeName: "Sarah Jenkins",
    jobTitle: "Welder",
    ppeType: "Safety Boots",
    ppeBrand: "Bova Maverick",
    ppeSize: "Size 8",
    ppeCategory: "Footwear",
    issueDate: "2024-01-15",
    condition: "new",
    replacementDue: "2024-07-15",
    signOffStatus: "signed",
    signOffDate: "2024-01-15T14:30:00",
  },
  {
    id: "PPE-24-088",
    employeeName: "Michael Chen",
    jobTitle: "Construction Supervisor",
    ppeType: "Hard Hat",
    ppeBrand: "3M SecureFit",
    ppeSize: "Universal",
    ppeCategory: "Head Protection",
    issueDate: "2024-01-14",
    condition: "new",
    replacementDue: "2025-01-14",
    signOffStatus: "signed",
    signOffDate: "2024-01-14T09:15:00",
  },
  {
    id: "PPE-24-087",
    employeeName: "John Smith",
    jobTitle: "Electrician",
    ppeType: "Safety Goggles",
    ppeBrand: "Honeywell Uvex",
    ppeSize: "One Size",
    ppeCategory: "Eye Protection",
    issueDate: "2024-01-12",
    condition: "re-issued-good",
    replacementDue: "2024-03-12",
    signOffStatus: "pending",
  },
  {
    id: "PPE-24-086",
    employeeName: "Emma Thompson",
    jobTitle: "Environmental Officer",
    ppeType: "High-Vis Vest",
    ppeBrand: "ProChoice Safety Gear",
    ppeSize: "Medium",
    ppeCategory: "Visibility",
    issueDate: "2024-01-10",
    condition: "new",
    replacementDue: "2024-07-10",
    signOffStatus: "signed",
    signOffDate: "2024-01-10T11:20:00",
  },
  {
    id: "PPE-24-085",
    employeeName: "David van der Merwe",
    jobTitle: "Operations Manager",
    ppeType: "Safety Boots",
    ppeBrand: "Caterpillar Holton",
    ppeSize: "Size 10",
    ppeCategory: "Footwear",
    issueDate: "2024-01-08",
    condition: "new",
    replacementDue: "2024-07-08",
    signOffStatus: "signed",
    signOffDate: "2024-01-08T08:45:00",
  },
  {
    id: "PPE-24-084",
    employeeName: "Lisa Botha",
    jobTitle: "Rigger / Scaffolder",
    ppeType: "Safety Harness",
    ppeBrand: "Miller Titan",
    ppeSize: "Large",
    ppeCategory: "Fall Protection",
    issueDate: "2024-01-05",
    condition: "new",
    replacementDue: "2025-01-05",
    signOffStatus: "signed",
    signOffDate: "2024-01-05T13:10:00",
  },
  {
    id: "PPE-24-083",
    employeeName: "James Ndlovu",
    jobTitle: "Plant Operator",
    ppeType: "Ear Plugs",
    ppeBrand: "3M E-A-R Classic",
    ppeSize: "Universal",
    ppeCategory: "Hearing Protection",
    issueDate: "2024-01-03",
    condition: "new",
    replacementDue: "2024-02-15",
    signOffStatus: "pending",
  },
  {
    id: "PPE-24-082",
    employeeName: "Peter van Zyl",
    jobTitle: "Mechanical Technician",
    ppeType: "Leather Gloves",
    ppeBrand: "Tillman TrueFit",
    ppeSize: "Large",
    ppeCategory: "Hand Protection",
    issueDate: "2023-12-28",
    condition: "re-issued-good",
    replacementDue: "2024-02-10",
    signOffStatus: "signed",
    signOffDate: "2023-12-28T10:30:00",
  },
  {
    id: "PPE-24-081",
    employeeName: "Thandi Mkhize",
    jobTitle: "Quality Inspector",
    ppeType: "Safety Boots",
    ppeBrand: "Bova Classics",
    ppeSize: "Size 6",
    ppeCategory: "Footwear",
    issueDate: "2023-12-20",
    condition: "new",
    replacementDue: "2024-06-20",
    signOffStatus: "signed",
    signOffDate: "2023-12-20T15:00:00",
  },
  {
    id: "PPE-24-080",
    employeeName: "Robert Malan",
    jobTitle: "Safety Representative",
    ppeType: "Dust Mask FFP2",
    ppeBrand: "Respirex",
    ppeSize: "Medium",
    ppeCategory: "Respiratory Protection",
    issueDate: "2023-12-15",
    condition: "new",
    replacementDue: "2024-01-30",
    signOffStatus: "pending",
  },
];

const ppeCategories = [
  "All PPE Types",
  "Footwear",
  "Head Protection",
  "Eye Protection",
  "Visibility",
  "Fall Protection",
  "Hearing Protection",
  "Hand Protection",
  "Respiratory Protection",
];

const sites = [
  "All Sites",
  "Johannesburg Main",
  "Cape Town Depot",
  "Durban Operations",
  "Pretoria Branch",
];

export function PPERegister() {
  const { dismissAlert } = useAlerts();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedCategory, setSelectedCategory] = useState("All PPE Types");

  const totalIssued = ppeTransactions.length;
  const pendingSignOffs = ppeTransactions.filter(
    (t) => t.signOffStatus === "pending"
  ).length;
  const signedOff = ppeTransactions.filter(
    (t) => t.signOffStatus === "signed"
  ).length;
  const upcomingReplacements = ppeTransactions.filter((t) => {
    const replacementDate = new Date(t.replacementDue);
    const today = new Date();
    const daysUntil =
      (replacementDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return daysUntil > 0 && daysUntil <= 30;
  }).length;

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `PPE Alert: ${pendingSignOffs} items awaiting employee sign-off`, "critical");
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "#0F172A" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Notification Bar - Full Width White */}
        {pendingSignOffs > 0 && (
          <AlertBanner
            id="ppe-pending-signoff-alert"
            type="critical"
            icon={<Clock className="size-5" />}
            title={`PPE Alert: ${pendingSignOffs} items awaiting employee sign-off`}
            description="Ensure all issued PPE is signed for within 24 hours for compliance tracking"
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>
                PPE Register & Issue Log
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                <p className="text-sm" style={{ color: "#94A3B8" }}>
                  POPI Act Compliant: Restricted Access
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCatalogue(true)}
                className="px-5 py-2.5 rounded-lg font-medium transition-opacity flex items-center gap-2 hover:opacity-90"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#F8FAFC",
                }}
              >
                <Settings className="size-4" />
                PPE Catalogue
              </button>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <Plus className="size-4" />
                Issue PPE
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="size-5" style={{ color: "#94A3B8" }} />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: "#1E293B",
                color: "#F8FAFC",
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: "#1E293B",
                color: "#F8FAFC",
                border: "none",
              }}
            >
              {ppeCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Total Issued
              </p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>
                {totalIssued}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Signed Off
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {signedOff}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Pending Sign-Off
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-danger)" }}
              >
                {pendingSignOffs}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Due for Replacement
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-warning)" }}
              >
                {upcomingReplacements}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Completion Rate
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {Math.round((signedOff / totalIssued) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* PPE Transaction Log Table */}
        <div className="px-8 pb-8">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: "#1E293B",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#0F172A",
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Transaction ID
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Employee
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      PPE Item
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Issue Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Replacement Due
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Condition
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Sign-Off Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ppeTransactions.map((transaction, index) => {
                    const replacementDate = new Date(transaction.replacementDue);
                    const today = new Date();
                    const isOverdue = replacementDate < today;
                    const isDueSoon =
                      !isOverdue &&
                      (replacementDate.getTime() - today.getTime()) /
                        (1000 * 3600 * 24) <=
                        30;

                    return (
                      <tr
                        key={transaction.id}
                        className="transition-colors hover:bg-opacity-80"
                        style={{
                          backgroundColor: index % 2 === 0 ? "#1E293B" : "#0F172A",
                        }}
                      >
                        <td
                          className="px-6 py-4 font-mono text-sm"
                          style={{ color: "#94A3B8" }}
                        >
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div
                              className="font-medium mb-0.5"
                              style={{ color: "#F8FAFC" }}
                            >
                              {transaction.employeeName}
                            </div>
                            <div className="text-sm" style={{ color: "#94A3B8" }}>
                              {transaction.jobTitle}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div
                              className="font-medium mb-0.5"
                              style={{ color: "#F8FAFC" }}
                            >
                              {transaction.ppeType}
                            </div>
                            <div className="text-sm" style={{ color: "#94A3B8" }}>
                              {transaction.ppeBrand} • {transaction.ppeSize}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "#94A3B8" }}>
                          {new Date(transaction.issueDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            style={{
                              color: isOverdue
                                ? "var(--compliance-danger)"
                                : isDueSoon
                                ? "var(--compliance-warning)"
                                : "var(--compliance-success)",
                            }}
                          >
                            {new Date(
                              transaction.replacementDue
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor:
                                transaction.condition === "new"
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : "rgba(59, 130, 246, 0.2)",
                              color:
                                transaction.condition === "new"
                                  ? "var(--compliance-success)"
                                  : "#3B82F6",
                            }}
                          >
                            {transaction.condition === "new"
                              ? "New"
                              : "Re-issued (Good)"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {transaction.signOffStatus === "signed" ? (
                            <div className="flex flex-col items-center gap-1">
                              <CheckCircle2
                                className="size-5"
                                style={{ color: "var(--compliance-success)" }}
                              />
                              <span
                                className="text-xs"
                                style={{ color: "#94A3B8" }}
                              >
                                {transaction.signOffDate
                                  ? new Date(
                                      transaction.signOffDate
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                    })
                                  : "Signed"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Clock
                                className="size-5"
                                style={{ color: "var(--compliance-danger)" }}
                              />
                              <span
                                className="text-xs font-medium"
                                style={{ color: "var(--compliance-danger)" }}
                              >
                                Pending
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Issue PPE Modal */}
      <IssuePPEModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
      />

      {/* PPE Catalogue Modal */}
      <PPECatalogue
        isOpen={showCatalogue}
        onClose={() => setShowCatalogue(false)}
      />
    </div>
  );
}