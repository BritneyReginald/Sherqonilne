import {
  ActionRow,
  IncidentRecord,
  InvestigationData,
  WhyRow,
} from "./types";
import { toDateInput } from "./form-helpers";

type Props = {
  record: IncidentRecord;
  investigation: InvestigationData;
  onChange: (field: string, value: any) => void;
  onUpdateStatus: (status: IncidentRecord["status"]) => void;
  onBack: () => void;
};

const WHY_COUNT = 5;

const emptyWhy = (): WhyRow => ({ question: "", finding: "" });
const emptyAction = (): ActionRow => ({
  action: "",
  responsiblePerson: "",
  targetDate: "",
});

const descriptionHeading = (type: string) => {
  if (type === "ncr") return "Description of Non-Conformance";
  if (type === "injury") return "Detailed Description of Injury";
  return "Detailed Description of Incident";
};

/* ------------------------------------------------------------------ */
/* Reusable Action / Responsible person / Target date table            */
/* ------------------------------------------------------------------ */

type ActionsTableProps = {
  rows: ActionRow[];
  onChange: (rows: ActionRow[]) => void;
  placeholder: string;
  addLabel: string;
};

function ActionsTable({
  rows,
  onChange,
  placeholder,
  addLabel,
}: ActionsTableProps) {
  const update = (index: number, patch: Partial<ActionRow>) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const add = () => onChange([...rows, emptyAction()]);

  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [emptyAction()]);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#1f3864] text-white text-left">
              <th className="border border-gray-400 p-2 w-1/2">Action</th>
              <th className="border border-gray-400 p-2">Responsible person</th>
              <th className="border border-gray-400 p-2 w-44">Target date</th>
              <th className="border border-gray-400 p-2 w-10" />
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="align-top">
                <td className="border border-gray-400 p-0">
                  <textarea
                    className="w-full p-2 min-h-[56px] bg-transparent focus:outline-none focus:bg-blue-50"
                    placeholder={placeholder}
                    value={row.action}
                    onChange={(e) => update(index, { action: e.target.value })}
                  />
                </td>

                <td className="border border-gray-400 p-0">
                  <textarea
                    className="w-full p-2 min-h-[56px] bg-transparent focus:outline-none focus:bg-blue-50"
                    value={row.responsiblePerson}
                    onChange={(e) =>
                      update(index, { responsiblePerson: e.target.value })
                    }
                  />
                </td>

                <td className="border border-gray-400 p-0">
                  <input
                    type="date"
                    className="w-full p-2 bg-transparent focus:outline-none focus:bg-blue-50"
                    value={toDateInput(row.targetDate)}
                    onChange={(e) =>
                      update(index, { targetDate: e.target.value })
                    }
                  />
                </td>

                <td className="border border-gray-400 p-0 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 px-2 py-2"
                      title="Remove this row"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={add}
        className="text-blue-600 text-sm hover:underline"
      >
        {addLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Investigation page                                                  */
/* ------------------------------------------------------------------ */

export const InvestigationForm = ({
  record,
  investigation,
  onChange,
  onUpdateStatus,
  onBack,
}: Props) => {
  // ---- 5 Whys: always show exactly five rows ----
  const whys: WhyRow[] = Array.from(
    { length: WHY_COUNT },
    (_, i) => investigation.fiveWhys?.[i] ?? emptyWhy(),
  );

  const updateWhy = (index: number, patch: Partial<WhyRow>) => {
    const next = whys.map((w, i) => (i === index ? { ...w, ...patch } : w));
    onChange("fiveWhys", next);
  };

  // ---- Corrective actions: new table rows, falling back to the old
  // single-text-per-action data so existing investigations still show ----
  const legacyCorrective = (investigation.correctiveActions ?? []).filter(
    (a) => a && a.trim(),
  );

  const correctiveRows: ActionRow[] = investigation.correctiveActionItems
    ?.length
    ? investigation.correctiveActionItems
    : legacyCorrective.length
      ? legacyCorrective.map((action, i) => ({
          action,
          responsiblePerson:
            i === 0 ? (investigation.responsiblePerson ?? "") : "",
          targetDate: i === 0 ? toDateInput(investigation.dueDate) : "",
        }))
      : [emptyAction()];

  // ---- Preventive actions: same table; old free-text becomes row 1 ----
  const legacyPreventive = (investigation.preventiveActions ?? "").trim();

  const preventiveRows: ActionRow[] = investigation.preventiveActionItems
    ?.length
    ? investigation.preventiveActionItems
    : legacyPreventive
      ? [{ ...emptyAction(), action: legacyPreventive }]
      : [emptyAction()];

  const descriptionText = (record.description ?? "").trim();

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
          <strong>Details:</strong>{" "}
          {record.type === "incident" ? record.category : record.title}
        </p>

        <p>
          <strong>Status:</strong> {record.status}
        </p>
      </div>

      {/* DESCRIPTION OF THE INCIDENT */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-2 text-gray-900">
        <h2 className="font-semibold text-lg">
          {descriptionHeading(record.type)}
        </h2>

        <p className="whitespace-pre-wrap text-gray-700">
          {descriptionText || "No description was captured for this record."}
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
          value={toDateInput(investigation.investigationDate)}
          onChange={(e) => onChange("investigationDate", e.target.value)}
        />
      </div>

      {/* ROOT CAUSE ANALYSIS */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-4 text-gray-700">
        <h2 className="font-semibold text-lg">Root Cause Analysis</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Immediate Cause"
          value={investigation.immediateCause || ""}
          onChange={(e) => onChange("immediateCause", e.target.value)}
        />

        {/* 5 WHY TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-gray-900">
            <thead>
              <tr className="bg-[#b4c6e7] text-black">
                <th className="border border-gray-800 p-2 w-24">Why</th>
                <th className="border border-gray-800 p-2">
                  Investigation question
                </th>
                <th className="border border-gray-800 p-2">Finding</th>
              </tr>
            </thead>

            <tbody>
              {whys.map((why, index) => (
                <tr key={index} className="align-top">
                  <td className="border border-gray-800 p-2">
                    Why {index + 1}
                  </td>

                  <td className="border border-gray-800 p-0">
                    <textarea
                      className="w-full p-2 min-h-[48px] bg-transparent focus:outline-none focus:bg-blue-50"
                      value={why.question}
                      onChange={(e) =>
                        updateWhy(index, { question: e.target.value })
                      }
                    />
                  </td>

                  <td className="border border-gray-800 p-0">
                    <textarea
                      className="w-full p-2 min-h-[48px] bg-transparent focus:outline-none focus:bg-blue-50"
                      value={why.finding}
                      onChange={(e) =>
                        updateWhy(index, { finding: e.target.value })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IDENTIFIED ROOT CAUSE */}
        <div className="border border-gray-800">
          <div className="border-b border-gray-800 px-3 py-2 font-bold text-[#1f3864]">
            Identified Root Cause
          </div>
          <textarea
            className="w-full p-3 min-h-[90px] bg-transparent text-gray-900 focus:outline-none focus:bg-blue-50"
            value={investigation.rootCause || ""}
            onChange={(e) => onChange("rootCause", e.target.value)}
          />
        </div>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Contributing Factors"
          value={investigation.contributingFactors || ""}
          onChange={(e) => onChange("contributingFactors", e.target.value)}
        />
      </div>

      {/* DAMAGE TO PROPERTY OR EQUIPMENT */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">
          Damage to Property or Equipment
        </h2>

        <textarea
          className="w-full border p-2 rounded min-h-[100px]"
          placeholder="Describe any damage to property or equipment, or write 'None'"
          value={investigation.propertyDamage || ""}
          onChange={(e) => onChange("propertyDamage", e.target.value)}
        />
      </div>

      {/* CORRECTIVE ACTIONS */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Corrective Actions</h2>

        <ActionsTable
          rows={correctiveRows}
          onChange={(rows) => onChange("correctiveActionItems", rows)}
          placeholder="Corrective action"
          addLabel="+ Add Corrective Action"
        />
      </div>

      {/* PREVENTIVE ACTIONS */}
      <div className="bg-white rounded-xl shadow p-6 mt-6 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Preventive Actions</h2>

        <ActionsTable
          rows={preventiveRows}
          onChange={(rows) => onChange("preventiveActionItems", rows)}
          placeholder="Preventive action"
          addLabel="+ Add Preventive Action"
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
          Save
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