import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Clock,
  Archive,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { VersionHistoryDrawer } from "../components/version-history-drawer";
import { ConfirmDeactivationModal } from "../components/confirm-deactivation-modal";
import { CreateFolderModal } from "../components/create-folder-modal";
import { UploadDocumentModal } from "../components/upload-document-modal";
import {
  ApiDocument,
  ApiEmployee,
  ApiFolder,
  ApiVersion,
  archiveDocument,
  createFolder,
  downloadFolderZip,
  fetchDocuments,
  fetchEmployees,
  fetchFileUrl,
  fetchFolders,
  fetchVersions,
  uploadDocument,
  uploadNewVersion,
} from "../../api/documentLibrary";

interface FolderNode extends ApiFolder {
  children: FolderNode[];
}

type UploadModalState =
  | { mode: "new" }
  | { mode: "version"; doc: ApiDocument }
  | null;

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const formatSize = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function buildTree(folders: ApiFolder[]): FolderNode[] {
  const map = new Map<number, FolderNode>();
  folders.forEach((f) => map.set(f.id, { ...f, children: [] }));
  const roots: FolderNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function getFileKind(doc: ApiDocument): "pdf" | "doc" | "xls" | "other" {
  const ext = doc.file_name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  return "other";
}

const STATUS_LABEL = {
  valid: "Valid",
  expiring: "Expiring Soon",
  expired: "Expired",
} as const;

export function DocumentLibrary() {
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [pageError, setPageError] = useState("");

  const [menu, setMenu] = useState<{
    doc: ApiDocument;
    top: number;
    right: number;
  } | null>(null);

  const [folderModal, setFolderModal] = useState<null | {
    parent: ApiFolder | null;
  }>(null);
  const [uploadModal, setUploadModal] = useState<UploadModalState>(null);

  const [selectedDocument, setSelectedDocument] = useState<ApiDocument | null>(
    null,
  );
  const [versions, setVersions] = useState<ApiVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [documentToArchive, setDocumentToArchive] =
    useState<ApiDocument | null>(null);

  const tree = useMemo(() => buildTree(folders), [folders]);
  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? null;

  // Breadcrumb: root → … → active folder
  const breadcrumb = useMemo(() => {
    const trail: ApiFolder[] = [];
    let current = activeFolder;
    while (current) {
      trail.unshift(current);
      current = folders.find((f) => f.id === current!.parent_id) ?? null;
    }
    return trail;
  }, [activeFolder, folders]);

  /* ----------------------------- loading ----------------------------- */

  const loadFolders = async () => {
    try {
      const data = await fetchFolders();
      setFolders(data);
      return data;
    } catch (e: any) {
      setPageError(e.message);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      const data = await loadFolders();
      if (data.length > 0) {
        const roots = data.filter((f) => !f.parent_id);
        if (roots[0]) setActiveFolderId(roots[0].id);
      }
      try {
        const emps = await fetchEmployees();
        setEmployees(emps.filter((e) => e.status !== "Inactive"));
      } catch {
        /* dropdown will just be empty */
      }
    })();
  }, []);

  const loadDocuments = async (folderId: number | null) => {
    if (!folderId) return setDocuments([]);
    setLoadingDocs(true);
    try {
      setDocuments(await fetchDocuments(folderId));
      setPageError("");
    } catch (e: any) {
      setPageError(e.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments(activeFolderId);
  }, [activeFolderId]);

  /* ----------------------------- folders ----------------------------- */

  const toggleFolder = (id: number) =>
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleCreateFolder = async (name: string) => {
    const parent = folderModal?.parent ?? null;
    const created = await createFolder(name, parent?.id ?? null);
    await loadFolders();
    if (parent) {
      setExpandedFolders((prev) =>
        prev.includes(parent.id) ? prev : [...prev, parent.id],
      );
    }
    setActiveFolderId(created.id);
  };

  const handleDownloadZip = async () => {
    if (!activeFolder) return;
    try {
      await downloadFolderZip(activeFolder);
    } catch (e: any) {
      alert(e.message);
    }
  };

  /* ---------------------------- documents ---------------------------- */

  const handleUploadSubmit = async (formData: FormData) => {
    if (!uploadModal) return;
    if (uploadModal.mode === "new") {
      if (!activeFolderId) throw new Error("Select a folder first");
      formData.append("folderId", String(activeFolderId));
      await uploadDocument(formData);
    } else {
      await uploadNewVersion(uploadModal.doc.id, formData);
    }
    await loadDocuments(activeFolderId);
  };

  const openFile = async (
    docId: number,
    mode: "view" | "download",
    versionId?: number,
  ) => {
    // Open the tab synchronously so popup blockers don't stop it
    const win = mode === "view" ? window.open("", "_blank") : null;
    try {
      const url = await fetchFileUrl(docId, mode, versionId);
      if (mode === "view" && win) win.location.href = url;
      else window.location.href = url; // attachment header → downloads, page stays
    } catch (e: any) {
      win?.close();
      alert(e.message);
    }
  };

  const openVersionHistory = async (doc: ApiDocument) => {
    setSelectedDocument(doc);
    setLoadingVersions(true);
    try {
      setVersions(await fetchVersions(doc.id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingVersions(false);
    }
  };

  const confirmArchive = async () => {
    const doc = documentToArchive; // capture before the modal clears it
    if (!doc) return;
    try {
      await archiveDocument(doc.id);
      await loadDocuments(activeFolderId);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openMenu = (e: React.MouseEvent, doc: ApiDocument) => {
    e.stopPropagation();
    if (menu?.doc.id === doc.id) return setMenu(null);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const MENU_HEIGHT = 200;
    const top =
      rect.bottom + MENU_HEIGHT > window.innerHeight
        ? rect.top - MENU_HEIGHT - 4
        : rect.bottom + 4;
    setMenu({ doc, top, right: window.innerWidth - rect.right });
  };

  /* ----------------------------- register PDF ----------------------------- */

  const handleDownloadRegister = () => {
    if (!activeFolder) return;
    const pdf = new jsPDF({ orientation: "landscape" });
    const path = breadcrumb.map((f) => f.name).join(" / ");

    pdf.setFontSize(16);
    pdf.text("Document Register", 14, 16);
    pdf.setFontSize(10);
    pdf.text(path, 14, 23);
    pdf.text(
      `Generated: ${formatDate(new Date().toISOString().slice(0, 10))}`,
      14,
      29,
    );

    autoTable(pdf, {
      startY: 35,
      head: [
        [
          "Document Name",
          "Revision",
          "Last Updated",
          "Updated By",
          "Expiry Date",
          "Status",
        ],
      ],
      body: documents.map((d) => [
        d.name,
        `Rev ${d.current_version}`,
        formatDate(d.last_updated_date),
        d.updated_by_name ?? "—",
        formatDate(d.expiry_date),
        STATUS_LABEL[d.status],
      ]),
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 9 },
    });

    pdf.save(`${activeFolder.name} - Register.pdf`);
  };

  /* ------------------------------- render ------------------------------- */

  return (
    <div className="h-full flex bg-background">
      {/* Left Column - Folder Navigation */}
      <aside
        className="w-80 border-r flex flex-col"
        style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--grey-200)" }}
        >
          <h2
            className="text-lg font-medium"
            style={{ color: "var(--grey-900)" }}
          >
            Site Repositories
          </h2>
          <button
            onClick={() => setFolderModal({ parent: null })}
            className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            <FolderPlus className="size-4" />
            Create folder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tree.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--grey-500)" }}>
              No folders yet. Click “Create folder” to get started.
            </p>
          ) : (
            tree.map((node) => (
              <FolderTree
                key={node.id}
                node={node}
                expandedFolders={expandedFolders}
                activeFolder={activeFolderId}
                onToggle={toggleFolder}
                onSelect={setActiveFolderId}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right Column - File View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-8 py-6 border-b"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm flex-wrap min-h-5">
            {breadcrumb.length === 0 && (
              <span style={{ color: "var(--grey-500)" }}>
                No folder selected
              </span>
            )}
            {breadcrumb.map((f, i) => (
              <span key={f.id} className="flex items-center gap-2">
                {i > 0 && (
                  <ChevronRight
                    className="size-4"
                    style={{ color: "var(--grey-400)" }}
                  />
                )}
                <span
                  className={i === breadcrumb.length - 1 ? "font-medium" : ""}
                  style={{
                    color:
                      i === breadcrumb.length - 1
                        ? "var(--grey-900)"
                        : "var(--grey-500)",
                  }}
                >
                  {f.name}
                </span>
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setUploadModal({ mode: "new" })}
              disabled={!activeFolder}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Upload className="size-5" />
              Upload Document
            </button>

            <button
              onClick={() => setFolderModal({ parent: activeFolder })}
              disabled={!activeFolder}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
            >
              <FolderPlus className="size-5" />
              New Subfolder
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={!activeFolder}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
            >
              <Download className="size-5" />
              Download Folder (ZIP)
            </button>

            <button
              onClick={handleDownloadRegister}
              disabled={!activeFolder || documents.length === 0}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
            >
              <FileText className="size-5" />
              Download Register (PDF)
            </button>
          </div>

          {pageError && (
            <p
              className="text-sm mt-3"
              style={{ color: "var(--compliance-danger)" }}
            >
              {pageError}
            </p>
          )}
        </div>

        {/* Document Table */}
        <div className="flex-1 overflow-auto p-8">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
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
                    {[
                      "Document Name",
                      "Revision",
                      "Last Updated",
                      "Expiry Date",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-sm font-medium"
                        style={{ color: "var(--grey-700)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm"
                        style={{ color: "var(--grey-500)" }}
                      >
                        {!activeFolder
                          ? "Create or select a folder to see its documents."
                          : loadingDocs
                            ? "Loading…"
                            : "No documents in this folder yet."}
                      </td>
                    </tr>
                  )}

                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b hover:bg-secondary transition-colors cursor-pointer"
                      style={{ borderColor: "var(--grey-200)" }}
                      onClick={() => openVersionHistory(doc)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileIcon kind={getFileKind(doc)} />
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "var(--grey-900)" }}
                            >
                              {doc.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "var(--grey-500)" }}
                            >
                              {doc.file_name} • {formatSize(doc.file_size)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "var(--brand-blue)20",
                            color: "var(--brand-blue)",
                          }}
                        >
                          Rev {doc.current_version}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div style={{ color: "var(--grey-900)" }}>
                            {formatDate(doc.last_updated_date)}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--grey-500)" }}
                          >
                            by {doc.updated_by_name ?? "—"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="text-sm"
                          style={{ color: "var(--grey-700)" }}
                        >
                          {formatDate(doc.expiry_date)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} />
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => openMenu(e, doc)}
                          className="p-2 rounded hover:bg-secondary transition-colors"
                          aria-label="More actions"
                        >
                          <MoreVertical
                            className="size-4"
                            style={{ color: "var(--grey-600)" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Action menu (fixed so the table's overflow never clips it) */}
      {menu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
          <div
            className="fixed w-56 rounded-lg border shadow-lg overflow-hidden z-20"
            style={{
              top: menu.top,
              right: menu.right,
              backgroundColor: "white",
              borderColor: "var(--grey-200)",
            }}
          >
            <MenuItem
              icon={<Download className="size-4" />}
              label="Download"
              onClick={() => {
                openFile(menu.doc.id, "download");
                setMenu(null);
              }}
            />
            <MenuItem
              icon={<Upload className="size-4" />}
              label="Upload New Version"
              onClick={() => {
                setUploadModal({ mode: "version", doc: menu.doc });
                setMenu(null);
              }}
            />
            <MenuItem
              icon={<Clock className="size-4" />}
              label="View Version History"
              onClick={() => {
                openVersionHistory(menu.doc);
                setMenu(null);
              }}
            />
            <div
              className="border-t"
              style={{ borderColor: "var(--grey-200)" }}
            />
            <MenuItem
              icon={<Archive className="size-4" />}
              label="Move to Archive"
              danger
              onClick={() => {
                setDocumentToArchive(menu.doc);
                setShowArchiveModal(true);
                setMenu(null);
              }}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {folderModal && (
        <CreateFolderModal
          parentName={folderModal.parent?.name}
          onClose={() => setFolderModal(null)}
          onCreate={handleCreateFolder}
        />
      )}

      {uploadModal && (
        <UploadDocumentModal
          mode={uploadModal.mode}
          documentName={
            uploadModal.mode === "version" ? uploadModal.doc.name : undefined
          }
          defaultExpiry={
            uploadModal.mode === "version" ? uploadModal.doc.expiry_date : null
          }
          employees={employees}
          onClose={() => setUploadModal(null)}
          onSubmit={handleUploadSubmit}
        />
      )}

      {selectedDocument && (
        <VersionHistoryDrawer
          isOpen
          onClose={() => {
            setSelectedDocument(null);
            setVersions([]);
          }}
          documentName={selectedDocument.name}
          currentRevision={String(selectedDocument.current_version)}
          loading={loadingVersions}
          versions={versions.map((v) => ({
            id: v.id,
            revision: String(v.version_number),
            date: v.created_at,
            user: v.updated_by_name ?? "—",
            fileSize: formatSize(v.file_size),
            fileName: v.file_name,
            changes: v.change_summary ?? "",
          }))}
          fetchUrl={(versionId, mode) =>
            fetchFileUrl(selectedDocument.id, mode, versionId)
          }
        />
      )}

      <ConfirmDeactivationModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setDocumentToArchive(null);
        }}
        onConfirm={confirmArchive}
        itemName={documentToArchive?.name}
      />
    </div>
  );
}

/* ------------------------------ sub-components ------------------------------ */

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
      style={{ color: danger ? "var(--compliance-danger)" : "var(--grey-700)" }}
    >
      {icon}
      {label}
    </button>
  );
}

interface FolderTreeProps {
  node: FolderNode;
  expandedFolders: number[];
  activeFolder: number | null;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
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
  const hasChildren = node.children.length > 0;

  const handleClick = () => {
    if (hasChildren) onToggle(node.id);
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
          if (!isActive)
            e.currentTarget.style.backgroundColor = "var(--grey-100)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {hasChildren ? (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown
                className="size-4"
                style={{
                  color: isActive ? "var(--brand-blue)" : "var(--grey-400)",
                }}
              />
            ) : (
              <ChevronRight
                className="size-4"
                style={{
                  color: isActive ? "var(--brand-blue)" : "var(--grey-400)",
                }}
              />
            )}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="flex-shrink-0">
          {isExpanded && hasChildren ? (
            <FolderOpen
              className="size-4"
              style={{
                color: isActive ? "var(--brand-blue)" : "var(--grey-500)",
              }}
            />
          ) : (
            <Folder
              className="size-4"
              style={{
                color: isActive ? "var(--brand-blue)" : "var(--grey-500)",
              }}
            />
          )}
        </span>
        <span className="flex-1 text-left truncate">{node.name}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
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

function FileIcon({ kind }: { kind: "pdf" | "doc" | "xls" | "other" }) {
  const config = {
    pdf: {
      color: "var(--compliance-danger)",
      bgColor: "var(--compliance-danger)10",
    },
    doc: { color: "var(--brand-blue)", bgColor: "var(--brand-blue)10" },
    xls: {
      color: "var(--compliance-success)",
      bgColor: "var(--compliance-success)10",
    },
    other: { color: "var(--grey-600)", bgColor: "var(--grey-100)" },
  }[kind];

  return (
    <div
      className="size-8 rounded flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: config.bgColor }}
    >
      <FileText className="size-4" style={{ color: config.color }} />
    </div>
  );
}

function StatusBadge({ status }: { status: "valid" | "expiring" | "expired" }) {
  const config = {
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
  }[status];

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
