interface RiskAssessmentSummaryProps {
  data: {
    id: number;
    hazard: string;
    before: {
      severity: number;
      probability: number;
      score: number;
      rating: string;
      controls: string;
    };
    after: {
      severity: number;
      probability: number;
      score: number;
      rating: string;
    };
  };
  onBack: () => void;
  onSubmit: () => void;
}

const ratingColor = (rating: string) => {
  switch (rating) {
    case "Critical":
      return "bg-red-200";
    case "High Risk":
      return "bg-orange-200";
    case "Substantial Risk":
      return "bg-yellow-200";
    case "Possible Risk":
      return "bg-blue-100";
    case "Low Risk":
      return "bg-green-200";
    default:
      return "";
  }
};

export function RiskAssessmentSummary({
  data,
  onBack,
  onSubmit,
}: RiskAssessmentSummaryProps) {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Risk Assessment Summary
      </h1>

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th rowSpan={2} className="border p-2 text-gray-900">
              Risk Ass. ID
            </th>
            <th rowSpan={2} className="border p-2 text-gray-900">
              Hazard / Aspect
            </th>
            <th colSpan={4} className="border p-2 text-gray-900">
              Assessment of Risk Before Controls
            </th>
            <th rowSpan={2} className="border p-2 text-gray-900">
              Current Control Measures
            </th>
            <th colSpan={4} className="border p-2 text-gray-900">
              Assessment of Risk After Controls
            </th>
          </tr>
          <tr className="bg-gray-100">
            <th className="border p-2">A<br />Severity</th>
            <th className="border p-2">B<br />Probability</th>
            <th className="border p-2">C<br />Score</th>
            <th className="border p-2">Rating</th>

            <th className="border p-2">A<br />Severity</th>
            <th className="border p-2">B<br />Probability</th>
            <th className="border p-2">C<br />Score</th>
            <th className="border p-2">Rating</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-2 text-center">{data.id}</td>

            <td className="border p-2">{data.hazard}</td>

            {/* Before controls */}
            <td className="border p-2 text-center">
              {data.before.severity}
            </td>
            <td className="border p-2 text-center">
              {data.before.probability}
            </td>
            <td className="border p-2 text-center">
              {data.before.score}
            </td>
            <td
              className={`border p-2 text-center font-semibold ${ratingColor(
                data.before.rating
              )}`}
            >
              {data.before.rating}
            </td>

            <td className="border p-2 whitespace-pre-line">
              {data.before.controls}
            </td>

            {/* After controls */}
            <td className="border p-2 text-center">
              {data.after.severity}
            </td>
            <td className="border p-2 text-center">
              {data.after.probability}
            </td>
            <td className="border p-2 text-center">
              {data.after.score}
            </td>
            <td
              className={`border p-2 text-center font-semibold ${ratingColor(
                data.after.rating
              )}`}
            >
              {data.after.rating}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Generate Risk Assessment
        </button>
      </div>
    </div>
  );
}
