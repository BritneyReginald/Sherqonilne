import { useState } from "react";
import { Shield, Filter, Calendar, User, FileText, Trash2, Edit, Upload, Archive, Eye, Download } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  description: string;
  targetRecord: string;
  actionType: "create" | "update" | "archive" | "view" | "export" | "restore";
  ipAddress?: string;
}

const auditEntries: AuditEntry[] = [
  {
    id: "AUD-158",
    timestamp: "2026-01-21 15:30",
    user: "Admin John",
    action: "Archived",
    module: "Risk Assessments",
    description: "Moved Rev 1.0 of 'Electrical Work - High Voltage' Risk Assessment to Recycle Bin",
    targetRecord: "RA-2024-045-Rev1.0",
    actionType: "archive",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-157",
    timestamp: "2026-01-21 14:02",
    user: "Admin John",
    action: "Updated",
    module: "Medical Surveillance",
    description: "Updated Medical Surveillance record for Peter Smith",
    targetRecord: "MED-089",
    actionType: "update",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-156",
    timestamp: "2026-01-21 13:47",
    user: "Sarah Johnson",
    action: "Created",
    module: "PPE Register",
    description: "Issued new Safety Boots (Size 9) to Thandi Mokoena with digital signature",
    targetRecord: "PPE-ISS-2156",
    actionType: "create",
    ipAddress: "192.168.1.23",
  },
  {
    id: "AUD-155",
    timestamp: "2026-01-21 12:15",
    user: "Admin John",
    action: "Exported",
    module: "Reports",
    description: "Generated Full Site Audit Pack for JHB South (PDF, 12.4 MB)",
    targetRecord: "EXP-004",
    actionType: "export",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-154",
    timestamp: "2026-01-21 11:30",
    user: "Sarah Johnson",
    action: "Viewed",
    module: "Medical Surveillance",
    description: "Accessed Clinical Records (POPI Protected) for Anna Coetzee",
    targetRecord: "MED-012",
    actionType: "view",
    ipAddress: "192.168.1.23",
  },
  {
    id: "AUD-153",
    timestamp: "2026-01-21 10:45",
    user: "Admin John",
    action: "Updated",
    module: "Workforce",
    description: "Modified employee profile: Changed department for Robert Williams from Production to Maintenance",
    targetRecord: "EMP-1134",
    actionType: "update",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-152",
    timestamp: "2026-01-21 09:20",
    user: "John Smith",
    action: "Created",
    module: "Training",
    description: "Uploaded new Training Certificate: 'Working at Heights' for Sarah Johnson (Valid until 2027-01-15)",
    targetRecord: "TRN-CERT-445",
    actionType: "create",
    ipAddress: "192.168.1.67",
  },
  {
    id: "AUD-151",
    timestamp: "2026-01-20 16:55",
    user: "Sarah Johnson",
    action: "Archived",
    module: "Document Library",
    description: "Moved document 'Old Safety Policy v2.1' to Recycle Bin",
    targetRecord: "DOC-2023-089",
    actionType: "archive",
    ipAddress: "192.168.1.23",
  },
  {
    id: "AUD-150",
    timestamp: "2026-01-20 15:40",
    user: "Admin John",
    action: "Restored",
    module: "Workforce",
    description: "Restored employee record from Recycle Bin: Johan Pretorius",
    targetRecord: "EMP-1178",
    actionType: "restore",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-149",
    timestamp: "2026-01-20 14:30",
    user: "Dr. P. Naidoo",
    action: "Created",
    module: "Medical Surveillance",
    description: "Recorded new Periodic Medical Exam for Sarah Johnson - Status: Fit for Duty",
    targetRecord: "MED-001",
    actionType: "create",
    ipAddress: "10.0.5.12",
  },
  {
    id: "AUD-148",
    timestamp: "2026-01-20 13:15",
    user: "Admin John",
    action: "Updated",
    module: "Risk Assessments",
    description: "Acknowledged Risk Assessment: Thandi Mokoena digitally signed 'Confined Space Entry'",
    targetRecord: "RA-2024-023",
    actionType: "update",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-147",
    timestamp: "2026-01-20 11:00",
    user: "Sarah Johnson",
    action: "Exported",
    module: "Reports",
    description: "Generated Employee Compliance File for Thandi Mokoena (PDF, 2.1 MB)",
    targetRecord: "EXP-001",
    actionType: "export",
    ipAddress: "192.168.1.23",
  },
];

type FilterModule = "all" | "workforce" | "training" | "medicals" | "ppe" | "risk-assessments" | "documents" | "reports";
type FilterAction = "all" | "create" | "update" | "archive" | "view" | "export" | "restore";

