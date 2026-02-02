import { useState } from "react";
import { Download, Lock, Shield, Calendar, User as UserIcon, Activity, Globe, Monitor } from "lucide-react";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  ipAddress: string;
  device: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    timestamp: "2026-01-22 09:47:23",
    user: "Sarah Naidoo (RSS Admin)",
    action: "Updated Branding Colors",
    entity: "ABC Mining Corp",
    ipAddress: "197.242.151.45",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "2",
    timestamp: "2026-01-22 09:32:11",
    user: "Michael van der Merwe (Client Admin)",
    action: "Invited New User",
    entity: "nomsa.k@abcmining.co.za",
    ipAddress: "197.242.151.47",
    device: "Safari 17 / macOS",
  },
  {
    id: "3",
    timestamp: "2026-01-22 08:15:09",
    user: "Jessica Williams (Auditor)",
    action: "Changed Medical Status",
    entity: "Thabo Molefe (EMP-2347)",
    ipAddress: "41.185.28.92",
    device: "Chrome 131 / Android 14",
  },
  {
    id: "4",
    timestamp: "2026-01-22 07:58:44",
    user: "Thabo Molefe (Manager)",
    action: "Uploaded Risk Assessment",
    entity: "Johannesburg North - HIRA-2026-001",
    ipAddress: "197.242.151.50",
    device: "Edge 131 / Windows 11",
  },
  {
    id: "5",
    timestamp: "2026-01-22 07:22:18",
    user: "David Malan (Manager)",
    action: "Issued PPE Item",
    entity: "Jonas Sithole (EMP-1298) - Safety Boots",
    ipAddress: "41.185.29.15",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "6",
    timestamp: "2026-01-22 06:41:07",
    user: "Michael van der Merwe (Client Admin)",
    action: "Archived Employee Record",
    entity: "Peter Anderson (EMP-1892)",
    ipAddress: "197.242.151.47",
    device: "Safari 17 / macOS",
  },
  {
    id: "7",
    timestamp: "2026-01-21 18:35:52",
    user: "Sarah Naidoo (RSS Admin)",
    action: "Modified System Settings",
    entity: "General Settings - Expiry Warning Days",
    ipAddress: "197.242.151.45",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "8",
    timestamp: "2026-01-21 17:14:29",
    user: "Jessica Williams (Auditor)",
    action: "Downloaded Audit Pack",
    entity: "Q4 2025 Compliance Report",
    ipAddress: "41.185.28.92",
    device: "Chrome 131 / Android 14",
  },
  {
    id: "9",
    timestamp: "2026-01-21 16:08:33",
    user: "Thabo Molefe (Manager)",
    action: "Updated Training Record",
    entity: "Sarah Khumalo (EMP-3421) - First Aid Level 1",
    ipAddress: "197.242.151.50",
    device: "Edge 131 / Windows 11",
  },
  {
    id: "10",
    timestamp: "2026-01-21 15:22:11",
    user: "David Malan (Manager)",
    action: "Created Document Folder",
    entity: "Safety Data Sheets / 2026",
    ipAddress: "41.185.29.15",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "11",
    timestamp: "2026-01-21 14:57:45",
    user: "Sarah Naidoo (RSS Admin)",
    action: "Changed User Role",
    entity: "Jessica Williams - Promoted to Senior Auditor",
    ipAddress: "197.242.151.45",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "12",
    timestamp: "2026-01-21 14:02:11",
    user: "Michael van der Merwe (Client Admin)",
    action: "Uploaded Medical Certificate",
    entity: "David Malan (EMP-2156) - Fit for Heights",
    ipAddress: "197.242.151.47",
    device: "Safari 17 / macOS",
  },
  {
    id: "13",
    timestamp: "2026-01-21 13:18:09",
    user: "Jessica Williams (Auditor)",
    action: "Acknowledged Risk Assessment",
    entity: "Pretoria East - HIRA-2026-002",
    ipAddress: "41.185.28.92",
    device: "Chrome 131 / Android 14",
  },
  {
    id: "14",
    timestamp: "2026-01-21 12:45:32",
    user: "Thabo Molefe (Manager)",
    action: "Bulk Imported Training Matrix",
    entity: "67 employees - Fire Safety Training",
    ipAddress: "197.242.151.50",
    device: "Edge 131 / Windows 11",
  },
  {
    id: "15",
    timestamp: "2026-01-21 11:33:28",
    user: "David Malan (Manager)",
    action: "Deactivated User Account",
    entity: "temporary.contractor@abcmining.co.za",
    ipAddress: "41.185.29.15",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "16",
    timestamp: "2026-01-21 10:22:14",
    user: "Sarah Naidoo (RSS Admin)",
    action: "Generated Compliance Report",
    entity: "All Sites - Monthly Compliance Summary",
    ipAddress: "197.242.151.45",
    device: "Chrome 131 / Windows 10",
  },
  {
    id: "17",
    timestamp: "2026-01-21 09:47:55",
    user: "Michael van der Merwe (Client Admin)",
    action: "Updated Site Information",
    entity: "Johannesburg North - Contact Details",
    ipAddress: "197.242.151.47",
    device: "Safari 17 / macOS",
  },
  {
    id: "18",
    timestamp: "2026-01-21 09:12:41",
    user: "Jessica Williams (Auditor)",
    action: "Digitally Signed Risk Assessment",
    entity: "Confined Space Entry - HIRA-2026-003",
    ipAddress: "41.185.28.92",
    device: "Chrome 131 / Android 14",
  },
  {
    id: "19",
    timestamp: "2026-01-21 08:28:07",
    user: "Thabo Molefe (Manager)",
    action: "Returned PPE Item",
    entity: "Michael Botha (EMP-3892) - Hard Hat",
    ipAddress: "197.242.151.50",
    device: "Edge 131 / Windows 11",
  },
  {
    id: "20",
    timestamp: "2026-01-21 07:51:33",
    user: "Sarah Naidoo (RSS Admin)",
    action: "System Login",
    entity: "SHERQ Online Platform",
    ipAddress: "197.242.151.45",
    device: "Chrome 131 / Windows 10",
  },
];

