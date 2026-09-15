import { FirstAidCard } from "./first-aid-card";
import { FirstAidEntry } from "./types";
import { EmployeeOption } from "../../../../api/employees";

interface SiteOption {
  id: string;
  name: string;
}

interface FirstAidSectionProps {
  entries: FirstAidEntry[];
  employees: EmployeeOption[];
  sites: SiteOption[];
  site: string;
  onSiteChange: (value: string) => void;
  handleTableChange: (index: number, field: keyof FirstAidEntry, value: any) => void;
  removeRow: (index: number) => void;
  addRow: () => void;
  onBack?: () => void;
  onSubmit: () => void;
}

export function FirstAidSection({
  entries,
  employees,
  sites,
  site,
  onSiteChange,
  handleTableChange,
  removeRow,
  addRow,
  onBack,
  onSubmit,
}: FirstAidSectionProps) {
  const handleEmployeeSign = (index: number) => {
    handleTableChange(index, "status", "AWAITING_FIRST_AIDER");
  };

  const handleFirstAiderSign = (index: number) => {
    handleTableChange(index, "status", "AWAITING_SAFETY");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          First Aid Case Dressing Log
        </h2>

        <div className="max-w-sm">
          <label className="text-sm text-gray-600">Site:</label>
          <select
            value={site}
            onChange={(e) => onSiteChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {entries.map((entry, index) => (
        <FirstAidCard
          key={entry.id}
          entry={entry}
          index={index}
          employees={employees}
          onChange={handleTableChange}
          onRemove={removeRow}
          onEmployeeSign={handleEmployeeSign}
          onFirstAiderSign={handleFirstAiderSign}
        />
      ))}

      <div className="flex gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-xl"
          >
            Back
          </button>
        )}

        <button
          onClick={addRow}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Add Treatment Record
        </button>

        <button
          onClick={onSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          Save First Aid Log
        </button>
      </div>
    </div>
  );
}