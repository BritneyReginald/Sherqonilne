import { useEffect, useState } from "react";
import { getSites } from "@/api/siteAPI";
import { createInspector } from "@/api/adminAPI";
import { Copy, Check } from "lucide-react";

interface Site {
  id: number;
  name: string;
}

export function InspectorsPage() {
  return (
    <div className="p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Inspector Onboarding</h1>
        <p className="text-gray-500">
          Create inspector accounts and assign them to inspection sites.
        </p>
      </div>

      <InspectorOnboardingForm />
    </div>
  );
}

function InspectorOnboardingForm() {
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
      const result = await createInspector({
        employeeNumber,
        fullName,
        surname,
        siteIds: selectedSites,
      });

      setGeneratedCredentials({
        username: result.username,
        password: result.plainPassword,
      });

      // Reset form
      setEmployeeNumber("");
      setFullName("");
      setSurname("");
      setSelectedSites([]);
    } catch (err) {
      console.error(err);
      alert("Failed to create inspector.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCredentials() {
    if (!generatedCredentials) return;

    const text = `Inspector Login Credentials

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
        <h2 className="text-xl font-semibold mb-6">Create Inspector</h2>

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
          <h3 className="font-semibold mb-3">Assign Inspection Sites</h3>

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
            Once an inspector has been created, their login credentials will
            appear here. Ensure the inspector records these credentials before
            leaving this page.
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
                These credentials are only shown once. Ask the inspector to
                store them securely.
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
