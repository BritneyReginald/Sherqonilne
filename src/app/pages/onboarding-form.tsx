import { useEffect, useState } from "react";
import { getSites } from "../../api/siteAPI";
import { createInspector, createFirstAider } from "../../api/adminAPI";
import { Copy, Check } from "lucide-react";

interface Site {
  id: number;
  name: string;
}

type Role = "inspector" | "first_aider";

const ROLE_LABEL: Record<Role, string> = {
  inspector: "Inspector",
  first_aider: "First Aider",
};

const ROLE_CREATE: Record<Role, (data: any) => Promise<any>> = {
  inspector: createInspector,
  first_aider: createFirstAider,
};

export function OnboardingForm({ role }: { role: Role }) {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [surname, setSurname] = useState("");

  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  // Reset the form whenever the role tab changes, so leftover state
  // from "Create Inspector" doesn't bleed into "Create First Aider"
  useEffect(() => {
    setEmployeeNumber("");
    setFullName("");
    setSurname("");
    setSelectedSites([]);
    setGeneratedCredentials(null);
  }, [role]);

  async function loadSites() {
    try {
      const data = await getSites();
      setSites(data);
    } catch (err) {
      console.error(err);
    }
  }

  function toggleSite(siteId: number) {
    setSelectedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId],
    );
  }

  async function handleCreate() {
    if (!employeeNumber.trim() || !fullName.trim() || !surname.trim()) {
      alert("Please complete all required fields.");
      return;
    }

    if (selectedSites.length === 0) {
      alert("Please assign at least one site.");
      return;
    }

    setLoading(true);

    try {
      const result = await ROLE_CREATE[role]({
        employeeNumber,
        fullName,
        surname,
        siteIds: selectedSites,
      });

      setGeneratedCredentials({
        username: result.username,
        password: result.plainPassword,
      });

      setEmployeeNumber("");
      setFullName("");
      setSurname("");
      setSelectedSites([]);
    } catch (err) {
      console.error(err);
      alert(`Failed to create ${ROLE_LABEL[role].toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCredentials() {
    if (!generatedCredentials) return;

    const text = `${ROLE_LABEL[role]} Login Credentials

Username: ${generatedCredentials.username}
Password: ${generatedCredentials.password}`;

    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* LEFT PANEL */}
      <div className="col-span-2 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          Create {ROLE_LABEL[role]}
        </h2>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium">Employee Number</label>

            <input
              className="w-full border rounded-lg p-3"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Surname</label>

            <input
              className="w-full border rounded-lg p-3"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-medium">Full Name</label>

            <input
              className="w-full border rounded-lg p-3"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-3">Assign Sites</h3>

          <div className="grid grid-cols-2 gap-3">
            {sites.map((site) => (
              <label
                key={site.id}
                className="border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-blue-500 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedSites.includes(site.id)}
                  onChange={() => toggleSite(site.id)}
                />

                <span>{site.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Generating Credentials..." : "Generate Credentials"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-blue-50 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Generated Credentials</h2>

        {!generatedCredentials ? (
          <div className="text-gray-500 text-sm">
            Once a {ROLE_LABEL[role].toLowerCase()} has been created, their
            login credentials will appear here. Ensure they record these
            credentials before leaving this page.
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500">Username</p>

              <div className="font-semibold text-lg">
                {generatedCredentials.username}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Temporary Password</p>

              <div className="font-semibold text-lg">
                {generatedCredentials.password}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-amber-700">
                These credentials are only shown once. Ask the{" "}
                {ROLE_LABEL[role].toLowerCase()} to store them securely.
              </p>
            </div>

            <button
              onClick={handleCopyCredentials}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Credentials
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}