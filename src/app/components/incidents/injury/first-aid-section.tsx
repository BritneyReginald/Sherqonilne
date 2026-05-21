import { FirstAidCard } from "./first-aid-card";

export function FirstAidSection({
  entries,
  handleTableChange,
  removeRow,
  addRow,
  onSubmit,
}: any) {
  const handleEmployeeSign = (index: number) => {
  const entry = entries[index];

  handleTableChange(index, "employeeSigned", true);
  handleTableChange(index, "status", "awaitingFirstAider");
};

const handleFirstAiderSign = (index: number) => {
  handleTableChange(index, "firstAiderSigned", true);
  handleTableChange(index, "status", "awaitingSafetyReview");
};


  return (
    <div className="space-y-6">
      {entries.map((entry: any, index: number) => (
        <FirstAidCard
          key={entry.id}
          entry={entry}
          index={index}
          onChange={handleTableChange}
          onRemove={removeRow}
          onEmployeeSign={handleEmployeeSign}
          onFirstAiderSign={handleFirstAiderSign}
        />
      ))}

      <div className="flex gap-4">
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
