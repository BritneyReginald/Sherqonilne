import { X, Search, Check, PenTool, Eraser } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PPECatalogueItem {
  id: string;
  name: string;
  category: string;
  sizes?: string[];
  requiresSize: boolean;
}

interface IssuePPEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const catalogueItems: PPECatalogueItem[] = [
  { id: "ppe-001", name: "Safety Boots", category: "Footwear", requiresSize: true, sizes: ["6", "7", "8", "9", "10", "11", "12"] },
  { id: "ppe-002", name: "Hard Hat", category: "Head Protection", requiresSize: false },
  { id: "ppe-003", name: "Safety Goggles", category: "Eye Protection", requiresSize: false },
  { id: "ppe-004", name: "High-Vis Vest", category: "Visibility", requiresSize: true, sizes: ["S", "M", "L", "XL", "XXL"] },
  { id: "ppe-005", name: "Safety Harness", category: "Fall Protection", requiresSize: true, sizes: ["S", "M", "L", "XL"] },
  { id: "ppe-006", name: "Ear Plugs", category: "Hearing Protection", requiresSize: false },
  { id: "ppe-007", name: "Leather Gloves", category: "Hand Protection", requiresSize: true, sizes: ["S", "M", "L", "XL"] },
  { id: "ppe-008", name: "Dust Mask FFP2", category: "Respiratory Protection", requiresSize: true, sizes: ["S", "M", "L"] },
];

const employees = [
  { id: "EMP001", name: "Sarah Jenkins", jobTitle: "Welder" },
  { id: "EMP002", name: "Michael Chen", jobTitle: "Construction Supervisor" },
  { id: "EMP003", name: "John Smith", jobTitle: "Electrician" },
  { id: "EMP004", name: "Emma Thompson", jobTitle: "Environmental Officer" },
  { id: "EMP005", name: "David van der Merwe", jobTitle: "Operations Manager" },
  { id: "EMP006", name: "Lisa Botha", jobTitle: "Rigger / Scaffolder" },
  { id: "EMP007", name: "James Ndlovu", jobTitle: "Plant Operator" },
  { id: "EMP008", name: "Peter van Zyl", jobTitle: "Mechanical Technician" },
  { id: "EMP009", name: "Thandi Mkhize", jobTitle: "Quality Inspector" },
  { id: "EMP010", name: "Robert Malan", jobTitle: "Safety Representative" },
];

