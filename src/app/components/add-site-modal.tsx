import { useState, useRef } from "react";
import { X, MapPin, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from "react-leaflet";
import { useTheme } from "@/app/contexts/theme-context";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siteData: {
    name: string;
    location: string;
    coordinates: [number, number];
    geofenceRadius: number;
  }) => void;
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const siteTypes = ["Construction", "Mining", "Factory"];
const siteManagers = [
  "John Smith",
  "Sarah Johnson",
  "Michael Chen",
  "Emma Thompson",
  "David van der Merwe",
];

const complianceModules = [
  { id: "medicals", label: "Medical Fitness Certificates" },
  { id: "ppe", label: "PPE Requirements & Tracking" },
  { id: "handover", label: "Toolbox Talks & Handovers" },
  { id: "training", label: "Training & Competency" },
  { id: "risk-assessments", label: "Risk Assessments" },
];

export function AddSiteModal({ isOpen, onClose, onSave }: AddSiteModalProps) {
  const { colors } = useTheme();
  const [siteName, setSiteName] = useState("");
  const [siteType, setSiteType] = useState("Construction");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [geofenceRadius, setGeofenceRadius] = useState(500);
  const [selectedManager, setSelectedManager] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([
    "medicals",
    "ppe",
    "handover",
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (siteName && siteType && coordinates && selectedManager) {
      onSave({
        name: siteName,
        location: `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`,
        coordinates,
        geofenceRadius,
      });
      // Reset form
      setSiteName("");
      setSiteType("Construction");
      setCoordinates(null);
      setGeofenceRadius(500);
      setSelectedManager("");
      setSelectedModules(["medicals", "ppe", "handover"]);
      onClose();
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const filteredManagers = siteManagers.filter((manager) =>
    manager.toLowerCase().includes(managerSearch.toLowerCase())
  );

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor:
            colors.background === "#0F172A"
              ? "rgba(15, 23, 42, 0.8)"
              : "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="w-full max-w-4xl rounded-lg overflow-hidden"
          style={{
            backgroundColor: "#1E293B",
            boxShadow: "0 0 40px rgba(59, 130, 246, 0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ color: "#F8FAFC" }}>
              Configure Site Environment
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: "#94A3B8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Section 1: Site Identity */}
            <div className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "#94A3B8" }}
              >
                Site Identity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#F8FAFC" }}
                  >
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g., Sasol Secunda"
                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      color: "#F8FAFC",
                      border: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#F8FAFC" }}
                  >
                    Site Type
                  </label>
                  <select
                    value={siteType}
                    onChange={(e) => setSiteType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      color: "#F8FAFC",
                      border: "none",
                    }}
                  >
                    {siteTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-6" />

            {/* Section 2: Geofencing Setup */}
            <div className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "#94A3B8" }}
              >
                Location & Radius
              </h3>

              {/* Explanation Banner */}
              <div
                className="mb-4 p-4 rounded-lg"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 mt-0.5" style={{ color: "#3B82F6" }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "#F8FAFC" }}>
                      Mobile App Geofencing
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                      The map pin defines the exact GPS coordinates (Latitude/Longitude) used by the worker mobile app.
                      If a worker is outside the defined radius, their Clock-In button will remain disabled.
                      <span className="block mt-1" style={{ color: "#3B82F6" }}>
                        Example: Radius = 500m → Worker at 501m away = Cannot clock in
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div
                className="rounded-lg overflow-hidden mb-4"
                style={{
                  height: "300px",
                  border: "2px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <MapContainer
                  center={[-26.0, 28.0]}
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={coordinates}
                    setPosition={setCoordinates}
                  />
                  {coordinates && (
                    <Circle
                      center={coordinates}
                      radius={geofenceRadius}
                      pathOptions={{
                        color: "#3B82F6",
                        fillColor: "#3B82F6",
                        fillOpacity: 0.2,
                      }}
                    />
                  )}
                </MapContainer>
              </div>
              
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>
                Click anywhere on the map to drop a pin. The blue circle represents the geofence boundary for mobile clock-ins.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#F8FAFC" }}
                  >
                    GPS Coordinates
                  </label>
                  <input
                    type="text"
                    value={
                      coordinates
                        ? `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`
                        : "Click map to set location"
                    }
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      color: coordinates ? "#3B82F6" : "#64748B",
                      border: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#F8FAFC" }}
                  >
                    Clock-in Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={geofenceRadius}
                    onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                    min="50"
                    max="5000"
                    step="50"
                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      color: "#F8FAFC",
                      border: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-6" />

            {/* Section 3: Leadership */}
            <div className="mb-6 relative">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "#94A3B8" }}
              >
                Leadership
              </h3>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#F8FAFC" }}
              >
                Assign Site Manager
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 size-4"
                  style={{ color: "#64748B" }}
                />
                <input
                  type="text"
                  value={selectedManager || managerSearch}
                  onChange={(e) => {
                    setManagerSearch(e.target.value);
                    setSelectedManager("");
                    setShowManagerDropdown(true);
                  }}
                  onFocus={() => setShowManagerDropdown(true)}
                  placeholder="Search for manager..."
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    color: "#F8FAFC",
                    border: "none",
                  }}
                />
                {showManagerDropdown && filteredManagers.length > 0 && (
                  <div
                    className="absolute z-10 w-full mt-1 rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: "#0F172A",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {filteredManagers.map((manager) => (
                      <button
                        key={manager}
                        onClick={() => {
                          setSelectedManager(manager);
                          setManagerSearch("");
                          setShowManagerDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left transition-colors"
                        style={{
                          color: "#F8FAFC",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(59, 130, 246, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {manager}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Separator */}
            <div className="h-6" />

            {/* Section 4: Compliance Requirements */}
            <div className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "#94A3B8" }}
              >
                Compliance Requirements
              </h3>
              <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
                Select mandatory modules for this site
              </p>
              <div className="space-y-3">
                {complianceModules.map((module) => (
                  <label
                    key={module.id}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: selectedModules.includes(module.id)
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(15, 23, 42, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedModules.includes(module.id)) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedModules.includes(module.id)) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(15, 23, 42, 0.4)";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={() => toggleModule(module.id)}
                      className="size-5 rounded cursor-pointer"
                      style={{
                        accentColor: "#3B82F6",
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: selectedModules.includes(module.id)
                          ? "#F8FAFC"
                          : "#94A3B8",
                      }}
                    >
                      {module.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
              style={{
                color: "#94A3B8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94A3B8";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!siteName || !siteType || !coordinates || !selectedManager}
              className="px-6 py-2.5 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed relative"
              style={{
                backgroundColor: "#3B82F6",
                color: "white",
                boxShadow: siteName && siteType && coordinates && selectedManager
                  ? "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)"
                  : "none",
                animation: siteName && siteType && coordinates && selectedManager
                  ? "pulse-glow 2s ease-in-out infinite"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (siteName && siteType && coordinates && selectedManager) {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3B82F6";
                e.currentTarget.style.transform = "translateY(0)";
                if (siteName && siteType && coordinates && selectedManager) {
                  e.currentTarget.style.boxShadow = 
                    "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)";
                } else {
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              Initialize Site
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe Animation for Glow */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(59, 130, 246, 0.5);
          }
        }
      `}</style>
    </>
  );
}