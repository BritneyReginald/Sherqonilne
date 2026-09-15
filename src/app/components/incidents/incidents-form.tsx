import { useState } from "react";
import { EmployeeOption } from "../../../api/employees";

interface SiteOption {
  id: string;
  name: string;
}

interface IncidentFormProps {
  onSubmit: (data: any) => void;
  incidentType: string | null;
  incidentNumber: string;
  employees: EmployeeOption[];
  sites: SiteOption[];
}

export function IncidentForm({
  onSubmit,
  incidentType,
  incidentNumber,
  employees,
  sites,
}: IncidentFormProps) {
  const [form, setForm] = useState({
    division: "",
    date: "",
    employeeId: "",
    employeeName: "",
    supervisor: "",
    site: "",
    time: "",
    employeeNumber: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeSelect = (id: string) => {
    const selected = employees.find((emp) => emp.id === id);
    setForm((prev) => ({
      ...prev,
      employeeId: id,
      employeeName: selected?.fullName || "",
      employeeNumber: selected?.employeeNumber || "",
      supervisor: selected?.reportingManager || "",
    }));
  };

  return (
    <div className="space-y-6">
      {/* ================= BASIC DETAILS ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Incident Details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Division:</label>
            <input
              value={form.division}
              onChange={(e) => handleChange("division", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Site:</label>
            <select
              value={form.site}
              onChange={(e) => handleChange("site", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.name}>
                  {site.name}
                </option>
              ))}
            </select>
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
              value={incidentType ?? ""}
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
              value={form.employeeId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Employee Co. No.</label>
            <input
              value={form.employeeNumber}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
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
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Detail Description Of Incident:
        </h2>

        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Provide a detailed description of the incident..."
        />
      </div>

      {/* ================= ACTION BUTTON ================= */}
      <div className="flex justify-end">
        <button
          onClick={() => onSubmit({ ...form, incidentNumber })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Save Incident
        </button>
      </div>
    </div>
  );
}