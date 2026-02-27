import { Network, Shield, Users, ChevronDown, ChevronRight, Maximize2 } from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { useState } from "react";

interface OrgNode {
  id: string;
  name: string;
  position: string;
  legalAppointment?: string;
  level: number;
  children?: OrgNode[];
}

const mockOrgData: OrgNode = {
  id: "1",
  name: "David van der Merwe",
  position: "CEO",
  legalAppointment: "OHS Act Section 16.1 - Principal Employer",
  level: 1,
  children: [
    {
      id: "2",
      name: "Sarah Thompson",
      position: "Operations Director",
      legalAppointment: "OHS Act Section 16.1 - Construction Work",
      level: 2,
      children: [
        {
          id: "4",
          name: "Michael Chen",
          position: "Construction Supervisor",
          legalAppointment: "OHS Act Section 16.2 - Safety Officer",
          level: 3,
          children: [
            {
              id: "7",
              name: "Thabo Molefe",
              position: "Site Safety Officer",
              legalAppointment: "OHS Act Section 16.2 - Safety Officer",
              level: 4,
            },
            {
              id: "8",
              name: "Johan Botha",
              position: "Safety Officer",
              legalAppointment: "OHS Act Section 16.2 - Safety Officer",
              level: 4,
            },
          ],
        },
        {
          id: "5",
          name: "Zanele Dlamini",
          position: "Operations Manager",
          legalAppointment: "OHS Act Section 17 - SHE Rep",
          level: 3,
          children: [
            {
              id: "9",
              name: "Sipho Mthembu",
              position: "Occupational Hygienist",
              legalAppointment: "OHS Act Section 13",
              level: 4,
            },
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Peter Naidoo",
      position: "Engineering Director",
      legalAppointment: "OHS Act Section 16.1 - Construction Work",
      level: 2,
      children: [
        {
          id: "6",
          name: "Lerato Mokoena",
          position: "Environmental Officer",
          legalAppointment: "NEMA Section 24G",
          level: 3,
        },
      ],
    },
  ],
};

export function OrganogramPreview() {
  const { colors } = useTheme();
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["1", "2", "3"]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) =>
      prev.includes(id) ? prev.filter((nodeId) => nodeId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: colors.background }}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Network className="size-8" style={{ color: "#3B82F6" }} />
              <h1 className="text-3xl font-bold" style={{ color: colors.primaryText }}>
                Organogram Preview
              </h1>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
              style={{
                backgroundColor: "#3B82F6",
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3B82F6";
              }}
            >
              <Maximize2 className="size-4" />
              <span>Full Screen</span>
            </button>
          </div>
          <p className="text-sm" style={{ color: colors.subText }}>
            Visual representation of organizational hierarchy and legal authority flow
          </p>
        </div>

        {/* Info Banner */}
        <div
          className="rounded-lg p-4 mb-6 flex items-start gap-3"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "none",
          }}
        >
          <Shield className="size-5 mt-0.5" style={{ color: "#3B82F6" }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: colors.primaryText }}>
              Legal Authority Flow
            </p>
            <p className="text-xs" style={{ color: colors.subText }}>
              This organogram displays the hierarchical structure of legal appointments under the OHS Act. Authority flows from Section 16.1 (Principal) downwards through designated roles and responsibilities.
            </p>
          </div>
        </div>

        {/* Organogram Visualization */}
        <div
          className="rounded-lg p-8"
          style={{
            backgroundColor: colors.surface,
            boxShadow:
              colors.background === "#0F172A"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Legend */}
          <div className="flex items-center gap-6 mb-8 pb-4 border-b" style={{ borderColor: colors.background === "#0F172A" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}>
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "#9333EA" }}
              />
              <span className="text-xs" style={{ color: colors.subText }}>
                Level 1: Principal Appointment
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "#3B82F6" }}
              />
              <span className="text-xs" style={{ color: colors.subText }}>
                Level 2: Senior Authority
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "#10B981" }}
              />
              <span className="text-xs" style={{ color: colors.subText }}>
                Level 3: Mid-level Authority
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "#F59E0B" }}
              />
              <span className="text-xs" style={{ color: colors.subText }}>
                Level 4: Operational Level
              </span>
            </div>
          </div>

          {/* Tree Structure */}
          <div className="flex justify-center">
            <OrgNodeComponent
              node={mockOrgData}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              colors={colors}
            />
          </div>

          {/* AI Generation Notice */}
          <div
            className="mt-8 pt-6 border-t text-center"
            style={{
              borderColor:
                colors.background === "#0F172A"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Network className="size-5" style={{ color: "#3B82F6" }} />
              <p className="text-sm font-semibold" style={{ color: colors.primaryText }}>
                AI-Powered Organogram Generation
              </p>
            </div>
            <p className="text-xs max-w-2xl mx-auto" style={{ color: colors.subText }}>
              This organogram is automatically generated from employee reporting structures and legal appointment data. Updates to employee profiles and legal appointments will be reflected in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrgNodeComponentProps {
  node: OrgNode;
  expandedNodes: string[];
  toggleNode: (id: string) => void;
  colors: any;
  isLast?: boolean;
}

function OrgNodeComponent({
  node,
  expandedNodes,
  toggleNode,
  colors,
  isLast = false,
}: OrgNodeComponentProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.includes(node.id);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "#9333EA"; // Purple for Principal
      case 2:
        return "#3B82F6"; // Blue for Senior
      case 3:
        return "#10B981"; // Green for Mid-level
      case 4:
        return "#F59E0B"; // Amber for Operational
      default:
        return "#64748B"; // Gray fallback
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className="rounded-lg p-4 min-w-[280px] transition-all cursor-pointer"
        style={{
          backgroundColor: colors.surface,
          border: `2px solid ${getLevelColor(node.level)}`,
          boxShadow:
            colors.background === "#0F172A"
              ? `0 0 20px ${getLevelColor(node.level)}40`
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            colors.background === "#0F172A"
              ? `0 0 25px ${getLevelColor(node.level)}60`
              : "0 6px 10px -1px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            colors.background === "#0F172A"
              ? `0 0 20px ${getLevelColor(node.level)}40`
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
        }}
        onClick={() => hasChildren && toggleNode(node.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="size-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: getLevelColor(node.level) }}
            >
              {node.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.primaryText }}>
                {node.name}
              </p>
              <p className="text-xs" style={{ color: colors.subText }}>
                {node.position}
              </p>
            </div>
          </div>
          {hasChildren && (
            <button
              className="p-1 rounded transition-colors"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
              }}
            >
              {isExpanded ? (
                <ChevronDown className="size-4" style={{ color: "#3B82F6" }} />
              ) : (
                <ChevronRight className="size-4" style={{ color: "#3B82F6" }} />
              )}
            </button>
          )}
        </div>

        {/* Legal Appointment */}
        {node.legalAppointment && (
          <div
            className="rounded-lg p-2 flex items-start gap-2"
            style={{
              backgroundColor:
                colors.background === "#0F172A"
                  ? "rgba(15, 23, 42, 0.6)"
                  : "rgba(0, 0, 0, 0.02)",
            }}
          >
            <Shield className="size-4 mt-0.5 flex-shrink-0" style={{ color: getLevelColor(node.level) }} />
            <p className="text-xs leading-relaxed" style={{ color: colors.primaryText }}>
              {node.legalAppointment}
            </p>
          </div>
        )}

        {/* Hierarchy Level Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-block px-2 py-1 rounded text-xs font-semibold"
            style={{
              backgroundColor: `${getLevelColor(node.level)}20`,
              color: getLevelColor(node.level),
            }}
          >
            Level {node.level}
          </span>
          {hasChildren && (
            <span className="text-xs flex items-center gap-1" style={{ color: colors.subText }}>
              <Users className="size-3" />
              {node.children!.length} {node.children!.length === 1 ? "report" : "reports"}
            </span>
          )}
        </div>
      </div>

      {/* Connector Line */}
      {hasChildren && isExpanded && (
        <>
          <div
            className="w-0.5 h-8"
            style={{
              backgroundColor:
                colors.background === "#0F172A"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.2)",
            }}
          />

          {/* Children Container */}
          <div className="flex gap-8">
            {node.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Horizontal line to child */}
                {node.children!.length > 1 && index !== Math.floor(node.children!.length / 2) && (
                  <div
                    className="h-0.5 w-full absolute"
                    style={{
                      backgroundColor:
                        colors.background === "#0F172A"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(0, 0, 0, 0.2)",
                      marginTop: "-16px",
                    }}
                  />
                )}
                <OrgNodeComponent
                  node={child}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  colors={colors}
                  isLast={index === node.children!.length - 1}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
