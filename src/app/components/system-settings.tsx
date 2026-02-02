import { useState, useEffect } from "react";
import { Settings, Users, Palette, Shield, FileText, Lock, CheckCircle, AlertTriangle, XCircle, LayoutDashboard, Save, Search, UserPlus, Edit2, Mail, MapPin, User as UserIcon, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { UserManagementTab } from "@/app/components/user-management-tab";
import { SystemAuditLogTab } from "@/app/components/system-audit-log-tab";
import { useTheme } from "@/app/contexts/theme-context";

type SettingsTab = "general" | "user-management" | "branding" | "security" | "audit-logs";

interface BrandConfig {
  primaryColor: string;
  accentColor: string;
}

interface GeneralSettings {
  legalTradingName: string;
  registrationNumber: string;
  vatNumber: string;
  timezone: string;
  language: string;
  currency: string;
  emailAlertsExpiries: boolean;
  weeklyComplianceSummary: boolean;
  systemAuditAlerts: boolean;
  defaultExpiryWarningDays: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "RSS Admin" | "Client Admin" | "Manager" | "Auditor";
  assignedSite: string;
  lastActive: string;
  status: "Active" | "Pending Invitation";
  avatar?: string;
}

interface InviteFormData {
  email: string;
  role: string;
  sites: string[];
}

const companies = [
  "ABC Mining Corp",
  "XYZ Manufacturing Ltd",
  "Global Construction Inc",
  "SafeWork Industries",
  "RSS Admin (Default)",
];

const timezones = [
  "SAST - UTC+2 (South African Standard Time)",
  "UTC+0 (Coordinated Universal Time)",
  "GMT (Greenwich Mean Time)",
  "EST - UTC-5 (Eastern Standard Time)",
  "PST - UTC-8 (Pacific Standard Time)",
  "AEST - UTC+10 (Australian Eastern Standard Time)",
];

const languages = [
  "English (UK)",
  "English (US)",
  "Afrikaans",
  "Zulu",
  "Xhosa",
];

const currencies = [
  "ZAR - South African Rand (R)",
  "USD - US Dollar ($)",
  "EUR - Euro (€)",
  "GBP - British Pound (£)",
];

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    // Initialize from localStorage if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedPrimaryColor = localStorage.getItem('Brand_Primary_Color');
        const savedAccentColor = localStorage.getItem('Brand_Accent_Color');
        return {
          primaryColor: savedPrimaryColor || "#0B3D91",
          accentColor: savedAccentColor || "#1E5BBF",
        };
      }
    } catch (error) {
      console.warn('Failed to read brand config from localStorage:', error);
    }
    return {
      primaryColor: "#0B3D91",
      accentColor: "#1E5BBF",
    };
  });

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    legalTradingName: "ABC Mining Corporation (Pty) Ltd",
    registrationNumber: "2015/123456/07",
    vatNumber: "4123456789",
    timezone: "SAST - UTC+2 (South African Standard Time)",
    language: "English (UK)",
    currency: "ZAR - South African Rand (R)",
    emailAlertsExpiries: true,
    weeklyComplianceSummary: true,
    systemAuditAlerts: false,
    defaultExpiryWarningDays: 30,
  });

  const [initialGeneralSettings] = useState<GeneralSettings>({ ...generalSettings });
  const [hasGeneralChanges, setHasGeneralChanges] = useState(false);

  const { theme, setTheme, colors, brandPrimaryBg, setBrandPrimaryBg } = useTheme();

  const handleGeneralSettingChange = <K extends keyof GeneralSettings>(
    field: K,
    value: GeneralSettings[K]
  ) => {
    const newSettings = { ...generalSettings, [field]: value };
    setGeneralSettings(newSettings);
    setHasGeneralChanges(JSON.stringify(newSettings) !== JSON.stringify(initialGeneralSettings));
  };

  const handleColorChange = (field: "primaryColor" | "accentColor", value: string) => {
    setBrandConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBrandColors = () => {
    // Update CSS custom properties to apply theme changes globally
    const root = document.documentElement;
    root.style.setProperty('--brand-blue', brandConfig.primaryColor);
    root.style.setProperty('--brand-blue-hover', brandConfig.accentColor);
    root.style.setProperty('--brand-primary-bg', brandPrimaryBg);
    
    // Persist brand colors to localStorage
    localStorage.setItem('Brand_Primary_Color', brandConfig.primaryColor);
    localStorage.setItem('Brand_Accent_Color', brandConfig.accentColor);
    // brandPrimaryBg is already persisted by the context's setBrandPrimaryBg function
    
    // Show success notification
    toast.success("System colors updated successfully!", {
      description: `Branding for ${selectedCompany} has been applied.`,
      duration: 3000,
    });
  };

  const sidebarCategories = [
    { id: "general" as SettingsTab, label: "General", icon: <Settings className="size-5" /> },
    { id: "user-management" as SettingsTab, label: "User Management", icon: <Users className="size-5" /> },
    { id: "branding" as SettingsTab, label: "Branding & Appearance", icon: <Palette className="size-5" /> },
    { id: "security" as SettingsTab, label: "Security", icon: <Shield className="size-5" /> },
    { id: "audit-logs" as SettingsTab, label: "Audit Logs", icon: <FileText className="size-5" /> },
  ];

  return (
    <div className="h-full flex" style={{ backgroundColor: colors.background }}>
      {/* Vertical Sidebar for Settings Categories */}
      <aside
        className="w-72 border-r flex flex-col"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)",
        }}
      >
        <div
          className="px-6 py-5 border-b"
          style={{
            borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)",
            backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
          }}
        >
          <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
            System Settings
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.subText }}>
            Configure platform preferences
          </p>
        </div>

        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {sidebarCategories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => setActiveTab(category.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
                  style={{
                    backgroundColor: activeTab === category.id ? "var(--brand-blue)" : "transparent",
                    color: activeTab === category.id ? "white" : colors.primaryText,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== category.id) {
                      e.currentTarget.style.backgroundColor = colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-100)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== category.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {category.icon}
                  <span className="font-medium">{category.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="px-6 py-4 border-t"
          style={{
            borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)",
            backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.subText }}>
            <Shield className="size-4" style={{ color: "var(--brand-blue)" }} />
            <span>Version 2.4.1 • Last updated: Jan 2026</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === "general" ? (
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl mb-2" style={{ color: colors.primaryText }}>
                General Settings
              </h1>
              <p className="text-sm" style={{ color: colors.subText }}>
                Configure general platform settings for {selectedCompany}.
              </p>
            </div>

            {/* Company Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
                Select Company to Edit
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-lg"
                style={{
                  border: "none",
                  color: colors.primaryText,
                  backgroundColor: colors.surface,
                }}
              >
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Information Section */}
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <div
                className="px-6 py-4"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                  Company Information
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.subText }}>
                  Legal entity details for {selectedCompany}
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {/* Legal Trading Name */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      Legal Trading Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.legalTradingName}
                      onChange={(e) => handleGeneralSettingChange("legalTradingName", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                      placeholder="ABC Mining Corporation (Pty) Ltd"
                    />
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={generalSettings.registrationNumber}
                      onChange={(e) => handleGeneralSettingChange("registrationNumber", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                      placeholder="2015/123456/07"
                    />
                  </div>

                  {/* VAT Number */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      VAT Number
                    </label>
                    <input
                      type="text"
                      value={generalSettings.vatNumber}
                      onChange={(e) => handleGeneralSettingChange("vatNumber", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                      placeholder="4123456789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Settings Section */}
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <div
                className="px-6 py-4"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                  Regional Settings
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.subText }}>
                  Configure timezone, language, and currency preferences
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {/* Default Timezone */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      Default Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => handleGeneralSettingChange("timezone", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                    >
                      {timezones.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Language */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      Primary Language
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => handleGeneralSettingChange("language", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                    >
                      {languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      Currency
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => handleGeneralSettingChange("currency", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences Section */}
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <div
                className="px-6 py-4"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                  Notification Preferences
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.subText }}>
                  Manage email alerts and system notifications
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {/* Email Alerts for Expiries */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium" style={{ color: colors.primaryText }}>
                        Email Alerts for Expiries
                      </p>
                      <p className="text-sm mt-1" style={{ color: colors.subText }}>
                        Receive email notifications when certifications are about to expire
                      </p>
                    </div>
                    <button
                      onClick={() => handleGeneralSettingChange("emailAlertsExpiries", !generalSettings.emailAlertsExpiries)}
                      className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                      style={{
                        backgroundColor: generalSettings.emailAlertsExpiries ? "var(--brand-blue)" : "var(--grey-300)",
                      }}
                      aria-label="Toggle email alerts for expiries"
                    >
                      <span
                        className="inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        style={{
                          transform: generalSettings.emailAlertsExpiries ? "translateX(20px)" : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Weekly Compliance Summary */}
                  <div className="flex items-center justify-between py-3" style={{ borderTop: colors.background === "#0F172A" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--grey-200)" }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.primaryText }}>
                        Weekly Compliance Summary
                      </p>
                      <p className="text-sm mt-1" style={{ color: colors.subText }}>
                        Get a weekly email summary of compliance status across all sites
                      </p>
                    </div>
                    <button
                      onClick={() => handleGeneralSettingChange("weeklyComplianceSummary", !generalSettings.weeklyComplianceSummary)}
                      className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                      style={{
                        backgroundColor: generalSettings.weeklyComplianceSummary ? "var(--brand-blue)" : "var(--grey-300)",
                      }}
                      aria-label="Toggle weekly compliance summary"
                    >
                      <span
                        className="inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        style={{
                          transform: generalSettings.weeklyComplianceSummary ? "translateX(20px)" : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>

                  {/* System Audit Alerts */}
                  <div className="flex items-center justify-between py-3" style={{ borderTop: colors.background === "#0F172A" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--grey-200)" }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.primaryText }}>
                        System Audit Alerts
                      </p>
                      <p className="text-sm mt-1" style={{ color: colors.subText }}>
                        Receive alerts for critical system audit events and changes
                      </p>
                    </div>
                    <button
                      onClick={() => handleGeneralSettingChange("systemAuditAlerts", !generalSettings.systemAuditAlerts)}
                      className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                      style={{
                        backgroundColor: generalSettings.systemAuditAlerts ? "var(--brand-blue)" : "var(--grey-300)",
                      }}
                      aria-label="Toggle system audit alerts"
                    >
                      <span
                        className="inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        style={{
                          transform: generalSettings.systemAuditAlerts ? "translateX(20px)" : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Preferences Section */}
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <div
                className="px-6 py-4"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                  Display Preferences
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.subText }}>
                  Customize the visual appearance of your interface
                </p>
              </div>

              <div className="p-8">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                    System Theme
                  </label>
                  
                  {/* Segmented Control */}
                  <div
                    className="inline-flex p-1 rounded-lg"
                    style={{
                      backgroundColor: "#1E293B",
                    }}
                  >
                    {/* Light Mode Option */}
                    <button
                      className="px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
                      style={{
                        backgroundColor: theme === "light" ? "#3B82F6" : "transparent",
                        color: theme === "light" ? "#FFFFFF" : "#94A3B8",
                      }}
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="size-4" />
                      <span className="font-medium">Light Mode</span>
                    </button>

                    {/* Dark Mode Option */}
                    <button
                      className="px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
                      style={{
                        backgroundColor: theme === "dark" ? "#3B82F6" : "transparent",
                        color: theme === "dark" ? "#FFFFFF" : "#94A3B8",
                      }}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="size-4" />
                      <span className="font-medium">Dark Mode</span>
                    </button>
                  </div>

                  <p className="text-sm mt-3" style={{ color: colors.subText }}>
                    Choose your preferred interface theme. Dark mode reduces eye strain in low-light environments.
                  </p>
                </div>
              </div>
            </div>

            {/* System Defaults Section */}
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <div
                className="px-6 py-4"
                style={{
                  backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)",
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
                  System Defaults
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.subText }}>
                  Configure default system behavior and thresholds
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {/* Default Expiry Warning Days */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                      Default Expiry Warning Period (Days)
                    </label>
                    <input
                      type="number"
                      value={generalSettings.defaultExpiryWarningDays}
                      onChange={(e) => handleGeneralSettingChange("defaultExpiryWarningDays", parseInt(e.target.value) || 0)}
                      className="w-full max-w-xs px-4 py-3 rounded-lg"
                      style={{
                        border: "none",
                        color: colors.primaryText,
                        backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                      }}
                      placeholder="30"
                      min="1"
                      max="365"
                    />
                    <p className="text-sm mt-2" style={{ color: colors.subText }}>
                      Number of days before expiry to trigger warning status (amber/orange indicator)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end">
              <button
                className="px-6 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2"
                style={{
                  backgroundColor: hasGeneralChanges ? "var(--brand-blue)" : "var(--grey-300)",
                  cursor: hasGeneralChanges ? "pointer" : "not-allowed",
                  opacity: hasGeneralChanges ? 1 : 0.6,
                }}
                disabled={!hasGeneralChanges}
                onClick={() => {
                  toast.success("Settings saved successfully!");
                }}
              >
                <Save className="size-5" />
                Save Changes
              </button>
            </div>
          </div>
        ) : activeTab === "branding" ? (
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl mb-2" style={{ color: "var(--grey-900)" }}>
                Client Branding Configuration
              </h1>
              <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                Customize the look of the system for specific clients while maintaining RSS core identity.
              </p>
            </div>

            {/* Company Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--grey-700)" }}>
                Select Company to Edit
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-lg border"
                style={{
                  borderColor: "var(--grey-300)",
                  color: "var(--grey-900)",
                  backgroundColor: "white",
                }}
              >
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Configuration Section */}
            <div
              className="rounded-lg border overflow-hidden mb-8"
              style={{
                backgroundColor: "white",
                borderColor: "var(--grey-200)",
              }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{
                  backgroundColor: "var(--grey-50)",
                  borderColor: "var(--grey-200)",
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: "var(--grey-900)" }}>
                  Brand Colors
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--grey-600)" }}>
                  Configure custom colors for {selectedCompany}
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side - Color Pickers */}
                  <div className="space-y-6">
                    {/* Primary Brand Color */}
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: "var(--grey-700)" }}>
                        Primary Brand Color
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            value={brandConfig.primaryColor}
                            onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            style={{ width: "80px", height: "80px" }}
                          />
                          <div
                            className="size-20 rounded-lg border-2 cursor-pointer shadow-sm"
                            style={{
                              backgroundColor: brandConfig.primaryColor,
                              borderColor: "var(--grey-300)",
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-2" style={{ color: "var(--grey-600)" }}>
                            HEX Code
                          </label>
                          <input
                            type="text"
                            value={brandConfig.primaryColor}
                            onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border font-mono text-sm uppercase"
                            style={{
                              borderColor: "var(--grey-300)",
                              color: "var(--grey-900)",
                              backgroundColor: "var(--grey-50)",
                            }}
                            placeholder="#0B3D91"
                            maxLength={7}
                          />
                          <p className="text-xs mt-2" style={{ color: "var(--grey-500)" }}>
                            Used for navigation, primary buttons, and links
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Accent/Hover Color */}
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                        Accent/Hover Color
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            value={brandConfig.accentColor}
                            onChange={(e) => handleColorChange("accentColor", e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            style={{ width: "80px", height: "80px" }}
                          />
                          <div
                            className="size-20 rounded-lg border-2 cursor-pointer shadow-sm"
                            style={{
                              backgroundColor: brandConfig.accentColor,
                              borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.2)" : "var(--grey-300)",
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.subText }}>
                            HEX Code
                          </label>
                          <input
                            type="text"
                            value={brandConfig.accentColor}
                            onChange={(e) => handleColorChange("accentColor", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg font-mono text-sm uppercase"
                            style={{
                              border: "none",
                              color: colors.primaryText,
                              backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                            }}
                            placeholder="#1E5BBF"
                            maxLength={7}
                          />
                          <p className="text-xs mt-2" style={{ color: colors.subText }}>
                            Used for hover states and secondary elements
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Brand Primary Background - Top Navigation Bar */}
                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                        Brand Primary Background (Top Nav Bar)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            value={brandPrimaryBg}
                            onChange={(e) => setBrandPrimaryBg(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            style={{ width: "80px", height: "80px" }}
                          />
                          <div
                            className="size-20 rounded-lg border-2 cursor-pointer shadow-sm"
                            style={{
                              backgroundColor: brandPrimaryBg,
                              borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.2)" : "var(--grey-300)",
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.subText }}>
                            HEX Code
                          </label>
                          <input
                            type="text"
                            value={brandPrimaryBg}
                            onChange={(e) => setBrandPrimaryBg(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg font-mono text-sm uppercase"
                            style={{
                              border: "none",
                              color: colors.primaryText,
                              backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                            }}
                            placeholder="#2C3E50"
                            maxLength={7}
                          />
                          <p className="text-xs mt-2" style={{ color: colors.subText }}>
                            Top navigation bar background. Text/icons auto-adjust for contrast.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <button
                        className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-2"
                        style={{ backgroundColor: "var(--brand-blue)" }}
                        onClick={handleSaveBrandColors}
                      >
                        <CheckCircle className="size-5" />
                        Save Brand Configuration
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Live Preview */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "var(--grey-700)" }}>
                      Live Preview
                    </label>
                    <div
                      className="rounded-lg border p-6"
                      style={{
                        backgroundColor: "var(--grey-50)",
                        borderColor: "var(--grey-200)",
                      }}
                    >
                      <p className="text-xs mb-4" style={{ color: "var(--grey-600)" }}>
                        Preview how your branding will appear:
                      </p>

                      {/* Mini Sidebar Preview */}
                      <div
                        className="rounded-lg border overflow-hidden mb-4"
                        style={{
                          backgroundColor: "white",
                          borderColor: "var(--grey-300)",
                        }}
                      >
                        {/* Preview Header */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--grey-200)" }}>
                          <div className="text-sm font-bold" style={{ color: brandConfig.primaryColor }}>
                            SHERQ Online
                          </div>
                        </div>

                        {/* Preview Navigation Items */}
                        <div className="p-2 space-y-1">
                          <div
                            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: brandConfig.primaryColor }}
                          >
                            <LayoutDashboard className="size-4" />
                            Dashboard (Active)
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 rounded text-xs"
                            style={{ color: "var(--grey-700)" }}
                          >
                            <Users className="size-4" />
                            Workforce
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 rounded text-xs hover:bg-secondary transition-colors"
                            style={{ 
                              color: "var(--grey-700)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = brandConfig.accentColor + "15";
                              e.currentTarget.style.color = brandConfig.accentColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "var(--grey-700)";
                            }}
                          >
                            <FileText className="size-4" />
                            Reports (Hover)
                          </div>
                        </div>
                      </div>

                      {/* Preview Button */}
                      <div className="space-y-3">
                        <button
                          className="w-full px-4 py-2.5 rounded-lg font-medium text-white text-sm transition-opacity hover:opacity-90"
                          style={{ backgroundColor: brandConfig.primaryColor }}
                        >
                          Primary Button Example
                        </button>
                        <button
                          className="w-full px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors"
                          style={{
                            borderColor: brandConfig.primaryColor,
                            color: brandConfig.primaryColor,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = brandConfig.primaryColor + "10";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          Secondary Button (Hover)
                        </button>
                      </div>

                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "var(--grey-100)" }}>
                        <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                          <strong>Note:</strong> Changes apply immediately to {selectedCompany}'s view only.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RSS Protection Note */}
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: "var(--grey-100)",
                borderColor: "var(--grey-300)",
              }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-2"
                style={{
                  backgroundColor: "var(--grey-200)",
                  borderColor: "var(--grey-300)",
                }}
              >
                <Lock className="size-5" style={{ color: "var(--grey-600)" }} />
                <h3 className="text-lg font-semibold" style={{ color: "var(--grey-800)" }}>
                  Fixed RSS Branding
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RSS Logo Section */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "var(--grey-700)" }}>
                      RSS Corporate Logo
                    </label>
                    <div
                      className="rounded-lg border p-6 flex items-center justify-center"
                      style={{
                        backgroundColor: "white",
                        borderColor: "var(--grey-300)",
                      }}
                    >
                      <div className="text-center">
                        <div
                          className="inline-flex items-center justify-center px-8 py-4 rounded-lg mb-2"
                          style={{
                            backgroundColor: "var(--brand-blue)",
                          }}
                        >
                          <span className="text-2xl font-bold text-white">RSS</span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                          Cannot be modified
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Compliance Indicators */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "var(--grey-700)" }}>
                      Statutory Compliance Indicators
                    </label>
                    <div
                      className="rounded-lg border p-6"
                      style={{
                        backgroundColor: "white",
                        borderColor: "var(--grey-300)",
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "var(--compliance-danger)" }}
                            >
                              <XCircle className="size-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                                Non-Compliant / Expired
                              </p>
                              <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                                Bright Red (#DC2626)
                              </p>
                            </div>
                          </div>
                          <Lock className="size-4" style={{ color: "var(--grey-400)" }} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "var(--compliance-warning)" }}
                            >
                              <AlertTriangle className="size-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                                Expiring Soon / Warning
                              </p>
                              <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                                Amber/Orange (#F59E0B)
                              </p>
                            </div>
                          </div>
                          <Lock className="size-4" style={{ color: "var(--grey-400)" }} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: "var(--compliance-success)" }}
                            >
                              <CheckCircle className="size-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--grey-900)" }}>
                                Compliant / Valid
                              </p>
                              <p className="text-xs" style={{ color: "var(--grey-600)" }}>
                                Emerald Green (#10B981)
                              </p>
                            </div>
                          </div>
                          <Lock className="size-4" style={{ color: "var(--grey-400)" }} />
                        </div>
                      </div>

                      <div
                        className="mt-4 p-3 rounded-lg flex items-start gap-2"
                        style={{ backgroundColor: "var(--grey-50)" }}
                      >
                        <Shield className="size-4 mt-0.5" style={{ color: "var(--brand-blue)" }} />
                        <p className="text-xs" style={{ color: "var(--grey-700)" }}>
                          <strong>Legal Requirement:</strong> Statutory compliance color indicators cannot be changed to ensure
                          consistent legal interpretation across all client instances.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "user-management" ? (
          <UserManagementTab />
        ) : activeTab === "audit-logs" ? (
          <SystemAuditLogTab />
        ) : (
          // Placeholder for other tabs
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center size-16 rounded-full mb-4"
                style={{ backgroundColor: "var(--grey-100)" }}
              >
                {sidebarCategories.find((c) => c.id === activeTab)?.icon}
              </div>
              <h2 className="text-2xl mb-2" style={{ color: "var(--grey-700)" }}>
                {sidebarCategories.find((c) => c.id === activeTab)?.label}
              </h2>
              <p style={{ color: "var(--grey-500)" }}>
                This section is under development
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}