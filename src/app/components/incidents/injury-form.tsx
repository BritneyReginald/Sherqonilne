import { useState } from "react";

type InjuryType = "firstAid" | "hospital" | null;
type FirstAidEntry = {
  date: string;
  name: string;
  injury: string;
  treatment: string;
  firstAider: string;
  signature: string;
  time: string;
  comment: string;
};

const employees = [
  { name: "John Doe", number: "EMP001", supervisor: "Mike Ross" },
  { name: "Jane Smith", number: "EMP002", supervisor: "Rachel Zane" },
];

const firstAiders = ["Mike Ross", "Rachel Zane"];

export function InjuryForm({
  onSubmit,
  onBack,
  incidentType,
  incidentNumber,
}: any) {
  const [step, setStep] = useState<InjuryType>(null);

  // form state (for hospital case)
  const [form, setForm] = useState({
    division: "",
    site: "",
    date: "",
    time: "",
    employeeName: "",
    employeeNumber: "",
    supervisor: "",
    description: "",
    bodyPart: "",
    otherBodyPart: "",
    effect: "",
    disablement: "",
  });

  const [entries, setEntries] = useState<FirstAidEntry[]>([
    {
      date: "",
      name: "",
      injury: "",
      treatment: "",
      firstAider: "",
      signature: "",
      time: "",
      comment: "",
    },
  ]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTableChange = (
    index: number,
    field: keyof FirstAidEntry,
    value: string,
  ) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addRow = () => {
    setEntries([
      ...entries,
      {
        date: "",
        name: "",
        injury: "",
        treatment: "",
        firstAider: "",
        signature: "",
        time: "",
        comment: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  // ================= STEP 1: SELECTION =================
  if (!step) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-600">
          Select Injury Type
        </h2>

        <div className="flex gap-4">
          <button
            onClick={() => setStep("firstAid")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            First Aid Case Dressing
          </button>

          <button
            onClick={() => setStep("hospital")}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Injured Sent to Hospital
          </button>
        </div>
      </div>
    );
  }

  // ================= STEP 2: FIRST AID =================
  if (step === "firstAid") {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-600">
          First Aid Case Dressing
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm text-gray-600">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-2">Date</th>
                <th className="border px-2 py-2">Name</th>
                <th className="border px-2 py-2">Nature of Injury</th>
                <th className="border px-2 py-2">Treatment</th>
                <th className="border px-2 py-2">First Aider</th>
                <th className="border px-2 py-2">Signature</th>
                <th className="border px-2 py-2">Time</th>
                <th className="border px-2 py-2">Comment</th>
                <th className="border px-2 py-2">Del</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="border p-1">
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) =>
                        handleTableChange(index, "date", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    />
                  </td>

                  <td className="border p-1">
                    <select
                      value={entry.name}
                      onChange={(e) =>
                        handleTableChange(index, "name", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.number} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="border p-1">
                    <input
                      value={entry.injury}
                      onChange={(e) =>
                        handleTableChange(index, "injury", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    />
                  </td>

                  <td className="border p-1">
                    <input
                      placeholder="e.g. Bandage, Ice pack"
                      value={entry.treatment}
                      onChange={(e) =>
                        handleTableChange(index, "treatment", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    />
                  </td>

                  <td className="border p-1">
                    <select
                      value={entry.firstAider}
                      onChange={(e) =>
                        handleTableChange(index, "firstAider", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    >
                      <option value="">Select First Aider</option>
                      {firstAiders.map((fa, i) => (
                        <option key={i} value={fa}>
                          {fa}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="border p-1">
                    <input
                      value={entry.signature}
                      onChange={(e) =>
                        handleTableChange(index, "signature", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    />
                  </td>

                  <td className="border p-1">
                    <input
                      type="time"
                      value={entry.time}
                      onChange={(e) =>
                        handleTableChange(index, "time", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    />
                  </td>

                  <td className="border p-1">
                    <input
                      value={entry.comment}
                      onChange={(e) =>
                        handleTableChange(index, "comment", e.target.value)
                      }
                      className="w-full px-1 py-1 border rounded"
                    />
                  </td>

                  <td className="border p-1 text-center">
                    <button
                      onClick={() => removeRow(index)}
                      className="text-red-600"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={addRow}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Row
          </button>

          <button
            onClick={() =>
              onSubmit({
                type: "firstAid",
                entries,
              })
            }
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save First Aid Log
          </button>

          <button
            onClick={() => setStep(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ================= STEP 3: HOSPITAL FORM =================
  return (
    <div className="space-y-6">
      {/* BASIC INFO (same as incident form) */}
      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4 text-gray-700">
        <div>
          <label className="text-sm text-gray-600">Division:</label>
          <input
            placeholder="Division"
            value={form.division}
            onChange={(e) => handleChange("division", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Site:</label>
          <input
            placeholder="Site"
            value={form.site}
            onChange={(e) => handleChange("site", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Date Of Incident:</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Time Of Incident:</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => handleChange("time", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Incident Classification:
          </label>
          <input
            value={incidentType}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Incident Number:</label>
          <input
            value={incidentNumber}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Employee Involved Name:
          </label>
          <select
            value={form.employeeName}
            onChange={(e) => {
              const selected = employees.find(
                (emp) => emp.name === e.target.value,
              );
              setForm((prev) => ({
                ...prev,
                employeeName: selected?.name || "",
                employeeNumber: selected?.number || "",
                supervisor: selected?.supervisor || "",
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.number} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Employee Co. No.</label>
          <input
            placeholder="Employee Number"
            value={form.employeeNumber}
            onChange={(e) => handleChange("employeeNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Supervisor</label>
          <input
            value={form.supervisor}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-2 text-gray-700">
          Detail Description of Injury
        </h2>

        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* INJURY TABLE FIELDS */}
      <div className="bg-white rounded-xl shadow p-6 grid gap-4 text-gray-700">
        <label className="text-md text-gray-600">Body Part Injured:</label>
        <select
          value={form.bodyPart}
          onChange={(e) => {
            handleChange("bodyPart", e.target.value);

            if (e.target.value !== "Other") {
              handleChange("otherBodyPart", "");
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
        >
          <option value="">Select injured part</option>
          <option>Other</option>
          <option>Head or Neck</option>
          <option>Eye</option>
          <option>Trunk</option>
          <option>Finger</option>
          <option>Hand</option>
          <option>Torso</option>
          <option>Arm</option>
          <option>Foot</option>
          <option>Leg</option>
          <option>Internal</option>
          <option>Multiple</option>
        </select>
        {form.bodyPart === "Other" && (
          <input
            placeholder="Specify body part"
            value={form.otherBodyPart}
            onChange={(e) => handleChange("otherBodyPart", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        )}

        <label className="text-sm text-gray-600">Effect On Person:</label>
        <select
          value={form.effect}
          onChange={(e) => handleChange("effect", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
        >
          <option value="">Select effect</option>
          <option>Cuts and Lacerations</option>
          <option>Sprains or Strains</option>
          <option>Contusion or Wounds</option>
          <option>Fractures</option>
          <option>Burns</option>
          <option>Amputation</option>
          <option>Repetitive Strain Injuries</option>
          <option>Electric Shock</option>
          <option>Asphyxiation</option>
          <option>Unconsciousness</option>
          <option>Poisoning</option>
          <option>Occupational Disease</option>
        </select>

        <label className="text-sm text-gray-600">
          Expected Period of Disablement:
        </label>
        <select
          value={form.disablement}
          onChange={(e) => handleChange("disablement", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
        >
          <option value="">Select Period of Disablement</option>
          <option>0–13 Days</option>
          <option>{">"}4–16 Weeks</option>
          <option>{">"}16–52 Weeks / Permanent</option>
          <option>Killed</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={() => setStep(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>

        <button
          onClick={() =>
            onSubmit({
              ...form,
              type: "injury",
              incidentNumber,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Injury
        </button>
      </div>
    </div>
  );
}
