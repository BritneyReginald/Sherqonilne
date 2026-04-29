import { IncidentRecord, InvestigationData } from "./types";

type Props = {
  record: IncidentRecord;
  investigation: InvestigationData;
  files: File[];
  onChange: (field: string, value: any) => void;
  onFileChange: (files: File[]) => void;
  onUpdateStatus: (status: IncidentRecord["status"]) => void;
  onBack: () => void;
};

export const InvestigationForm = ({
  record,
  investigation,
  files,
  onChange,
  onFileChange,
  onUpdateStatus,
  onBack,
}: Props) => {
  return (
    <>
      <button onClick={onBack} className="mb-4 text-blue-600">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4 text-white">
        Investigation Details
      </h1>

      {/* BASIC INFO */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4 text-gray-900">
        <p>
          <strong>Type:</strong> {record.type}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {record.type === "incident" ? record.category : record.title}
        </p>

        <p>
          <strong>Status:</strong> {record.status}
        </p>
      </div>

      {/* INVESTIGATOR INFO */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Investigator Details</h2>

        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Investigator Name"
          value={investigation.investigator || ""}
          onChange={(e) => onChange("investigator", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="date"
          value={investigation.investigationDate || ""}
          onChange={(e) => onChange("investigationDate", e.target.value)}
        />
      </div>

      {/* ROOT CAUSE */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Root Cause Analysis</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Immediate Cause"
          value={investigation.immediateCause || ""}
          onChange={(e) => onChange("immediateCause", e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Root Cause"
          value={investigation.rootCause || ""}
          onChange={(e) => onChange("rootCause", e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Contributing Factors"
          value={investigation.contributingFactors || ""}
          onChange={(e) =>
            onChange("contributingFactors", e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Corrective Actions</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Corrective Actions"
          value={investigation.correctiveActions || ""}
          onChange={(e) =>
            onChange("correctiveActions", e.target.value)
          }
        />

        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Responsible Person"
          value={investigation.responsiblePerson || ""}
          onChange={(e) =>
            onChange("responsiblePerson", e.target.value)
          }
        />

        <input
          className="w-full border p-2 rounded"
          type="date"
          value={investigation.dueDate || ""}
          onChange={(e) => onChange("dueDate", e.target.value)}
        />
      </div>

      {/* PREVENTION */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Preventive Actions</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Preventive Actions"
          value={investigation.preventiveActions || ""}
          onChange={(e) =>
            onChange("preventiveActions", e.target.value)
          }
        />
      </div>

      {/* EVIDENCE */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 text-gray-900">
        <h2 className="font-semibold text-lg mb-4">Evidence Upload</h2>

        <input
          type="file"
          multiple
          onChange={(e) => {
            if (!e.target.files) return;
            const newFiles = Array.from(e.target.files);
            onFileChange(newFiles);
          }}
        />

        <ul className="mt-3 text-sm">
          {files.map((file, i) => (
            <li key={i}>📄 {file.name}</li>
          ))}
        </ul>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => onUpdateStatus("Under Investigation")}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
        >
          Start Investigation
        </button>

        <button
          onClick={() => onUpdateStatus("Closed")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Close Case
        </button>
      </div>
    </>
  );
};