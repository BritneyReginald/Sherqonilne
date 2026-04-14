import { useState } from "react";

export function IncidentForm({ onSubmit }: any) {
  const [form, setForm] = useState({
    division: "",
    date: "",
    classification: "",
    employeeName: "",
    site: "",
    time: "",
    incidentNumber: "",
    employeeNumber: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow p-4">
      <table className="w-full border border-gray-200">
        <thead>
          <tr>
            <th colSpan={4} className="bg-blue-600 text-white text-left p-3">
              Details of Incident
            </th>
          </tr>
        </thead>

        <tbody className="text-gray-900">
          <tr>
            <td className="p-2 font-medium">Division: </td>
            <td className="p-2">
              <input
                value={form.division}
                onChange={(e) => handleChange("division", e.target.value)}
                className="input w-full"
              />
            </td>

            <td className="p-2 font-medium">Site: </td>
            <td className="p-2">
              <input
                value={form.site}
                onChange={(e) => handleChange("site", e.target.value)}
                className="input w-full"
              />
            </td>
          </tr>

          <tr>
            <td className="p-2 font-medium">Date Of Incident: </td>
            <td className="p-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="input w-full"
              />
            </td>

            <td className="p-2 font-medium">Time Of Incident: </td>
            <td className="p-2">
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="input w-full"
              />
            </td>
            

            
          </tr>

          <tr>
            <td className="p-2 font-medium">Incident Classification: </td>
            <td className="p-2">
              <input
                value={form.classification}
                onChange={(e) => handleChange("classification", e.target.value)}
                className="input w-full"
              />
            </td>

            <td className="p-2 font-medium">Incident Number: </td>
            <td className="p-2">
              <input
                value={form.incidentNumber}
                onChange={(e) => handleChange("incidentNumber", e.target.value)}
                className="input w-full"
              />
            </td>

            
          </tr>

          <tr>
            <td className="p-2 font-medium">Employee Involved Name: </td>
            <td className="p-2">
              <input
                value={form.employeeName}
                onChange={(e) => handleChange("employeeName", e.target.value)}
                className="input w-full"
              />
            </td>

            <td className="p-2 font-medium">Employee Co. No. : </td>
            <td className="p-2">
              <input
                value={form.employeeNumber}
                onChange={(e) => handleChange("employeeNumber", e.target.value)}
                className="input w-full"
              />
            </td>
          </tr>

          {/* FULL WIDTH DESCRIPTION */}
          <tr>
            <td className="p-2 font-medium align-top">Description: </td>
            <td colSpan={3} className="p-2">
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="input w-full h-24"
                placeholder="Detailed description of incident"
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* SAVE BUTTON */}
      <div className="mt-4">
        <button
          onClick={() => onSubmit(form)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Save Incident
        </button>
      </div>
    </div>
  );
}
