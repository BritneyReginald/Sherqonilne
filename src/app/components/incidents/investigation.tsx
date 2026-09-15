import { IncidentRecord, InvestigationData } from "./types";

type Props = {
  record: IncidentRecord;
  investigation: InvestigationData;
  onChange: (field: string, value: any) => void;
  onUpdateStatus: (status: IncidentRecord["status"]) => void;
  onBack: () => void;
};

export const InvestigationForm = ({
  record,
  investigation,
  onChange,
  onUpdateStatus,
  onBack,
}: Props) => {
  const correctiveActions =
    investigation.correctiveActions && investigation.correctiveActions.length
      ? investigation.correctiveActions
      : [""];

  const updateCorrectiveAction = (index: number, value: string) => {
    const updated = [...correctiveActions];
    updated[index] = value;
    onChange("correctiveActions", updated);
  };

  const addCorrectiveAction = () => {
    onChange("correctiveActions", [...correctiveActions, ""]);
  };

  const removeCorrectiveAction = (index: number) => {
    const updated = correctiveActions.filter((_, i) => i !== index);
    onChange("correctiveActions", updated.length ? updated : [""]);
  };

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
          onChange={(e) => onChange("contributingFactors", e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Corrective Actions</h2>

        {correctiveActions.map((ca, index) => (
          <div key={index} className="flex gap-2 items-start">
            <textarea
              className="w-full border p-2 rounded"
              placeholder={`Corrective Action ${index + 1}`}
              value={ca}
              onChange={(e) => updateCorrectiveAction(index, e.target.value)}
            />

            {correctiveActions.length > 1 && (
              <button
                type="button"
                onClick={() => removeCorrectiveAction(index)}
                className="text-red-600 px-2 py-2"
                title="Remove this action"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addCorrectiveAction}
          className="text-blue-600 text-sm hover:underline"
        >
          + Add Corrective Action
        </button>

        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Responsible Person"
          value={investigation.responsiblePerson || ""}
          onChange={(e) => onChange("responsiblePerson", e.target.value)}
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
          onChange={(e) => onChange("preventiveActions", e.target.value)}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => {
            onUpdateStatus("Under Investigation");
            onBack();
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
        >
          Start Investigation
        </button>

        <button
          onClick={() => {
            onUpdateStatus("Complete");
            onBack();
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Mark as Complete
        </button>
      </div>
    </>
  );
};