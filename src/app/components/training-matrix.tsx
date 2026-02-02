import { useState } from "react";
import { Trash2, CheckCircle2, AlertTriangle, XCircle, Plus, Filter, ShieldCheck } from "lucide-react";
import { ConfirmDeactivationModal } from "@/app/components/confirm-deactivation-modal";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";
import { useTheme } from "@/app/contexts/theme-context";

interface TrainingRecord {
  id: string;
  employeeName: string;
  certificateName: string;
  provider: string;
  completionDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

const trainingRecords: TrainingRecord[] = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    certificateName: "First Aid Level 1",
    provider: "SafetyFirst Training",
    completionDate: "2023-01-15",
    expiryDate: "2026-01-15",
    status: "valid",
  },
  {
    id: "2",
    employeeName: "Michael Chen",
    certificateName: "Fire Safety Awareness",
    provider: "Fire Solutions SA",
    completionDate: "2022-06-10",
    expiryDate: "2025-06-10",
    status: "valid",
  },
  {
    id: "3",
    employeeName: "John Smith",
    certificateName: "Working at Heights",
    provider: "Heights Safety Academy",
    completionDate: "2021-03-20",
    expiryDate: "2024-03-20",
    status: "expired",
  },
  {
    id: "4",
    employeeName: "Emma Thompson",
    certificateName: "Hazardous Materials Handling",
    provider: "ChemSafe Training",
    completionDate: "2023-09-05",
    expiryDate: "2024-09-05",
    status: "expiring",
  },
  {
    id: "5",
    employeeName: "David van der Merwe",
    certificateName: "Confined Space Entry",
    provider: "Industrial Safety Institute",
    completionDate: "2022-11-12",
    expiryDate: "2025-11-12",
    status: "valid",
  },
  {
    id: "6",
    employeeName: "Lisa Botha",
    certificateName: "Electrical Safety",
    provider: "ElectroSafe Training",
    completionDate: "2020-08-30",
    expiryDate: "2023-08-30",
    status: "expired",
  },
];

const sites = [
  "All Sites",
  "Johannesburg Main",
  "Cape Town Depot",
  "Durban Operations",
  "Pretoria Branch",
];

const statuses = [
  "All Training Statuses",
  "Valid",
  "Expiring Soon",
  "Expired",
];

export function TrainingMatrix() {
  const { dismissAlert } = useAlerts();
  const { colors } = useTheme();
  const [records, setRecords] = useState(trainingRecords);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Training Statuses");

  const expiredCount = records.filter((r) => r.status === "expired").length;

  const handleDeleteClick = (record: TrainingRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (selectedRecord) {
      // Remove the record from the list (in a real app, this would call an API)
      setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
      setSelectedRecord(null);
    }
  };

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `${expiredCount} training certificates expired`, "critical");
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: colors.background }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Notification Bar - Full Width White */}
        {expiredCount > 0 && (
          <AlertBanner
            id="training-expired-alert"
            type="critical"
            icon={<AlertTriangle className="size-5" />}
            title={`${expiredCount} training certificate${expiredCount !== 1 ? "s" : ""} expired`}
            description="Employees may not be authorized for certain high-risk tasks"
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>
                Training Matrix & Competency Tracking
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                <p className="text-sm" style={{ color: "#94A3B8" }}>
                  POPI Act Compliant: Restricted Access
                </p>
              </div>
            </div>
            <button
              className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <Plus className="size-4" />
              Add Training Record
            </button>
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: "#1E293B",
                color: "#F8FAFC",
                border: "none",
              }}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
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
                Total Records
              </p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>
                {records.length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Valid
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {records.filter((r) => r.status === "valid").length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Expiring Soon
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-warning)" }}
              >
                {records.filter((r) => r.status === "expiring").length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Expired
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-danger)" }}
              >
                {records.filter((r) => r.status === "expired").length}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Compliance Rate
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-success)" }}
              >
                {Math.round((records.filter((r) => r.status === "valid").length / records.length) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Training Records Table */}
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
                      Employee
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Certificate Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Training Provider
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Completion Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Expiry Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Training Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "#94A3B8" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-opacity-80"
                      style={{
                        backgroundColor: index % 2 === 0 ? "#1E293B" : "#0F172A",
                      }}
                    >
                      <td
                        className="px-6 py-4 text-sm font-medium"
                        style={{ color: "#F8FAFC" }}
                      >
                        {record.employeeName}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#F8FAFC" }}>
                        {record.certificateName}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#94A3B8" }}>
                        {record.provider}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#94A3B8" }}>
                        {new Date(record.completionDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          style={{
                            color:
                              record.status === "expired"
                                ? "var(--compliance-danger)"
                                : record.status === "expiring"
                                ? "var(--compliance-warning)"
                                : "var(--compliance-success)",
                          }}
                        >
                          {new Date(record.expiryDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteClick(record)}
                          className="p-2 rounded hover:bg-opacity-20 transition-colors"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                          aria-label="Archive record"
                        >
                          <Trash2
                            className="size-4"
                            style={{ color: "var(--compliance-danger)" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmDeactivationModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedRecord(null);
          }}
          onConfirm={handleConfirmArchive}
          itemName={selectedRecord?.certificateName}
        />
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "valid" | "expiring" | "expired";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const badgeConfig = {
    valid: {
      label: "Valid",
      color: "var(--compliance-success)",
      icon: <CheckCircle2 className="size-4" />,
    },
    expiring: {
      label: "Expiring Soon",
      color: "var(--compliance-warning)",
      icon: <AlertTriangle className="size-4" />,
    },
    expired: {
      label: "Expired",
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