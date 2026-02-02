import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Upload,
  Download,
  FileText,
  File,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  Archive,
} from "lucide-react";
import { VersionHistoryDrawer } from "@/app/components/version-history-drawer";
import { ConfirmDeactivationModal } from "@/app/components/confirm-deactivation-modal";

interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
}

interface Document {
  id: string;
  name: string;
  docId: string;
  revision: string;
  fileType: "pdf" | "doc" | "xls";
  lastUpdated: {
    date: string;
    user: string;
  };
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

const folderStructure: FolderNode = {
  id: "rss-global",
  name: "RSS Global",
  children: [
    {
      id: "client-a",
      name: "Client Company A",
      children: [
        {
          id: "jhb-site",
          name: "Johannesburg Site",
          children: [
            {
              id: "sheq-folders",
              name: "SHEQ Folders",
              children: [
                {
                  id: "policies",
                  name: "01. Policies",
                },
                {
                  id: "risk-assessments",
                  name: "02. Risk Assessments",
                },
                {
                  id: "legal-appointments",
                  name: "03. Legal Appointments",
                },
                {
                  id: "audit-reports",
                  name: "04. Audit Reports",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const documents: Document[] = [
  {
    id: "1",
    name: "Baseline Risk Assessment - Workshop",
    docId: "RA-WSP-001",
    revision: "3.0",
    fileType: "pdf",
    lastUpdated: {
      date: "2024-01-15",
      user: "Sarah Johnson",
    },
    expiryDate: "2025-10-15",
    status: "valid",
  },
  {
    id: "2",
    name: "Risk Assessment - Chemical Storage",
    docId: "RA-CHM-002",
    revision: "2.1",
    fileType: "pdf",
    lastUpdated: {
      date: "2023-11-20",
      user: "Michael Chen",
    },
    expiryDate: "2024-11-20",
    status: "expiring",
  },
  {
    id: "3",
    name: "Working at Heights Risk Matrix",
    docId: "RA-HTH-003",
    revision: "4.0",
    fileType: "pdf",
    lastUpdated: {
      date: "2023-03-10",
      user: "David van der Merwe",
    },
    expiryDate: "2024-03-10",
    status: "expired",
  },
  {
    id: "4",
    name: "Confined Space Entry Assessment",
    docId: "RA-CSE-004",
    revision: "1.5",
    fileType: "doc",
    lastUpdated: {
      date: "2024-06-05",
      user: "Emma Thompson",
    },
    expiryDate: "2026-06-05",
    status: "valid",
  },
  {
    id: "5",
    name: "Electrical Safety Risk Profile",
    docId: "RA-ELC-005",
    revision: "2.3",
    fileType: "pdf",
    lastUpdated: {
      date: "2024-02-18",
      user: "James Ndlovu",
    },
    expiryDate: "2025-02-18",
    status: "valid",
  },
  {
    id: "6",
    name: "Fire Risk Assessment Report",
    docId: "RA-FIR-006",
    revision: "3.2",
    fileType: "pdf",
    lastUpdated: {
      date: "2023-09-30",
      user: "Lisa Botha",
    },
    expiryDate: "2024-09-30",
    status: "expiring",
  },
  {
    id: "7",
    name: "Machinery Operations Risk Matrix",
    docId: "RA-MCH-007",
    revision: "1.0",
    fileType: "xls",
    lastUpdated: {
      date: "2023-05-12",
      user: "Peter van Zyl",
    },
    expiryDate: "2024-05-12",
    status: "expired",
  },
  {
    id: "8",
    name: "Manual Handling Assessment",
    docId: "RA-MHL-008",
    revision: "2.0",
    fileType: "pdf",
    lastUpdated: {
      date: "2024-08-22",
      user: "Sarah Johnson",
    },
    expiryDate: "2026-08-22",
    status: "valid",
  },
];

export function DocumentLibrary() {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    "rss-global",
    "client-a",
    "jhb-site",
    "sheq-folders",
  ]);
  const [activeFolder, setActiveFolder] = useState("risk-assessments");
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [documentToArchive, setDocumentToArchive] = useState<Document | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  return (
    <div className="h-full flex bg-background">
      {/* Left Column - Folder Navigation */}
      <aside
        className="w-80 border-r flex flex-col"
        style={{
          backgroundColor: "white",
          borderColor: "var(--grey-200)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-lg font-medium" style={{ color: "var(--grey-900)" }}>
            Site Repositories
          </h2>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-4">
          <FolderTree
            node={folderStructure}
            expandedFolders={expandedFolders}
            activeFolder={activeFolder}
            onToggle={toggleFolder}
            onSelect={setActiveFolder}
          />
        </div>
      </aside>

      {/* Right Column - File View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Breadcrumbs and Actions */}
        <div
          className="px-8 py-6 border-b"
          style={{
            backgroundColor: "white",
            borderColor: "var(--grey-200)",
          }}
        >
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span style={{ color: "var(--grey-500)" }}>Client Company A</span>
            <ChevronRight className="size-4" style={{ color: "var(--grey-400)" }} />
            <span style={{ color: "var(--grey-500)" }}>JHB Site</span>
            <ChevronRight className="size-4" style={{ color: "var(--grey-400)" }} />
            <span style={{ color: "var(--grey-900)" }} className="font-medium">
              Risk Assessments
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Upload className="size-5" />
              Upload Document
            </button>
            <button
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-100)";
              }}
            >
              <Download className="size-5" />
              Download Register (PDF)
            </button>
          </div>
        </div>

        {/* Document Table */}
        <div className="flex-1 overflow-auto p-8">
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: "var(--grey-50)",
                      borderColor: "var(--grey-200)",
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Document Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Doc ID No
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Revision
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Last Updated
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Expiry Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium"
                      style={{ color: "var(--grey-700)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b hover:bg-secondary transition-colors cursor-pointer"
                      style={{ borderColor: "var(--grey-200)" }}
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowVersionDrawer(true);
                      }}
                    >
                      {/* Document Name with Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileIcon fileType={doc.fileType} />
                          <span
                            className="text-sm font-medium"
                            style={{ color: "var(--grey-900)" }}
                          >
                            {doc.name}
                          </span>
                        </div>
                      </td>

                      {/* Doc ID */}
                      <td className="px-6 py-4">
                        <span
                          className="text-sm font-mono"
                          style={{ color: "var(--grey-700)" }}
                        >
                          {doc.docId}
                        </span>
                      </td>

                      {/* Revision Badge */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "var(--brand-blue)20",
                            color: "var(--brand-blue)",
                          }}
                        >
                          Rev {doc.revision}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div style={{ color: "var(--grey-900)" }}>
                            {new Date(doc.lastUpdated.date).toLocaleDateString(
                              "en-ZA",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--grey-500)" }}
                          >
                            by {doc.lastUpdated.user}
                          </div>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: "var(--grey-700)" }}>
                          {new Date(doc.expiryDate).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActionMenu(
                                showActionMenu === doc.id ? null : doc.id
                              );
                            }}
                            className="p-2 rounded hover:bg-secondary transition-colors"
                            aria-label="More actions"
                          >
                            <MoreVertical
                              className="size-4"
                              style={{ color: "var(--grey-600)" }}
                            />
                          </button>

                          {/* Action Menu */}
                          {showActionMenu === doc.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-56 rounded-lg border shadow-lg overflow-hidden z-10"
                              style={{
                                backgroundColor: "white",
                                borderColor: "var(--grey-200)",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                                style={{ color: "var(--grey-700)" }}
                              >
                                <Download className="size-4" />
                                Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                                style={{ color: "var(--grey-700)" }}
                              >
                                <Upload className="size-4" />
                                Upload New Version
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocument(doc);
                                  setShowVersionDrawer(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                                style={{ color: "var(--grey-700)" }}
                              >
                                <Clock className="size-4" />
                                View Version History
                              </button>
                              <div
                                className="border-t"
                                style={{ borderColor: "var(--grey-200)" }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDocumentToArchive(doc);
                                  setShowArchiveModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                                style={{ color: "var(--compliance-danger)" }}
                              >
                                <Archive className="size-4" />
                                Move to Archive
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Drawer */}
      {selectedDocument && (
        <VersionHistoryDrawer
          isOpen={showVersionDrawer}
          onClose={() => {
            setShowVersionDrawer(false);
            setSelectedDocument(null);
          }}
          documentName={selectedDocument.name}
          docId={selectedDocument.docId}
          currentRevision={selectedDocument.revision}
          versions={getVersionHistory(selectedDocument.docId)}
        />
      )}

      {/* Archive Confirmation Modal */}
      <ConfirmDeactivationModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setDocumentToArchive(null);
        }}
        onConfirm={() => {
          console.log("Archiving document:", documentToArchive);
          // In a real app, this would call an API to archive the document
        }}
        itemName={documentToArchive?.name}
      />
    </div>
  );
}

interface FolderTreeProps {
  node: FolderNode;
  expandedFolders: string[];
  activeFolder: string;
  onToggle: (folderId: string) => void;
  onSelect: (folderId: string) => void;
  level?: number;
}

function FolderTree({
  node,
  expandedFolders,
  activeFolder,
  onToggle,
  onSelect,
  level = 0,
}: FolderTreeProps) {
  const isExpanded = expandedFolders.includes(node.id);
  const isActive = activeFolder === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
    onSelect(node.id);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
        style={{
          paddingLeft: `${level * 0.75 + 0.75}rem`,
          backgroundColor: isActive ? "var(--brand-blue)10" : "transparent",
          color: isActive ? "var(--brand-blue)" : "var(--grey-700)",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "var(--grey-100)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown
                className="size-4"
                style={{ color: isActive ? "var(--brand-blue)" : "var(--grey-400)" }}
              />
            ) : (
              <ChevronRight
                className="size-4"
                style={{ color: isActive ? "var(--brand-blue)" : "var(--grey-400)" }}
              />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="flex-shrink-0">
          {isExpanded ? (
            <FolderOpen
              className="size-4"
              style={{ color: isActive ? "var(--brand-blue)" : "var(--grey-500)" }}
            />
          ) : (
            <Folder
              className="size-4"
              style={{ color: isActive ? "var(--brand-blue)" : "var(--grey-500)" }}
            />
          )}
        </span>
        <span className="flex-1 text-left truncate">{node.name}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <FolderTree
              key={child.id}
              node={child}
              expandedFolders={expandedFolders}
              activeFolder={activeFolder}
              onToggle={onToggle}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileIcon({ fileType }: { fileType: "pdf" | "doc" | "xls" }) {
  const iconConfig = {
    pdf: { color: "var(--compliance-danger)", bgColor: "var(--compliance-danger)10" },
    doc: { color: "var(--brand-blue)", bgColor: "var(--brand-blue)10" },
    xls: { color: "var(--compliance-success)", bgColor: "var(--compliance-success)10" },
  };

  const config = iconConfig[fileType];

  return (
    <div
      className="size-8 rounded flex items-center justify-center"
      style={{ backgroundColor: config.bgColor }}
    >
      <FileText className="size-4" style={{ color: config.color }} />
    </div>
  );
}

interface StatusBadgeProps {
  status: "valid" | "expiring" | "expired";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const badgeConfig = {
    valid: {
      label: "Valid",
      color: "var(--compliance-success)",
      icon: <CheckCircle2 className="size-4" />,
    },
    expiring: {
      label: "Expiring Soon",
      color: "var(--compliance-warning)",
      icon: <AlertTriangle className="size-4" />,
    },
    expired: {
      label: "Expired",
      color: "var(--compliance-danger)",
      icon: <XCircle className="size-4" />,
    },
  };

  const config = badgeConfig[status];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.icon}
      {config.label}
    </div>
  );
}

// Mock function to generate version history
function getVersionHistory(docId: string) {
  const versionHistory: Record<string, any[]> = {
    "RA-WSP-001": [
      {
        revision: "3.0",
        date: "2024-01-15T10:30:00",
        user: "Sarah Johnson",
        fileSize: "2.4 MB",
        changes: "Updated risk controls and added new PPE requirements based on Q4 2023 audit findings",
      },
      {
        revision: "2.0",
        date: "2023-06-10T14:15:00",
        user: "Michael Chen",
        fileSize: "2.1 MB",
        changes: "Revised hazard identification section and updated emergency response procedures",
      },
      {
        revision: "1.0",
        date: "2022-11-05T09:00:00",
        user: "David van der Merwe",
        fileSize: "1.8 MB",
        changes: "Initial baseline risk assessment for workshop operations",
      },
    ],
    "RA-CHM-002": [
      {
        revision: "2.1",
        date: "2023-11-20T11:45:00",
        user: "Michael Chen",
        fileSize: "1.9 MB",
        changes: "Minor updates to chemical storage temperature requirements",
      },
      {
        revision: "2.0",
        date: "2023-05-18T13:20:00",
        user: "Sarah Johnson",
        fileSize: "1.8 MB",
        changes: "Complete revision following new SANS regulations for hazardous material storage",
      },
      {
        revision: "1.0",
        date: "2022-09-15T10:00:00",
        user: "Emma Thompson",
        fileSize: "1.5 MB",
        changes: "Initial chemical storage risk assessment",
      },
    ],
  };

  return (
    versionHistory[docId] || [
      {
        revision: "1.0",
        date: new Date().toISOString(),
        user: "System",
        fileSize: "1.0 MB",
        changes: "Initial document version",
      },
    ]
  );
}