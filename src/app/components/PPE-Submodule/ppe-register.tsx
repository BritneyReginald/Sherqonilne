import { useState, useEffect } from "react";
import {
  Plus,
  Settings,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  IssuePPEModal,
  PPECatalogueItem,
  EmployeeOption,
} from "./issue-ppe-modal";
import { PPECatalogue } from "./ppe-catalogue";
import { AlertBanner } from "../alert-banner";
import { useAlerts } from "../../contexts/alert-context";

interface PPETransaction {
  id: number;
  employeeName: string;
  jobTitle: string | null;
  siteLocation: string | null;
  ppeItemName: string;
  ppeBrand: string | null;
  ppeSize: string | null;
  ppeCategory: string;
  issueDate: string;
  condition: "new" | "re-issued-good";
  replacementDue: string;
  signOffStatus: "signed" | "pending";
  signOffDate: string | null;
}

function authHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("sherq_auth");
    const token = stored ? JSON.parse(stored).token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export function PPERegister({ employeeId }: { employeeId?: string }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { dismissAlert } = useAlerts();

  const [transactions, setTransactions] = useState<PPETransaction[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [catalogueItems, setCatalogueItems] = useState<PPECatalogueItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedCategory, setSelectedCategory] = useState("All PPE Types");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] =
    useState("All Employees");

  // Delete (moves to Recycle Bin)
  const [deleteTarget, setDeleteTarget] = useState<PPETransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchEmployees(),
        fetchCatalogueItems(),
      ]);
    } catch (error) {
      console.error("Error loading PPE register:", error);
      setLoadError(
        "Couldn't load the PPE register. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const response = await fetch(`${API_URL}/ppe/transactions`);
    if (!response.ok) throw new Error("Failed to fetch PPE transactions");
    const data = await response.json();

    const formatted: PPETransaction[] = data.map((t: any) => ({
      id: t.id,
      employeeName: t.employee_name,
      jobTitle: t.job_title,
      siteLocation: t.site_location,
      ppeItemName: t.ppe_item_name,
      ppeBrand: t.ppe_brand,
      ppeSize: t.ppe_size,
      ppeCategory: t.ppe_category,
      issueDate: t.issue_date,
      condition: t.condition,
      replacementDue: t.replacement_due,
      signOffStatus: t.sign_off_status,
      signOffDate: t.sign_off_date,
    }));

    setTransactions(formatted);
  };

  const fetchEmployees = async () => {
    const response = await fetch(`${API_URL}/employees`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    const data = await response.json();

    // NOTE: employeeNumber is included here (in addition to the existing
    // fields) so the register can be filtered by the employee's number
    // (e.g. "EMP001") from the employee profile page, even though PPE
    // transactions themselves only store the employee's name.
    const formatted: EmployeeOption[] = data
      .filter((e: any) => e.status !== "Inactive")
      .map((e: any) => ({
        id: e.id,
        employeeNumber: e.employee_number,
        name: e.full_name,
        jobTitle: e.job_title,
        siteLocation: e.site_location,
      }));

    setEmployees(formatted);
  };

  const fetchCatalogueItems = async () => {
    const response = await fetch(`${API_URL}/ppe/catalogue`);
    if (!response.ok) throw new Error("Failed to fetch PPE catalogue");
    const data = await response.json();

    const formatted: PPECatalogueItem[] = data.map((item: any) => ({
      id: item.id,
      name: item.item_name,
      category: item.category,
      requiresSize: item.requires_size,
      sizes: item.sizes || undefined,
    }));

    setCatalogueItems(formatted);
  };

  const handleIssuePPE = async (data: {
    employee: EmployeeOption;
    items: Map<string, { condition: string; size?: string }>;
    signatureData: string;
  }) => {
    const response = await fetch(`${API_URL}/ppe/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: data.employee.id,
        employeeName: data.employee.name,
        jobTitle: data.employee.jobTitle,
        siteLocation: data.employee.siteLocation,
        items: Array.from(data.items.entries()).map(([itemId, details]) => ({
          itemId: Number(itemId),
          condition: details.condition,
          size: details.size,
        })),
        signatureData: data.signatureData,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Failed to issue PPE");
    }

    await Promise.all([fetchTransactions(), fetchCatalogueItems()]);
    setShowIssueModal(false);
  };

  const openDeleteConfirm = (t: PPETransaction) => {
    setDeleteError(null);
    setDeleteTarget(t);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(
        `${API_URL}/ppe/transactions/${deleteTarget.id}`,
        { method: "DELETE", headers: authHeaders() },
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to delete PPE record");
      }
      await Promise.all([fetchTransactions(), fetchCatalogueItems()]);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error("Error deleting PPE record:", error);
      setDeleteError(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const sites = [
    "All Sites",
    ...(Array.from(
      new Set(employees.map((e) => e.siteLocation).filter(Boolean)),
    ).sort() as string[]),
  ];

  const ppeCategories = [
    "All PPE Types",
    ...Array.from(new Set(catalogueItems.map((c) => c.category))).sort(),
  ];

  const employeeFilterOptions = [
    "All Employees",
    ...Array.from(new Set(transactions.map((t) => t.employeeName))).sort(),
  ];

  // Crosswalk: the employee profile page passes an employee NUMBER
  // (e.g. "EMP001"), but PPE transactions only store the employee's NAME.
  // Resolve the number to a name once here so filtering below is a
  // straightforward name comparison.
  const employeeNameForProfileFilter = employeeId
    ? employees.find((e) => e.employeeNumber === employeeId)?.name
    : undefined;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesEmployeeId = employeeId
      ? employeeNameForProfileFilter
        ? transaction.employeeName === employeeNameForProfileFilter
        : false
      : true;
    const matchesSite =
      selectedSite === "All Sites" || transaction.siteLocation === selectedSite;
    const matchesCategory =
      selectedCategory === "All PPE Types" ||
      transaction.ppeCategory === selectedCategory;
    const matchesEmployee =
      selectedEmployeeFilter === "All Employees" ||
      transaction.employeeName === selectedEmployeeFilter;

    return (
      matchesEmployeeId && matchesSite && matchesCategory && matchesEmployee
    );
  });

  const totalIssued = filteredTransactions.length;
  const pendingSignOffs = filteredTransactions.filter(
    (t) => t.signOffStatus === "pending",
  ).length;
  const signedOff = filteredTransactions.filter(
    (t) => t.signOffStatus === "signed",
  ).length;
  const upcomingReplacements = filteredTransactions.filter((t) => {
    const replacementDate = new Date(t.replacementDue);
    const today = new Date();
    const daysUntil =
      (replacementDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return daysUntil > 0 && daysUntil <= 30;
  }).length;
  const completionRate =
    totalIssued > 0 ? Math.round((signedOff / totalIssued) * 100) : 0;

  const handleDismissAlert = (id: string) => {
    dismissAlert(
      id,
      `PPE Alert: ${pendingSignOffs} items awaiting employee sign-off`,
      "critical",
    );
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const thStyle = {
    color: "#94A3B8",
  };

  const DeleteButton = ({ t }: { t: PPETransaction }) => (
    <button
      onClick={() => openDeleteConfirm(t)}
      className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
      style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
      title="Delete (moves to Recycle Bin)"
      aria-label={`Delete PPE record for ${t.employeeName}`}
    >
      <Trash2
        className="size-4"
        style={{ color: "var(--compliance-danger)" }}
      />
    </button>
  );

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="max-w-[1600px] mx-auto">
        {!employeeId && (
          <>
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

            <div className="px-8 pt-6 pb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>
                    PPE Register & Issue Log
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck
                      className="size-4"
                      style={{ color: "var(--compliance-success)" }}
                    />
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
                    disabled={
                      employees.length === 0 || catalogueItems.length === 0
                    }
                    className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    <Plus className="size-4" />
                    Issue PPE
                  </button>
                </div>
              </div>

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
                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundColor: "#1E293B",
                    color: "#F8FAFC",
                    border: "none",
                  }}
                >
                  {employeeFilterOptions.map((employee) => (
                    <option key={employee} value={employee}>
                      {employee}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[
                  {
                    label: "Total Issued",
                    value: totalIssued,
                    color: "#F8FAFC",
                  },
                  {
                    label: "Signed Off",
                    value: signedOff,
                    color: "var(--compliance-success)",
                  },
                  {
                    label: "Pending Sign-Off",
                    value: pendingSignOffs,
                    color: "var(--compliance-danger)",
                  },
                  {
                    label: "Due for Replacement",
                    value: upcomingReplacements,
                    color: "var(--compliance-warning)",
                  },
                  {
                    label: "Completion Rate",
                    value: `${completionRate}%`,
                    color: "var(--compliance-success)",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="px-6 py-4 rounded-lg"
                    style={{ backgroundColor: "#1E293B" }}
                  >
                    <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                      {stat.label}
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="px-8 pb-8">
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: "#1E293B" }}
          >
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2
                  className="size-5 animate-spin"
                  style={{ color: "#94A3B8" }}
                />
                <span className="text-sm" style={{ color: "#94A3B8" }}>
                  Loading PPE register…
                </span>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertTriangle
                  className="size-6"
                  style={{ color: "var(--compliance-danger)" }}
                />
                <span className="text-sm" style={{ color: "#F8FAFC" }}>
                  {loadError}
                </span>
                <button
                  onClick={fetchAll}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading &&
              !loadError &&
              (employeeId ? (
                <div className="p-6 space-y-3">
                  {filteredTransactions.length === 0 ? (
                    <div
                      className="text-center py-10 text-sm"
                      style={{ color: "#94A3B8" }}
                    >
                      No PPE has been issued to this employee yet.
                    </div>
                  ) : (
                    filteredTransactions.map((t) => {
                      const replacementDate = new Date(t.replacementDue);
                      const today = new Date();
                      const isOverdue = replacementDate < today;
                      const isDueSoon =
                        !isOverdue &&
                        (replacementDate.getTime() - today.getTime()) /
                          (1000 * 3600 * 24) <=
                          30;
                      return (
                        <div
                          key={t.id}
                          className="rounded-lg p-4 flex items-center justify-between"
                          style={{ backgroundColor: "#0F172A" }}
                        >
                          <div>
                            <div
                              className="font-medium mb-1"
                              style={{ color: "#F8FAFC" }}
                            >
                              {t.ppeItemName}
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "#94A3B8" }}
                            >
                              {t.ppeBrand}
                              {t.ppeSize ? ` • ${t.ppeSize}` : ""} • Issued{" "}
                              {formatDate(t.issueDate)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className="text-sm"
                              style={{
                                color: isOverdue
                                  ? "var(--compliance-danger)"
                                  : isDueSoon
                                    ? "var(--compliance-warning)"
                                    : "var(--compliance-success)",
                              }}
                            >
                              Due {formatDate(t.replacementDue)}
                            </span>
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  t.condition === "new"
                                    ? "rgba(34, 197, 94, 0.2)"
                                    : "rgba(59, 130, 246, 0.2)",
                                color:
                                  t.condition === "new"
                                    ? "var(--compliance-success)"
                                    : "#3B82F6",
                              }}
                            >
                              {t.condition === "new"
                                ? "New"
                                : "Re-issued (Good)"}
                            </span>
                            {t.signOffStatus === "signed" ? (
                              <CheckCircle2
                                className="size-5"
                                style={{ color: "var(--compliance-success)" }}
                              />
                            ) : (
                              <span
                                className="flex items-center gap-1 text-xs font-medium"
                                style={{ color: "var(--compliance-danger)" }}
                              >
                                <Clock className="size-4" /> Pending
                              </span>
                            )}
                            <DeleteButton t={t} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Employee
                        </th>
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Site
                        </th>
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          PPE Item
                        </th>
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Issue Date
                        </th>
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Condition
                        </th>
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Replacement Due
                        </th>
                        <th
                          className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Sign-Off
                        </th>
                        <th
                          className="text-center px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={thStyle}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-10 text-sm"
                            style={{ color: "#94A3B8" }}
                          >
                            No PPE issue records match the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t) => {
                          const replacementDate = new Date(t.replacementDue);
                          const today = new Date();
                          const isOverdue = replacementDate < today;
                          const daysUntil =
                            (replacementDate.getTime() - today.getTime()) /
                            (1000 * 3600 * 24);
                          const isDueSoon = !isOverdue && daysUntil <= 30;

                          return (
                            <tr
                              key={t.id}
                              style={{
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              <td className="px-6 py-4">
                                <div
                                  className="font-medium"
                                  style={{ color: "#F8FAFC" }}
                                >
                                  {t.employeeName}
                                </div>
                                {t.jobTitle && (
                                  <div
                                    className="text-xs"
                                    style={{ color: "#94A3B8" }}
                                  >
                                    {t.jobTitle}
                                  </div>
                                )}
                              </td>
                              <td
                                className="px-6 py-4 text-sm"
                                style={{ color: "#CBD5E1" }}
                              >
                                {t.siteLocation || "—"}
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className="font-medium"
                                  style={{ color: "#F8FAFC" }}
                                >
                                  {t.ppeItemName}
                                </div>
                                <div
                                  className="text-xs"
                                  style={{ color: "#94A3B8" }}
                                >
                                  {[t.ppeBrand, t.ppeSize, t.ppeCategory]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </div>
                              </td>
                              <td
                                className="px-6 py-4 text-sm"
                                style={{ color: "#CBD5E1" }}
                              >
                                {formatDate(t.issueDate)}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor:
                                      t.condition === "new"
                                        ? "rgba(34, 197, 94, 0.2)"
                                        : "rgba(59, 130, 246, 0.2)",
                                    color:
                                      t.condition === "new"
                                        ? "var(--compliance-success)"
                                        : "#3B82F6",
                                  }}
                                >
                                  {t.condition === "new"
                                    ? "New"
                                    : "Re-issued (Good)"}
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 text-sm font-medium"
                                style={{
                                  color: isOverdue
                                    ? "var(--compliance-danger)"
                                    : isDueSoon
                                      ? "var(--compliance-warning)"
                                      : "var(--compliance-success)",
                                }}
                              >
                                {formatDate(t.replacementDue)}
                              </td>
                              <td className="px-6 py-4">
                                {t.signOffStatus === "signed" ? (
                                  <span
                                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                                    style={{
                                      color: "var(--compliance-success)",
                                    }}
                                  >
                                    <CheckCircle2 className="size-4" />
                                    Signed
                                    {t.signOffDate
                                      ? ` • ${formatDate(t.signOffDate)}`
                                      : ""}
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                                    style={{
                                      color: "var(--compliance-danger)",
                                    }}
                                  >
                                    <Clock className="size-4" />
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center">
                                  <DeleteButton t={t} />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        </div>
      </div>

      <IssuePPEModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        employees={employees}
        catalogueItems={catalogueItems}
        onSubmit={handleIssuePPE}
      />

      <PPECatalogue
        isOpen={showCatalogue}
        onClose={() => setShowCatalogue(false)}
        onCatalogueChanged={fetchCatalogueItems}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeDeleteConfirm}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
            <div
              className="w-full max-w-md rounded-lg shadow-2xl"
              style={{ backgroundColor: "white" }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--compliance-danger)10" }}
                  >
                    <Trash2
                      className="size-5"
                      style={{ color: "var(--compliance-danger)" }}
                    />
                  </div>
                  <h3
                    className="font-medium"
                    style={{ color: "var(--grey-900)" }}
                  >
                    Delete this PPE record?
                  </h3>
                </div>
                <p
                  className="text-sm mb-2"
                  style={{ color: "var(--grey-700)" }}
                >
                  <strong>{deleteTarget.ppeItemName}</strong> issued to{" "}
                  <strong>{deleteTarget.employeeName}</strong> on{" "}
                  {formatDate(deleteTarget.issueDate)}.
                </p>
                <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                  It will move to the Recycle Bin and be permanently deleted
                  after 30 days. You can restore it from there until then.
                </p>
                {deleteError && (
                  <div
                    className="mt-4 p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--compliance-danger)10",
                      color: "var(--compliance-danger)",
                    }}
                  >
                    {deleteError}
                  </div>
                )}
              </div>
              <div
                className="px-6 py-4 border-t flex justify-end gap-3"
                style={{ borderColor: "var(--grey-200)" }}
              >
                <button
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: "var(--grey-100)",
                    color: "var(--grey-700)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center gap-2"
                  style={{ backgroundColor: "var(--compliance-danger)" }}
                >
                  {isDeleting && <Loader2 className="size-4 animate-spin" />}
                  {isDeleting ? "Deleting…" : "Move to Recycle Bin"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
