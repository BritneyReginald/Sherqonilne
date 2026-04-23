import { useEffect, useState } from "react";
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
  investigationNotes?: string;
  evidence?: File[];
};

export default function Incidents() {
  type ViewType =
    | "registry"
    | "incident-type"
    | "incident-form"
    | "ncr"
    | "injury"
    | "investigation";

  const [incidentCategory, setIncidentCategory] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>("registry");
  const [records, setRecords] = useState<IncidentRecord[]>(() => {
    const saved = localStorage.getItem("incident-records");
    return saved ? JSON.parse(saved) : [];
  });
  const [counter, setCounter] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<IncidentRecord | null>(
    null,
  );
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => {
    if (selectedRecord) {
      setNotes(selectedRecord.investigationNotes || "");
      setFiles(selectedRecord.evidence || []);
    }
  }, [selectedRecord]);

  useEffect(() => {
    localStorage.setItem("incident-records", JSON.stringify(records));
  }, [records]);

  const addRecord = (data: any) => {
    const newRecord: IncidentRecord = {
      id: Date.now(),
      type: view === "incident-form" ? "incident" : view,
      category: data.category || incidentCategory || undefined,
      title: data.ncrNo || data.title || "",
      description: data.description,
      status: "Open",
    };

    setCounter((prev) => prev + 1);
    setRecords((prev) => [newRecord, ...prev]);
    setView("registry");
  };

  const updateStatus = (newStatus: IncidentRecord["status"]) => {
    if (!selectedRecord) return;

    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === selectedRecord.id
          ? {
              ...rec,
              status: newStatus,
              investigationNotes: notes,
              evidence: files,
            }
          : rec,
      ),
    );

    setSelectedRecord((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            investigationNotes: notes,
            evidence: files,
          }
        : prev,
    );
  };

  const total = records.length;
  const open = records.filter((r) => r.status === "Open").length;
  const closed = records.filter((r) => r.status === "Closed").length;

  const ncrRecords = records.filter((r) => r.type === "ncr");

  const [injuryCount, setInjuryCount] = useState(1);

  const generateInjuryNumber = () => {
    return `INJ-${String(injuryCount).padStart(3, "0")}`;
  };

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
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 capitalize">{record.type}</td>
                    <td className="p-3">
                      {record.type === "incident"
                        ? record.category
                        : record.title}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium">
                        {record.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setView("investigation");
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View / Investigate
                      </button>
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
            Type:{" "}
            <span className="font-bold text-blue-600">{incidentCategory}</span>
          </p>

          <IncidentForm
            onSubmit={addRecord}
            incidentType={incidentCategory}
            incidentNumber={`INC-${counter.toString().padStart(4, "0")}`}
          />
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

          <NCRForm onSubmit={addRecord} existingNCRs={ncrRecords} />
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

          <InjuryForm
            incidentType="Injury"
            incidentNumber={generateInjuryNumber()}
            onSubmit={(data: any) => {
              addRecord({
                ...data,
                incidentNumber: generateInjuryNumber(),
              });

              setInjuryCount((prev) => prev + 1);
            }}
          />
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

      {view === "investigation" && selectedRecord && (
        <>
          <button
            onClick={() => setView("registry")}
            className="mb-4 text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold mb-4 text-white">
            Investigation Details
          </h1>

          <div className="bg-white rounded-xl shadow p-6 space-y-4 text-gray-900">
            <p>
              <strong>Type:</strong> {selectedRecord.type}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {selectedRecord.type === "incident"
                ? selectedRecord.category
                : selectedRecord.title}
            </p>

            <p>
              <strong>Status:</strong> {selectedRecord.status}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Investigation Notes
            </h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write investigation findings..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Evidence Upload
            </h2>

            <input
              type="file"
              multiple
              onChange={(e) => {
                if (!e.target.files) return;
                setFiles(Array.from(e.target.files));
              }}
              className="mb-4"
            />

            {/* Show uploaded files */}
            <ul className="text-sm text-gray-600 space-y-1">
              {files.map((file, index) => (
                <li key={index}>📄 {file.name}</li>
              ))}
            </ul>
          </div>

          {/* STATUS ACTIONS */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => updateStatus("Under Investigation")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
            >
              Start Investigation
            </button>

            <button
              onClick={() => updateStatus("Closed")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Close Case
            </button>
          </div>
        </>
      )}
    </div>
  );
}