export function SystemAuditLogTab() {
  const [auditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [filter, setFilter] = useState("");

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.entity.toLowerCase().includes(filter.toLowerCase())
  );

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Timestamp", "User", "Action", "Entity", "IP Address", "Device"];
    const rows = auditLogs.map((log) => [
      log.timestamp,
      log.user,
      log.action,
      log.entity,
      log.ipAddress,
      log.device,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SHERQ_Audit_Log_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Audit log exported successfully!", {
      description: `${auditLogs.length} entries exported to CSV`,
    });
  };

  return (
    <div className="p-8 relative">
      {/* Watermark */}
      <div
        className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none"
        style={{ zIndex: 0 }}
      >
        <div className="text-center">
          <Lock className="size-96" style={{ color: "var(--grey-900)" }} />
          <p className="text-8xl font-bold mt-8" style={{ color: "var(--grey-900)" }}>
            IMMUTABLE
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl mb-2 flex items-center gap-3" style={{ color: "var(--grey-900)" }}>
                <Shield className="size-8" style={{ color: "var(--brand-blue)" }} />
                Global Audit Trail
              </h1>
              <p className="text-sm flex items-center gap-2" style={{ color: "var(--grey-600)" }}>
                <Lock className="size-4" style={{ color: "var(--grey-500)" }} />
                Immutable record of all system activities. No silent deletions.
              </p>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Download className="size-5" />
              Export Log to CSV
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--brand-blue)15" }}
              >
                <Activity className="size-5" style={{ color: "var(--brand-blue)" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--grey-900)" }}>
                  {auditLogs.length}
                </p>
                <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                  Total Events
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--compliance-success)15" }}
              >
                <Calendar className="size-5" style={{ color: "var(--compliance-success)" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--grey-900)" }}>
                  48h
                </p>
                <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                  Time Range
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#9333EA15" }}
              >
                <UserIcon className="size-5" style={{ color: "#9333EA" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--grey-900)" }}>
                  6
                </p>
                <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                  Active Users
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--compliance-warning)15" }}
              >
                <Globe className="size-5" style={{ color: "var(--compliance-warning)" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--grey-900)" }}>
                  8
                </p>
                <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                  IP Addresses
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter by user, action, or entity..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border"
            style={{
              borderColor: "var(--grey-300)",
              color: "var(--grey-900)",
              backgroundColor: "white",
            }}
          />
        </div>

        {/* Audit Log Table */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--grey-50)",
                    borderBottom: "2px solid var(--grey-300)",
                  }}
                >
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--grey-700)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      Timestamp
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--grey-700)" }}
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="size-4" />
                      User
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--grey-700)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="size-4" />
                      Action
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--grey-700)" }}
                  >
                    Entity
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--grey-700)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="size-4" />
                      IP Address
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--grey-700)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="size-4" />
                      Device
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="border-b transition-colors"
                    style={{
                      borderColor: "var(--grey-200)",
                      backgroundColor: index % 2 === 0 ? "white" : "var(--grey-50)05",
                    }}
                  >
                    {/* Timestamp */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs" style={{ color: "var(--grey-900)" }}>
                        {log.timestamp}
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                        {log.user.split(" (")[0]}
                      </div>
                      <div className="text-xs" style={{ color: "var(--grey-600)" }}>
                        {log.user.match(/\((.*?)\)/)?.[1]}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <div
                        className="inline-flex items-center gap-1.5 text-sm font-medium"
                        style={{ color: "var(--brand-blue)" }}
                      >
                        {log.action.includes("Uploaded") && "📤"}
                        {log.action.includes("Downloaded") && "📥"}
                        {log.action.includes("Archived") && "📦"}
                        {log.action.includes("Deleted") && "🗑️"}
                        {log.action.includes("Updated") && "✏️"}
                        {log.action.includes("Created") && "➕"}
                        {log.action.includes("Changed") && "🔄"}
                        {log.action.includes("Invited") && "✉️"}
                        {log.action.includes("Login") && "🔐"}
                        {log.action.includes("Issued") && "📋"}
                        {log.action.includes("Returned") && "↩️"}
                        {log.action.includes("Signed") && "✍️"}
                        {log.action.includes("Acknowledged") && "✅"}
                        {log.action.includes("Generated") && "📊"}
                        {log.action.includes("Deactivated") && "⏸️"}
                        {log.action.includes("Modified") && "⚙️"}
                        {log.action.includes("Imported") && "📥"}
                        <span>{log.action}</span>
                      </div>
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3">
                      <div className="text-sm" style={{ color: "var(--grey-900)" }}>
                        {log.entity}
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs" style={{ color: "var(--grey-700)" }}>
                        {log.ipAddress}
                      </div>
                    </td>

                    {/* Device */}
                    <td className="px-4 py-3">
                      <div className="text-xs" style={{ color: "var(--grey-600)" }}>
                        {log.device}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "var(--grey-500)" }}>
                No audit logs found matching "{filter}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm" style={{ color: "var(--grey-600)" }}>
            Showing {filteredLogs.length} of {auditLogs.length} audit entries
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--grey-50)",
              borderColor: "var(--grey-200)",
            }}
          >
            <Lock className="size-4" style={{ color: "var(--compliance-success)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--grey-700)" }}>
              Read-Only • Cryptographically Sealed
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div
          className="mt-8 rounded-lg border p-6"
          style={{
            backgroundColor: "var(--brand-blue)05",
            borderColor: "var(--brand-blue)20",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Shield className="size-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--grey-900)" }}>
                Audit Trail Integrity
              </h3>
              <p className="text-sm mb-3" style={{ color: "var(--grey-700)" }}>
                This audit log provides a complete, tamper-proof record of all system activities. Each entry is
                cryptographically signed and cannot be modified or deleted, ensuring full compliance with legal and
                regulatory requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--grey-700)" }}>
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--compliance-success)" }}
                  />
                  No Silent Deletions
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--grey-700)" }}>
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--compliance-success)" }}
                  />
                  Complete Version History
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--grey-700)" }}>
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--compliance-success)" }}
                  />
                  Immutable Records
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
