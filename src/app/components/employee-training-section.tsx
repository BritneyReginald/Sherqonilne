// import  getTrainingStatus  from "./training-matrix";

interface EmployeeTrainingSectionProps {
  employeeId: string;
  records: TrainingRecord[];
}

export function EmployeeTrainingSection({
  employeeId,
  records,
}: EmployeeTrainingSectionProps) {
  const employeeRecords = (records ?? []).filter(
    (r) => r.employeeId === employeeId
  );

  if (employeeRecords.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-400">
        No training records found for this employee.
      </div>
    );
  }

  const expired = employeeRecords.filter(
    (r) => getTrainingStatus(r.expiryDate) === "expired"
  ).length;

  const expiring = employeeRecords.filter(
    (r) => getTrainingStatus(r.expiryDate) === "expiring"
  ).length;

  return (
    <div className="rounded-lg overflow-hidden bg-slate-800">
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-white">Total: {employeeRecords.length}</span>
        <span className="text-yellow-400">Expiring: {expiring}</span>
        <span className="text-red-500">Expired: {expired}</span>
      </div>

      <table className="w-full">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-4 py-3 text-left text-sm text-gray-400">
              Certificate
            </th>
            <th className="px-4 py-3 text-left text-sm text-gray-400">
              Provider
            </th>
            <th className="px-4 py-3 text-left text-sm text-gray-400">
              Expiry
            </th>
            <th className="px-4 py-3 text-left text-sm text-gray-400">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {employeeRecords.map((record) => {
            const status = getTrainingStatus(record.expiryDate);

            return (
              <tr key={record.id} className="border-t border-slate-700">
                <td className="px-4 py-3 text-sm text-white">
                  {record.certificateName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {record.provider}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(record.expiryDate).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
