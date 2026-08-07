interface Site {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  inspector: any | null;
  sites: Site[];
  selectedSites: number[];
  onChangeSelectedSites: (siteIds: number[]) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditInspectorSitesModal({
  open,
  inspector,
  sites,
  selectedSites,
  onChangeSelectedSites,
  onClose,
  onSave,
}: Props) {
  if (!open || !inspector) return null;

  function toggleSite(siteId: number) {
    if (selectedSites.includes(siteId)) {
      onChangeSelectedSites(selectedSites.filter((id) => id !== siteId));
    } else {
      onChangeSelectedSites([...selectedSites, siteId]);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] max-w-full shadow-xl">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Edit Assigned Sites</h2>

          <p className="text-sm text-gray-500 mt-1">
            {inspector.fullName} {inspector.surname}
          </p>
        </div>

        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {sites.map((site) => (
            <label
              key={site.id}
              className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSites.includes(site.id)}
                onChange={() => toggleSite(site.id)}
              />

              {site.name}
            </label>
          ))}
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border">
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
