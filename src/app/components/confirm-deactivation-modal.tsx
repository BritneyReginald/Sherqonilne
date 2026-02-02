import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export function ConfirmDeactivationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
}: ConfirmDeactivationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-lg shadow-xl"
          style={{ backgroundColor: "white" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--grey-200)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--compliance-danger)15" }}
              >
                <AlertTriangle
                  className="size-5"
                  style={{ color: "var(--compliance-danger)" }}
                />
              </div>
              <h2 className="text-xl" style={{ color: "var(--grey-900)" }}>
                Confirm Deactivation
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

          {/* Modal Body */}
          <div className="px-6 py-6">
            <div
              className="mb-4 px-4 py-3 rounded-lg border-l-4"
              style={{
                backgroundColor: "var(--compliance-warning)10",
                borderColor: "var(--compliance-warning)",
              }}
            >
              <p className="font-medium mb-2" style={{ color: "var(--grey-900)" }}>
                Wait! For legal audit purposes, records are never permanently deleted.
              </p>
              <p style={{ color: "var(--grey-700)" }}>
                This item will be moved to the Recycle Bin and marked as archived.
              </p>
            </div>

            {itemName && itemName !== "this item" && (
              <div className="mt-4">
                <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
                  Item to be archived:
                </p>
                <p className="font-medium" style={{ color: "var(--grey-900)" }}>
                  {itemName}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="px-6 py-4 border-t flex items-center justify-end gap-3"
            style={{
              backgroundColor: "var(--grey-50)",
              borderColor: "var(--grey-200)",
            }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-100)";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--compliance-danger)" }}
            >
              Archive Record
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
