import { useEffect, useRef, useState } from "react";
import { IncidentForm } from "./incidents-form";
import { NCRForm } from "./ncr-form";
import { InjuryForm } from "./injury/injury-form";
import { InvestigationForm } from "./investigation";
import { UploadPage } from "./upload";
import { PDFView } from "./pdf-view";
import {
  IncidentRecord,
  InvestigationData,
  RecordStatus,
  RecordType,
} from "./types";
import {
  createIncidentRecord,
  deleteIncidentRecord,
  fetchIncidentRecords,
  fetchIncidentRecord,
  getNextRecordNumber,
  patchInvestigationField,
  updateIncidentStatus,
  uploadEvidenceFiles,
} from "../../../api/incidents";
import { getEmployees, EmployeeOption } from "../../../api/employees";
import { getSites } from "../../../api/siteAPI";

type ViewType =
  | "registry"
  | "incident-type"
  | "incident-form"
  | "ncr"
  | "injury"
  | "investigation"
  | "upload"
  | "pdf";

interface SiteOption {
  id: string;
  name: string;
}

export default function Incidents() {
  const [incidentCategory, setIncidentCategory] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>("registry");
  const [records, setRecords] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<IncidentRecord | null>(
    null,
  );

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [sites, setSites] = useState<SiteOption[]>([]);

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchIncidentRecords();
        if (!cancelled) setRecords(data);
      } catch (err) {
        console.error("Failed to load records", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    getEmployees()
      .then((data) => !cancelled && setEmployees(data))
      .catch((err) => console.error("Failed to load employees", err));

    getSites()
      .then(
        (data: any[]) =>
          !cancelled &&
          setSites(data.map((s) => ({ id: String(s.id), name: s.name }))),
      )
      .catch((err) => console.error("Failed to load sites", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Numbers are derived from the records themselves (max existing
  // number of that type + 1), so they stay correct across refreshes
  // and deletions instead of drifting local counters.
  const nextIncidentNumber = getNextRecordNumber(records, "incident", "INC");
  const nextNcrNumber = getNextRecordNumber(records, "ncr", "NCR");
  const nextInjuryNumber = getNextRecordNumber(records, "injury", "INJ");

  const addRecord = async (data: any) => {
    // InjuryForm's First Aid step submits { type: "firstAid", ... }
    // directly (it isn't gated by `view`, since both injury steps
    // share the "injury" view) — detect it up front.
    const isFirstAid = data.type === "firstAid";
    const type = (
      isFirstAid ? "injury" : view === "incident-form" ? "incident" : view
    ) as RecordType;

    try {
      let payload: Parameters<typeof createIncidentRecord>[0];

      if (isFirstAid) {
        payload = {
          type: "injury",
          injuryType: "firstAid",
          title: data.incidentNumber,
          site: data.site,
          description: "First Aid Case Dressing log",
          entries: data.entries.map((e: any) => ({
            employeeId: e.employeeId,
            employeeName: e.employeeName,
            employeeNumber: e.employeeNumber,
            date: e.date,
            time: e.time,
            injury: e.injury,
            treatment: e.treatment,
            comments: e.comments,
            firstAider: e.firstAider,
            // Was previously dropped here, so a signature captured on
            // the form (see FirstAidCard/onFirstAiderSign) never made
            // it to the API even though the backend already accepts
            // and stores it — this is the fix.
            firstAiderSignature: e.firstAiderSignature,
            furtherMedicalAttention: e.furtherMedicalAttention,
            status: e.status,
          })),
        };
      } else if (type === "incident") {
        payload = {
          type,
          employeeId: data.employeeId ? Number(data.employeeId) : undefined,
          category: incidentCategory || undefined,
          division: data.division,
          site: data.site,
          incidentDate: data.date,
          incidentTime: data.time,
          description: data.description,
          title: data.incidentNumber,
        };
      } else if (type === "ncr") {
        payload = {
          type,
          category: data.category,
          title: data.ncrNo,
          description: data.description,
          ncrType: data.type, // NCRForm's "type" field is Internal/External
          identifiedBy: data.identifiedBy,
          department: data.department,
          incidentDate: data.dateIdentified,
        };
      } else {
        // injury (hospital-case step)
        payload = {
          type,
          employeeId: data.employeeId ? Number(data.employeeId) : undefined,
          injuryType: "hospital",
          division: data.division,
          site: data.site,
          incidentDate: data.date,
          incidentTime: data.time,
          description: data.description,
          bodyPart:
            data.bodyPart === "Other" ? data.otherBodyPart : data.bodyPart,
          effect: data.effect,
          disablement: data.disablement,
          title: data.incidentNumber,
        };
      }

      const newRecord = await createIncidentRecord(payload);
      setRecords((prev) => [newRecord, ...prev]);
      setView("registry");
    } catch (err) {
      console.error("Failed to save record", err);
      alert("Couldn't save that record — check your connection and try again.");
    }
  };

  const updateStatus = async (newStatus: RecordStatus) => {
    if (!selectedRecord) return;

    try {
      const updated = await updateIncidentStatus(selectedRecord.id, newStatus);
      setSelectedRecord(updated);
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Couldn't update the status. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this record?",
    );
    if (!confirmDelete) return;

    try {
      await deleteIncidentRecord(id);
      setRecords((prev) => prev.filter((rec) => rec.id !== id));
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Couldn't delete that record. Please try again.");
    }
  };

  const updateInvestigation = (field: string, value: any) => {
    if (!selectedRecord) return;

    const updatedRecord = {
      ...selectedRecord,
      investigation: {
        ...selectedRecord.investigation,
        [field]: value,
      },
    };

    setSelectedRecord(updatedRecord);
    setRecords((prev) =>
      prev.map((rec) => (rec.id === selectedRecord.id ? updatedRecord : rec)),
    );

    const key = `${selectedRecord.id}:${field}`;
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);

    debounceTimers.current[key] = setTimeout(() => {
      patchInvestigationField(
        selectedRecord.id,
        field as keyof InvestigationData,
        value,
      ).catch((err) =>
        console.error("Failed to save investigation field", err),
      );
    }, 600);
  };

  const investigation = selectedRecord?.investigation || {};

  const handleUpload = async (files: File[]) => {
    if (!selectedRecord) return;

    try {
      // Upload the files
      await uploadEvidenceFiles(selectedRecord.id, files);

      // Get the latest incident, including the newly uploaded evidence
      const freshRecord = await fetchIncidentRecord(selectedRecord.id);

      // Update the page immediately
      setSelectedRecord(freshRecord);

      // Keep the registry data up to date too
      setRecords((prev) =>
        prev.map((rec) => (rec.id === freshRecord.id ? freshRecord : rec)),
      );
    } catch (err) {
      console.error("Failed to upload evidence", err);
      alert("Couldn't upload those files. Please try again.");

      // Important: let UploadPage know the upload failed
      throw err;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created":
        return "bg-gray-200 text-gray-700";
      case "Under Investigation":
        return "bg-yellow-200 text-yellow-800";
      case "Complete":
        return "bg-green-200 text-green-800";
      default:
        return "";
    }
  };

  const total = records.length;
  const created = records.filter((r) => r.status === "Created").length;
  const underInvestigation = records.filter(
    (r) => r.status === "Under Investigation",
  ).length;
  const complete = records.filter((r) => r.status === "Complete").length;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading records…</div>;
  }

  const openUploadPage = async (record: IncidentRecord) => {
    try {
      const freshRecord = await fetchIncidentRecord(record.id);
      setSelectedRecord(freshRecord);
      setView("upload");
    } catch (err) {
      console.error("Failed to load latest incident", err);
      alert("Couldn't load the latest incident data.");
    }
  };

  const openPdfView = async (record: IncidentRecord) => {
    try {
      const freshRecord = await fetchIncidentRecord(record.id);
      setSelectedRecord(freshRecord);
      setView("pdf");
    } catch (err) {
      console.error("Failed to load latest incident", err);
      alert("Couldn't load the latest incident data.");
    }
  };

  return (
    <div className="p-6">
      {/* ================= REGISTRY ================= */}
      {view === "registry" && (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Incidents / NCR / Injuries Register
          </h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-gray-500">{total}</p>
            </div>

            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-2xl font-bold text-red-500">{created}</p>
            </div>

            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Under Investigation</p>
              <p className="text-2xl font-bold text-green-600">
                {underInvestigation}
              </p>
            </div>

            <div className="p-4 rounded-xl shadow bg-white">
              <p className="text-sm text-gray-500">Complete</p>
              <p className="text-2xl font-bold text-green-600">{complete}</p>
            </div>
          </div>

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

          <div className="bg-white rounded-xl shadow overflow-hidden text-gray-900">
            <table className="w-full">
              <thead className="bg-gray-100 text-left text-sm">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference #</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 capitalize">{record.type}</td>
                    <td className="p-3">{record.title || "—"}</td>
                    <td className="p-3">
                      {record.type === "incident"
                        ? record.category
                        : record.description}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setView("investigation");
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Investigate
                        </button>

                        <button
                          onClick={() => openUploadPage(record)}
                          className="text-purple-600 hover:underline text-sm"
                        >
                          Upload
                        </button>

                        <button
                          onClick={() => openPdfView(record)}
                          className="text-gray-700 hover:underline text-sm"
                        >
                          View PDF
                        </button>

                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
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

          <p className="mb-4 text-gray-500">
            Type:{" "}
            <span className="font-bold text-blue-600">{incidentCategory}</span>
          </p>

          <IncidentForm
            onSubmit={addRecord}
            incidentType={incidentCategory}
            incidentNumber={nextIncidentNumber}
            employees={employees}
            sites={sites}
          />
        </>
      )}

      {view === "upload" && selectedRecord && (
        <UploadPage
          record={selectedRecord!}
          onBack={() => setView("registry")}
          onUpload={handleUpload}
        />
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

          <NCRForm onSubmit={addRecord} ncrNumber={nextNcrNumber} />
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
            incidentNumber={nextInjuryNumber}
            employees={employees}
            sites={sites}
            onSubmit={(data: any) => addRecord(data)}
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
        <InvestigationForm
          record={selectedRecord!}
          investigation={investigation}
          onBack={() => setView("registry")}
          onChange={updateInvestigation}
          onUpdateStatus={updateStatus}
        />
      )}

      {view === "pdf" && selectedRecord && (
        <PDFView record={selectedRecord} onBack={() => setView("registry")} />
      )}
    </div>
  );
}
