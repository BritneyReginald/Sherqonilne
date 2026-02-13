import React from "react";
import { PageLayout } from "../components/page-layout";
import {
  BeforeControlsData,
  AfterControlsData,
  DetailsData,
} from "./new-risk-assessment";
import {
  calculateRiskScore,
  calculateRiskRating,
} from "@/app/utils/risk-utils";

interface RiskAssessmentTableProps {
  beforeControls: BeforeControlsData;
  afterControls: AfterControlsData | null;
  details: DetailsData;
  onBack: () => void;
  onGenerate: () => void;
}

export const RiskAssessmentTable: React.FC<
  RiskAssessmentTableProps
> = ({
  beforeControls,
  afterControls,
  details,
  onBack,
  onGenerate,
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

  const hazards = beforeControls?.hazards ?? [];

  return (
    <PageLayout
      title="Risk Assessment Report"
      description="Summary of risk assessment before and after controls."
    >
      {/* ===== Header Section ===== */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 space-y-4 text-gray-900">
        <div>
          <h2 className="text-lg font-semibold">Task / Activity</h2>
          <p>{details.taskDescription || "-"}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Persons Conducting Risk Assessment
          </h2>
          <p>{details.assessors.filter(Boolean).join(", ") || "-"}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Assessment Date</h2>
          <p>{details.assessmentDate || "-"}</p>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm text-gray-900">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Task Assessment ID</th>
              <th className="border p-2">Hazard</th>
              <th className="border p-2">Severity (Before)</th>
              <th className="border p-2">Probability (Before)</th>
              <th className="border p-2">Score (Before)</th>
              <th className="border p-2">Rating (Before)</th>
              <th className="border p-2">Controls</th>
              <th className="border p-2">Severity (After)</th>
              <th className="border p-2">Probability (After)</th>
              <th className="border p-2">Score (After)</th>
              <th className="border p-2">Rating (After)</th>
            </tr>
          </thead>

          <tbody>
            {hazards.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center p-4 text-gray-900">
                  No risk assessments available.
                </td>
              </tr>
            ) : (
              hazards.map((hazard, index) => {
                /* ---------- BEFORE ---------- */
                const beforeScore = calculateRiskScore(
                  hazard.severity,
                  hazard.probability
                );

                const beforeRating = beforeScore
                  ? calculateRiskRating(beforeScore)
                  : "";

                /* ---------- AFTER ---------- */
                const afterHazard = afterControls?.hazards?.find(
                  (h) => h.id === hazard.id
                );

                const afterScore =
                  afterHazard?.severity && afterHazard?.probability
                    ? calculateRiskScore(
                        afterHazard.severity,
                        afterHazard.probability
                      )
                    : 0;

                const afterRating = afterScore
                  ? calculateRiskRating(afterScore)
                  : "";

                return (
                  <tr key={hazard.id}>
                    {/* Task Assessment ID */}
                    <td className="border p-2 text-center font-semibold text-white">
                      {index + 1}
                    </td>

                    <td className="border p-2 text-white">
                      {hazard.hazard || "-"}
                    </td>

                    <td className="border p-2 text-center text-white">
                      {hazard.severity ?? "-"}
                    </td>

                    <td className="border p-2 text-center text-white">
                      {hazard.probability ?? "-"}
                    </td>

                    <td className="border p-2 text-center text-white">
                      {beforeScore || "-"}
                    </td>

                    <td
                      className={`border p-2 text-center font-semibold ${ratingClass(
                        beforeRating
                      )}`}
                    >
                      {beforeRating || "-"}
                    </td>

                    <td className="border p-2 text-white">
                      {hazard.controls?.join(", ") || "-"}
                    </td>

                    <td className="border p-2 text-center text-white">
                      {afterHazard?.severity ?? "-"}
                    </td>

                    <td className="border p-2 text-center text-white">
                      {afterHazard?.probability ?? "-"}
                    </td>

                    <td className="border p-2 text-center text-white">
                      {afterScore || "-"}
                    </td>

                    <td
                      className={`border p-2 text-center font-semibold ${ratingClass(
                        afterRating
                      )}`}
                    >
                      {afterRating || "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Buttons ===== */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Back
        </button>

        <button
          onClick={onGenerate}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Risk Assessment
        </button>
      </div>
    </PageLayout>
  );
};
