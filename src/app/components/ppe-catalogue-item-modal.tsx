import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export interface CatalogueItem {
  id: number;
  item_name: string;
  category: string;
  supplier: string | null;
  requires_size: boolean;
  sizes: string[] | null;
  replacement_days: number;
  stock_level: number;
  min_stock_level: number;
}

interface PPECatalogueItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemName: string;
    category: string;
    supplier: string;
    requiresSize: boolean;
    sizes: string;
    replacementDays: number;
    stockLevel: number;
    minStockLevel: number;
  }) => Promise<void>;
  editingItem?: CatalogueItem | null;
}

const emptyForm = {
  itemName: "",
  category: "",
  supplier: "",
  requiresSize: false,
  sizes: "",
  replacementDays: 180,
  stockLevel: 0,
  minStockLevel: 0,
};

export function PPECatalogueItemModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
}: PPECatalogueItemModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setForm({
        itemName: editingItem.item_name,
        category: editingItem.category,
        supplier: editingItem.supplier || "",
        requiresSize: editingItem.requires_size,
        sizes: editingItem.sizes?.join(", ") || "",
        replacementDays: editingItem.replacement_days,
        stockLevel: editingItem.stock_level,
        minStockLevel: editingItem.min_stock_level,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none";
  const inputStyle = { backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" };
  const labelClass = "block text-xs font-medium mb-1";

  const handleSubmit = async () => {
    if (!form.itemName || !form.category) {
      setError("Item name and category are required.");
      return;
    }

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
        className="w-full max-w-lg rounded-lg shadow-2xl"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
          <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>
            {editingItem ? "Edit Catalogue Item" : "Add New Catalogue Item"}
          </h3>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Item Name *</label>
              <input
                type="text"
                placeholder="Safety Boots - Bova Maverick"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Category *</label>
              <input
                type="text"
                placeholder="Footwear"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ color: "var(--grey-700)" }}>Supplier</label>
            <input
              type="text"
              placeholder="Bova Safety Supplies"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresSize"
              checked={form.requiresSize}
              onChange={(e) => setForm({ ...form, requiresSize: e.target.checked })}
            />
            <label htmlFor="requiresSize" className="text-sm" style={{ color: "var(--grey-700)" }}>
              This item requires a size selection
            </label>
          </div>

          {form.requiresSize && (
            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Available Sizes (comma-separated)</label>
              <input
                type="text"
                placeholder="S, M, L, XL, XXL"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
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
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Stock Level</label>
              <input
                type="number"
                min={0}
                value={form.stockLevel}
                onChange={(e) => setForm({ ...form, stockLevel: Number(e.target.value) })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--grey-700)" }}>Min Stock Level</label>
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
            {isSaving ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}