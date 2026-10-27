import { useEffect, useMemo, useState } from "react";
import { createInspector, createFirstAider } from "../../api/adminAPI";
import { Copy, Check, Loader2, AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("sherq_auth");
    const token = stored ? JSON.parse(stored).token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Raw row from GET /employees (snake_case, straight from the DB)
interface EmployeeRow {
  id: number;
  employee_number: string | null;
  full_name: string | null;
  job_title: string | null;
  site_id: number | null;
  site_location: string | null;
  status: string | null;
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

// Employees only store one "full_name" string, but the account profile needs
// a name and a surname. The last word becomes the surname and the rest the
// name (a single word is used for both, since both are required).
// If your usernames are built from these, adjust the split here.
function splitName(full: string): { fullName: string; surname: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    const only = parts[0] ?? "";
    return { fullName: only, surname: only };
  }
  return {
    fullName: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1],
  };
}

// Pulls the server's error message out of whatever shape the API layer throws
// (axios-style, a fetch wrapper's custom error, or a plain Error).
function getServerMessage(err: any): string | undefined {
  const fromBody = err?.response?.data?.error ?? err?.data?.error;
  if (typeof fromBody === "string" && fromBody) return fromBody;

  if (
    err instanceof Error &&
    err.message &&
    !err.message.startsWith("Request failed")
  ) {
    return err.message;
  }

  return undefined;
}

function isConflict(err: any): boolean {
  return err?.response?.status === 409 || err?.status === 409;
}

export function OnboardingForm({ role }: { role: Role }) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Reset the form whenever the role tab changes, so leftover state
  // from "Create Inspector" doesn't bleed into "Create First Aider"
  useEffect(() => {
    setSelectedEmployeeId("");
    setGeneratedCredentials(null);
  }, [role]);

  async function loadEmployees() {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      const res = await fetch(`${API_URL}/employees`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        throw new Error(
          res.status === 403
            ? "You don't have permission to view employees."
            : `Failed to load employees (HTTP ${res.status}).`,
        );
      }
      const data: EmployeeRow[] = await res.json();
      setEmployees(
        data
          .filter((e) => e.status !== "Inactive" && e.employee_number)
          .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? "")),
      );
    } catch (err: any) {
      console.error(err);
      setEmployeesError(err?.message ?? "Failed to load employees.");
    } finally {
      setEmployeesLoading(false);
    }
  }

  const selectedEmployee = useMemo(
    () => employees.find((e) => String(e.id) === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const derivedName = selectedEmployee
    ? splitName(selectedEmployee.full_name ?? "")
    : null;

  // Site comes from the employee record (set in Workforce), never typed here.
  const employeeHasSite = !!selectedEmployee?.site_id;

  async function handleCreate() {
    if (!selectedEmployee || !derivedName) {
      alert("Please select an employee.");
      return;
    }

    if (!selectedEmployee.site_id) {
      alert(
        "This employee has no site assigned. Assign a site to them in Workforce first.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await ROLE_CREATE[role]({
        employeeId: selectedEmployee.id,
        employeeNumber: (selectedEmployee.employee_number ?? "").trim(),
        fullName: derivedName.fullName,
        surname: derivedName.surname,
        siteIds: [selectedEmployee.site_id],
      });

      setGeneratedCredentials({
        username: result.username,
        password: result.plainPassword,
      });

      setSelectedEmployeeId("");
    } catch (err) {
      console.error(err);

      if (isConflict(err)) {
        alert(
          getServerMessage(err) ??
            `${ROLE_LABEL[role]} already onboarded, check Security & Privacy page`,
        );
      } else {
        alert(
          getServerMessage(err) ??
            `Failed to create ${ROLE_LABEL[role].toLowerCase()}.`,
        );
      }
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

        <div>
          <label className="block mb-2 font-medium">Employee</label>

          {employeesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
              <Loader2 className="size-4 animate-spin" />
              Loading employees…
            </div>
          ) : employeesError ? (
            <div className="flex items-center gap-3 text-sm text-red-600 py-3">
              <AlertTriangle className="size-4" />
              <span>{employeesError}</span>
              <button
                onClick={loadEmployees}
                className="underline font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <select
              className="w-full border rounded-lg p-3 bg-white"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">
                {employees.length === 0
                  ? "No registered employees found"
                  : "Select an employee…"}
              </option>
              {employees.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.employee_number} — {e.full_name}
                  {e.site_location ? ` (${e.site_location})` : " (no site)"}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Only employees registered in Workforce can be onboarded. Add them
            there first if they're missing.
          </p>
        </div>

        {selectedEmployee && derivedName && (
          <div className="mt-6 grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-gray-500 mb-1">Employee Number</p>
              <div className="border rounded-lg p-3 bg-gray-50">
                {selectedEmployee.employee_number}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Job Title</p>
              <div className="border rounded-lg p-3 bg-gray-50">
                {selectedEmployee.job_title || "—"}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <div className="border rounded-lg p-3 bg-gray-50">
                {derivedName.fullName}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Surname</p>
              <div className="border rounded-lg p-3 bg-gray-50">
                {derivedName.surname}
              </div>
            </div>
          </div>
        )}

        {selectedEmployee && (
          <div className="mt-8">
            <h3 className="font-semibold mb-3">Assigned Site</h3>
            {employeeHasSite ? (
              <div className="border rounded-lg p-3 bg-gray-50">
                {selectedEmployee.site_location}
                <span className="block text-xs text-gray-500 mt-1">
                  Taken from the employee's record in Workforce.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 border border-amber-300 bg-amber-50 text-amber-800 rounded-lg p-3 text-sm">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>
                  This employee isn't linked to a registered site
                  {selectedEmployee.site_location
                    ? ` ("${selectedEmployee.site_location}" doesn't match any site)`
                    : ""}
                  . Edit their profile in Workforce and choose a site before
                  onboarding.
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || !selectedEmployee || !employeeHasSite}
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