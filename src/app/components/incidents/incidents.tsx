import { useState } from "react";
import { IncidentForm } from "./incidents-form";
import { NCRForm } from "./ncr-form";
import { InjuryForm } from "./injury-form";

type RecordType = "incident" | "ncr" | "injury" | null;

type IncidentRecord = {
  id: number;
  type: "incident" | "ncr" | "injury";
  category?: string;
  title: string;
  description: string;
  status: "Open" | "Under Investigation" | "Closed";
};

export default function Incidents() {
  type ViewType =
    | "registry"
    | "incident-type"
    | "incident-form"
    | "ncr"
    | "injury";
  const [incidentCategory, setIncidentCategory] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>("registry");
  const [records, setRecords] = useState<IncidentRecord[]>([]);

  const addRecord = (data: { title: string; description: string }) => {
    const newRecord: IncidentRecord = {
      id: Date.now(),
      type: view === "incident-form" ? "incident" : (view as "ncr" | "injury"),
      category: incidentCategory || undefined,
      title: data.title,
      description: data.description,
      status: "Open",
    };

    setRecords((prev) => [newRecord, ...prev]);
    setView("registry");
  };

  const total = records.length;
  const open = records.filter((r) => r.status === "Open").length;
  const closed = records.filter((r) => r.status === "Closed").length;

  return (
    <div className="p-6">
      {/* ================= REGISTRY ================= */}
      {view === "registry" && (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Incidents / NCR / Injuries Register
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-gray-500">{total}</p>
            </div>

            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-2xl font-bold text-red-500">{open}</p>
            </div>

            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Closed</p>
              <p className="text-2xl font-bold text-green-600">{closed}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setView("incident-type")}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              + Report Incident
            </button>

            <button
              onClick={() => setView("ncr")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
            >
              + Report NCR
            </button>

            <button
              onClick={() => setView("injury")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              + Report Injury
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden text-gray-900">
            <table className="w-full">
              <thead className="bg-gray-100 text-left text-sm">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 capitalize">{record.type}</td>
                    <td className="p-3">{record.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= INCIDENT PAGE ================= */}
      {view === "incident-form" && (
        <>
          <button
            onClick={() => setView("incident-type")}
            className="mb-4 text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold mb-2">Report Incident</h1>

          {/* Show selected type */}
          <p className="mb-4 text-gray-500">
            Type: <span className="font-medium">{incidentCategory}</span>
          </p>

          <IncidentForm onSubmit={addRecord} />
        </>
      )}

      {/* ================= NCR PAGE ================= */}
      {view === "ncr" && (
        <>
          <button
            onClick={() => setView("registry")}
            className="mb-4 text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold mb-4">Report NCR</h1>

          <NCRForm onSubmit={addRecord} />
        </>
      )}

      {/* ================= INJURY PAGE ================= */}
      {view === "injury" && (
        <>
          <button
            onClick={() => setView("registry")}
            className="mb-4 text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold mb-4">Report Injury</h1>

          <InjuryForm onSubmit={addRecord} />
        </>
      )}

      {view === "incident-type" && (
        <>
          <button
            onClick={() => setView("registry")}
            className="mb-4 text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold mb-6">Select Incident Type</h1>

          <div className="grid grid-cols-2 gap-4 text-gray-900">
            {[
              "Fire and explosion",
              "Hazardous substance & environmental incidents",
              "Unsafe act",
              "Unsafe condition",
              "Machinery & equipment incidents",
              "Transport & vehicle incidents",
              "Security incidents",
            ].map((type) => (
              <button 
                key={type}
                onClick={() => {
                  setIncidentCategory(type);
                  setView("incident-form");
                }}
               className="p-4 rounded-xl shadow text-left border border-blue-700 bg-blue-50 hover:bg-blue-500 transition"
              >
                <p className="font-medium">{type}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
