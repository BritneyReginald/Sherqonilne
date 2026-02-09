import { useMemo } from "react";

interface AfterControlsProps {
  severity: number | null;
  probability: number | null;
  onChange: (data: {
    severity: number;
    probability: number;
    score: number;
    rating: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const getRiskRating = (score: number) => {
  if (score === 25) return "Critical";
  if (score >= 15) return "High Risk";
  if (score >= 12) return "Substantial Risk";
  if (score >= 4) return "Possible Risk";
  return "Low Risk";
};

export function RiskAssessmentAfterControls({
  severity,
  probability,
  onChange,
  onNext,
  onBack,
}: AfterControlsProps) {
  const score = useMemo(() => {
    if (!severity || !probability) return 0;
    return severity * probability;
  }, [severity, probability]);

  const rating = useMemo(() => {
    if (!score) return "";
    return getRiskRating(score);
  }, [score]);

  const handleSeverityChange = (value: number) => {
    onChange({
      severity: value,
      probability: probability ?? 0,
      score: value * (probability ?? 0),
      rating: getRiskRating(value * (probability ?? 0)),
    });
  };

  const handleProbabilityChange = (value: number) => {
    onChange({
      severity: severity ?? 0,
      probability: value,
      score: (severity ?? 0) * value,
      rating: getRiskRating((severity ?? 0) * value),
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">
        Risk Assessment After Controls
      </h1>

      <p className="text-gray-600 mb-6 text-gray-900">
        Re-evaluate the risk after all control measures have been implemented.
      </p>

      {/* Severity */}
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-900">
          Consequence / Severity (After Controls)
        </label>
        <select
          value={severity ?? ""}
          onChange={(e) => handleSeverityChange(Number(e.target.value))}
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
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-900">
          Exposure / Probability (After Controls)
        </label>
        <select
          value={probability ?? ""}
          onChange={(e) => handleProbabilityChange(Number(e.target.value))}
          className="w-full border rounded p-2 text-gray-900"
        >
          <option value="">Select probability</option>
          <option value={1}>1 – Conceivable</option>
          <option value={2}>2 – Remotely Possible</option>
          <option value={3}>3 – Unusual but Possible</option>
          <option value={4}>4 – Likely</option>
          <option value={5}>5 – Almost Certain</option>
        </select>
      </div>

      {/* Calculated Risk Score */}
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-900">
          Risk Score (Calculated)
        </label>
        <input
          value={score || ""}
          readOnly
          className="w-full border rounded p-2 bg-gray-100 text-gray-900"
        />
      </div>

      {/* Calculated Risk Rating */}
      <div className="mb-6">
        <label className="block font-medium mb-1 text-gray-900">
          Risk Rating (Calculated)
        </label>
        <input
          value={rating}
          readOnly
          className="w-full border rounded p-2 bg-gray-100 font-semibold text-gray-900"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!severity || !probability}
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-gray-900"
        >
          Continue to Summary
        </button>
      </div>
    </div>
  );
}
