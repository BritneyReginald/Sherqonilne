import { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Filter,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { ConfirmDeactivationModal } from "../confirm-deactivation-modal";
import { AlertBanner } from "../alert-banner";
import { useAlerts } from "../../contexts/alert-context";
import { useTheme } from "../../contexts/theme-context";
import { useRecycleBin } from "../../contexts/recycle-bin-context";
import { AddTrainingRecordModal, EmployeeOption } from "./add-training-record-modal";



interface TrainingMatrixProps {
  employeeId?: string;
}

interface TrainingRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  siteLocation: string;
  trainingType: "internal" | "external" | null;
  trainingName: string;
  certificateName: string;
  provider: string;
  trainingCategory: string;
  isLegallyRequired: boolean;
  completionDate: string;
  expiryDate: string;
  fileName: string | null;
}

const statuses = ["All Training Statuses", "Valid", "Expiring Soon", "Expired"];

function getTrainingStatus(expiryDate: string): "valid" | "expiring" | "expired" {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffInDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "expired";
  if (diffInDays <= 30) return "expiring";
  return "valid";
}

export function TrainingMatrix({ employeeId }: TrainingMatrixProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const isEmployeeView = !!employeeId;
  const { dismissAlert } = useAlerts();
  const { colors } = useTheme();
  const { moveToRecycleBin } = useRecycleBin();

  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Training Statuses");
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);
  const [fetchingFileId, setFetchingFileId] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await Promise.all([fetchRecords(), fetchEmployees()]);
    } catch (error) {
      console.error("Error loading training records:", error);
      setLoadError("Couldn't load training records. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecords = async () => {
    const response = await fetch(`${API_URL}/training-records`);
    if (!response.ok) throw new Error("Failed to fetch training records");
    const data = await response.json();

    const formatted: TrainingRecord[] = data.map((r: any) => ({
      id: r.id,
      employeeId: r.work_id,
      employeeName: r.employee_name,
      siteLocation: r.site_location,
      trainingType: r.training_type,
      trainingName: r.training_name,
      certificateName: r.certificate_name,
      provider: r.provider,
      trainingCategory: r.training_category,
      isLegallyRequired: r.is_legally_required,
      completionDate: r.completion_date,
      expiryDate: r.expiry_date,
      fileName: r.file_name,
    }));

    setRecords(formatted);
  };

  const fetchEmployees = async () => {
    const response = await fetch(`${API_URL}/employees`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    const data = await response.json();

    const formatted: EmployeeOption[] = data
      .filter((e: any) => e.status !== "Inactive")
      .map((e: any) => ({
        id: e.id,
        employeeId: e.employee_number,
        fullName: e.full_name,
        siteLocation: e.site_location,
      }));

    setEmployees(formatted);
  };

  const sites = [
    "All Sites",
    ...(Array.from(new Set(employees.map((e) => e.siteLocation).filter(Boolean))).sort() as string[]),
  ];

  const filteredRecords = records.filter((record) => {
    if (employeeId && record.employeeId !== employeeId) return false;
    if (selectedEmployee !== "All Employees" && record.employeeId !== selectedEmployee) return false;
    if (selectedSite !== "All Sites" && record.siteLocation !== selectedSite) return false;

    if (selectedStatus !== "All Training Statuses") {
      const status = getTrainingStatus(record.expiryDate);
      if (selectedStatus === "Valid" && status !== "valid") return false;
      if (selectedStatus === "Expiring Soon" && status !== "expiring") return false;
      if (selectedStatus === "Expired" && status !== "expired") return false;
    }

    return true;
  });

  const expiredCount = filteredRecords.filter((r) => getTrainingStatus(r.expiryDate) === "expired").length;
  const validCount = filteredRecords.filter((r) => getTrainingStatus(r.expiryDate) === "valid").length;
  const expiringCount = filteredRecords.filter((r) => getTrainingStatus(r.expiryDate) === "expiring").length;
  const complianceRate = filteredRecords.length === 0 ? 0 : Math.round((validCount / filteredRecords.length) * 100);

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `${expiredCount} training certificates expired`, "critical");
  };

  const handleDeleteClick = (record: TrainingRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!selectedRecord) return;

    try {
      const response = await fetch(`${API_URL}/training-records/${selectedRecord.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete training record");

      moveToRecycleBin({
        id: String(selectedRecord.id),
        name: selectedRecord.certificateName,
        type: "Training Record",
        data: selectedRecord,
        deletedAt: new Date().toISOString(),
      });

      setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
    } catch (error) {
      console.error("Error archiving training record:", error);
    } finally {
      setSelectedRecord(null);
    }
  };

  const handleAddTraining = async (formData: FormData) => {
    const response = await fetch(`${API_URL}/training-records`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Failed to save training record");
    }

    await fetchRecords();
    setAddModalOpen(false);
  };

  const handleViewCertificate = async (record: TrainingRecord) => {
    setFetchingFileId(record.id);
    try {
      const response = await fetch(`${API_URL}/training-records/${record.id}/file`);
      if (!response.ok) throw new Error("No certificate available");
      const data = await response.json();
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error fetching certificate:", error);
    } finally {
      setFetchingFileId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: colors.background }}>
      <div className="max-w-[1600px] mx-auto">
        {!isEmployeeView && expiredCount > 0 && (
          <AlertBanner
            id="training-expired-alert"
            type="critical"
            icon={<AlertTriangle className="size-5" />}
            title={`${expiredCount} training certificate${expiredCount !== 1 ? "s" : ""} expired`}
            description="Employees may not be authorized for certain high-risk tasks"
            onDismiss={handleDismissAlert}
          />
        )}

        {!isEmployeeView && (
          <div className="px-8 pt-6 pb-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>Training Matrix & Competency Tracking</h1>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                  <p className="text-sm" style={{ color: "#94A3B8" }}>POPI Act Compliant: Restricted Access</p>
                </div>
              </div>

              <button
                onClick={() => setAddModalOpen(true)}
                disabled={employees.length === 0}
                className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <Plus className="size-4" />
                Add Training Record
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Filter className="size-5" style={{ color: "#94A3B8" }} />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
              >
                {sites.map((site) => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
              >
                <option value="All Employees">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.employeeId}>{employee.fullName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Total Records", value: filteredRecords.length, color: "#F8FAFC" },
                { label: "Valid", value: validCount, color: "var(--compliance-success)" },
                { label: "Expiring Soon", value: expiringCount, color: "var(--compliance-warning)" },
                { label: "Expired", value: expiredCount, color: "var(--compliance-danger)" },
                { label: "Compliance Rate", value: `${complianceRate}%`, color: "var(--compliance-success)" },
              ].map((stat) => (
                <div key={stat.label} className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
                  <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>{stat.label}</p>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-8 pb-8">
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2 className="size-5 animate-spin" style={{ color: "#94A3B8" }} />
                <span className="text-sm" style={{ color: "#94A3B8" }}>Loading training records…</span>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertTriangle className="size-6" style={{ color: "var(--compliance-danger)" }} />
                <span className="text-sm" style={{ color: "#F8FAFC" }}>{loadError}</span>
                <button onClick={fetchAll} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#3B82F6" }}>
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#0F172A" }}>
                      {!isEmployeeView && (
                        <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Employee</th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Certificate Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Training Provider</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Completion Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Expiry Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Training Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Certificate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={isEmployeeView ? 7 : 8} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                          {records.length === 0
                            ? 'No training records yet. Click "Add Training Record" to create one.'
                            : "No training records found matching your filters"}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, index) => {
                        const status = getTrainingStatus(record.expiryDate);
                        const statusColor =
                          status === "expired" ? "var(--compliance-danger)"
                          : status === "expiring" ? "var(--compliance-warning)"
                          : "var(--compliance-success)";

                        return (
                          <tr
                            key={record.id}
                            className="transition-colors hover:bg-opacity-80"
                            style={{ backgroundColor: index % 2 === 0 ? "#1E293B" : "#0F172A" }}
                          >
                            {!isEmployeeView && (
                              <td className="px-6 py-4 text-sm font-medium" style={{ color: "#F8FAFC" }}>
                                <div>
                                  <p>{record.employeeName}</p>
                                  <p className="text-xs text-gray-400">{record.employeeId}</p>
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm" style={{ color: "#F8FAFC" }}>{record.certificateName}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: "#94A3B8" }}>{record.provider}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: "#94A3B8" }}>
                              {new Date(record.completionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span style={{ color: statusColor }}>
                                {new Date(record.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </span>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={status} /></td>
                            <td className="px-6 py-4 text-sm">
                              {record.fileName ? (
                                <button
                                  onClick={() => handleViewCertificate(record)}
                                  disabled={fetchingFileId === record.id}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs disabled:opacity-60 flex items-center gap-1.5"
                                >
                                  {fetchingFileId === record.id && <Loader2 className="size-3 animate-spin" />}
                                  {fetchingFileId === record.id ? "Loading…" : "View Certificate"}
                                </button>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteClick(record)}
                                className="p-2 rounded hover:bg-opacity-20 transition-colors"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                aria-label="Archive record"
                              >
                                <Trash2 className="size-4" style={{ color: "var(--compliance-danger)" }} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

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

      <AddTrainingRecordModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        employees={employees}
        lockedEmployeeId={
          employeeId ? employees.find((e) => e.employeeId === employeeId)?.id : undefined
        }
        onSubmit={handleAddTraining}
      />
    </div>
  );
}

interface StatusBadgeProps {
  status: "valid" | "expiring" | "expired";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const badgeConfig = {
    valid: { label: "Valid", color: "var(--compliance-success)", icon: <CheckCircle2 className="size-4" /> },
    expiring: { label: "Expiring Soon", color: "var(--compliance-warning)", icon: <AlertTriangle className="size-4" /> },
    expired: { label: "Expired", color: "var(--compliance-danger)", icon: <XCircle className="size-4" /> },
  };

  const config = badgeConfig[status];

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: config.color }}>
      {config.icon}
      {config.label}
    </div>
  );
}