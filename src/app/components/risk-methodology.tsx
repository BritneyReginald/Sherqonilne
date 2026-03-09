import { PageLayout } from "../components/page-layout";

export function RiskMethodology({ onNext }: { onNext: () => void }) {
  return (
    <PageLayout
      title="Risk Assessment Methodology"
      description="This methodology is used to evaluate workplace hazards by determining
        the level of risk before and after control measures are applied."
    >
      {/* Methodology Formula */}
      <div className="mb-6 p-4 border rounded bg-gray-50 text-gray-900">
        <h2 className="font-semibold mb-2">Risk Calculation Formula</h2>
        <p className="text-lg font-mono">
          Risk Score (C) = Severity (A) × Probability (B)
        </p>
      </div>

      {/* Severity Table */}
      <h2 className="font-semibold mb-2">A. Consequence (Severity)</h2>
      <table className="w-full border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-gray-900">Weight</th>
            <th className="border p-2 text-gray-900">Impact</th>
          </tr>
        </thead>
        <tbody>
          {[
            [1, "Noticeable"],
            [2, "Important"],
            [3, "Serious"],
            [4, "Very Serious"],
            [5, "Disaster"],
          ].map(([w, label]) => (
            <tr key={w}>
              <td className="border p-2 text-center">{w}</td>
              <td className="border p-2">{label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Probability Table */}
      <h2 className="font-semibold mb-2">B. Exposure (Probability)</h2>
      <table className="w-full border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-gray-900">Weight</th>
            <th className="border p-2 text-gray-900">Impact</th>
            <th className="border p-2 text-gray-900">Effect</th>
          </tr>
        </thead>
        <tbody>
          {[
            [1, "Conceivable", "Has never happened but is possible (1 in 1000)"],
            [2, "Remotely possible", "Less possible coincidence (1 in 100)"],
            [3, "Unusual but possible", "More possible occurrence (1 in 10)"],
            [4, "Likely", "50/50 chance of occurrence"],
            [5, "Almost certain", "Most likely outcome if event occurs"],
          ].map(([w, impact, effect]) => (
            <tr key={w}>
              <td className="border p-2 text-center">{w}</td>
              <td className="border p-2">{impact}</td>
              <td className="border p-2">{effect}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Risk Rating */}
      <h2 className="font-semibold mb-2">Risk Rating Categories</h2>
      <table className="w-full border mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-gray-900">Risk Category</th>
            <th className="border p-2 text-gray-900">Risk Rating</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 font-semibold">Critical</td>
            <td className="border p-2 bg-red-600 text-center">25</td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">High Risk</td>
            <td className="border p-2 bg-orange-600 text-center">15 – 24</td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Substantial Risk</td>
            <td className="border p-2 bg-yellow-300 text-center">12 – 14</td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Possible Risk</td>
            <td className="border p-2 bg-green-600 text-center">4 – 11</td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Low Risk</td>
            <td className="border p-2 bg-green-300 text-center">1 – 3</td>
          </tr>
        </tbody>
      </table>

      {/* Action */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
        >
          Start Risk Assessment
        </button>
      </div>
    </PageLayout>
  );
}
