
import { FirstAidEntry } from "./types";
import { EmployeeOption } from "../../../../api/employees";
import { SignaturePad } from "./signature-panel";

type Props = {
  entry: FirstAidEntry;
  index: number;
  employees: EmployeeOption[];
  onChange: (
    index: number,
    field: keyof FirstAidEntry,
    value: any,
  ) => void;
  onRemove: (index: number) => void;
  onFirstAiderSign: (
    index: number,
    signature: string,
  ) => void;
};

export function FirstAidCard({
  entry,
  index,
  employees,
  onChange,
  onRemove,
  onFirstAiderSign,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-4 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">
          Treatment Record
        </h3>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-600 text-sm"
        >
          Remove
        </button>
      </div>

      {/* Employee */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">
            Employee
          </label>

          <select
            value={entry.employeeId || ""}
            onChange={(e) => {
              const selected = employees.find(
                (emp) => emp.id === e.target.value,
              );

              onChange(index, "employeeId", e.target.value);
              onChange(
                index,
                "employeeName",
                selected?.fullName || "",
              );
              onChange(
                index,
                "employeeNumber",
                selected?.employeeNumber || "",
              );
            }}
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          >
            <option value="">Select Employee</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Employee Number
          </label>

          <input
            value={entry.employeeNumber}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
          />
        </div>
      </div>

      {/* Injury */}
      <div>
        <label className="text-sm text-gray-600">
          Nature of Injury
        </label>

        <textarea
          value={entry.injury}
          onChange={(e) =>
            onChange(index, "injury", e.target.value)
          }
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Treatment */}
      <div>
        <label className="text-sm text-gray-600">
          Treatment Used
        </label>

        <textarea
          value={entry.treatment}
          onChange={(e) =>
            onChange(index, "treatment", e.target.value)
          }
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Comments */}
      <div>
        <label className="text-sm text-gray-600">
          Comments
        </label>

        <textarea
          value={entry.comments}
          onChange={(e) =>
            onChange(index, "comments", e.target.value)
          }
          className="w-full mt-1 px-3 py-2 border rounded-lg"
          placeholder="Any additional notes about this treatment..."
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-600">
            Date
          </label>

          <input
            type="date"
            value={entry.date}
            onChange={(e) =>
              onChange(index, "date", e.target.value)
            }
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Time
          </label>

          <input
            type="time"
            value={entry.time}
            onChange={(e) =>
              onChange(index, "time", e.target.value)
            }
            className="w-full mt-1 px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            First Aider
          </label>

          <input
            value={entry.firstAider || "Not yet signed"}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
          />
        </div>
      </div>

      {/* Signature */}
      {!entry.firstAiderSignature ? (
        <div>
          <label className="text-sm text-gray-600 block mb-2">
            First Aider Signature
          </label>

          <SignaturePad
            onSave={(dataUrl) =>
              onFirstAiderSign(index, dataUrl)
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm text-gray-600 block">
            Signed by {entry.firstAiderSignature.signedBy} on{" "}
            {new Date(
              entry.firstAiderSignature.signedAt,
            ).toLocaleString()}
          </label>

          <img
            src={entry.firstAiderSignature.signature}
            alt={`Signature of ${entry.firstAiderSignature.signedBy}`}
            className="border rounded-lg bg-white h-20 max-w-full object-contain"
          />

          <p className="text-sm text-green-600 font-medium">
            Signature saved successfully
          </p>
        </div>
      )}

      {/* Medical Attention */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={entry.furtherMedicalAttention}
          onChange={(e) =>
            onChange(
              index,
              "furtherMedicalAttention",
              e.target.checked,
            )
          }
        />

        <span className="text-sm text-gray-700">
          Further medical attention required
        </span>
      </div>
    </div>
  );
}