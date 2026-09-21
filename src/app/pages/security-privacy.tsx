import { useEffect, useState } from "react";
import {
  Plus,
  Key,
  MoreVertical,
  KeyRound,
  MapPinned,
  UserX,
  Trash2,
} from "lucide-react";
import { getSites } from "../../api/siteAPI";
import {
  createInspector,
  getInspectors,
  resetInspectorPassword,
  updateInspectorSites,
  updateInspectorStatus,
  deleteInspector,
} from "../../api/adminAPI";
import {
  getFirstAiders,
  resetFirstAiderPassword,
  updateFirstAiderSites,
  updateFirstAiderStatus,
  deleteFirstAider,
} from "../../api/adminAPI";
import EditInspectorSitesModal from "./EditInspectorSitesModal";
import { createPortal } from "react-dom";

type Role = "inspector" | "first_aider";

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    getAll: () => Promise<any[]>;
    resetPassword: (id: number, pw: string) => Promise<any>;
    updateSites: (id: number, siteIds: number[]) => Promise<any>;
    updateStatus: (id: number, status: "active" | "disabled") => Promise<any>;
    remove: (id: number) => Promise<any>;
  }
> = {
  inspector: {
    label: "Inspector",
    getAll: getInspectors,
    resetPassword: resetInspectorPassword,
    updateSites: updateInspectorSites,
    updateStatus: updateInspectorStatus,
    remove: deleteInspector,
  },
  first_aider: {
    label: "First Aider",
    getAll: getFirstAiders,
    resetPassword: resetFirstAiderPassword,
    updateSites: updateFirstAiderSites,
    updateStatus: updateFirstAiderStatus,
    remove: deleteFirstAider,
  },
};

export function SecurityPrivacy() {
  const [activeRole, setActiveRole] = useState<Role>("inspector");

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Security & Privacy</h1>
        <p className="text-gray-500">
          Manage inspector and first aider accounts and login credentials.
        </p>
      </div>

      <div className="flex gap-3">
        {(["inspector", "first_aider"] as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeRole === role ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            <Key size={18} />
            {ROLE_CONFIG[role].label} Credentials
          </button>
        ))}
      </div>

      <PersonnelCredentialsTable
        role={activeRole}
        config={ROLE_CONFIG[activeRole]}
      />
    </div>
  );
}
function PersonnelCredentialsTable({
  role,
  config,
}: {
  role: Role;
  config: (typeof ROLE_CONFIG)[Role];
}) {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editingPerson, setEditingPerson] = useState<any | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    loadPeople();
  }, [role]); // re-fetch whenever the active tab/role changes

  useEffect(() => {
    async function loadSites() {
      try {
        const data = await getSites();
        setSites(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadSites();
  }, []);

  async function loadPeople() {
    setLoading(true);
    try {
      const data = await config.getAll();
      setPeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function handleClick() {
      setOpenMenu(null);
    }

    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  async function handleReset(person: any) {
    const password = prompt(`Enter a new password for ${person.fullName}:`);

    if (!password) return;

    try {
      await config.resetPassword(person.id, password);

      alert("Password reset successfully.");

      loadPeople();
    } catch {
      alert("Failed to reset password.");
    }
  }

  async function handleSaveSites() {
    if (!editingPerson) return;

    try {
      await config.updateSites(editingPerson.id, selectedSites);

      alert("Sites updated successfully.");

      setEditingPerson(null);

      loadPeople();
    } catch (err) {
      console.error(err);
      alert("Failed to update sites.");
    }
  }

  async function handleToggleStatus(person: any) {
    const newStatus = person.status === "active" ? "disabled" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus} this ${config.label.toLowerCase()} account?`,
    );

    if (!confirmed) return;

    try {
      await config.updateStatus(person.id, newStatus);

      alert(`${config.label} ${newStatus} successfully.`);

      loadPeople();
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${config.label.toLowerCase()} status.`);
    }
  }

  async function handleDelete(person: any) {
    const confirmed = window.confirm(
      `Delete ${person.fullName} ${person.surname}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await config.remove(person.id);

      alert(`${config.label} deleted successfully.`);

      loadPeople();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete ${config.label.toLowerCase()}.`);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading {config.label.toLowerCase()}s...
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">{config.label} Credentials</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Username</th>
                <th className="text-left py-3">Employee No.</th>
                <th className="text-left py-3">Assigned Sites</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {people.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">
                    No {config.label.toLowerCase()}s found.
                  </td>
                </tr>
              ) : (
                people.map((person) => (
                  <tr key={person.id} className="border-b">
                    <td className="py-3">
                      {person.fullName} {person.surname}
                    </td>

                    <td>{person.username}</td>

                    <td>{person.employeeNumber}</td>

                    <td>{person.sites.join(", ")}</td>

                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          person.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>

                    <td className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          if (openMenu === person.id) {
                            setOpenMenu(null);
                            return;
                          }

                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuHeight = 200; // approx height of the 4-item dropdown
                          const spaceBelow = window.innerHeight - rect.bottom;

                          const top =
                            spaceBelow >= menuHeight
                              ? rect.bottom + window.scrollY + 4 // enough room — open downward
                              : rect.top + window.scrollY - menuHeight - 4; // not enough — open upward instead

                          setMenuPosition({
                            top,
                            left: rect.right + window.scrollX - 224,
                          });
                          setOpenMenu(person.id);
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === person.id &&
                        menuPosition &&
                        createPortal(
                          <div
                            className="fixed w-56 bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                            style={{
                              top: menuPosition.top,
                              left: menuPosition.left,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                handleReset(person);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-600"
                            >
                              <KeyRound size={18} />
                              Reset Password
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                setEditingPerson(person);
                                const selected = sites
                                  .filter((site) =>
                                    person.sites.includes(site.name),
                                  )
                                  .map((site) => site.id);
                                setSelectedSites(selected);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-600"
                            >
                              <MapPinned size={18} />
                              Edit Sites
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                handleToggleStatus(person);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                                person.status === "active"
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              <UserX size={18} />
                              {person.status === "active"
                                ? "Disable Account"
                                : "Enable Account"}
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                handleDelete(person);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 size={18} />
                              Delete {config.label}
                            </button>
                          </div>,
                          document.body,
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditInspectorSitesModal
        open={editingPerson !== null}
        inspector={editingPerson}
        sites={sites}
        selectedSites={selectedSites}
        onChangeSelectedSites={setSelectedSites}
        onClose={() => setEditingPerson(null)}
        onSave={handleSaveSites}
      />
    </>
  );
}
