import { useState } from "react";
import { Plus, Edit, X, Package, AlertCircle, Filter, ShieldCheck } from "lucide-react";

interface CatalogueItem {
  id: string;
  itemName: string;
  category: string;
  supplier: string;
  replacementCycle: string;
  replacementDays: number;
  stockLevel: number;
  minStockLevel: number;
  sizes?: string[];
}

const catalogueData: CatalogueItem[] = [
  {
    id: "CAT-001",
    itemName: "Safety Boots - Bova Maverick",
    category: "Footwear",
    supplier: "Bova Safety Supplies",
    replacementCycle: "Every 6 months",
    replacementDays: 180,
    stockLevel: 45,
    minStockLevel: 20,
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
  },
  {
    id: "CAT-002",
    itemName: "Safety Boots - Caterpillar Holton",
    category: "Footwear",
    supplier: "CAT Workwear SA",
    replacementCycle: "Every 6 months",
    replacementDays: 180,
    stockLevel: 28,
    minStockLevel: 15,
    sizes: ["7", "8", "9", "10", "11", "12"],
  },
  {
    id: "CAT-003",
    itemName: "Hard Hat - 3M SecureFit",
    category: "Head Protection",
    supplier: "3M South Africa",
    replacementCycle: "Every 12 months",
    replacementDays: 365,
    stockLevel: 62,
    minStockLevel: 25,
  },
  {
    id: "CAT-004",
    itemName: "Safety Goggles - Honeywell Uvex",
    category: "Eye Protection",
    supplier: "Honeywell Safety Products",
    replacementCycle: "Every 3 months",
    replacementDays: 90,
    stockLevel: 15,
    minStockLevel: 30,
  },
  {
    id: "CAT-005",
    itemName: "High-Vis Vest - ProChoice",
    category: "Visibility",
    supplier: "ProChoice Safety Gear",
    replacementCycle: "Every 6 months",
    replacementDays: 180,
    stockLevel: 54,
    minStockLevel: 40,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "CAT-006",
    itemName: "Safety Harness - Miller Titan",
    category: "Fall Protection",
    supplier: "Miller Fall Protection",
    replacementCycle: "Every 12 months",
    replacementDays: 365,
    stockLevel: 18,
    minStockLevel: 12,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "CAT-007",
    itemName: "Ear Plugs - 3M E-A-R Classic",
    category: "Hearing Protection",
    supplier: "3M South Africa",
    replacementCycle: "Every 1 month",
    replacementDays: 30,
    stockLevel: 250,
    minStockLevel: 200,
  },
  {
    id: "CAT-008",
    itemName: "Leather Gloves - Tillman TrueFit",
    category: "Hand Protection",
    supplier: "Tillman Safety",
    replacementCycle: "Every 2 months",
    replacementDays: 60,
    stockLevel: 88,
    minStockLevel: 50,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "CAT-009",
    itemName: "Dust Mask FFP2 - Respirex",
    category: "Respiratory Protection",
    supplier: "Respirex International",
    replacementCycle: "Every 1 month",
    replacementDays: 30,
    stockLevel: 12,
    minStockLevel: 100,
    sizes: ["S", "M", "L"],
  },
  {
    id: "CAT-010",
    itemName: "Welding Gloves - Lincoln Electric",
    category: "Hand Protection",
    supplier: "Lincoln Electric",
    replacementCycle: "Every 3 months",
    replacementDays: 90,
    stockLevel: 34,
    minStockLevel: 20,
    sizes: ["M", "L", "XL"],
  },
];

