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
import { getSites } from "@/api/siteAPI";
import {
  createInspector,
  getInspectors,
  resetInspectorPassword,
  updateInspectorSites,
  updateInspectorStatus,
  deleteInspector,
} from "../../api/adminAPI";
import EditInspectorSitesModal from "./EditInspectorSitesModal";

export function SecurityPrivacy() {
  const [activeTab, setActiveTab] = useState<"create" | "credentials">(
    "create",
  );

  return (
    <div className="p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Security & Privacy</h1>
        <p className="text-gray-500">
          Manage inspector accounts and login credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === "credentials"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
        >
          <Key size={18} />
          Inspector Credentials
        </button>
      </div>

      <InspectorCredentialsTable />
    </div>
  );
}

function InspectorCredentialsTable() {
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editingInspector, setEditingInspector] = useState<any | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);

  async function handleReset(inspector: any) {
    const password = prompt(`Enter a new password for ${inspector.fullName}:`);

    if (!password) return;

    try {
      await resetInspectorPassword(inspector.id, password);

      alert("Password reset successfully.");

      loadInspectors();
    } catch {
      alert("Failed to reset password.");
    }
  }

  useEffect(() => {
    loadInspectors();
  }, []);

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

  async function loadInspectors() {
    try {
      const data = await getInspectors();
      setInspectors(data);
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading inspectors...
      </div>
    );
  }

  async function handleSaveSites() {
    if (!editingInspector) return;

    try {
      await updateInspectorSites(editingInspector.id, selectedSites);

      alert("Sites updated successfully.");

      setEditingInspector(null);

      loadInspectors();
    } catch (err) {
      console.error(err);
      alert("Failed to update sites.");
    }
  }

  async function handleToggleStatus(inspector: any) {
    const newStatus = inspector.status === "active" ? "disabled" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus} this inspector account?`,
    );

    if (!confirmed) return;

    try {
      await updateInspectorStatus(inspector.id, newStatus);

      alert(`Inspector ${newStatus} successfully.`);

      loadInspectors();
    } catch (err) {
      console.error(err);
      alert("Failed to update inspector status.");
    }
  }

  async function handleDelete(inspector: any) {
    const confirmed = window.confirm(
      `Delete ${inspector.fullName} ${inspector.surname}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteInspector(inspector.id);

      alert("Inspector deleted successfully.");

      loadInspectors();
    } catch (err) {
      console.error(err);
      alert("Failed to delete inspector.");
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-x-auto overflow-y-visible">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">Inspector Credentials</h2>
        </div>

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
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : inspectors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center">
                  No inspectors found.
                </td>
              </tr>
            ) : (
              inspectors.map((inspector) => (
                <tr key={inspector.id} className="border-b">
                  <td className="py-3">
                    {inspector.fullName} {inspector.surname}
                  </td>

                  <td>{inspector.username}</td>

                  <td>{inspector.employeeNumber}</td>

                  <td>{inspector.sites.join(", ")}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        inspector.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inspector.status}
                    </span>
                  </td>

                  <td className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenu(
                          openMenu === inspector.id ? null : inspector.id,
                        );
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === inspector.id && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            handleReset(inspector);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        >
                          <KeyRound size={18} />
                          Reset Password
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenu(null);

                            setEditingInspector(inspector);

                            const selected = sites
                              .filter((site) =>
                                inspector.sites.includes(site.name),
                              )
                              .map((site) => site.id);

                            setSelectedSites(selected);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        >
                          <MapPinned size={18} />
                          Edit Sites
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            handleToggleStatus(inspector);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                            inspector.status === "active"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          <UserX size={18} />

                          {inspector.status === "active"
                            ? "Disable Account"
                            : "Enable Account"}
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            handleDelete(inspector);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={18} />
                          Delete Inspector
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditInspectorSitesModal
        open={editingInspector !== null}
        inspector={editingInspector}
        sites={sites}
        selectedSites={selectedSites}
        onChangeSelectedSites={setSelectedSites}
        onClose={() => setEditingInspector(null)}
        onSave={handleSaveSites}
      />
    </>
  );
}
