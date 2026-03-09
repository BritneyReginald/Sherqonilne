import { PageLayout } from "../components/page-layout";
import {
  calculateRiskScore,
  calculateRiskRating,
  getRiskRatingColor,
  RiskRating,
} from "@/app/utils/risk-utils";
import { Plus, Trash2 } from "lucide-react";

/* ---------------- TYPES ---------------- */

type HazardItem = {
  id: string;
  hazard: string;
  risks?: string[]; // ✅ optional (important)
  severity: number | null;
  probability: number | null;
  controls: string[];
};

type BeforeControlsData = {
  hazards: HazardItem[];
};

type Props = {
  data: BeforeControlsData;
  setData: React.Dispatch<React.SetStateAction<BeforeControlsData>>;
  onComplete: (data: BeforeControlsData) => void;
};

/* ---------------- COMPONENT ---------------- */

export function RiskAssessmentBeforeControls({
  data,
  setData,
  onComplete,
}: Props) {
  /* ---------------- HELPERS ---------------- */

  const addHazard = () => {
    setData((prev) => ({
      hazards: [
        ...prev.hazards,
        {
          id: crypto.randomUUID(),
          hazard: "",
          risks: [""], // initialize
          severity: null,
          probability: null,
          controls: [""],
        },
      ],
    }));
  };

  const removeHazard = (id: string) => {
    setData((prev) => ({
      hazards: prev.hazards.filter((h) => h.id !== id),
    }));
  };

  const updateHazard = (id: string, updated: Partial<HazardItem>) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === id ? { ...h, ...updated } : h
      ),
    }));
  };

  /* ---------------- RISK HELPERS ---------------- */

  const addRisk = (hazardId: string) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === hazardId
          ? {
              ...h,
              risks: [...(h.risks ?? [""]), ""],
            }
          : h
      ),
    }));
  };

  const updateRisk = (
    hazardId: string,
    index: number,
    value: string
  ) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === hazardId
          ? {
              ...h,
              risks: (h.risks ?? [""]).map((r, i) =>
                i === index ? value : r
              ),
            }
          : h
      ),
    }));
  };

  const removeRisk = (hazardId: string, index: number) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === hazardId
          ? {
              ...h,
              risks: (h.risks ?? [""]).filter((_, i) => i !== index),
            }
          : h
      ),
    }));
  };

  /* ---------------- CONTROL HELPERS ---------------- */

  const addControl = (hazardId: string) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === hazardId
          ? { ...h, controls: [...h.controls, ""] }
          : h
      ),
    }));
  };

  const updateControl = (
    hazardId: string,
    index: number,
    value: string
  ) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === hazardId
          ? {
              ...h,
              controls: h.controls.map((c, i) =>
                i === index ? value : c
              ),
            }
          : h
      ),
    }));
  };

  const removeControl = (hazardId: string, index: number) => {
    setData((prev) => ({
      hazards: prev.hazards.map((h) =>
        h.id === hazardId
          ? {
              ...h,
              controls: h.controls.filter((_, i) => i !== index),
            }
          : h
      ),
    }));
  };

  /* ---------------- RENDER ---------------- */

  return (
    <PageLayout
      title="Risk Assessment – Before Controls"
      description="Identify hazards, associated risks, calculate initial risk scores, and record existing control measures."
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

          const risks = hazardItem.risks ?? [""]; // ✅ SAFE fallback

          return (
            <div
              key={hazardItem.id}
              className="bg-white rounded-xl shadow p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hazard {index + 1}
                </h2>

                {data.hazards.length > 1 && (
                  <button
                    onClick={() => removeHazard(hazardItem.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Hazard Description */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  What is the Hazard and / or Aspect
                </label>
                <textarea
                  value={hazardItem.hazard}
                  onChange={(e) =>
                    updateHazard(hazardItem.id, {
                      hazard: e.target.value,
                    })
                  }
                  className="w-full border rounded p-2 text-gray-900"
                  rows={2}
                />
              </div>

              {/* Risks Section */}
              <div className="space-y-3">
                <label className="font-semibold block text-gray-900">
                  Associated Risks
                </label>

                {risks.map((risk, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea
                      value={risk}
                      onChange={(e) =>
                        updateRisk(
                          hazardItem.id,
                          i,
                          e.target.value
                        )
                      }
                      className="flex-1 border rounded p-2 text-gray-900"
                      rows={2}
                    />
                    {risks.length > 1 && (
                      <button
                        onClick={() =>
                          removeRisk(hazardItem.id, i)
                        }
                        className="text-red-600 mt-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addRisk(hazardItem.id)}
                  className="flex items-center gap-2 text-blue-600"
                >
                  <Plus size={16} />
                  Add Another Risk
                </button>
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

              {/* Controls */}
              <div className="space-y-3">
                <label className="font-semibold block text-gray-900">
                  Existing Control Measures
                </label>

                {hazardItem.controls.map((control, i) => (
                  <div key={i} className="flex gap-2 items-start text-gray-900">
                    <textarea
                      value={control}
                      onChange={(e) =>
                        updateControl(
                          hazardItem.id,
                          i,
                          e.target.value
                        )
                      }
                      className="flex-1 border rounded p-2"
                      rows={2}
                    />
                    {hazardItem.controls.length > 1 && (
                      <button
                        onClick={() =>
                          removeControl(hazardItem.id, i)
                        }
                        className="text-red-600 mt-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addControl(hazardItem.id)}
                  className="flex items-center gap-2 text-blue-600"
                >
                  <Plus size={16} />
                  Add Control
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={addHazard}
          className="flex items-center gap-2 text-blue-600 font-semibold"
        >
          <Plus size={18} />
          Add Another Hazard
        </button>

        <button
          onClick={() => onComplete(data)}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </PageLayout>
  );
}