interface PPECatalogueProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PPECatalogue({ isOpen, onClose }: PPECatalogueProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  if (!isOpen) return null;

  const categories = [
    "All Categories",
    ...Array.from(new Set(catalogueData.map((item) => item.category))).sort(),
  ];

  const filteredItems = catalogueData.filter((item) =>
    selectedCategory === "All Categories" ? true : item.category === selectedCategory
  );

  const getStockStatus = (item: CatalogueItem) => {
    if (item.stockLevel < item.minStockLevel) {
      return {
        color: "var(--compliance-danger)",
        label: "Low Stock",
        status: "critical",
      };
    } else if (item.stockLevel < item.minStockLevel * 1.5) {
      return {
        color: "var(--compliance-warning)",
        label: "Monitor",
        status: "warning",
      };
    } else {
      return {
        color: "var(--compliance-success)",
        label: "In Stock",
        status: "good",
      };
    }
  };

  const totalItems = catalogueData.length;
  const lowStockItems = catalogueData.filter(
    (item) => item.stockLevel < item.minStockLevel
  ).length;
  const totalStockValue = catalogueData.reduce((sum, item) => sum + item.stockLevel, 0);

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
        {/* Header Section */}
        <div className="px-8 py-6 border-b" style={{ borderColor: "#1E293B" }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2" style={{ color: "#F8FAFC" }}>
                PPE Catalogue & Stock Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="size-4" style={{ color: "var(--compliance-success)" }} />
                <p className="text-sm" style={{ color: "#94A3B8" }}>
                  POPI Act Compliant: Restricted Access
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
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

          {/* Filter Section */}
          <div className="flex items-center gap-3">
            <Filter className="size-5" style={{ color: "#94A3B8" }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: "#1E293B",
                color: "#F8FAFC",
                border: "none",
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Total Catalogue Items
              </p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>
                {totalItems}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Low Stock Alerts
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--compliance-danger)" }}
              >
                {lowStockItems}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Total Stock Units
              </p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>
                {totalStockValue}
              </p>
            </div>
            <div
              className="px-6 py-4 rounded-lg"
              style={{
                backgroundColor: "#1E293B",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Active Suppliers
              </p>
              <p className="text-3xl font-bold" style={{ color: "#F8FAFC" }}>
                {new Set(catalogueData.map((item) => item.supplier)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Catalogue Table */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: "#1E293B",
            }}
          >
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#0F172A",
                    }}
                  >
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Item Name
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Category
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Supplier
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Replacement Cycle
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Available Sizes
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Stock Level
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#94A3B8" }}
                      >
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => {
                    const stockStatus = getStockStatus(item);

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-opacity-80"
                        style={{
                          backgroundColor: index % 2 === 0 ? "#1E293B" : "#0F172A",
                        }}
                      >
                        {/* Item Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: "rgba(59, 130, 246, 0.2)",
                              }}
                            >
                              <Package
                                className="size-5"
                                style={{ color: "#3B82F6" }}
                              />
                            </div>
                            <div>
                              <div
                                className="font-medium"
                                style={{ color: "#F8FAFC" }}
                              >
                                {item.itemName}
                              </div>
                              <div
                                className="text-xs font-mono"
                                style={{ color: "#94A3B8" }}
                              >
                                {item.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{ color: "#94A3B8" }}
                          >
                            {item.category}
                          </span>
                        </td>

                        {/* Supplier */}
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{ color: "#94A3B8" }}
                          >
                            {item.supplier}
                          </span>
                        </td>

                        {/* Replacement Cycle */}
                        <td className="px-6 py-4">
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "#F8FAFC" }}
                            >
                              {item.replacementCycle}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#94A3B8" }}
                            >
                              ({item.replacementDays} days)
                            </div>
                          </div>
                        </td>

                        {/* Available Sizes */}
                        <td className="px-6 py-4">
                          {item.sizes ? (
                            <div className="flex flex-wrap gap-1">
                              {item.sizes.slice(0, 3).map((size) => (
                                <span
                                  key={size}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    color: "#F8FAFC",
                                  }}
                                >
                                  {size}
                                </span>
                              ))}
                              {item.sizes.length > 3 && (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    color: "#F8FAFC",
                                  }}
                                >
                                  +{item.sizes.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className="text-sm"
                              style={{ color: "#94A3B8" }}
                            >
                              Universal
                            </span>
                          )}
                        </td>

                        {/* Stock Level */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {stockStatus.status === "critical" && (
                              <AlertCircle
                                className="size-4"
                                style={{ color: stockStatus.color }}
                              />
                            )}
                            <div>
                              <div
                                className="text-sm font-bold"
                                style={{ color: stockStatus.color }}
                              >
                                {item.stockLevel} units
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "#94A3B8" }}
                              >
                                Min: {item.minStockLevel}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                            aria-label="Edit item"
                          >
                            <Edit
                              className="size-4"
                              style={{ color: "#94A3B8" }}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}