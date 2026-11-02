import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { SIZE_TYPES, SIZE_TYPE_LABELS, PPEType } from "./ppe-sizes";
import type { CatalogueItem } from "./ppe-catalogue-item-modal";

export interface StockSubmit {
  itemName: string;
  mode: "add" | "set";
  entries: { size?: string; quantity: number }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  types: PPEType[];         // the full PPE dropdown list
  items: CatalogueItem[];   // rows that already have a catalogue record (for current stock)
  initialName?: string | null;
  onSubmit: (data: StockSubmit) => Promise<void>;
}

export function PPEAddStockModal({ isOpen, onClose, types, items, initialName, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"add" | "set">("add");
  const [qty, setQty] = useState<Record<string, string>>({}); // size -> typed value ("" key = unsized)
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName ?? "");
      setMode("add");
      setQty({});
      setError(null);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const type = types.find((t) => t.name === name) || null;
  const existing = items.find((i) => i.item_name === name) || null;
  const sizes = type ? SIZE_TYPES[type.sizeType] : [];
  const currentFor = (size: string) => existing?.size_stock.find((s) => s.size === size)?.quantity ?? 0;
  const categories = Array.from(new Set(types.map((t) => t.category)));

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none";
  const inputStyle = { backgroundColor: "white", borderColor: "var(--grey-300)", color: "var(--grey-900)" };

  const changeItem = (v: string) => {
    setName(v);
    setQty({});
    setError(null);
  };

  const handleSubmit = async () => {
    if (!type) {
      setError("Choose a PPE item first.");
      return;
    }
    const keys = type.sizeType === "none" ? [""] : sizes;
    const entries = keys
      .filter((k) => qty[k] !== undefined && qty[k] !== "")
      .map((k) => ({ ...(k ? { size: k } : {}), quantity: Number(qty[k]) }))
      .filter((e) => (mode === "add" ? e.quantity > 0 : e.quantity >= 0));

    if (entries.length === 0) {
      setError("Enter at least one quantity.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({ itemName: type.name, mode, entries });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBtn = (value: "add" | "set", label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className="flex-1 px-3 py-2 text-sm rounded-lg"
      style={{
        backgroundColor: mode === value ? "var(--brand-blue)" : "var(--grey-100)",
        color: mode === value ? "white" : "var(--grey-700)",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={isSaving ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--grey-200)" }}>
          <h3 className="font-medium" style={{ color: "var(--grey-900)" }}>Add Stock</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="size-5" style={{ color: "var(--grey-500)" }} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-auto">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--compliance-danger)10", color: "var(--compliance-danger)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-700)" }}>PPE Item</label>
            <select value={name} onChange={(e) => changeItem(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">Select PPE…</option>
              {categories.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {types.filter((t) => t.category === cat).map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {type && (
              <p className="text-xs mt-1" style={{ color: "var(--grey-500)" }}>
                {SIZE_TYPE_LABELS[type.sizeType]}
              </p>
            )}
          </div>

          {type && (
            <>
              <div className="flex gap-2">
                {toggleBtn("add", "Add to current stock")}
                {toggleBtn("set", "Set exact counts")}
              </div>

              {type.sizeType === "none" ? (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--grey-700)" }}>
                    Quantity (currently {existing?.stock_level ?? 0})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={qty[""] ?? ""}
                    onChange={(e) => setQty({ ...qty, "": e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--grey-700)" }}>
                    {mode === "add" ? "Quantity to add per size" : "Total in stock per size"}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {sizes.map((size) => (
                      <div key={size}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: "var(--grey-900)" }}>Size {size}</span>
                          <span className="text-[10px]" style={{ color: "var(--grey-500)" }}>have {currentFor(size)}</span>
                        </div>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={qty[size] ?? ""}
                          onChange={(e) => setQty({ ...qty, [size]: e.target.value })}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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
            disabled={isSaving || !type}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center gap-2"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? "Saving…" : mode === "add" ? "Add Stock" : "Save Counts"}
          </button>
        </div>
      </div>
    </div>
  );
}