import { IncidentRecord } from "./types";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { useRef } from "react";

type Props = {
  record: IncidentRecord;
  onBack: () => void;
};

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

  return (
    <div
  ref={pdfRef}
  className="bg-white min-h-screen p-8 text-black"
>
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

      {/* REPORT TABLE */}
      {/* CONDITIONAL PDF LAYOUT */}
      {record.type === "injury" ? (
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

                <td className="border border-black p-2"></td>

                <td className="border border-black bg-orange-100 font-bold p-2">
                  Site:
                </td>

                <td className="border border-black p-2"></td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Date of incident:
                </td>

                <td className="border border-black p-2">
                  {new Date(record.id).toLocaleDateString()}
                </td>

                <td className="border border-black bg-orange-100 font-bold p-2">
                  Time of incident:
                </td>

                <td className="border border-black p-2">
                  {new Date(record.id).toLocaleTimeString()}
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

                <td className="border border-black p-2">INJ-{record.id}</td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2">
                  Employee Name
                </td>

                <td className="border border-black p-2">{record.title}</td>

                <td className="border border-black bg-orange-100 font-bold p-2">
                  Employee Co. No.
                </td>

                <td className="border border-black p-2">EMP-001</td>
              </tr>

              <tr>
                <td className="border border-black bg-orange-100 font-bold p-2 align-top h-32">
                  Detail Description of Injury
                </td>

                <td colSpan={3} className="border border-black p-3 align-top">
                  {record.description}
                </td>
              </tr>

              {/* BODY PART */}
              <tr>
                <td
                  colSpan={4}
                  className="border border-black bg-orange-100 text-center font-bold p-2"
                >
                  Body Part Injured
                </td>
              </tr>

              <tr>
                <td className="border border-black p-2">Other</td>
                <td className="border border-black p-2">Head or Neck</td>
                <td className="border border-black p-2">Eye</td>
                <td className="border border-black p-2">Trunk</td>
              </tr>

              <tr>
                <td className="border border-black p-2">Finger</td>
                <td className="border border-black p-2">Hand</td>
                <td className="border border-black p-2">Torso</td>
                <td className="border border-black p-2">Arm</td>
              </tr>

              <tr>
                <td className="border border-black p-2">Foot</td>
                <td className="border border-black p-2">Leg</td>
                <td className="border border-black p-2">Internal</td>
                <td className="border border-black p-2">Multiple</td>
              </tr>

              {/* EFFECT */}
              <tr>
                <td
                  colSpan={4}
                  className="border border-black bg-orange-100 text-center font-bold p-2"
                >
                  Effect on Person
                </td>
              </tr>

              <tr>
                <td className="border border-black p-2">
                  Cuts and lacerations
                </td>

                <td className="border border-black p-2">Sprains or strains</td>

                <td className="border border-black p-2">Contusion or wounds</td>

                <td className="border border-black p-2">Fractures</td>
              </tr>

              <tr>
                <td className="border border-black p-2">Burns</td>
                <td className="border border-black p-2">Amputation</td>
                <td className="border border-black p-2">
                  Repetitive strain injuries
                </td>

                <td className="border border-black p-2">Electric shock</td>
              </tr>

              <tr>
                <td className="border border-black p-2">Asphyxiation</td>

                <td className="border border-black p-2">Unconsciousness</td>

                <td className="border border-black p-2">Poisoning</td>

                <td className="border border-black p-2">
                  Occupational Disease
                </td>
              </tr>

              {/* DISABLEMENT */}
              <tr>
                <td
                  colSpan={4}
                  className="border border-black bg-orange-100 text-center font-bold p-2"
                >
                  Expected period of disablement
                </td>
              </tr>

              <tr>
                <td className="border border-black p-2">0-13 days</td>

                <td className="border border-black p-2">2-4 weeks</td>

                <td className="border border-black p-2">{">"}4-16 weeks</td>

                <td className="border border-black p-2">{">"}16-52 weeks</td>
              </tr>

              <tr>
                <td className="border border-black p-2">
                  {">"}52 weeks or permanent disablement
                </td>

                <td className="border border-black p-2">Killed</td>

                <td className="border border-black p-2"></td>

                <td className="border border-black p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
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

                <td className="border border-black p-3">Mining Division</td>

                <td className="border border-black font-bold p-3 bg-orange-100">
                  Site:
                </td>

                <td className="border border-black p-3">Main Site</td>
              </tr>

              <tr>
                <td className="border border-black font-bold p-3 bg-orange-100">
                  Date of Incident:
                </td>

                <td className="border border-black p-3">
                  {new Date(record.id).toLocaleDateString()}
                </td>

                <td className="border border-black font-bold p-3 bg-orange-100">
                  Time of Incident:
                </td>

                <td className="border border-black p-3">
                  {new Date(record.id).toLocaleTimeString()}
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

                <td className="border border-black p-3">INC-{record.id}</td>
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
                  {record.investigation.correctiveActions}
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
