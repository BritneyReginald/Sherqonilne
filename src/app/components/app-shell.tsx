import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardCheck,
  GraduationCap,
  Heart,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  FileText,
  Grid3x3,
  Settings,
  Shield,
  Trash2,
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Dashboard } from "@/app/components/dashboard";
import { Workforce } from "@/app/components/workforce";
import { TrainingMatrix } from "@/app/components/training-matrix";
import { DocumentLibrary } from "@/app/components/document-library";
import { GlobalTrainingMatrix } from "@/app/components/global-training-matrix";
import { PPERegister } from "@/app/components/ppe-register";
import { RiskAssessmentRegisterEnhanced } from "@/app/components/risk-assessment-register-enhanced";
import { MedicalSurveillanceEnhanced } from "@/app/components/medical-surveillance-enhanced";
import { ReportsAnalytics } from "@/app/components/reports-analytics";
import { SystemAuditLog } from "@/app/components/system-audit-log";
import { GlobalSearch } from "@/app/components/global-search";
import { SystemSettings } from "@/app/components/system-settings";
import { CompanySites } from "@/app/components/company-sites";
import { Appointments } from "@/app/components/appointments";
import { useAlerts } from "@/app/contexts/alert-context";
import { useTheme } from "@/app/contexts/theme-context";
import { NewRiskAssessment } from "@/app/components/new-risk-assessment";
import { RiskMethodology } from "@/app/components/risk-methodology";
import { RiskAssessmentBeforeControls } from "@/app/components/risk-assessment-before-controls";
import { RiskAssessmentAfterControls } from "@/app/components/risk-assessment-after-controls";
import { RiskAssessmentSummary } from "@/app/components/risk-assessment-summary";


interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    id: "company-sites",
    label: "Company & Sites",
    icon: <Building2 className="size-5" />,
  },
  {
    id: "workforce",
    label: "Workforce",
    icon: <Users className="size-5" />,
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: <ClipboardCheck className="size-5" />,
    children: [
      {
        id: "appointments",
        label: "Appointments",
        icon: <ClipboardCheck className="size-4" />,
      },
      {
        id: "training",
        label: "Training",
        icon: <GraduationCap className="size-4" />,
      },
      {
        id: "medicals",
        label: "Medicals",
        icon: <Heart className="size-4" />,
      },
      {
        id: "ppe",
        label: "PPE",
        icon: <ShieldCheck className="size-4" />,
      },
    ],
  },
  {
    id: "risk-assessments",
    label: "Risk Assessments",
    icon: <AlertTriangle className="size-5" />,
  },
  {
    id: "document-library",
    label: "Document Library",
    icon: <FolderOpen className="size-5" />,
  },
  {
    id: "reports",
    label: "Reports",
    icon: <FileText className="size-5" />,
    children: [
      {
        id: "global-training-matrix",
        label: "Global Training Matrix",
        icon: <Grid3x3 className="size-4" />,
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: <Settings className="size-4" />,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="size-5" />,
    children: [
      {
        id: "system-settings",
        label: "System Settings",
        icon: <Settings className="size-4" />,
      },
      {
        id: "system-audit-log",
        label: "System Audit Log",
        icon: <Shield className="size-4" />,
      },
    ],
  },
];

const bottomNavigationItems: NavigationItem[] = [
  {
    id: "recycle-bin",
    label: "Recycle Bin",
    icon: <Trash2 className="size-5" />,
  },
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const { dismissedAlerts } = useAlerts();
  const { theme, colors, brandPrimaryBg, getNavTextColor } = useTheme();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState<string[]>(["compliance", "reports", "settings"]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAlertHistory, setShowAlertHistory] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const navTextColor = getNavTextColor();

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--slate-dark)" }}>
      {/* Sidebar */}
      <aside
        className="border-r flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: isSidebarOpen ? "256px" : "0px",
          backgroundColor: colors.surface,
          borderColor: "var(--grey-200)",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b" style={{ borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)", minWidth: "256px" }}>
          <h1 className="text-xl font-bold" style={{ color: "var(--brand-blue)" }}>
            SHERQ Online
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4" style={{ minWidth: "256px" }}>
          <ul className="space-y-1 px-3">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activeItem={activeItem}
                expandedItems={expandedItems}
                onItemClick={setActiveItem}
                onToggleExpand={toggleExpanded}
              />
            ))}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t px-3 py-4" style={{ borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)", minWidth: "256px" }}>
          <ul className="space-y-1">
            {bottomNavigationItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activeItem={activeItem}
                expandedItems={expandedItems}
                onItemClick={setActiveItem}
                onToggleExpand={toggleExpanded}
              />
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="h-16 flex items-center justify-between px-6"
          style={{
            backgroundColor: brandPrimaryBg,
            borderBottom: "none",
          }}
        >
          {/* Left Side: Menu Toggle + Page Title */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
              style={{
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Menu className="size-5" style={{ color: navTextColor }} />
            </button>

            {/* Page Title */}
            <h2 className="text-lg font-semibold" style={{ color: navTextColor }}>
              {activeItem === "dashboard" ? "Dashboard" : 
               activeItem === "company-sites" ? "Company & Sites" :
               activeItem === "workforce" ? "Workforce" :
               activeItem === "training" ? "Training" :
               activeItem === "document-library" ? "Document Library" :
               activeItem === "global-training-matrix" ? "Global Training Matrix" :
               activeItem === "ppe" ? "PPE Register" :
               activeItem === "risk-assessments" ? "Risk Assessments" :
               activeItem === "medicals" ? "Medical Surveillance" :
               activeItem === "analytics" ? "Reports & Analytics" :
               activeItem === "system-audit-log" ? "System Audit Log" :
               activeItem === "system-settings" ? "System Settings" :
               activeItem.charAt(0).toUpperCase() + activeItem.slice(1).replace("-", " ")}
            </h2>
          </div>

          {/* Right Side: Search, Notifications & User Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                style={{ color: navTextColor === "#F8FAFC" ? "rgba(248, 250, 252, 0.6)" : "rgba(15, 23, 42, 0.6)" }}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 h-9 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: navTextColor === "#F8FAFC" ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.1)",
                  border: "none",
                  color: navTextColor,
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              {showSearchResults && searchQuery && (
                <div
                  className="absolute left-0 top-full mt-1 w-full rounded-lg border shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: "white",
                    borderColor: "var(--grey-200)",
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--grey-200)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                      Search Results
                    </p>
                  </div>
                  <GlobalSearch 
                    query={searchQuery} 
                    onResultClick={(result) => {
                      console.log("Clicked:", result);
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertHistory(!showAlertHistory)}
                className="relative p-2 rounded-lg transition-colors"
                aria-label="Notifications"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Bell className="size-5" style={{ color: navTextColor }} />
                {/* Alert count badge */}
                {dismissedAlerts.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 size-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: "var(--compliance-danger)",
                      color: "white",
                    }}
                  >
                    {dismissedAlerts.length}
                  </span>
                )}
              </button>

              {/* Alert History Dropdown */}
              {showAlertHistory && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 rounded-lg border shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: "white",
                    borderColor: "var(--grey-200)",
                    maxHeight: "400px",
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--grey-200)" }}>
                    <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                      Dismissed Alerts
                    </p>
                    <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                      {dismissedAlerts.length} alert{dismissedAlerts.length !== 1 ? "s" : ""} dismissed
                    </p>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
                    {dismissedAlerts.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm" style={{ color: "var(--grey-500)" }}>
                          No dismissed alerts
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {dismissedAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="px-4 py-3 border-b"
                            style={{ borderColor: "var(--grey-100)" }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="size-2 rounded-full mt-1.5 flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    alert.type === "critical"
                                      ? "var(--compliance-danger)"
                                      : alert.type === "warning"
                                      ? "var(--compliance-warning)"
                                      : "#3B82F6",
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium mb-1" style={{ color: "var(--grey-900)" }}>
                                  {alert.title}
                                </p>
                                <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                                  Dismissed{" "}
                                  {new Date(alert.dismissedAt).toLocaleString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  className="size-8 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  AU
                </div>
                <span className="text-sm" style={{ color: navTextColor }}>Admin User</span>
                <ChevronDown className="size-4" style={{ color: navTextColor }} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: "white",
                    borderColor: "var(--grey-200)",
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--grey-200)" }}>
                    <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                      Admin User
                    </p>
                    <p className="text-sm" style={{ color: "var(--grey-500)" }}>
                      admin@sherq.com
                    </p>
                  </div>
                  <div className="py-2">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Profile Settings
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Account Preferences
                    </button>
                    <div className="border-t my-2" style={{ borderColor: "var(--grey-200)" }} />
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors"
                      style={{ color: "var(--compliance-danger)" }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
  {activeItem === "dashboard" ? (
    <Dashboard />
  ) : activeItem === "company-sites" ? (
    <CompanySites />
  ) : activeItem === "workforce" ? (
    <Workforce />
  ) : activeItem === "appointments" ? (
    <Appointments />
  ) : activeItem === "training" ? (
    <TrainingMatrix />
  ) : activeItem === "document-library" ? (
    <DocumentLibrary />
  ) : activeItem === "global-training-matrix" ? (
    <GlobalTrainingMatrix />
  ) : activeItem === "ppe" ? (
    <PPERegister />
  ) : activeItem === "risk-assessments" ? (
    <RiskAssessmentRegisterEnhanced />
  ) : activeItem === "risk-assessment-new" ? (
    <NewRiskAssessment />
  ) : activeItem === "medicals" ? (
    <MedicalSurveillanceEnhanced />
  ) : activeItem === "analytics" ? (
    <ReportsAnalytics />
  ) : activeItem === "system-audit-log" ? (
    <SystemAuditLog />
  ) : activeItem === "system-settings" ? (
    <SystemSettings />
  ) : (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl mb-2" style={{ color: "var(--grey-700)" }}>
          {activeItem.charAt(0).toUpperCase() + activeItem.slice(1).replace("-", " ")}
        </h2>
        <p style={{ color: "var(--grey-500)" }}>
          This section is under development
        </p>
      </div>
    </div>
  )}
</main>

      </div>
    </div>
  );
}

interface NavItemProps {
  item: NavigationItem;
  activeItem: string;
  expandedItems: string[];
  onItemClick: (id: string) => void;
  onToggleExpand: (id: string) => void;
  level?: number;
}

function NavItem({
  item,
  activeItem,
  expandedItems,
  onItemClick,
  onToggleExpand,
  level = 0,
}: NavItemProps) {
  const { colors } = useTheme();
  const isActive = activeItem === item.id;
  const isExpanded = expandedItems.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(item.id);
    } else {
      onItemClick(item.id);
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          level > 0 ? "pl-11" : ""
        }`}
        style={{
          backgroundColor: isActive ? "var(--brand-blue)" : "transparent",
          color: isActive ? "white" : colors.primaryText,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-100)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        {item.icon}
        <span className="flex-1 text-left text-sm">{item.label}</span>
        {hasChildren && (
          <ChevronRight
            className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            style={{ color: isActive ? "white" : colors.subText }}
          />
        )}
      </button>

      {/* Child Items */}
      {hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              activeItem={activeItem}
              expandedItems={expandedItems}
              onItemClick={onItemClick}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}