import { useEffect, useMemo, useState } from "react";
import {
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  UserPlus,
  X,
  Loader2,
  AlertTriangle,
  // ClipboardList, // Open Audit Findings / Schedule Audit - later update
  // Upload,        // Upload Documents - later update
  // FileText,      // Generate Reports - later update
} from "lucide-react";
import { AlertBanner } from "../components/alert-banner";
import { useAlerts } from "../contexts/alert-context";
import { useTheme } from "../contexts/theme-context";
import { useLegalAppointments } from "../contexts/legal-appointments-context";
import { getRiskAssessments } from "../utils/risk-assessment-api";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface DetailItem {
  id: string;
  title: string; // usually the employee / assessment name
  subtitle: string; // what it is + reference
  date: string | null; // the relevant due / expiry date
  days: number | null; // days until date (negative = past)
  note?: string; // overrides the auto status text (e.g. "No document uploaded")
}

interface RiskCard {
  id: string;
  title: string;
  description: string;
  status: "danger" | "warning";
  items: DetailItem[];
}

interface DashboardProps {
  /**
   * Navigate to another page of the app (e.g. onNavigate("workforce")).
   * Wire this to however your app switches pages.
   */
  onNavigate?: (page: string) => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DAY_MS = 1000 * 60 * 60 * 24;

function daysUntil(value?: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / DAY_MS);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Keep only the newest record per key so superseded records don't count as expired. */
function latestBy<T>(
  rows: T[],
  keyFn: (r: T) => string,
  dateFn: (r: T) => number,
): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    const key = keyFn(row);
    const existing = map.get(key);
    if (!existing || dateFn(row) > dateFn(existing)) map.set(key, row);
  }
  return Array.from(map.values());
}

