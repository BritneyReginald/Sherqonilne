import { SiteFilters } from "@/app/types/site-filter";
import { X } from "lucide-react";

interface FilterSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SiteFilters;
  onApply: (filters: SiteFilters) => void;
}

export function FilterSitesModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: FilterSitesModalProps) {
  if (!isOpen) return null;

  const handleComplianceChange = (value: SiteFilters["complianceStatus"]) => {
    onApply({
      ...filters,
      complianceStatus: value,
    });
  };

  const handleManagerChange = (value: SiteFilters["manager"]) => {
    onApply({
      ...filters,
      manager: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filter Sites</h2>

          <button onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Compliance Status</label>

            <select
              className="border rounded w-full p-2"
              value={filters.complianceStatus}
              onChange={(e) =>
                handleComplianceChange(
                  e.target.value as SiteFilters["complianceStatus"],
                )
              }
            >
              <option value="all">All</option>
              <option value="compliant">Compliant</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Manager Assigned</label>

            <select
              className="border rounded w-full p-2"
              value={filters.manager}
              onChange={(e) =>
                handleManagerChange(e.target.value as SiteFilters["manager"])
              }
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={onClose}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
