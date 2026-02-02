import { useState } from "react";
import { Search, UserPlus, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/app/contexts/theme-context";

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

const mockUsers: UserData[] = [
  {
    id: "1",
    name: "Sarah Naidoo",
    email: "sarah.naidoo@rss.co.za",
    role: "RSS Admin",
    assignedSite: "All Sites",
    lastActive: "2 mins ago",
    status: "Active",
  },
  {
    id: "2",
    name: "Michael van der Merwe",
    email: "michael.vdm@abcmining.co.za",
    role: "Client Admin",
    assignedSite: "All Sites",
    lastActive: "1 hour ago",
    status: "Active",
  },
  {
    id: "3",
    name: "Thabo Molefe",
    email: "thabo.molefe@abcmining.co.za",
    role: "Manager",
    assignedSite: "Johannesburg North",
    lastActive: "3 hours ago",
    status: "Active",
  },
  {
    id: "4",
    name: "Jessica Williams",
    email: "jessica.williams@abcmining.co.za",
    role: "Auditor",
    assignedSite: "Johannesburg North",
    lastActive: "Yesterday",
    status: "Active",
  },
  {
    id: "5",
    name: "David Malan",
    email: "david.malan@abcmining.co.za",
    role: "Manager",
    assignedSite: "Pretoria East",
    lastActive: "2 days ago",
    status: "Active",
  },
  {
    id: "6",
    name: "Nomsa Khumalo",
    email: "nomsa.k@abcmining.co.za",
    role: "Auditor",
    assignedSite: "Durban Central",
    lastActive: "Never",
    status: "Pending Invitation",
  },
];

const availableSites = [
  "All Sites",
  "Johannesburg North",
  "Johannesburg South",
  "Pretoria East",
  "Pretoria West",
  "Durban Central",
  "Cape Town Waterfront",
];

const roles = [
  { value: "RSS Admin", label: "RSS Admin", color: "#9333EA" },
  { value: "Client Admin", label: "Client Admin", color: "#0B3D91" },
  { value: "Manager", label: "Manager", color: "#10B981" },
  { value: "Auditor", label: "Auditor", color: "#6B7280" },
];

function getRoleBadgeColor(role: string) {
  const roleConfig = roles.find((r) => r.value === role);
  return roleConfig?.color || "#6B7280";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserManagementTab() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: "",
    role: "Auditor",
    sites: [],
  });

  const { colors } = useTheme();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "Active" ? "Pending Invitation" : "Active" }
          : user
      )
    );
    toast.success("User status updated");
  };

  const handleSendInvite = () => {
    if (!inviteForm.email || inviteForm.sites.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Add new user to the list
    const newUser: UserData = {
      id: String(users.length + 1),
      name: inviteForm.email.split("@")[0].replace(/\./g, " "),
      email: inviteForm.email,
      role: inviteForm.role as UserData["role"],
      assignedSite: inviteForm.sites.length === availableSites.length ? "All Sites" : inviteForm.sites[0],
      lastActive: "Never",
      status: "Pending Invitation",
    };

    setUsers((prev) => [...prev, newUser]);
    toast.success("Invitation sent successfully!", {
      description: `An invite has been sent to ${inviteForm.email}`,
    });

    // Reset form and close modal
    setInviteForm({ email: "", role: "Auditor", sites: [] });
    setShowInviteModal(false);
  };

  const handleToggleSite = (site: string) => {
    setInviteForm((prev) => ({
      ...prev,
      sites: prev.sites.includes(site)
        ? prev.sites.filter((s) => s !== site)
        : [...prev.sites, site],
    }));
  };

  const handleSelectAllSites = () => {
    setInviteForm((prev) => ({
      ...prev,
      sites: prev.sites.length === availableSites.length ? [] : [...availableSites],
    }));
  };

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2" style={{ color: colors.primaryText }}>
            User Management
          </h1>
          <p className="text-sm" style={{ color: colors.subText }}>
            Manage user access, roles, and permissions across your organization.
          </p>
        </div>

        {/* Top Bar - Search and Invite */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 size-5"
              style={{ color: colors.subText }}
            />
            <input
              type="text"
              placeholder="Find user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg"
              style={{
                border: "none",
                color: colors.primaryText,
                backgroundColor: colors.surface,
              }}
            />
          </div>

          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            <UserPlus className="size-5" />
            Invite New User
          </button>
        </div>

        {/* User Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: colors.surface,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)", borderBottom: colors.background === "#0F172A" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--grey-200)" }}>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: colors.primaryText }}>
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: colors.primaryText }}>
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: colors.primaryText }}>
                    Assigned Site
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: colors.primaryText }}>
                    Last Active
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: colors.primaryText }}>
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: colors.primaryText }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: colors.background === "#0F172A" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid var(--grey-200)",
                    }}
                    className="hover:bg-grey-50 transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* User Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-full flex items-center justify-center font-semibold text-white text-sm"
                          style={{ backgroundColor: "var(--brand-blue)" }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: colors.primaryText }}>
                            {user.name}
                          </p>
                          <p className="text-sm" style={{ color: colors.subText }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Assigned Site Column */}
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: colors.primaryText }}>
                        {user.assignedSite}
                      </p>
                    </td>

                    {/* Last Active Column */}
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: colors.subText }}>
                        {user.lastActive}
                      </p>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor:
                            user.status === "Active" ? "var(--compliance-success)15" : "var(--grey-200)",
                          color:
                            user.status === "Active" ? "var(--compliance-success)" : "var(--grey-600)",
                        }}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Edit Button */}
                        <button
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: colors.subText }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-100)";
                            e.currentTarget.style.color = "var(--brand-blue)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = colors.subText;
                          }}
                          onClick={() => toast.info("Edit user functionality")}
                        >
                          <Edit2 className="size-4" />
                        </button>

                        {/* Deactivate Toggle */}
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                          style={{
                            backgroundColor: user.status === "Active" ? "var(--brand-blue)" : "var(--grey-300)",
                          }}
                        >
                          <span
                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            style={{
                              transform: user.status === "Active" ? "translateX(20px)" : "translateX(0)",
                            }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: colors.subText }}>
                No users found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* User Count */}
        <div className="mt-4 text-sm" style={{ color: colors.subText }}>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="rounded-lg shadow-xl max-w-lg w-full"
            style={{ backgroundColor: colors.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)" }}
            >
              <div>
                <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                  Invite New User
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.subText }}>
                  Send an invitation to join SHERQ Online
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.subText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-100)";
                  e.currentTarget.style.color = colors.primaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.subText;
                }}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
                  Email Address <span style={{ color: "var(--compliance-danger)" }}>*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    border: "none",
                    color: colors.primaryText,
                    backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                  }}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
                  Role <span style={{ color: "var(--compliance-danger)" }}>*</span>
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    border: "none",
                    color: colors.primaryText,
                    backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-50)",
                  }}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-2" style={{ color: colors.subText }}>
                  This determines what the user can access and modify
                </p>
              </div>

              {/* Site Access Multi-select */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
                  Site Access <span style={{ color: "var(--compliance-danger)" }}>*</span>
                </label>
                <div
                  className="rounded-lg p-4 max-h-64 overflow-y-auto"
                  style={{
                    border: colors.background === "#0F172A" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--grey-300)",
                    backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.03)" : "var(--grey-50)",
                  }}
                >
                  {/* Select All */}
                  <label className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inviteForm.sites.length === availableSites.length}
                      onChange={handleSelectAllSites}
                      className="size-4 rounded"
                      style={{ accentColor: "var(--brand-blue)" }}
                    />
                    <span className="font-medium text-sm" style={{ color: colors.primaryText }}>
                      All Sites
                    </span>
                  </label>

                  <div className="h-px my-2" style={{ backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)" }} />

                  {/* Individual Sites */}
                  {availableSites.slice(1).map((site) => (
                    <label key={site} className="flex items-center gap-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteForm.sites.includes(site)}
                        onChange={() => handleToggleSite(site)}
                        className="size-4 rounded"
                        style={{ accentColor: "var(--brand-blue)" }}
                      />
                      <span className="text-sm" style={{ color: colors.primaryText }}>
                        {site}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: colors.subText }}>
                  {inviteForm.sites.length} site{inviteForm.sites.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="px-6 py-4 border-t flex items-center justify-end gap-3"
              style={{ 
                borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "var(--grey-200)", 
                backgroundColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.02)" : "var(--grey-50)" 
              }}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  color: colors.primaryText,
                  backgroundColor: "transparent",
                  border: colors.background === "#0F172A" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid var(--grey-300)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.05)" : "var(--grey-100)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                className="px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--brand-blue)" }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}