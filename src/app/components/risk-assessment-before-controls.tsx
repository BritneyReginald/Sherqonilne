import { useEffect, useState } from "react";

type BeforeControlsData = {
  hazard: string;
  consequence: string;
  severity: number | null;
  probability: number | null;
  controls: string;
  score: number;
  rating: string;
};

type Props = {
  data: BeforeControlsData;
  setData: React.Dispatch<React.SetStateAction<BeforeControlsData>>;
  onComplete: (data: BeforeControlsData) => void;
};

export function RiskAssessmentBeforeControls({
  data,
  setData,
  onComplete,
}: Props) {
  const [riskScore, setRiskScore] = useState<number>(data.score);
  const [riskRating, setRiskRating] = useState<string>(data.rating);

  /* ---------------- Risk Calculations ---------------- */
  useEffect(() => {
    if (data.severity && data.probability) {
      const score = data.severity * data.probability;
      setRiskScore(score);
      setRiskRating(getRiskRating(score));
    } else {
      setRiskScore(0);
      setRiskRating("");
    }
  }, [data.severity, data.probability]);

  const getRiskRating = (score: number) => {
    if (score === 25) return "Critical";
    if (score >= 15) return "High Risk";
    if (score >= 12) return "Substantial Risk";
    if (score >= 4) return "Possible Risk";
    return "Low Risk";
  };

  const getRatingColor = () => {
    switch (riskRating) {
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Risk Assessment – Before Controls
      </h1>

      {/* 1. Hazard */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          1. Hazard / Aspect
        </label>
        <textarea
          value={data.hazard}
          onChange={(e) => setData({ ...data, hazard: e.target.value })}
          className="w-full border rounded p-2 text-gray-900"
          rows={2}
        />
      </div>

      {/* 2. Consequence */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          2. Possible Consequences
        </label>
        <textarea
          value={data.consequence}
          onChange={(e) => setData({ ...data, consequence: e.target.value })}
          className="w-full border rounded p-2 text-gray-900"
          rows={2}
        />
      </div>

      {/* 3. Severity */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          3. Consequence (Severity)
        </label>
        <select
          value={data.severity ?? ""}
          onChange={(e) =>
            setData({ ...data, severity: Number(e.target.value) })
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

      {/* 4. Probability */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          4. Exposure (Probability)
        </label>
        <select
          value={data.probability ?? ""}
          onChange={(e) =>
            setData({ ...data, probability: Number(e.target.value) })
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

      {/* 5. Risk Score */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          5. Risk Score (Severity × Probability)
        </label>
        <input
          value={riskScore || ""}
          readOnly
          className="w-full border rounded p-2 bg-gray-100 text-gray-900"
        />
      </div>

      {/* 6. Risk Rating (COLOURED – unchanged position) */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          6. Risk Rating
        </label>
        <div
          className={`p-3 rounded font-semibold text-center ${getRatingColor()}`}
        >
          {riskRating || "Not calculated"}
        </div>
      </div>

      {/* 7. Existing Controls */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          7. Existing Control Measures
        </label>
        <textarea
          value={data.controls}
          onChange={(e) => setData({ ...data, controls: e.target.value })}
          className="w-full border rounded p-2 text-gray-900"
          rows={3}
        />
      </div>

      {/* Continue */}
      <button
        onClick={() =>
          onComplete({
            ...data,
            score: riskScore,
            rating: riskRating,
          })
        }
        disabled={!data.severity || !data.probability}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
