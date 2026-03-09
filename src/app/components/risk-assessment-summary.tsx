import { PageLayout } from "@/app/components/page-layout";

export interface RiskItem {
  id: number;
  hazard: string;
  consequence: string;
  before: {
    severity: number | null;
    probability: number | null;
    score: number;
    rating: string;
    controls: string;
  };
  after?: {
    severity: number | null;
    probability: number | null;
    score: number;
    rating: string;
  };
}

interface RiskAssessmentSummaryProps {
  data: RiskItem[];
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
    <PageLayout
      title="Risk Assessment Summary"
      description="Review the final risk assessment results before generating the report."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border p-2">ID</th>
              <th rowSpan={2} className="border p-2">Hazard</th>
              <th rowSpan={2} className="border p-2">Consequence</th>

              <th colSpan={4} className="border p-2">
                Before Controls
              </th>

              <th rowSpan={2} className="border p-2">
                Controls
              </th>

              <th colSpan={4} className="border p-2">
                After Controls
              </th>
            </tr>

            <tr className="bg-gray-100">
              <th className="border p-2">Severity</th>
              <th className="border p-2">Probability</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Rating</th>

              <th className="border p-2">Severity</th>
              <th className="border p-2">Probability</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Rating</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="border p-2 text-center">
                  {item.id}
                </td>

                <td className="border p-2">
                  {item.hazard}
                </td>

                <td className="border p-2">
                  {item.consequence}
                </td>

                <td className="border p-2 text-center">
                  {item.before.severity ?? "-"}
                </td>

                <td className="border p-2 text-center">
                  {item.before.probability ?? "-"}
                </td>

                <td className="border p-2 text-center">
                  {item.before.score ?? "-"}
                </td>

                <td
                  className={`border p-2 text-center font-semibold ${ratingColor(
                    item.before.rating
                  )}`}
                >
                  {item.before.rating || "-"}
                </td>

                <td className="border p-2">
                  {item.before.controls || "-"}
                </td>

                <td className="border p-2 text-center">
                  {item.after?.severity ?? "-"}
                </td>

                <td className="border p-2 text-center">
                  {item.after?.probability ?? "-"}
                </td>

                <td className="border p-2 text-center">
                  {item.after?.score ?? "-"}
                </td>

                <td
                  className={`border p-2 text-center font-semibold ${ratingColor(
                    item.after?.rating || ""
                  )}`}
                >
                  {item.after?.rating || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
    </PageLayout>
  );
}
