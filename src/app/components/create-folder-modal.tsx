import { useState } from "react";
import { FolderPlus, X } from "lucide-react";

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  parentName?: string | null;
}

export function CreateFolderModal({
  onClose,
  onCreate,
  parentName,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a folder name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate(name.trim());
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to create folder");
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-lg shadow-xl"
          style={{ backgroundColor: "white" }}
        >
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--grey-200)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--brand-blue)10" }}
              >
                <FolderPlus
                  className="size-5"
                  style={{ color: "var(--brand-blue)" }}
                />
              </div>
              <h2 className="text-xl" style={{ color: "var(--grey-900)" }}>
                {parentName ? "New Subfolder" : "Create Folder"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="size-5" style={{ color: "var(--grey-500)" }} />
            </button>
          </div>

          <div className="px-6 py-6">
            {parentName && (
              <p className="text-sm mb-3" style={{ color: "var(--grey-600)" }}>
                Inside: <span className="font-medium">{parentName}</span>
              </p>
            )}
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--grey-700)" }}
            >
              Folder name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full px-3 py-2 rounded-lg border outline-none"
              style={{
                borderColor: "var(--grey-200)",
                color: "var(--grey-900)",
              }}
              placeholder="e.g. 05. Training Material"
            />
            {error && (
              <p
                className="text-sm mt-2"
                style={{ color: "var(--compliance-danger)" }}
              >
                {error}
              </p>
            )}
          </div>

          <div
            className="px-6 py-4 border-t flex items-center justify-end gap-3"
            style={{
              backgroundColor: "var(--grey-50)",
              borderColor: "var(--grey-200)",
            }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              {saving ? "Saving..." : "Save Folder"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
