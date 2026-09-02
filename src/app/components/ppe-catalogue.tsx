import { useState, useEffect } from "react";
import { Plus, Edit, X, Package, AlertCircle, Filter, ShieldCheck, Loader2 } from "lucide-react";
import { PPECatalogueItemModal, CatalogueItem } from "./ppe-catalogue-item-modal";

interface PPECatalogueProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogueChanged?: () => void;
}

export function PPECatalogue({ isOpen, onClose, onCatalogueChanged }: PPECatalogueProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogueItem | null>(null);

  useEffect(() => {
    if (isOpen) fetchCatalogue();
  }, [isOpen]);

  const fetchCatalogue = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${API_URL}/ppe/catalogue`);
      if (!response.ok) throw new Error("Failed to fetch PPE catalogue");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching PPE catalogue:", error);
      setLoadError("Couldn't load the PPE catalogue. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    "All Categories",
    ...Array.from(new Set(items.map((item) => item.category))).sort(),
  ];

  const filteredItems = items.filter((item) =>
    selectedCategory === "All Categories" ? true : item.category === selectedCategory,
  );

  const getStockStatus = (item: CatalogueItem) => {
    if (item.stock_level < item.min_stock_level) {
      return { color: "var(--compliance-danger)", label: "Low Stock", status: "critical" };
    } else if (item.stock_level < item.min_stock_level * 1.5) {
      return { color: "var(--compliance-warning)", label: "Monitor", status: "warning" };
    } else {
      return { color: "var(--compliance-success)", label: "In Stock", status: "good" };
    }
  };

  const replacementLabel = (days: number) => {
    if (days % 30 === 0) {
      const months = days / 30;
      return `Every ${months} month${months !== 1 ? "s" : ""}`;
    }
    return `Every ${days} days`;
  };

  const totalItems = items.length;
  const lowStockItems = items.filter((item) => item.stock_level < item.min_stock_level).length;
  const totalStockValue = items.reduce((sum, item) => sum + item.stock_level, 0);
  const activeSuppliers = new Set(items.map((item) => item.supplier).filter(Boolean)).size;

  const openAddModal = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const openEditModal = (item: CatalogueItem) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleItemSubmit = async (form: {
    itemName: string;
    category: string;
    supplier: string;
    requiresSize: boolean;
    sizes: string;
    replacementDays: number;
    stockLevel: number;
    minStockLevel: number;
  }) => {
    const body = {
      itemName: form.itemName,
      category: form.category,
      supplier: form.supplier,
      requiresSize: form.requiresSize,
      sizes: form.sizes,
      replacementDays: form.replacementDays,
      stockLevel: form.stockLevel,
      minStockLevel: form.minStockLevel,
    };

    const url = editingItem
      ? `${API_URL}/ppe/catalogue/${editingItem.id}`
      : `${API_URL}/ppe/catalogue`;
    const method = editingItem ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Failed to save catalogue item");
    }

    await fetchCatalogue();
    onCatalogueChanged?.();
    setShowItemModal(false);
  };

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
                onClick={openAddModal}
                className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <Plus className="size-4" />
                Add New Item
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
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>{totalStockValue}</p>
            </div>
            <div className="px-6 py-4 rounded-lg" style={{ backgroundColor: "#1E293B" }}>
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>Active Suppliers</p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>{activeSuppliers}</p>
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
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Item Name</span></th>
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Category</span></th>
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Supplier</span></th>
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Replacement Cycle</span></th>
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Available Sizes</span></th>
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Stock Level</span></th>
                      <th className="px-6 py-4 text-left"><span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                          No catalogue items yet. Click "Add New Item" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, index) => {
                        const stockStatus = getStockStatus(item);

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
                            <td className="px-6 py-4"><span className="text-sm" style={{ color: "#94A3B8" }}>{item.supplier || "—"}</span></td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{replacementLabel(item.replacement_days)}</div>
                                <div className="text-xs" style={{ color: "#94A3B8" }}>({item.replacement_days} days)</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {item.sizes && item.sizes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {item.sizes.slice(0, 3).map((size) => (
                                    <span key={size} className="inline-flex items-center px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#F8FAFC" }}>
                                      {size}
                                    </span>
                                  ))}
                                  {item.sizes.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#F8FAFC" }}>
                                      +{item.sizes.length - 3}
                                    </span>
                                  )}
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
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                aria-label="Edit item"
                              >
                                <Edit className="size-4" style={{ color: "#94A3B8" }} />
                              </button>
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
    </div>
  );
}