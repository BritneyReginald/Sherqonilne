import { IncidentRecord, FirstAidEntryRecord } from "./types";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { useRef } from "react";

type Props = {
  record: IncidentRecord;
  onBack: () => void;
};

const refNumber = (record: IncidentRecord) => {
  const prefix =
    record.type === "ncr" ? "NCR" : record.type === "injury" ? "INJ" : "INC";
  return `${prefix}-${String(record.id).padStart(4, "0")}`;
};

const reportTitle = (record: IncidentRecord) => {
  if (record.type === "ncr") return "Non-Conformance Report";
  if (record.type === "injury") {
    return record.injuryType === "firstAid"
      ? "First Aid Case Dressing Log"
      : "Injury Report";
  }
  return "Incident Report";
};

// Normalizes for comparison: case-insensitive, collapses en/em dashes
// to a plain hyphen, collapses whitespace. Lets "0–13 Days" (form)
// match "0-13 days" (display label) without being fragile about exact
// punctuation/casing.
const normalize = (value?: string) =>
  (value || "").toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();

const isMatch = (selected?: string, option?: string) =>
  !!option && !!selected && normalize(selected) === normalize(option);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
};

const OptionCell = ({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) => (
  <td className="border border-black p-2 align-top">
    <span className="inline-flex items-start gap-2">
      <span
        className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 shrink-0 border border-black text-[10px] leading-none ${
          checked ? "bg-black text-white" : "bg-white"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span className={checked ? "font-semibold" : ""}>{label}</span>
    </span>
  </td>
);

const BODY_PARTS = [
  ["Head or Neck", "Eye", "Trunk"],
  ["Finger", "Hand", "Torso", "Arm"],
  ["Foot", "Leg", "Internal", "Multiple"],
];

const EFFECTS = [
  [
    "Cuts and Lacerations",
    "Sprains or Strains",
    "Contusion or Wounds",
    "Fractures",
  ],
  ["Burns", "Amputation", "Repetitive Strain Injuries", "Electric Shock"],
  ["Asphyxiation", "Unconsciousness", "Poisoning", "Occupational Disease"],
];

// Matches InjuryForm's actual <select> options for disablement.
const DISABLEMENTS = [
  ["0–13 Days", ">4–16 Weeks"],
  [">16–52 Weeks / Permanent", "Killed"],
];

// One treatment record within a First Aid log, laid out for print:
// the entry's details as a small table, then the first aider's
// sign-off underneath. Signature is shown whenever the backend
// returned one for this entry — text confirmation always shows,
// the image renders alongside it when present.
const FirstAidEntryBlock = ({
  entry,
  index,
}: {
  entry: FirstAidEntryRecord;
  index: number;
}) => (
  <div className="border border-black mb-6 break-inside-avoid">
    <div className="bg-orange-500 text-white font-bold px-3 py-2">
      Treatment Record {index + 1}
    </div>

    <table className="w-full border-collapse text-sm">
      <tbody>
        <tr>
          <td className="border border-black bg-gray-100 font-bold p-2 w-1/4">
            Employee
          </td>
          <td className="border border-black p-2">
            {entry.employeeName || "-"}
          </td>
          <td className="border border-black bg-gray-100 font-bold p-2 w-1/4">
            Employee No.
          </td>
          <td className="border border-black p-2">
            {entry.employeeNumber || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black bg-gray-100 font-bold p-2">
            Date
          </td>
          <td className="border border-black p-2">{formatDate(entry.date)}</td>
          <td className="border border-black bg-gray-100 font-bold p-2">
            Time
          </td>
          <td className="border border-black p-2">{entry.time || "-"}</td>
        </tr>

        <tr>
          <td className="border border-black bg-gray-100 font-bold p-2 align-top">
            Nature of Injury
          </td>
          <td colSpan={3} className="border border-black p-2 align-top">
            {entry.injury || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black bg-gray-100 font-bold p-2 align-top">
            Treatment Used
          </td>
          <td colSpan={3} className="border border-black p-2 align-top">
            {entry.treatment || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black bg-gray-100 font-bold p-2 align-top">
            Comments
          </td>
          <td colSpan={3} className="border border-black p-2 align-top">
            {entry.comments || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black bg-gray-100 font-bold p-2">
            Further Medical Attention
          </td>
          <td className="border border-black p-2">
            {entry.furtherMedicalAttention ? "Yes" : "No"}
          </td>
          <td className="border border-black bg-gray-100 font-bold p-2">
            Status
          </td>
          <td className="border border-black p-2">{entry.status || "-"}</td>
        </tr>
      </tbody>
    </table>

    {/* SIGN-OFF — each entry is signed by whichever first aider was
        logged in when they treated that specific case, so this sits
        per-entry rather than once at the bottom of the whole log. */}
    <div className="border-t border-black p-3">
      <p className="text-xs font-bold uppercase text-gray-600 mb-1">
        First Aider Sign-off
      </p>

      {entry.firstAiderSignature ? (
        <div className="flex items-center gap-4">
          <div className="text-sm">
            Signed by{" "}
            <span className="font-semibold">
              {entry.firstAiderSignature.signedBy}
            </span>{" "}
            on {formatDateTime(entry.firstAiderSignature.signedAt)}
          </div>
          <img
            src={entry.firstAiderSignature.signature}
            alt={`Signature of ${entry.firstAiderSignature.signedBy}`}
            className="h-14 border border-gray-300 bg-white"
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          {entry.firstAider
            ? `${entry.firstAider} — not yet signed`
            : "Not yet signed"}
        </p>
      )}
    </div>
  </div>
);

export const PDFView = ({ record, onBack }: Props) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    const element = pdfRef.current;
    if (!element) return;

    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `${record.type}-${record.id}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
      })
      .save();
  };

  // A flat body part list (all rows joined) is used to find a match;
  // if the saved value isn't one of the fixed options, treat it as a
  // typed-in "Other" value (that's what InjuryForm actually stores
  // when "Other" is picked — see addRecord's bodyPart mapping).
  const flatBodyParts = BODY_PARTS.flat();
  const matchedBodyPart = flatBodyParts.find((opt) =>
    isMatch(record.bodyPart, opt),
  );
  const otherBodyPartValue =
    !matchedBodyPart && record.bodyPart ? record.bodyPart : undefined;

  const generatedAt = new Date();
  const isFirstAid = record.type === "injury" && record.injuryType === "firstAid";

  return (
    <div ref={pdfRef} className="bg-white min-h-screen p-8 text-black">
      {/* ACTION BUTTONS */}
      <div className="flex justify-between mb-6 print:hidden">
        <button onClick={onBack} className="bg-gray-200 px-4 py-2 rounded">
          ← Back
        </button>

        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Print / Save PDF
        </button>
      </div>

      {/* HEADER */}
      <div className="mb-6 border-b-2 border-black pb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {reportTitle(record)}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Reference:{" "}
            <span className="font-semibold text-black">
              {refNumber(record)}
            </span>
            {record.site && (
              <>
                {" "}
                · Site: <span className="font-semibold text-black">{record.site}</span>
              </>
            )}
          </p>
        </div>

        <div className="text-right text-sm text-gray-600">
          <p>
            Status:{" "}
            <span className="font-semibold text-black">{record.status}</span>
          </p>
          <p>
            Generated: {generatedAt.toLocaleDateString()}{" "}
            {generatedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* ================= FIRST AID CASE DRESSING LOG ================= */}
      {isFirstAid ? (
        <div>
          {record.firstAidEntries && record.firstAidEntries.length > 0 ? (
            record.firstAidEntries.map((entry, i) => (
              <FirstAidEntryBlock key={entry.id} entry={entry} index={i} />
            ))
          ) : (
            <div className="border border-black p-4 text-gray-500 italic">
              No treatment records on this log.
            </div>
          )}
        </div>
      ) : record.type === "injury" ? (
        /* ================= HOSPITAL-CASE INJURY ================= */
        <div className="border border-black">
          <div className="bg-orange-500 text-center font-bold text-xl py-3 border-b border-black">
            Details of Incident
          </div>

          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Division:
                </td>
                <td className="border border-black p-2">
                  {record.division || "-"}
                </td>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Site:
                </td>
                <td className="border border-black p-2">
                  {record.site || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Date of incident:
                </td>
                <td className="border border-black p-2">
                  {record.incidentDate
                    ? new Date(record.incidentDate).toLocaleDateString()
                    : new Date(record.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Time of incident:
                </td>
                <td className="border border-black p-2">
                  {record.incidentTime || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Incident Classification
                </td>
                <td className="border border-black p-2">
                  {record.category || "Injury"}
                </td>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Incident Number
                </td>
                <td className="border border-black p-2">{refNumber(record)}</td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Employee Name
                </td>
                <td className="border border-black p-2">
                  {record.employeeName || record.title || "-"}
                </td>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Employee Co. No.
                </td>
                <td className="border border-black p-2">
                  {record.employeeNumber || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2 align-top h-32">
                  Detail Description of Injury
                </td>
                <td colSpan={3} className="border border-black p-3 align-top">
                  {record.description}
                </td>
              </tr>

              <tr>
                <td
                  colSpan={4}
                  className="border border-black bg-orange-100 text-center font-bold p-2"
                >
                  Body Part Injured
                </td>
              </tr>
              {BODY_PARTS.map((row, i) => (
                <tr key={`bodypart-${i}`}>
                  {i === 0 && (
                    <OptionCell
                      label={
                        otherBodyPartValue
                          ? `Other: ${otherBodyPartValue}`
                          : "Other"
                      }
                      checked={!!otherBodyPartValue}
                    />
                  )}
                  {row.map((label) => (
                    <OptionCell
                      key={label}
                      label={label}
                      checked={label === matchedBodyPart}
                    />
                  ))}
                </tr>
              ))}

              <tr>
                <td
                  colSpan={4}
                  className="border border-black bg-orange-100 text-center font-bold p-2"
                >
                  Effect on Person
                </td>
              </tr>
              {EFFECTS.map((row, i) => (
                <tr key={`effect-${i}`}>
                  {row.map((label) => (
                    <OptionCell
                      key={label}
                      label={label}
                      checked={isMatch(record.effect, label)}
                    />
                  ))}
                </tr>
              ))}

              <tr>
                <td
                  colSpan={4}
                  className="border border-black bg-orange-100 text-center font-bold p-2"
                >
                  Expected period of disablement
                </td>
              </tr>
              {DISABLEMENTS.map((row, i) => (
                <tr key={`disablement-${i}`}>
                  {row.map((label) => (
                    <OptionCell
                      key={label}
                      label={label}
                      checked={isMatch(record.disablement, label)}
                    />
                  ))}
                  {/* keep the table 4 columns wide, matching the layout above */}
                  <td className="border border-black p-2" colSpan={2}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ================= INCIDENT / NCR ================= */
        <div className="border border-black">
          <div className="bg-orange-500 text-center font-bold text-xl py-3 border-b border-black">
            Details of Incident
          </div>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Division:
                </td>
                <td className="border border-black p-3">
                  {record.division || "-"}
                </td>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Site:
                </td>
                <td className="border border-black p-3">
                  {record.site || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Date of Incident:
                </td>
                <td className="border border-black p-3">
                  {record.incidentDate
                    ? new Date(record.incidentDate).toLocaleDateString()
                    : new Date(record.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Time of Incident:
                </td>
                <td className="border border-black p-3">
                  {record.incidentTime || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Incident Classification
                </td>
                <td className="border border-black p-3">
                  {record.category || record.type}
                </td>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Incident Number
                </td>
                <td className="border border-black p-3">{refNumber(record)}</td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Detail Description of Incident
                </td>
                <td colSpan={3} className="border border-black p-4">
                  {record.description}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* INVESTIGATION SECTION */}
      {record.investigation && (
        <div className="mt-10 border border-black">
          <div className="bg-gray-200 font-bold text-lg p-3 border-b border-black">
            Investigation Details
          </div>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-black font-bold p-3 w-1/4">
                  Investigator
                </td>
                <td className="border border-black p-3">
                  {record.investigation.investigator}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3">
                  Root Cause
                </td>
                <td className="border border-black p-3">
                  {record.investigation.rootCause}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3">
                  Corrective Actions
                </td>
                <td className="border border-black p-3">
                  {record.investigation.correctiveActions?.filter(Boolean)
                    .length ? (
                    <ul className="list-disc pl-4">
                      {record.investigation.correctiveActions
                        .filter(Boolean)
                        .map((ca, i) => (
                          <li key={i}>{ca}</li>
                        ))}
                    </ul>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3">
                  Responsible Person
                </td>
                <td className="border border-black p-3">
                  {record.investigation.responsiblePerson || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3">Due Date</td>
                <td className="border border-black p-3">
                  {record.investigation.dueDate || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3">
                  Preventive Actions
                </td>
                <td className="border border-black p-3">
                  {record.investigation.preventiveActions}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};