import { useState } from "react";
import { PageLayout } from "../components/page-layout";
import {
  calculateRiskScore,
  calculateRiskRating,
  getRiskRatingColor,
  RiskRating,
} from "../utils/risk-utils";
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

type HazardErrors = {
  hazard?: string;
  risks?: string;
  severity?: string;
  probability?: string;
  controls?: string;
};

/* ---------------- COMPONENT ---------------- */

export function RiskAssessmentBeforeControls({
  data,
  setData,
  onComplete,
}: Props) {
  const [errors, setErrors] = useState<Record<string, HazardErrors>>({});

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
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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

  /* ---------------- VALIDATION ---------------- */

  const validate = (): boolean => {
    const nextErrors: Record<string, HazardErrors> = {};

    for (const hazardItem of data.hazards ?? []) {
      const hazardErrors: HazardErrors = {};

      if (!hazardItem.hazard.trim()) {
        hazardErrors.hazard = "Hazard / Aspect is required.";
      }

      const risks = (hazardItem.risks ?? [""]).filter((r) => r.trim());
      if (risks.length === 0) {
        hazardErrors.risks = "At least one associated risk is required.";
      }

      if (hazardItem.severity === null) {
        hazardErrors.severity = "Severity is required.";
      }

      if (hazardItem.probability === null) {
        hazardErrors.probability = "Probability is required.";
      }

      const controls = (hazardItem.controls ?? []).filter((c) => c.trim());
      if (controls.length === 0) {
        hazardErrors.controls = "At least one control measure is required.";
      }

      if (Object.keys(hazardErrors).length > 0) {
        nextErrors[hazardItem.id] = hazardErrors;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete(data);
    }
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
          const hazardErrors = errors[hazardItem.id] ?? {};

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
                  What is the Hazard and / or Aspect *
                </label>
                <textarea
                  value={hazardItem.hazard}
                  onChange={(e) =>
                    updateHazard(hazardItem.id, {
                      hazard: e.target.value,
                    })
                  }
                  className={`w-full border rounded p-2 text-gray-900 ${
                    hazardErrors.hazard ? "border-red-500" : ""
                  }`}
                  rows={2}
                />
                {hazardErrors.hazard && (
                  <p className="text-red-600 text-sm mt-1">
                    {hazardErrors.hazard}
                  </p>
                )}
              </div>

              {/* Risks Section */}
              <div className="space-y-3">
                <label className="font-semibold block text-gray-900">
                  Associated Risks *
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
                      className={`flex-1 border rounded p-2 text-gray-900 ${
                        hazardErrors.risks ? "border-red-500" : ""
                      }`}
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

                {hazardErrors.risks && (
                  <p className="text-red-600 text-sm">
                    {hazardErrors.risks}
                  </p>
                )}

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
                  Consequence (Severity) *
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
                  className={`w-full border rounded p-2 text-gray-900 ${
                    hazardErrors.severity ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select severity</option>
                  <option value={1}>1 – Noticeable</option>
                  <option value={2}>2 – Important</option>
                  <option value={3}>3 – Serious</option>
                  <option value={4}>4 – Very Serious</option>
                  <option value={5}>5 – Disaster</option>
                </select>
                {hazardErrors.severity && (
                  <p className="text-red-600 text-sm mt-1">
                    {hazardErrors.severity}
                  </p>
                )}
              </div>

              {/* Probability */}
              <div>
                <label className="font-semibold block mb-1 text-gray-900">
                  Exposure (Probability) *
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
                  className={`w-full border rounded p-2 text-gray-900 ${
                    hazardErrors.probability ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select probability</option>
                  <option value={1}>1 – Conceivable</option>
                  <option value={2}>2 – Remotely possible</option>
                  <option value={3}>3 – Unusual but possible</option>
                  <option value={4}>4 – Likely</option>
                  <option value={5}>5 – Almost certain</option>
                </select>
                {hazardErrors.probability && (
                  <p className="text-red-600 text-sm mt-1">
                    {hazardErrors.probability}
                  </p>
                )}
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
                  Existing Control Measures *
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
                      className={`flex-1 border rounded p-2 ${
                        hazardErrors.controls ? "border-red-500" : ""
                      }`}
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

                {hazardErrors.controls && (
                  <p className="text-red-600 text-sm">
                    {hazardErrors.controls}
                  </p>
                )}

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
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </PageLayout>
  );
}