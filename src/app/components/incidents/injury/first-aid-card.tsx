import { FirstAidEntry } from "./types";
import { employees, firstAiders } from "./constants";
import { useMockAuth } from "@/app/contexts/mock-auth-context";
// import {
//   canEmployeeSign,
//   canFirstAiderSign,
// } from "@/app/permissions/firstAidPermissions";

type Props = {
  entry: FirstAidEntry;
  index: number;
  onChange: (index: number, field: keyof FirstAidEntry, value: any) => void;
  onRemove: (index: number) => void;
  onEmployeeSign: (index: number) => void;
  onFirstAiderSign: (index: number) => void;
};

export function FirstAidCard({
  entry,
  index,
  onChange,
  onRemove,
  onEmployeeSign,
  onFirstAiderSign,
}: Props) {
  const { user } = useMockAuth();
  const handleEmployeeSign = (index: number) => {
    handleTableChange(index, "status", "awaitingFirstAider");
  };

  const handleFirstAiderSign = (index: number) => {
    handleTableChange(index, "status", "awaitingSafetyReview");
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-4 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">Treatment Record</h3>
        </div>

        <button
          onClick={() => onRemove(index)}
          className="text-red-600 text-sm"
        >
          Remove
        </button>
      </div>

      {/* Employee */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Employee</label>

          <select
            value={entry.employeeName}
            onChange={(e) => {
              const selected = employees.find(
                (emp) => emp.name === e.target.value,
              );

              onChange(index, "employeeName", selected?.name || "");

              onChange(index, "employeeNumber", selected?.number || "");
            }}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          >
            <option value="">Select Employee</option>

            {employees.map((emp) => (
              <option key={emp.number} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Employee Number</label>

          <input
            value={entry.employeeNumber}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
          />
        </div>
      </div>

      {/* Injury */}
      <div>
        <label className="text-sm text-gray-600">Nature of Injury</label>

        <textarea
          value={entry.injury}
          onChange={(e) => onChange(index, "injury", e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Treatment */}
      <div>
        <label className="text-sm text-gray-600">Treatment</label>

        <textarea
          value={entry.treatment}
          onChange={(e) => onChange(index, "treatment", e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-600">Date</label>

          <input
            type="date"
            value={entry.date}
            onChange={(e) => onChange(index, "date", e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Time</label>

          <input
            type="time"
            value={entry.time}
            onChange={(e) => onChange(index, "time", e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">First Aider</label>

          <select
            value={entry.firstAider}
            onChange={(e) => onChange(index, "firstAider", e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>

            {firstAiders.map((fa) => (
              <option key={fa}>{fa}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medical Attention */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={entry.furtherMedicalAttention}
          onChange={(e) =>
            onChange(index, "furtherMedicalAttention", e.target.checked)
          }
        />

        <span className="text-sm text-gray-700">
          Further medical attention required
        </span>
      </div>

      {/* <div className="flex gap-4">
        <button
          disabled={!handleEmployeeSign}
          onClick={() => onEmployeeSign(index)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          Employee Sign
        </button>

        <button
          disabled={!handleFirstAiderSign}
          onClick={() => onFirstAiderSign(index)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          First Aider Sign
        </button>
      </div> */}

      <div className="mt-3 text-sm text-gray-600">Status: {entry.status}</div>
    </div>
  );
}
