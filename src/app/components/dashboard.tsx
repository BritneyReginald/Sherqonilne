import {
  Users,
  GraduationCap,
  Heart,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ArrowRight,
  UserPlus,
  Upload,
  FileText,
  ClipboardList,
} from "lucide-react";
import { AlertBanner } from "@/app/components/alert-banner";
import { useAlerts } from "@/app/contexts/alert-context";
import { useTheme } from "@/app/contexts/theme-context";

interface MetricCard {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color?: string;
}

interface ComplianceItem {
  id: string;
  title: string;
  count: number;
  status: "danger" | "warning";
  description: string;
}

const metricCards: MetricCard[] = [
  {
    id: "total-employees",
    label: "Total Employees Managed",
    value: "1,247",
    change: "+12 this month",
    trend: "up",
    icon: <Users className="size-6" />,
  },
  {
    id: "critical-expiries",
    label: "CRITICAL Expiries",
    value: "23",
    change: "Requires immediate action",
    icon: <AlertCircle className="size-6" />,
    color: "var(--compliance-danger)",
  },
  {
    id: "upcoming-expiries",
    label: "Upcoming Expiries",
    value: "47",
    change: "Next 30 days",
    icon: <Clock className="size-6" />,
    color: "var(--compliance-warning)",
  },
  {
    id: "audit-findings",
    label: "Open Audit Findings",
    value: "8",
    change: "2 high priority",
    icon: <ClipboardList className="size-6" />,
    color: "var(--compliance-warning)",
  },
];

const complianceRisks: ComplianceItem[] = [
  {
    id: "medicals-expiring",
    title: "Medicals expire next month",
    count: 5,
    status: "warning",
    description: "Medical certificates requiring renewal",
  },
  {
    id: "appointments-missing",
    title: "Legal Appointments missing",
    count: 3,
    status: "danger",
    description: "Critical compliance roles unfilled",
  },
  {
    id: "training-overdue",
    title: "Training certifications overdue",
    count: 12,
    status: "danger",
    description: "Employees with expired training",
  },
  {
    id: "ppe-expiring",
    title: "PPE inspections due",
    count: 8,
    status: "warning",
    description: "Equipment inspections in next 14 days",
  },
  {
    id: "risk-assessments",
    title: "Risk Assessments require review",
    count: 4,
    status: "warning",
    description: "Annual reviews approaching deadline",
  },
  {
    id: "documents-expiring",
    title: "Documents expiring this week",
    count: 6,
    status: "danger",
    description: "Permits and licenses",
  },
];

export function Dashboard() {
  const { dismissAlert } = useAlerts();
  const { colors } = useTheme();

  const handleDismissAlert = (id: string) => {
    dismissAlert(id, "System Alert: 23 critical compliance items require immediate attention", "critical");
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: colors.background }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Global Notification Header - Full Width White Bar */}
        <AlertBanner
          id="dashboard-critical-alert"
          type="critical"
          icon={<AlertCircle className="size-5" />}
          title="System Alert: 23 critical compliance items require immediate attention"
          description="Review all expired certifications and schedule renewals"
          onDismiss={handleDismissAlert}
        />

        {/* Header Section */}
        <div className="px-8 pt-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2" style={{ color: colors.primaryText }}>
              Welcome, Sarah Thompson
            </h1>
            <p className="text-sm" style={{ color: colors.subText }}>
              RSS Admin • Last login: Today at 08:15 AM
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card) => (
              <div
                key={card.id}
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: card.color ? `${card.color}20` : "rgba(59, 130, 246, 0.2)",
                      color: card.color || "#3B82F6",
                    }}
                  >
                    {card.icon}
                  </div>
                  {card.trend && (
                    <div>
                      {card.trend === "up" ? (
                        <TrendingUp className="size-5" style={{ color: "var(--compliance-success)" }} />
                      ) : (
                        <TrendingDown className="size-5" style={{ color: "var(--compliance-danger)" }} />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm mb-2" style={{ color: colors.subText }}>
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold mb-1" style={{ color: colors.primaryText }}>
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
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-xl mb-6" style={{ color: colors.primaryText }}>
              Compliance Risks & Actions
            </h2>
            <div className="space-y-4">
              {complianceRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              risk.status === "danger"
                                ? "var(--compliance-danger)20"
                                : "var(--compliance-warning)20",
                            color: risk.status === "danger" ? "var(--compliance-danger)" : "var(--compliance-warning)",
                          }}
                        >
                          {risk.status === "danger" ? "HIGH RISK" : "WARNING"}
                        </span>
                        <span
                          className="text-2xl font-bold"
                          style={{
                            color: risk.status === "danger" ? "var(--compliance-danger)" : "var(--compliance-warning)",
                          }}
                        >
                          {risk.count}
                        </span>
                      </div>
                      <p className="font-medium mb-1" style={{ color: colors.primaryText }}>
                        {risk.title}
                      </p>
                      <p className="text-xs" style={{ color: colors.subText }}>
                        {risk.description}
                      </p>
                    </div>
                    <button
                      className="p-2 rounded-lg transition-opacity hover:opacity-80"
                      style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }}
                    >
                      <ArrowRight className="size-4" style={{ color: "#3B82F6" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: colors.surface,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-xl mb-6" style={{ color: colors.primaryText }}>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                className="w-full p-4 rounded-lg text-left flex items-center gap-4 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "#3B82F6",
                }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                  <UserPlus className="size-5" style={{ color: "white" }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "white" }}>
                    Add New Employee
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Onboard workforce member
                  </p>
                </div>
              </button>

              <button
                className="w-full p-4 rounded-lg text-left flex items-center gap-4 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" }}>
                  <Upload className="size-5" style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.primaryText }}>
                    Upload Documents
                  </p>
                  <p className="text-xs" style={{ color: colors.subText }}>
                    Certificates & compliance files
                  </p>
                </div>
              </button>

              <button
                className="w-full p-4 rounded-lg text-left flex items-center gap-4 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" }}>
                  <FileText className="size-5" style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.primaryText }}>
                    Generate Reports
                  </p>
                  <p className="text-xs" style={{ color: colors.subText }}>
                    Export compliance analytics
                  </p>
                </div>
              </button>

              <button
                className="w-full p-4 rounded-lg text-left flex items-center gap-4 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" }}>
                  <ClipboardList className="size-5" style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.primaryText }}>
                    Schedule Audit
                  </p>
                  <p className="text-xs" style={{ color: colors.subText }}>
                    Plan site inspection
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}