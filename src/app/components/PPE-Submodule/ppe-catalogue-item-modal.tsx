import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { SizeType, SIZE_TYPE_LABELS } from "./ppe-sizes";

export interface CatalogueItem {
  id: number;
  item_name: string;
  category: string;
  size_type: SizeType;
  replacement_days: number;
  stock_level: number; // total across sizes
  min_stock_level: number;
  size_stock: { size: string; quantity: number }[];
}

// Only the settings that aren't fixed by the PPE list.
export interface CatalogueItemForm {
  replacementDays: number;
  minStockLevel: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CatalogueItemForm) => Promise<void>;
  editingItem: CatalogueItem | null;
}

export function PPECatalogueItemModal({ isOpen, onClose, onSubmit, editingItem }: Props) {
  const [form, setForm] = useState<CatalogueItemForm>({ replacementDays: 180, minStockLevel: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setForm({
        replacementDays: editingItem.replacement_days,
        minStockLevel: editingItem.min_stock_level,
      });
    }
    setError(null);
  }, [editingItem, isOpen]);

  if (!isOpen || !editingItem) return null;

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none";
  const inputStyle = { backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" };
  const labelClass = "block text-xs font-medium mb-1";

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={isSaving ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-2xl"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
          <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Edit {editingItem.item_name}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="size-5" style={{ color: "var(--grey-500)" }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--compliance-danger)10", color: "var(--compliance-danger)" }}>
              {error}
            </div>
          )}

          <p className="text-xs" style={{ color: "var(--grey-500)" }}>
            {editingItem.category} · {SIZE_TYPE_LABELS[editingItem.size_type]}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Replacement (days)</label>
              <input
                type="number"
                min={1}
                value={form.replacementDays}
                onChange={(e) => setForm({ ...form, replacementDays: Number(e.target.value) })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Min Stock Level (total)</label>
              <input
                type="number"
                min={0}
                value={form.minStockLevel}
                onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: "var(--grey-200)" }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-sm"
            style={{ backgroundColor: "var(--grey-100)", color: "var(--grey-700)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center gap-2"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}