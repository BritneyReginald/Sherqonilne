import { Users, MapPin, FileText, ClipboardCheck, Heart, ShieldCheck, AlertTriangle } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "employee" | "site" | "document" | "training" | "medical" | "ppe" | "risk-assessment";
  module: string;
}

const allResults: SearchResult[] = [
  {
    id: "emp-001",
    title: "John Smith",
    subtitle: "Maintenance Technician • EMP-1042",
    type: "employee",
    module: "Workforce",
  },
  {
    id: "emp-002",
    title: "Sarah Johnson",
    subtitle: "Maintenance • EMP-1024",
    type: "employee",
    module: "Workforce",
  },
  {
    id: "emp-003",
    title: "Admin John",
    subtitle: "Administrator • EMP-1001",
    type: "employee",
    module: "Workforce",
  },
  {
    id: "site-001",
    title: "JHB South",
    subtitle: "Johannesburg • 47 employees",
    type: "site",
    module: "Company & Sites",
  },
  {
    id: "doc-001",
    title: "Risk Assessment - Electrical Work",
    subtitle: "Document Library • Updated 2 days ago",
    type: "document",
    module: "Documents",
  },
  {
    id: "trn-001",
    title: "Working at Heights Training",
    subtitle: "Training • Valid until Dec 2026",
    type: "training",
    module: "Training",
  },
  {
    id: "med-001",
    title: "Medical Surveillance - Periodic Exam",
    subtitle: "Sarah Johnson • Fit for Duty",
    type: "medical",
    module: "Medical",
  },
];

interface GlobalSearchProps {
  query: string;
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ query, onResultClick }: GlobalSearchProps) {
  const filteredResults = allResults.filter((result) => {
    const searchLower = query.toLowerCase();
    return (
      result.title.toLowerCase().includes(searchLower) ||
      result.subtitle.toLowerCase().includes(searchLower)
    );
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "employee":
        return <Users className="size-4" style={{ color: "var(--brand-blue)" }} />;
      case "site":
        return <MapPin className="size-4" style={{ color: "var(--compliance-success)" }} />;
      case "document":
        return <FileText className="size-4" style={{ color: "var(--grey-600)" }} />;
      case "training":
        return <ClipboardCheck className="size-4" style={{ color: "var(--compliance-warning)" }} />;
      case "medical":
        return <Heart className="size-4" style={{ color: "var(--compliance-danger)" }} />;
      case "ppe":
        return <ShieldCheck className="size-4" style={{ color: "var(--compliance-warning)" }} />;
      case "risk-assessment":
        return <AlertTriangle className="size-4" style={{ color: "var(--compliance-danger)" }} />;
      default:
        return <FileText className="size-4" style={{ color: "var(--grey-600)" }} />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "employee":
        return { label: "Employee", color: "var(--brand-blue)", bgColor: "var(--brand-blue)15" };
      case "site":
        return { label: "Location", color: "var(--compliance-success)", bgColor: "var(--compliance-success)15" };
      case "document":
        return { label: "Document", color: "var(--grey-600)", bgColor: "var(--grey-100)" };
      case "training":
        return { label: "Training", color: "var(--compliance-warning)", bgColor: "var(--compliance-warning)15" };
      case "medical":
        return { label: "Medical", color: "var(--compliance-danger)", bgColor: "var(--compliance-danger)15" };
      case "ppe":
        return { label: "PPE", color: "var(--compliance-warning)", bgColor: "var(--compliance-warning)15" };
      case "risk-assessment":
        return { label: "Risk", color: "var(--compliance-danger)", bgColor: "var(--compliance-danger)15" };
      default:
        return { label: type, color: "var(--grey-600)", bgColor: "var(--grey-100)" };
    }
  };

  if (filteredResults.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm" style={{ color: "var(--grey-500)" }}>
          No results found for "{query}"
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {filteredResults.map((result) => {
        const badge = getTypeBadge(result.type);

        return (
          <button
            key={result.id}
            onClick={() => onResultClick?.(result)}
            className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
          >
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: badge.bgColor,
              }}
            >
              {getIcon(result.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate" style={{ color: "var(--grey-900)" }}>
                  {result.title}
                </p>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: badge.bgColor,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: "var(--grey-600)" }}>
                {result.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