const time = (v: any) => {
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const EXAM_LABELS: Record<string, string> = {
  "pre-placement": "Pre-Placement",
  periodic: "Periodic",
  exit: "Exit",
  "return-to-work": "Return to Work",
};

function statusText(item: DetailItem) {
  if (item.note) return item.note;
  if (item.days === null) return "—";
  if (item.days < 0)
    return `Overdue by ${Math.abs(item.days)} day${Math.abs(item.days) !== 1 ? "s" : ""}`;
  if (item.days === 0) return "Due today";
  return `Due in ${item.days} day${item.days !== 1 ? "s" : ""}`;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function Dashboard({ onNavigate }: DashboardProps) {
  const { dismissAlert } = useAlerts();
  const { colors } = useTheme();
  const { appointments: legalAppointments, loading: legalLoading } =
    useLegalAppointments();

  const [employees, setEmployees] = useState<any[]>([]);
  const [medicals, setMedicals] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [ppe, setPpe] = useState<any[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
  const [failedModules, setFailedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openCard, setOpenCard] = useState<RiskCard | null>(null);

  const isDark = colors.background === "#0F172A";
  const subtleBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";
  const cardShadow =
    "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)";

  /* ---------- Load live data ---------- */

  useEffect(() => {
    let cancelled = false;

    const get = async (path: string) => {
      const res = await fetch(`${API_URL}${path}`);
      if (!res.ok) throw new Error(`Failed: ${path}`);
      return res.json();
    };

    (async () => {
      setIsLoading(true);
      const [emp, med, trn, ppeRes, ra] = await Promise.allSettled([
        get("/employees"),
        get("/medicals"),
        get("/training-records"),
        get("/ppe/transactions"),
        getRiskAssessments(),
      ]);
      if (cancelled) return;

      const failed: string[] = [];
      const pick = (r: PromiseSettledResult<any>, label: string): any[] => {
        if (r.status === "fulfilled" && Array.isArray(r.value)) return r.value;
        failed.push(label);
        return [];
      };

      setEmployees(pick(emp, "Workforce"));
      setMedicals(pick(med, "Medical Surveillance"));
      setTraining(pick(trn, "Training"));
      setPpe(pick(ppeRes, "PPE Register"));
      setRiskAssessments(pick(ra, "Risk Assessments"));
      setFailedModules(failed);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Last login ---------- */

  const lastLogin = useMemo(() => {
    try {
      let value = localStorage.getItem("rss:lastLoginAt");
      if (!value) {
        // Fallback: the dashboard is the first page after login, so its first
        // open in a session is effectively the login time.
        value = sessionStorage.getItem("rss:sessionStartAt");
        if (!value) {
          value = new Date().toISOString();
          sessionStorage.setItem("rss:sessionStartAt", value);
        }
      }
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "—";
    }
  }, []);

  /* ---------- Derived compliance data ---------- */

  const data = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status !== "Inactive");
    const inactiveNumbers = new Set(
      employees
        .filter((e) => e.status === "Inactive")
        .map((e) => e.employee_number),
    );
    const inactiveNames = new Set(
      employees.filter((e) => e.status === "Inactive").map((e) => e.full_name),
    );

    /* Medicals — newest exam per employee */
    const medicalItems: DetailItem[] = latestBy(
      medicals.filter((m) => !inactiveNumbers.has(m.employee_number)),
      (m) => String(m.employee_id ?? m.employee_number),
      (m) => time(m.exam_date),
    )
      .filter((m) => m.expiry_date)
      .map((m) => ({
        id: `med-${m.id}`,
        title: m.employee_name,
        subtitle: `${EXAM_LABELS[m.exam_type] ?? "Medical"} certificate • ${m.employee_number}`,
        date: m.expiry_date,
        days: daysUntil(m.expiry_date),
      }));

    /* Training — newest record per employee + certificate */
    const trainingItems: DetailItem[] = latestBy(
      training.filter((t) => !inactiveNumbers.has(t.work_id)),
      (t) => `${t.work_id}|${t.certificate_name}`,
      (t) => time(t.expiry_date),
    )
      .filter((t) => t.expiry_date)
      .map((t) => ({
        id: `trn-${t.id}`,
        title: t.employee_name,
        subtitle: `${t.certificate_name} • ${t.work_id}`,
        date: t.expiry_date,
        days: daysUntil(t.expiry_date),
      }));

    /* PPE — newest issue per employee + item (replacement due date) */
    const ppeItems: DetailItem[] = latestBy(
      ppe.filter((p) => !inactiveNames.has(p.employee_name)),
      (p) => `${p.employee_name}|${p.ppe_item_name}`,
      (p) => time(p.issue_date),
    )
      .filter((p) => p.replacement_due)
      .map((p) => ({
        id: `ppe-${p.id}`,
        title: p.employee_name,
        subtitle: `${p.ppe_item_name} replacement${p.site_location ? ` • ${p.site_location}` : ""}`,
        date: p.replacement_due,
        days: daysUntil(p.replacement_due),
      }));

    /* Risk assessments — annual review, 12 months after the saved date */
    const raItems: DetailItem[] = riskAssessments
      .filter((r) => r.savedDate)
      .map((r) => {
        const due = new Date(r.savedDate);
        due.setFullYear(due.getFullYear() + 1);
        const iso = due.toISOString();
        return {
          id: `ra-${r.id}`,
          title: r.assessmentName || "Untitled assessment",
          subtitle: `Annual review${r.referenceNo ? ` • Ref ${r.referenceNo}` : ""}`,
          date: iso,
          days: daysUntil(iso),
        };
      });

    /* Legal appointments — expired, or no document on file */
    const legalActive = legalAppointments.filter(
      (a: any) => !inactiveNumbers.has(a.employeeNumber),
    );
    // An appointment is "fulfilled" by either an uploaded signed document
    // OR an electronic signature, same rule as the Legal Appointments register.
    const hasProof = (a: any) => !!(a.documentUploaded || a.signatureData);

    const legalMissing: DetailItem[] = legalActive
      .filter((a: any) => a.status === "Expired" || !hasProof(a))
      .map((a: any) => ({
        id: `legal-${a.id}`,
        title: a.employeeName,
        subtitle: `${a.appointmentType}${a.legalSection ? ` • ${a.legalSection}` : ""}`,
        date: a.endDate || null,
        days: daysUntil(a.endDate),
        note: a.status === "Expired" ? undefined : "No document uploaded",
      }));

    const legalMissingIds = new Set(legalMissing.map((i) => i.id));
    const legalItems: DetailItem[] = legalActive.map((a: any) => ({
      id: `legal-${a.id}`,
      title: a.employeeName,
      subtitle: `${a.appointmentType}${a.legalSection ? ` • ${a.legalSection}` : ""}`,
      date: a.endDate || null,
      days: daysUntil(a.endDate),
    }));

    const sortByDays = (list: DetailItem[]) =>
      [...list].sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

    /* Cards */
    const medicalsCard = medicalItems.filter(
      (i) => i.days !== null && i.days <= 30,
    );
    const trainingCard = trainingItems.filter(
      (i) => i.days !== null && i.days < 0,
    );
    const ppeCard = ppeItems.filter((i) => i.days !== null && i.days <= 14);
    const raCard = raItems.filter((i) => i.days !== null && i.days <= 30);
    const docsThisWeek = [
      ...medicalItems.map((i) => ({
        ...i,
        subtitle: `Medical • ${i.subtitle}`,
      })),
      ...trainingItems.map((i) => ({
        ...i,
        subtitle: `Training • ${i.subtitle}`,
      })),
      ...legalItems
        .filter((i) => i.date)
        .map((i) => ({ ...i, subtitle: `Legal Appointment • ${i.subtitle}` })),
    ].filter((i) => i.days !== null && i.days >= 0 && i.days <= 7);

    const hasOverdue = (list: DetailItem[]) =>
      list.some((i) => i.days !== null && i.days < 0);

    const cards: RiskCard[] = [
      {
        id: "medicals-expiring",
        title: "Medical certificates expired or expiring within 30 days",
        description: "Medical certificates requiring renewal",
        status: hasOverdue(medicalsCard) ? "danger" : "warning",
        items: sortByDays(medicalsCard),
      },
      {
        id: "appointments-missing",
        title: "Legal Appointments missing",
        description:
          "Critical compliance roles unfilled (expired or no document)",
        status: "danger",
        items: sortByDays(legalMissing),
      },
      {
        id: "training-overdue",
        title: "Training certifications overdue",
        description: "Employees with expired training",
        status: "danger",
        items: sortByDays(trainingCard),
      },
      {
        id: "ppe-expiring",
        title: "PPE inspections due",
        description: "PPE replacements overdue or due in the next 14 days",
        status: hasOverdue(ppeCard) ? "danger" : "warning",
        items: sortByDays(ppeCard),
      },
      {
        id: "risk-assessments",
        title: "Risk Assessments require review",
        description: "Annual reviews overdue or due within 30 days",
        status: hasOverdue(raCard) ? "danger" : "warning",
        items: sortByDays(raCard),
      },
      {
        id: "documents-expiring",
        title: "Documents expiring this week",
        description:
          "Certificates and appointments expiring in the next 7 days",
        status: "danger",
        items: sortByDays(docsThisWeek),
      },
    ];

    /* Headline numbers */
    const overdueCount = (list: DetailItem[]) =>
      list.filter((i) => i.days !== null && i.days < 0).length;
    const upcomingCount = (list: DetailItem[]) =>
      list.filter((i) => i.days !== null && i.days >= 0 && i.days <= 30).length;

    const criticalCount =
      overdueCount(medicalItems) +
      overdueCount(trainingItems) +
      legalMissing.length +
      overdueCount(ppeItems) +
      overdueCount(raItems);

    const upcomingTotal =
      upcomingCount(medicalItems) +
      upcomingCount(trainingItems) +
      upcomingCount(legalItems.filter((i) => !legalMissingIds.has(i.id))) +
      upcomingCount(ppeItems) +
      upcomingCount(raItems);

    return {
      activeCount: activeEmployees.length,
      inactiveCount: employees.length - activeEmployees.length,
      criticalCount,
      upcomingTotal,
      cards,
    };
  }, [employees, medicals, training, ppe, riskAssessments, legalAppointments]);

  const loading = isLoading || legalLoading;
  const show = (n: number) => (loading ? "…" : n.toLocaleString("en-ZA"));

  /* ---------- Actions ---------- */

  const handleDismissAlert = (id: string) => {
    dismissAlert(
      id,
      `System Alert: ${data.criticalCount} critical compliance items require immediate attention`,
      "critical",
    );
  };

  const handleAddEmployee = () => {
    // Workforce reads this flag on mount and opens the Add Employee form.
    sessionStorage.setItem("workforce:openAddModal", "1");
    onNavigate?.("workforce");
  };

  const metricCards = [
    {
      id: "total-employees",
      label: "Total Employees Managed",
      value: show(data.activeCount),
      change: loading ? "" : `${data.inactiveCount} inactive`,
      icon: <Users className="size-6" />,
      color: undefined as string | undefined,
    },
    {
      id: "critical-expiries",
      label: "CRITICAL Expiries",
      value: show(data.criticalCount),
      change: "Requires immediate action",
      icon: <AlertCircle className="size-6" />,
      color: "var(--compliance-danger)",
    },
    {
      id: "upcoming-expiries",
      label: "Upcoming Expiries",
      value: show(data.upcomingTotal),
      change: "Next 30 days",
      icon: <Clock className="size-6" />,
      color: "var(--compliance-warning)",
    },
    // Open Audit Findings — commented out, planned for a later update
    // {
    //   id: "audit-findings",
    //   label: "Open Audit Findings",
    //   value: "8",
    //   change: "2 high priority",
    //   icon: <ClipboardList className="size-6" />,
    //   color: "var(--compliance-warning)",
    // },
  ];

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Red alert banner — only when something actually needs attention */}
        {!loading && data.criticalCount > 0 && (
          <AlertBanner
            id="dashboard-critical-alert"
            type="critical"
            icon={<AlertCircle className="size-5" />}
            title={`System Alert: ${data.criticalCount} critical compliance item${
              data.criticalCount !== 1 ? "s" : ""
            } require${data.criticalCount === 1 ? "s" : ""} immediate attention`}
            description={`Review all expired certifications and schedule renewals${
              data.upcomingTotal > 0
                ? ` • ${data.upcomingTotal} more expiring in the next 30 days`
                : ""
            }`}
            onDismiss={handleDismissAlert}
          />
        )}

        {failedModules.length > 0 && (
          <div
            className="mx-8 mt-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              color: "var(--compliance-warning)",
            }}
          >
            <AlertTriangle className="size-4" />
            Couldn't load: {failedModules.join(", ")}. Figures below may be
            incomplete.
          </div>
        )}

        {/* Header */}
        <div className="px-8 pt-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2" style={{ color: colors.primaryText }}>
              Welcome to Reginald SHERQ Services
            </h1>
            <p className="text-sm" style={{ color: colors.subText }}>
              RSS Admin: Last login: {lastLogin}
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricCards.map((card) => (
              <div
                key={card.id}
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: "8px",
                  boxShadow: cardShadow,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: card.color
                        ? `${card.color}20`
                        : "rgba(59, 130, 246, 0.2)",
                      color: card.color || "#3B82F6",
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div>
                  <p className="text-sm mb-2" style={{ color: colors.subText }}>
                    {card.label}
                  </p>
                  <p
                    className="text-3xl font-bold mb-1"
                    style={{ color: colors.primaryText }}
                  >
                    {card.value}
                  </p>
                  <p className="text-xs" style={{ color: colors.subText }}>
                    {card.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="px-8 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Risks */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: colors.surface,
              borderRadius: "8px",
              boxShadow: cardShadow,
            }}
          >
            <h2 className="text-xl mb-6" style={{ color: colors.primaryText }}>
              Compliance Risks & Actions
            </h2>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12">
                <Loader2
                  className="size-5 animate-spin"
                  style={{ color: colors.subText }}
                />
                <span className="text-sm" style={{ color: colors.subText }}>
                  Loading compliance data…
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {data.cards.map((risk) => {
                  const color =
                    risk.status === "danger"
                      ? "var(--compliance-danger)"
                      : "var(--compliance-warning)";
                  const count = risk.items.length;
                  return (
                    <div
                      key={risk.id}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: subtleBg }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {count > 0 ? (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ backgroundColor: `${color}20`, color }}
                              >
                                {risk.status === "danger"
                                  ? "HIGH RISK"
                                  : "WARNING"}
                              </span>
                            ) : (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    "var(--compliance-success)20",
                                  color: "var(--compliance-success)",
                                }}
                              >
                                ALL CLEAR
                              </span>
                            )}
                            <span
                              className="text-2xl font-bold"
                              style={{
                                color:
                                  count > 0
                                    ? color
                                    : "var(--compliance-success)",
                              }}
                            >
                              {count}
                            </span>
                          </div>
                          <p
                            className="font-medium mb-1"
                            style={{ color: colors.primaryText }}
                          >
                            {risk.title}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.subText }}
                          >
                            {risk.description}
                          </p>
                        </div>
                        <button
                          onClick={() => setOpenCard(risk)}
                          disabled={count === 0}
                          className="p-2 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: subtleBg }}
                          aria-label={`View ${risk.title}`}
                        >
                          <ArrowRight
                            className="size-4"
                            style={{ color: "#3B82F6" }}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: colors.surface,
              borderRadius: "8px",
              boxShadow: cardShadow,
            }}
          >
            <h2 className="text-xl mb-6" style={{ color: colors.primaryText }}>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleAddEmployee}
                className="w-full p-4 rounded-lg text-left flex items-center gap-4 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <UserPlus className="size-5" style={{ color: "white" }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "white" }}>
                    Add New Employee
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Onboard workforce member
                  </p>
                </div>
              </button>

              {/* Upload Documents, Generate Reports and Schedule Audit —
                  commented out for now, planned for a later update.

              <button className="w-full p-4 rounded-lg text-left flex items-center gap-4 ..."> Upload Documents </button>
              <button className="w-full p-4 rounded-lg text-left flex items-center gap-4 ..."> Generate Reports </button>
              <button className="w-full p-4 rounded-lg text-left flex items-center gap-4 ..."> Schedule Audit </button>
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Detail list modal */}
      {openCard && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpenCard(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-8 pointer-events-none">
            <div
              className="w-full max-w-3xl rounded-lg shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto"
              style={{ backgroundColor: colors.surface }}
            >
              <div
                className="px-6 py-4 flex items-start justify-between border-b"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <div>
                  <h3
                    className="font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    {openCard.title}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: colors.subText }}
                  >
                    {openCard.items.length} item
                    {openCard.items.length !== 1 ? "s" : ""} •{" "}
                    {openCard.description}
                  </p>
                </div>
                <button
                  onClick={() => setOpenCard(null)}
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                  aria-label="Close"
                >
                  <X className="size-5" style={{ color: colors.subText }} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {openCard.items.map((item) => {
                  const overdue = item.note
                    ? true
                    : item.days !== null && item.days < 0;
                  const color = overdue
                    ? "var(--compliance-danger)"
                    : "var(--compliance-warning)";
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg flex items-center justify-between gap-4"
                      style={{ backgroundColor: subtleBg }}
                    >
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: colors.primaryText }}
                        >
                          {item.title}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: colors.subText }}
                        >
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium" style={{ color }}>
                          {statusText(item)}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.subText }}
                        >
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