export function IssuePPEModal({ isOpen, onClose, onSubmit }: IssuePPEModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, { condition: string; size?: string }>>(new Map());
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setSelectedEmployee("");
      setEmployeeSearch("");
      setSelectedItems(new Map());
      setHasSigned(false);
      clearSignature();
    }
  }, [isOpen]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const toggleItem = (itemId: string) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.set(itemId, { condition: "new" });
    }
    setSelectedItems(newSelected);
  };

  const updateItemDetails = (itemId: string, field: "condition" | "size", value: string) => {
    const newSelected = new Map(selectedItems);
    const item = newSelected.get(itemId);
    if (item) {
      newSelected.set(itemId, { ...item, [field]: value });
      setSelectedItems(newSelected);
    }
  };

  // Signature pad functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0B3D91";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = () => {
    if (!selectedEmployee || selectedItems.size === 0 || !hasSigned) {
      alert("Please select an employee, at least one PPE item, and provide a signature.");
      return;
    }

    // In a real app, this would submit to an API
    console.log({
      employee: selectedEmployee,
      items: Array.from(selectedItems.entries()),
      signature: canvasRef.current?.toDataURL(),
    });

    onSubmit({
      employee: selectedEmployee,
      items: selectedItems,
    });

    onClose();
  };

  if (!isOpen) return null;

  const selectedEmp = employees.find((e) => e.id === selectedEmployee);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] shadow-2xl z-50 rounded-lg overflow-hidden flex flex-col"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl" style={{ color: "var(--grey-900)" }}>
            Issue New PPE
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="size-5" style={{ color: "var(--grey-500)" }} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Section 1: Select Employee */}
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--grey-900)" }}>
                1. Select Employee
              </h3>
              <div className="relative">
                <div
                  className="px-4 py-3 rounded-lg border cursor-pointer"
                  style={{
                    borderColor: "var(--grey-300)",
                    backgroundColor: "white",
                  }}
                  onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                >
                  {selectedEmp ? (
                    <div>
                      <div className="font-medium" style={{ color: "var(--grey-900)" }}>
                        {selectedEmp.name}
                      </div>
                      <div className="text-sm" style={{ color: "var(--grey-600)" }}>
                        {selectedEmp.jobTitle}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "var(--grey-500)" }}>Select an employee...</div>
                  )}
                </div>

                {/* Employee Dropdown */}
                {showEmployeeDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-10"
                    style={{
                      backgroundColor: "white",
                      borderColor: "var(--grey-200)",
                      maxHeight: "300px",
                    }}
                  >
                    {/* Search */}
                    <div className="p-3 border-b" style={{ borderColor: "var(--grey-200)" }}>
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                          style={{ color: "var(--grey-400)" }}
                        />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="w-full h-10 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2"
                          style={{
                            borderColor: "var(--grey-300)",
                            color: "var(--grey-900)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Employee List */}
                    <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                      {filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setSelectedEmployee(emp.id);
                            setShowEmployeeDropdown(false);
                            setEmployeeSearch("");
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors border-b"
                          style={{ borderColor: "var(--grey-100)" }}
                        >
                          <div className="font-medium" style={{ color: "var(--grey-900)" }}>
                            {emp.name}
                          </div>
                          <div className="text-sm" style={{ color: "var(--grey-600)" }}>
                            {emp.jobTitle}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Select Items */}
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--grey-900)" }}>
                2. Select PPE Items
              </h3>
              <div
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: "var(--grey-200)" }}
              >
                <div className="divide-y" style={{ borderColor: "var(--grey-200)" }}>
                  {catalogueItems.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const itemDetails = selectedItems.get(item.id);

                    return (
                      <div
                        key={item.id}
                        className="p-4"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--brand-blue)05"
                            : "transparent",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className="pt-1">
                            <button
                              onClick={() => toggleItem(item.id)}
                              className="size-5 rounded border-2 flex items-center justify-center transition-colors"
                              style={{
                                borderColor: isSelected
                                  ? "var(--brand-blue)"
                                  : "var(--grey-300)",
                                backgroundColor: isSelected
                                  ? "var(--brand-blue)"
                                  : "white",
                              }}
                            >
                              {isSelected && (
                                <Check className="size-3.5 text-white" />
                              )}
                            </button>
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div
                                  className="font-medium"
                                  style={{ color: "var(--grey-900)" }}
                                >
                                  {item.name}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "var(--grey-600)" }}
                                >
                                  {item.category}
                                </div>
                              </div>
                            </div>

                            {/* Condition and Size Selection */}
                            {isSelected && (
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex-1">
                                  <label
                                    className="block text-xs font-medium mb-1"
                                    style={{ color: "var(--grey-700)" }}
                                  >
                                    Condition
                                  </label>
                                  <select
                                    value={itemDetails?.condition || "new"}
                                    onChange={(e) =>
                                      updateItemDetails(item.id, "condition", e.target.value)
                                    }
                                    className="w-full px-3 py-1.5 rounded border text-sm"
                                    style={{
                                      borderColor: "var(--grey-300)",
                                      color: "var(--grey-900)",
                                    }}
                                  >
                                    <option value="new">New</option>
                                    <option value="re-issued-good">Re-issued (Good)</option>
                                  </select>
                                </div>

                                {item.requiresSize && (
                                  <div className="flex-1">
                                    <label
                                      className="block text-xs font-medium mb-1"
                                      style={{ color: "var(--grey-700)" }}
                                    >
                                      Size
                                    </label>
                                    <select
                                      value={itemDetails?.size || ""}
                                      onChange={(e) =>
                                        updateItemDetails(item.id, "size", e.target.value)
                                      }
                                      className="w-full px-3 py-1.5 rounded border text-sm"
                                      style={{
                                        borderColor: "var(--grey-300)",
                                        color: "var(--grey-900)",
                                      }}
                                    >
                                      <option value="">Select size...</option>
                                      {item.sizes?.map((size) => (
                                        <option key={size} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm mt-2" style={{ color: "var(--grey-600)" }}>
                Selected {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Section 3: Digital Signature */}
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--grey-900)" }}>
                3. Employee Digital Signature
              </h3>
              <div>
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={200}
                  className="w-full border-2 rounded-lg cursor-crosshair"
                  style={{
                    borderColor: hasSigned ? "var(--brand-blue)" : "var(--grey-300)",
                    backgroundColor: "var(--grey-50)",
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <PenTool
                      className="size-4"
                      style={{ color: "var(--grey-500)" }}
                    />
                    <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                      {hasSigned
                        ? "Signature captured"
                        : "Sign above to acknowledge receipt of PPE"}
                    </p>
                  </div>
                  <button
                    onClick={clearSignature}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
                    style={{
                      borderColor: "var(--grey-300)",
                      color: "var(--grey-700)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--grey-50)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Eraser className="size-4" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Legal Notice */}
              <div
                className="mt-4 px-4 py-3 rounded-lg border-l-4"
                style={{
                  backgroundColor: "var(--brand-blue)05",
                  borderColor: "var(--brand-blue)",
                }}
              >
                <p className="text-sm" style={{ color: "var(--grey-700)" }}>
                  By signing above, the employee confirms receipt of the listed PPE items in the
                  specified condition and agrees to use them in accordance with safety regulations.
                  This digital signature is legally binding and will be stored for audit purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: "var(--grey-50)",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--grey-600)" }}>
            All fields are required to complete issuance
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "white",
                color: "var(--grey-700)",
                border: "1px solid var(--grey-300)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-50)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedEmployee || selectedItems.size === 0 || !hasSigned}
              className="px-6 py-2 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              Complete Issuance
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