export function SystemAuditLog() {
  const [selectedModule, setSelectedModule] = useState<FilterModule>("all");
  const [selectedAction, setSelectedAction] = useState<FilterAction>("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const users = ["all", ...Array.from(new Set(auditEntries.map((e) => e.user))).sort()];

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesModule = selectedModule === "all" || entry.module.toLowerCase().includes(selectedModule);
    const matchesAction = selectedAction === "all" || entry.actionType === selectedAction;
    const matchesUser = selectedUser === "all" || entry.user === selectedUser;
    return matchesModule && matchesAction && matchesUser;
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <Upload className="size-4" style={{ color: "var(--compliance-success)" }} />;
      case "update":
        return <Edit className="size-4" style={{ color: "var(--brand-blue)" }} />;
      case "archive":
        return <Trash2 className="size-4" style={{ color: "var(--compliance-danger)" }} />;
      case "view":
        return <Eye className="size-4" style={{ color: "var(--grey-500)" }} />;
      case "export":
        return <Download className="size-4" style={{ color: "var(--compliance-warning)" }} />;
      case "restore":
        return <Archive className="size-4" style={{ color: "var(--compliance-success)" }} />;
      default:
        return <FileText className="size-4" style={{ color: "var(--grey-500)" }} />;
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "create":
        return { label: "Created", color: "var(--compliance-success)", bgColor: "var(--compliance-success)15" };
      case "update":
        return { label: "Updated", color: "var(--brand-blue)", bgColor: "var(--brand-blue)15" };
      case "archive":
        return { label: "Archived", color: "var(--compliance-danger)", bgColor: "var(--compliance-danger)15" };
      case "view":
        return { label: "Viewed", color: "var(--grey-600)", bgColor: "var(--grey-100)" };
      case "export":
        return { label: "Exported", color: "var(--compliance-warning)", bgColor: "var(--compliance-warning)15" };
      case "restore":
        return { label: "Restored", color: "var(--compliance-success)", bgColor: "var(--compliance-success)15" };
      default:
        return { label: actionType, color: "var(--grey-600)", bgColor: "var(--grey-100)" };
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div
        className="px-8 py-6 border-b"
        style={{
          backgroundColor: "white",
          borderColor: "var(--grey-200)",
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: "var(--grey-900)" }}>
              System Audit Log
            </h1>
            <div className="flex items-center gap-2">
              <Shield className="size-4" style={{ color: "var(--brand-blue)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--grey-600)" }}>
                Complete audit trail - No silent deletions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--compliance-success)10" }}>
            <Shield className="size-5" style={{ color: "var(--compliance-success)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                {filteredEntries.length} Audit Entries
              </p>
              <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                All actions tracked
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
              Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as FilterModule)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: "var(--grey-300)",
                color: "var(--grey-900)",
                backgroundColor: "white",
              }}
            >
              <option value="all">All Modules</option>
              <option value="workforce">Workforce</option>
              <option value="training">Training</option>
              <option value="medicals">Medical Surveillance</option>
              <option value="ppe">PPE Register</option>
              <option value="risk-assessments">Risk Assessments</option>
              <option value="documents">Document Library</option>
              <option value="reports">Reports</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
              Action Type
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as FilterAction)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: "var(--grey-300)",
                color: "var(--grey-900)",
                backgroundColor: "white",
              }}
            >
              <option value="all">All Actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="archive">Archived</option>
              <option value="view">Viewed</option>
              <option value="export">Exported</option>
              <option value="restore">Restored</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
              User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: "var(--grey-300)",
                color: "var(--grey-900)",
                backgroundColor: "white",
              }}
            >
              {users.map((user) => (
                <option key={user} value={user}>
                  {user === "all" ? "All Users" : user}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: "var(--grey-300)",
                color: "var(--grey-900)",
                backgroundColor: "white",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-600)" }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: "var(--grey-300)",
                color: "var(--grey-900)",
                backgroundColor: "white",
              }}
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: "var(--grey-50)", borderColor: "var(--grey-200)" }}>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                    Timestamp
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                    User
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                    Action
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                    Module
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                    Description
                  </span>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-sm font-medium" style={{ color: "var(--grey-700)" }}>
                    Record ID
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const actionBadge = getActionBadge(entry.actionType);

                return (
                  <tr
                    key={entry.id}
                    className="border-b hover:bg-secondary transition-colors"
                    style={{ borderColor: "var(--grey-200)" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" style={{ color: "var(--grey-400)" }} />
                        <span className="text-sm font-mono" style={{ color: "var(--grey-700)" }}>
                          {entry.timestamp}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="size-4" style={{ color: "var(--grey-400)" }} />
                        <span className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                          {entry.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.actionType)}
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: actionBadge.bgColor, color: actionBadge.color }}
                        >
                          {actionBadge.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                        {entry.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: "var(--grey-700)" }}>
                        {entry.description}
                      </p>
                      {entry.ipAddress && (
                        <p className="text-xs mt-1" style={{ color: "var(--grey-500)" }}>
                          IP: {entry.ipAddress}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-mono px-2 py-1 rounded"
                        style={{
                          backgroundColor: "var(--grey-100)",
                          color: "var(--grey-700)",
                        }}
                      >
                        {entry.targetRecord}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div
        className="px-8 py-3 border-t flex items-center justify-between"
        style={{
          backgroundColor: "var(--grey-50)",
          borderColor: "var(--grey-200)",
        }}
      >
        <div className="flex items-center gap-2">
          <Shield className="size-4" style={{ color: "var(--brand-blue)" }} />
          <span className="text-xs" style={{ color: "var(--grey-600)" }}>
            <strong>Audit Compliance:</strong> All system actions are permanently logged. Records cannot be permanently deleted - only archived with full traceability.
          </span>
        </div>
        <button
          className="px-4 py-2 rounded-lg font-medium border transition-colors text-sm flex items-center gap-2"
          style={{
            borderColor: "var(--brand-blue)",
            color: "var(--brand-blue)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brand-blue)10";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Download className="size-4" />
          Export Audit Log
        </button>
      </div>
    </div>
  );
}
