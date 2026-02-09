import React from "react";

interface BeforeControlsData {
  hazard: string;
  consequence: string;
  severity: number | null;
  probability: number | null;
  controls: string;
  score: number;
  rating: string;
}

interface AfterControlsData {
  severity: number | null;
  probability: number | null;
  score: number;
  rating: string;
}

interface DetailsData {
  taskDescription: string;
  assessors: string[];
  assessmentDate: string;
}

interface RiskAssessmentTableProps {
  beforeControls: BeforeControlsData;
  afterControls: AfterControlsData;
  details: DetailsData;
}

export const RiskAssessmentTable: React.FC<RiskAssessmentTableProps> = ({
  beforeControls,
  afterControls,
  details,
}) => {
  const ratingClass = (rating: string) => {
    switch (rating) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High Risk":
        return "bg-orange-500 text-white";
      case "Substantial Risk":
        return "bg-yellow-400 text-black";
      case "Possible Risk":
        return "bg-blue-400 text-white";
      case "Low Risk":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-gray-700">Task / Activity</th>
            <th className="border p-2 text-gray-700">Hazard / Aspect</th>
            <th className="border p-2 text-gray-700">Consequences</th>
            <th className="border p-2 text-gray-700">Severity (Before)</th>
            <th className="border p-2 text-gray-700">Probability (Before)</th>
            <th className="border p-2 text-gray-700">Risk Score (Before)</th>
            <th className="border p-2 text-gray-700">Risk Rating (Before)</th>
            <th className="border p-2 text-gray-700">Existing Controls</th>
            <th className="border p-2 text-gray-700">Severity (After)</th>
            <th className="border p-2 text-gray-700">Probability (After)</th>
            <th className="border p-2 text-gray-700">Risk Score (After)</th>
            <th className="border p-2 text-gray-700">Risk Rating (After)</th>
            <th className="border p-2 text-gray-700">Assessors</th>
            <th className="border p-2 text-gray-700">Assessment Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 text-gray-700">{details.taskDescription || "-"}</td>
            <td className="border p-2 text-gray-700">{beforeControls.hazard || "-"}</td>
            <td className="border p-2 text-gray-700">{beforeControls.consequence || "-"}</td>
            <td className="border p-2 text-center text-gray-700">
              {beforeControls.severity ?? "-"}
            </td>
            <td className="border p-2 text-center text-gray-700">
              {beforeControls.probability ?? "-"}
            </td>
            <td className="border p-2 text-center text-gray-700">{beforeControls.score ?? "-"}</td>
            <td
              className={`border p-2 text-center font-semibold  ${ratingClass(
                beforeControls.rating
              )}`}
            >
              {beforeControls.rating || "-"}
            </td>
            <td className="border p-2 text-gray-700">{beforeControls.controls || "-"}</td>
            <td className="border p-2 text-center text-gray-700">{afterControls.severity ?? "-"}</td>
            <td className="border p-2 text-center text-gray-700">
              {afterControls.probability ?? "-"}
            </td>
            <td className="border p-2 text-center text-gray-700">{afterControls.score ?? "-"}</td>
            <td
              className={`border p-2 text-center font-semibold text-gray-700 ${ratingClass(
                afterControls.rating
              )}`}
            >
              {afterControls.rating || "-"}
            </td>
            <td className="border p-2 text-gray-700">
              {details.assessors.filter(Boolean).join(", ") || "-"}
            </td>
            <td className="border p-2 text-gray-700">{details.assessmentDate || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
