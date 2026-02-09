import { useEffect, useState } from "react";

type Props = {
  onNext: () => void;
};

export function RiskAssessmentBeforeControls({ onNext }: Props) {
  const [hazard, setHazard] = useState("");
  const [consequence, setConsequence] = useState("");
  const [severity, setSeverity] = useState<number | null>(null);
  const [probability, setProbability] = useState<number | null>(null);
  const [controls, setControls] = useState("");

  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskRating, setRiskRating] = useState("");

  /* ---------------- Risk Calculations ---------------- */
  useEffect(() => {
    if (severity != null && probability != null) {
      const score = severity * probability;
      setRiskScore(score);
      setRiskRating(getRiskRating(score));
    } else {
      setRiskScore(0);
      setRiskRating("");
    }
  }, [severity, probability]);

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

      {/* Hazard */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          1. What is the hazard / aspect?
        </label>
        <textarea
          value={hazard}
          onChange={(e) => setHazard(e.target.value)}
          className="w-full border rounded p-2 text-gray-900"
          rows={2}
        />
      </div>

      {/* Consequence */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          2. What are the possible consequences?
        </label>
        <textarea
          value={consequence}
          onChange={(e) => setConsequence(e.target.value)}
          className="w-full border rounded p-2 text-gray-900"
          rows={2}
        />
      </div>

      {/* Severity */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          3. Severity (Consequence rating)
        </label>
        <select
          value={severity ?? ""}
          onChange={(e) =>
            setSeverity(e.target.value ? Number(e.target.value) : null)
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
          4. Exposure (Probability)
        </label>
        <select
          value={probability ?? ""}
          onChange={(e) =>
            setProbability(e.target.value ? Number(e.target.value) : null)
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

      {/* Risk Score */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          5. Risk Score (Severity × Probability)
        </label>
        <input
          type="text"
          value={riskScore || ""}
          readOnly
          className="w-full border rounded p-2 bg-gray-100 text-gray-900"
        />
      </div>

      {/* Risk Rating */}
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

      {/* Existing Controls */}
      <div>
        <label className="font-semibold block mb-1 text-gray-900">
          7. Existing control measures
        </label>
        <textarea
          value={controls}
          onChange={(e) => setControls(e.target.value)}
          className="w-full border rounded p-2 text-gray-900"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={severity == null || probability == null}
          className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Proceed to After Controls
        </button>
      </div>
    </div>
  );
}
