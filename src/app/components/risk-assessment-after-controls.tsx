import { PageLayout } from "../components/page-layout";
import {
  calculateRiskScore,
  calculateRiskRating,
  getRiskRatingColor,
  RiskRating,
} from "@/app/utils/risk-utils";

/* ---------------- TYPES ---------------- */
interface HazardItem {
  id: string;
  hazard: string;
  risks?: string[]; // ✅ optional for backward compatibility
  controls: string[];
  severity: number | null;
  probability: number | null;
}

interface AfterControlsData {
  hazards: HazardItem[];
}

interface Props {
  data: AfterControlsData;
  setData: React.Dispatch<React.SetStateAction<AfterControlsData>>;
  onBack: () => void;
  onNext: () => void;
}

/* ---------------- COMPONENT ---------------- */
export function RiskAssessmentAfterControls({
  data,
  setData,
  onBack,
  onNext,
}: Props) {
  const updateHazard = (id: string, updated: Partial<HazardItem>) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === id ? { ...h, ...updated } : h
      ),
    }));
  };

  return (
    <PageLayout
      title="Risk Assessment – After Controls"
      description="Re-assess hazards that were high risk or critical, considering the control measures in place."
    >
      <div className="space-y-8">
        {(data.hazards ?? []).map((hazardItem, index) => {
          const score = calculateRiskScore(
            hazardItem.severity,
            hazardItem.probability
          );

          const rating: RiskRating | "" = score
            ? calculateRiskRating(score)
            : "";

          const risks = hazardItem.risks ?? []; // ✅ safe fallback

          return (
            <div
              key={hazardItem.id}
              className="bg-white rounded-xl shadow p-6 space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Hazard {index + 1}
              </h2>

              {/* Hazard Description */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Hazard / Aspect
                </label>
                <div className="p-2 bg-gray-100 rounded text-gray-900">
                  {hazardItem.hazard}
                </div>
              </div>

              {/* Risks (READ ONLY) */}
              {risks.length > 0 && (
                <div>
                  <label className="font-semibold block mb-1 text-gray-900">
                    Associated Risks
                  </label>
                  <div className="space-y-2">
                    {risks.map((risk, i) => (
                      <div
                        key={i}
                        className="p-2 bg-gray-100 rounded text-gray-900"
                      >
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Controls */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Existing Control Measures
                </label>
                <div className="space-y-2">
                  {hazardItem.controls.map((control, i) => (
                    <div
                      key={i}
                      className="p-2 bg-gray-100 rounded text-gray-900"
                    >
                      {control}
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Consequence (Severity)
                </label>
                <select
                  value={hazardItem.severity ?? ""}
                  onChange={(e) =>
                    updateHazard(hazardItem.id, {
                      severity: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full border rounded p-2 text-gray-900"
                >
                  <option value="">Select severity</option>
                  <option value={1}>1 – Noticeable</option>
                  <option value={2}>2 – Important</option>
                  <option value={3}>3 – Serious</option>
                  <option value={4}>4 – Very Serious</option>
                  <option value={5}>5 – Disaster</option>
                </select>
              </div>

              {/* Probability */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Exposure (Probability)
                </label>
                <select
                  value={hazardItem.probability ?? ""}
                  onChange={(e) =>
                    updateHazard(hazardItem.id, {
                      probability: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full border rounded p-2 text-gray-900"
                >
                  <option value="">Select probability</option>
                  <option value={1}>1 – Conceivable</option>
                  <option value={2}>2 – Remotely possible</option>
                  <option value={3}>3 – Unusual but possible</option>
                  <option value={4}>4 – Likely</option>
                  <option value={5}>5 – Almost certain</option>
                </select>
              </div>

              {/* Score */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Risk Score
                </label>
                <input
                  readOnly
                  value={score || ""}
                  className="w-full border rounded p-2 bg-gray-100 text-gray-900"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Risk Rating
                </label>
                <div
                  className={`p-3 rounded font-semibold text-center ${
                    rating
                      ? getRiskRatingColor(rating)
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {rating || "Not calculated"}
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
