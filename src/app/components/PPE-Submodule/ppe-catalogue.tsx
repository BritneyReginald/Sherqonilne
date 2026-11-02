import { useState, useEffect } from "react";
import { Edit, X, Package, AlertCircle, Filter, ShieldCheck, Loader2, PackagePlus } from "lucide-react";
import {
  PPECatalogueItemModal,
  CatalogueItem,
  CatalogueItemForm,
} from "./ppe-catalogue-item-modal";
import { PPEAddStockModal, StockSubmit } from "./ppe-add-stock-modal";
import { SIZE_TYPES, PPEType } from "./ppe-sizes";

interface PPECatalogueProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogueChanged?: () => void;
}

function authHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("sherq_auth");
    const token = stored ? JSON.parse(stored).token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export function PPECatalogue({ isOpen, onClose, onCatalogueChanged }: PPECatalogueProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogueItem | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockItemName, setStockItemName] = useState<string | null>(null);
  const [types, setTypes] = useState<PPEType[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCatalogue();
      fetchTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/ppe/catalogue/types`, { headers: authHeaders() });
      if (response.ok) setTypes(await response.json());
    } catch (error) {
      console.error("Error fetching PPE types:", error);
    }
  };

  const fetchCatalogue = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${API_URL}/ppe/catalogue`, { headers: authHeaders() });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Your session has expired. Please log in again.");
        if (response.status === 403) throw new Error("You don't have permission to view the PPE catalogue.");
        throw new Error(`Failed to fetch PPE catalogue (HTTP ${response.status}).`);
      }
      setItems(await response.json());
    } catch (error: any) {
      console.error("Error fetching PPE catalogue:", error);
      setLoadError(error?.message || "Couldn't load the PPE catalogue. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ["All Categories", ...Array.from(new Set(items.map((i) => i.category))).sort()];

  const filteredItems = items.filter((item) =>
    selectedCategory === "All Categories" ? true : item.category === selectedCategory,
  );

  const getStockStatus = (item: CatalogueItem) => {
    if (item.stock_level < item.min_stock_level) {
      return { color: "var(--compliance-danger)", label: "Low Stock", status: "critical" };
    } else if (item.stock_level < item.min_stock_level * 1.5) {
      return { color: "var(--compliance-warning)", label: "Monitor", status: "warning" };
    }
    return { color: "var(--compliance-success)", label: "In Stock", status: "good" };
  };

  const replacementLabel = (days: number) => {
    if (days % 30 === 0) {
      const months = days / 30;
      return `Every ${months} month${months !== 1 ? "s" : ""}`;
    }
    return `Every ${days} days`;
  };

  const sizeStockOrdered = (item: CatalogueItem) =>
    SIZE_TYPES[item.size_type].map((size) => ({
      size,
      quantity: item.size_stock.find((s) => s.size === size)?.quantity ?? 0,
    }));

  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.stock_level < i.min_stock_level).length;
  const totalStockUnits = items.reduce((sum, i) => sum + i.stock_level, 0);
  const totalCategories = new Set(items.map((i) => i.category)).size;

  const openEditModal = (item: CatalogueItem) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const openStockModal = (itemName: string | null = null) => {
    setStockItemName(itemName);
    setShowStockModal(true);
  };

  const readError = async (response: Response, fallback: string) => {
    const errBody = await response.json().catch(() => ({}));
    return new Error(errBody.error || fallback);
  };

  // Edits replacement days / min stock only. Name, category and sizing come from the PPE list.
  const handleItemSubmit = async (form: CatalogueItemForm) => {
    if (!editingItem) return;
    const response = await fetch(`${API_URL}/ppe/catalogue/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(form),
    });
    if (!response.ok) throw await readError(response, "Failed to save changes");

    await fetchCatalogue();
    onCatalogueChanged?.();
    setShowItemModal(false);
  };

  const handleStockSubmit = async ({ itemName, mode, entries }: StockSubmit) => {
    const response = await fetch(`${API_URL}/ppe/catalogue/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ itemName, mode, entries }),
    });
    if (!response.ok) throw await readError(response, "Failed to update stock");

    await fetchCatalogue();
    onCatalogueChanged?.();
    setShowStockModal(false);
  };

  const chipStyle = { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#F8FAFC" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[95vw] h-[90vh] flex flex-col rounded-lg overflow-hidden"
        style={{ backgroundColor: "#0F172A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b" style={{ borderColor: "#1E293B" }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>PPE Catalogue & Stock Management</h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                <p className="text-sm" style={{ color: "#94A3B8" }}>POPI Act Compliant: Restricted Access</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => openStockModal(null)}
                className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <PackagePlus className="size-4" />
                Add Stock
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                aria-label="Close"
              >
                <X className="size-5" style={{ color: "#F8FAFC" }} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="size-5" style={{ color: "#94A3B8" }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{ backgroundColor: "#1E293B", color: "#F8FAFC", border: "none" }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>Total Catalogue Items</p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>{totalItems}</p>
            </div>
            <div className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>Low Stock Alerts</p>
              <p className="text-3xl font-bold" style={{ color: "var(--compliance-danger)" }}>{lowStockItems}</p>
            </div>
            <div className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>Total Stock Units</p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>{totalStockUnits}</p>
            </div>
            <div className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>Categories</p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>{totalCategories}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 pb-8">
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1E293B" }}>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2 className="size-5 animate-spin" style={{ color: "#94A3B8" }} />
                <span className="text-sm" style={{ color: "#94A3B8" }}>Loading catalogue…</span>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <AlertCircle className="size-6" style={{ color: "var(--compliance-danger)" }} />
                <span className="text-sm" style={{ color: "#F8FAFC" }}>{loadError}</span>
                <button onClick={fetchCatalogue} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#3B82F6" }}>
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !loadError && (
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "#0F172A" }}>
                      {["Item Name", "Category", "Replacement Cycle", "Stock by Size", "Total Stock", "Actions"].map((label) => (
                        <th key={label} className="px-6 py-4 text-left">
                          <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>{label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                          No stock recorded yet. Click "Add Stock" to choose a PPE item and enter quantities.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, index) => {
                        const stockStatus = getStockStatus(item);
                        const sizeRows = sizeStockOrdered(item);

                        return (
                          <tr
                            key={item.id}
                            className="transition-colors hover:bg-opacity-80"
                            style={{ backgroundColor: index % 2 === 0 ? "#1E293B" : "#0F172A" }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}>
                                  <Package className="size-5" style={{ color: "#3B82F6" }} />
                                </div>
                                <div>
                                  <div className="font-medium" style={{ color: "#F8FAFC" }}>{item.item_name}</div>
                                  <div className="text-xs font-mono" style={{ color: "#94A3B8" }}>PPE-{String(item.id).padStart(3, "0")}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4"><span className="text-sm" style={{ color: "#94A3B8" }}>{item.category}</span></td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{replacementLabel(item.replacement_days)}</div>
                                <div className="text-xs" style={{ color: "#94A3B8" }}>({item.replacement_days} days)</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {sizeRows.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[320px]">
                                  {sizeRows.map(({ size, quantity }) => (
                                    <span
                                      key={size}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                                      style={{ ...chipStyle, opacity: quantity === 0 ? 0.4 : 1 }}
                                      title={`Size ${size}: ${quantity} in stock`}
                                    >
                                      <span style={{ color: "#94A3B8" }}>{size}</span>
                                      <span className="font-medium">{quantity}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm" style={{ color: "#94A3B8" }}>Universal</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {stockStatus.status === "critical" && <AlertCircle className="size-4" style={{ color: stockStatus.color }} />}
                                <div>
                                  <div className="text-sm font-bold" style={{ color: stockStatus.color }}>{item.stock_level} units</div>
                                  <div className="text-xs" style={{ color: "#94A3B8" }}>Min: {item.min_stock_level}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openStockModal(item.item_name)}
                                  className="p-2 rounded-lg transition-colors"
                                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                  aria-label="Add stock"
                                  title="Add stock"
                                >
                                  <PackagePlus className="size-4" style={{ color: "#94A3B8" }} />
                                </button>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-2 rounded-lg transition-colors"
                                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                  aria-label="Edit item"
                                  title="Edit item"
                                >
                                  <Edit className="size-4" style={{ color: "#94A3B8" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <PPECatalogueItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSubmit={handleItemSubmit}
        editingItem={editingItem}
      />

      <PPEAddStockModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        types={types}
        items={items}
        initialName={stockItemName}
        onSubmit={handleStockSubmit}
      />
    </div>
  );
}