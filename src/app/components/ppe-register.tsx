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
} from "lucide-react";
import { IssuePPEModal, PPECatalogueItem, EmployeeOption } from "@/app/components/issue-ppe-modal";
import { PPECatalogue } from "../components/ppe-catalogue";
import { AlertBanner } from "../components/alert-banner";
import { useAlerts } from "../contexts/alert-context";

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
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("All Employees");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await Promise.all([fetchTransactions(), fetchEmployees(), fetchCatalogueItems()]);
    } catch (error) {
      console.error("Error loading PPE register:", error);
      setLoadError("Couldn't load the PPE register. Check your connection and try again.");
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

    const formatted: EmployeeOption[] = data
      .filter((e: any) => e.status !== "Inactive")
      .map((e: any) => ({
        id: e.id,
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

  const sites = [
    "All Sites",
    ...Array.from(new Set(employees.map((e) => e.siteLocation).filter(Boolean))).sort() as string[],
  ];

  const ppeCategories = [
    "All PPE Types",
    ...Array.from(new Set(catalogueItems.map((c) => c.category))).sort(),
  ];

  const employeeFilterOptions = [
    "All Employees",
    ...Array.from(new Set(transactions.map((t) => t.employeeName))).sort(),
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesEmployeeId = employeeId ? transaction.employeeName === employeeId : true;
    const matchesSite = selectedSite === "All Sites" || transaction.siteLocation === selectedSite;
    const matchesCategory = selectedCategory === "All PPE Types" || transaction.ppeCategory === selectedCategory;
    const matchesEmployee = selectedEmployeeFilter === "All Employees" || transaction.employeeName === selectedEmployeeFilter;

    return matchesEmployeeId && matchesSite && matchesCategory && matchesEmployee;
  });

  const totalIssued = filteredTransactions.length;
  const pendingSignOffs = filteredTransactions.filter((t) => t.signOffStatus === "pending").length;
  const signedOff = filteredTransactions.filter((t) => t.signOffStatus === "signed").length;
  const upcomingReplacements = filteredTransactions.filter((t) => {
    const replacementDate = new Date(t.replacementDue);
    const today = new Date();
    const daysUntil = (replacementDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return daysUntil > 0 && daysUntil <= 30;
  }).length;
  const completionRate = totalIssued > 0 ? Math.round((signedOff / totalIssued) * 100) : 0;

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, `PPE Alert: ${pendingSignOffs} items awaiting employee sign-off`, "critical");
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "#0F172A" }}>
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
                  <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>PPE Register & Issue Log</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                    <p className="text-sm" style={{ color: "#94A3B8" }}>POPI Act Compliant: Restricted Access</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCatalogue(true)}
                    className="px-5 py-2.5 rounded-lg font-medium transition-opacity flex items-center gap-2 hover:opacity-90"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#F8FAFC" }}
                  >
                    <Settings className="size-4" />
                    PPE Catalogue
                  </button>
                  <button
                    onClick={() => setShowIssueModal(true)}
                    disabled={employees.length === 0 || catalogueItems.length === 0}
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
                  style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
                >
                  {sites.map((site) => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                  style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
                >
                  {ppeCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                  style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
                >
                  {employeeFilterOptions.map((employee) => (
                    <option key={employee} value={employee}>{employee}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Total Issued", value: totalIssued, color: "#F8FAFC" },
                  { label: "Signed Off", value: signedOff, color: "var(--compliance-success)" },
                  { label: "Pending Sign-Off", value: pendingSignOffs, color: "var(--compliance-danger)" },
                  { label: "Due for Replacement", value: upcomingReplacements, color: "var(--compliance-warning)" },
                  { label: "Completion Rate", value: `${completionRate}%`, color: "var(--compliance-success)" },
                ].map((stat) => (
                  <div key={stat.label} className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
                    <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>{stat.label}</p>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="px-8 pb-8">
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2 className="size-5 animate-spin" style={{ color: "#94A3B8" }} />
                <span className="text-sm" style={{ color: "#94A3B8" }}>Loading PPE register…</span>
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
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Employee</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>PPE Item</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Issue Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Replacement Due</th>
                      <th className="px-6 py-4 text-left text-sm font-medium" style={{ color: "#94A3B8" }}>Condition</th>
                      <th className="px-6 py-4 text-center text-sm font-medium" style={{ color: "#94A3B8" }}>Sign-Off Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                          No PPE has been issued yet. Click "Issue PPE" to record one.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction, index) => {
                        const replacementDate = new Date(transaction.replacementDue);
                        const today = new Date();
                        const isOverdue = replacementDate < today;
                        const isDueSoon = !isOverdue && (replacementDate.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 30;

                        return (
                          <tr
                            key={transaction.id}
                            className="transition-colors hover:bg-opacity-80"
                            style={{ backgroundColor: index % 2 === 0 ? "#1E293B" : "#0F172A" }}
                          >
                            <td className="px-6 py-4 font-mono text-sm" style={{ color: "#94A3B8" }}>
                              PPE-{String(transaction.id).padStart(4, "0")}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium mb-0.5" style={{ color: "#F8FAFC" }}>{transaction.employeeName}</div>
                                <div className="text-sm" style={{ color: "#94A3B8" }}>{transaction.jobTitle}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium mb-0.5" style={{ color: "#F8FAFC" }}>{transaction.ppeItemName}</div>
                                <div className="text-sm" style={{ color: "#94A3B8" }}>
                                  {transaction.ppeBrand}{transaction.ppeSize ? ` • ${transaction.ppeSize}` : ""}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: "#94A3B8" }}>
                              {new Date(transaction.issueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span style={{ color: isOverdue ? "var(--compliance-danger)" : isDueSoon ? "var(--compliance-warning)" : "var(--compliance-success)" }}>
                                {new Date(transaction.replacementDue).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: transaction.condition === "new" ? "rgba(34, 197, 94, 0.2)" : "rgba(59, 130, 246, 0.2)",
                                  color: transaction.condition === "new" ? "var(--compliance-success)" : "#3B82F6",
                                }}
                              >
                                {transaction.condition === "new" ? "New" : "Re-issued (Good)"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {transaction.signOffStatus === "signed" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <CheckCircle2 className="size-5" style={{ color: "var(--compliance-success)" }} />
                                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                                    {transaction.signOffDate
                                      ? new Date(transaction.signOffDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                                      : "Signed"}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <Clock className="size-5" style={{ color: "var(--compliance-danger)" }} />
                                  <span className="text-xs font-medium" style={{ color: "var(--compliance-danger)" }}>Pending</span>
                                </div>
                              )}
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
    </div>
  );
}