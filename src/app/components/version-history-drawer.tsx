import { useEffect, useRef, useState } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  Clock,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface DocumentVersion {
  id: number;
  revision: string;
  date: string;
  user: string;
  fileName: string;
  fileSize: string;
  changes: string;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  currentRevision: string;
  versions: DocumentVersion[];
  loading?: boolean;
  /** Returns a short-lived URL for a version (view = inline, download = attachment) */
  fetchUrl: (versionId: number, mode: "view" | "download") => Promise<string>;
}

type PreviewKind = "pdf" | "image" | "unsupported";

const getPreviewKind = (fileName: string): PreviewKind => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  return "unsupported";
};

interface PreviewState {
  version: DocumentVersion;
  kind: PreviewKind;
  url: string | null;
}

export function VersionHistoryDrawer({
  isOpen,
  onClose,
  documentName,
  currentRevision,
  versions,
  loading = false,
  fetchUrl,
}: VersionHistoryDrawerProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const requestRef = useRef(0); // ignores slow responses from an earlier click

  const closePreview = () => {
    requestRef.current++;
    setPreview(null);
    setPreviewError("");
    setPreviewLoading(false);
  };

  // Esc closes the preview first, then the drawer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (preview) closePreview();
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, preview, onClose]);

  if (!isOpen) return null;

  const handleView = async (version: DocumentVersion) => {
    // Small screens: no room for a side panel, so open a new tab.
    // The tab is opened synchronously so popup blockers allow it.
    if (window.innerWidth < 1024) {
      const win = window.open("", "_blank");
      try {
        const url = await fetchUrl(version.id, "view");
        if (win) win.location.href = url;
      } catch (e: any) {
        win?.close();
        alert(e.message || "Failed to open file");
      }
      return;
    }

    const requestId = ++requestRef.current;
    const kind = getPreviewKind(version.fileName);
    setPreviewError("");

    if (kind === "unsupported") {
      setPreview({ version, kind, url: null });
      setPreviewLoading(false);
      return;
    }

    setPreview({ version, kind, url: null });
    setPreviewLoading(true);
    try {
      const url = await fetchUrl(version.id, "view");
      if (requestId !== requestRef.current) return;
      setPreview({ version, kind, url });
    } catch (e: any) {
      if (requestId !== requestRef.current) return;
      setPreviewError(e.message || "Failed to load preview");
    } finally {
      if (requestId === requestRef.current) setPreviewLoading(false);
    }
  };

  const handleDownload = async (version: DocumentVersion) => {
    setDownloadingId(version.id);
    try {
      const url = await fetchUrl(version.id, "download");
      // attachment header → browser downloads, page stays where it is
      window.location.href = url;
    } catch (e: any) {
      alert(e.message || "Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* LEFT: backdrop, or the document preview when a version is being viewed */}
      {!preview ? (
        <div
          className="flex-1 min-w-0"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={onClose}
        />
      ) : (
        <div
          className="flex-1 min-w-0 hidden lg:flex flex-col p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden shadow-2xl"
            style={{ backgroundColor: "white" }}
          >
            {/* Preview header */}
            <div
              className="px-5 py-3 border-b flex items-center justify-between gap-4 flex-shrink-0"
              style={{ borderColor: "var(--grey-200)" }}
            >
              <div className="min-w-0">
                <p
                  className="font-medium truncate"
                  style={{ color: "var(--grey-900)" }}
                >
                  {preview.version.fileName}
                </p>
                <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                  Revision {preview.version.revision} •{" "}
                  {preview.version.fileSize}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {preview.url && (
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                    style={{
                      backgroundColor: "var(--grey-100)",
                      color: "var(--grey-900)",
                    }}
                  >
                    <ExternalLink className="size-4" />
                    New tab
                  </a>
                )}
                <button
                  onClick={closePreview}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Close preview"
                >
                  <X className="size-5" style={{ color: "var(--grey-500)" }} />
                </button>
              </div>
            </div>

            {/* Preview body */}
            <div
              className="flex-1 min-h-0 relative"
              style={{ backgroundColor: "var(--grey-100)" }}
            >
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2
                    className="size-8 animate-spin"
                    style={{ color: "var(--grey-400)" }}
                  />
                </div>
              )}

              {previewError && (
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                  <p
                    className="text-sm"
                    style={{ color: "var(--compliance-danger)" }}
                  >
                    {previewError}
                  </p>
                </div>
              )}

              {preview.kind === "pdf" && preview.url && (
                <iframe
                  key={preview.url}
                  src={preview.url}
                  title={preview.version.fileName}
                  className="w-full h-full border-0"
                />
              )}

              {preview.kind === "image" && preview.url && (
                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                  <img
                    src={preview.url}
                    alt={preview.version.fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {preview.kind === "unsupported" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div
                    className="size-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: "white" }}
                  >
                    <FileText
                      className="size-8"
                      style={{ color: "var(--grey-400)" }}
                    />
                  </div>
                  <p className="text-lg" style={{ color: "var(--grey-700)" }}>
                    Preview isn't available for this file type
                  </p>
                  <p
                    className="text-sm mt-1 mb-5"
                    style={{ color: "var(--grey-500)" }}
                  >
                    Word, Excel and other Office files need to be downloaded to
                    open.
                  </p>
                  <button
                    onClick={() => handleDownload(preview.version)}
                    className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--brand-blue, #1D4ED8)" }}
                  >
                    <Download className="size-4" />
                    Download file
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT: the drawer */}
      <div
        className="w-full max-w-2xl shadow-2xl flex flex-col flex-shrink-0"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="px-6 py-5 border-b flex items-start justify-between flex-shrink-0"
          style={{ borderColor: "var(--grey-200)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--brand-blue)10" }}
              >
                <Clock
                  className="size-5"
                  style={{ color: "var(--brand-blue)" }}
                />
              </div>
              <h2 className="text-xl" style={{ color: "var(--grey-900)" }}>
                Version History
              </h2>
            </div>
            <h3
              className="font-medium mb-1 truncate"
              style={{ color: "var(--grey-900)" }}
            >
              {documentName}
            </h3>
            <div className="text-sm" style={{ color: "var(--grey-600)" }}>
              Current: Rev {currentRevision}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="size-5" style={{ color: "var(--grey-500)" }} />
          </button>
        </div>

        {/* Audit Notice */}
        <div
          className="mx-6 mt-6 px-4 py-3 rounded-lg border-l-4 flex-shrink-0"
          style={{
            backgroundColor: "var(--brand-blue)05",
            borderColor: "var(--brand-blue)",
          }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--grey-900)" }}
          >
            Audit Trail Maintained
          </p>
          <p className="text-sm" style={{ color: "var(--grey-700)" }}>
            All document revisions are permanently retained for legal and
            compliance purposes. No versions are ever deleted from the system.
          </p>
        </div>

        {/* Version List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {loading && (
            <p className="text-sm" style={{ color: "var(--grey-500)" }}>
              Loading…
            </p>
          )}

          {!loading && versions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--grey-500)" }}>
              No versions found.
            </p>
          )}

          <div className="space-y-3">
            {versions.map((version, index) => {
              const isViewing = preview?.version.id === version.id;

              return (
                <div
                  key={version.id}
                  className="border rounded-lg overflow-hidden transition-colors"
                  style={{
                    backgroundColor: "white",
                    borderColor: isViewing
                      ? "var(--brand-blue)"
                      : "var(--grey-200)",
                  }}
                >
                  <div className="p-5">
                    {/* Version Header */}
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              index === 0
                                ? "var(--compliance-success)15"
                                : "var(--grey-100)",
                          }}
                        >
                          <FileText
                            className="size-5"
                            style={{
                              color:
                                index === 0
                                  ? "var(--compliance-success)"
                                  : "var(--grey-500)",
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-medium"
                              style={{ color: "var(--grey-900)" }}
                            >
                              Revision {version.revision}
                            </span>
                            {index === 0 && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{
                                  backgroundColor: "var(--compliance-success)",
                                }}
                              >
                                Current
                              </span>
                            )}
                          </div>
                          <div
                            className="flex items-center gap-3 text-sm flex-wrap"
                            style={{ color: "var(--grey-600)" }}
                          >
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {new Date(version.date).toLocaleDateString(
                                "en-ZA",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}{" "}
                              at{" "}
                              {new Date(version.date).toLocaleTimeString(
                                "en-ZA",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="size-3.5" />
                              {version.user}
                            </span>
                          </div>
                          <p
                            className="text-xs mt-1 truncate"
                            style={{ color: "var(--grey-500)" }}
                            title={version.fileName}
                          >
                            {version.fileName}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded flex-shrink-0"
                        style={{
                          backgroundColor: "var(--grey-100)",
                          color: "var(--grey-600)",
                        }}
                      >
                        {version.fileSize}
                      </span>
                    </div>

                    {/* Changes Description */}
                    {version.changes && (
                      <div
                        className="mb-4 p-3 rounded"
                        style={{ backgroundColor: "var(--grey-50)" }}
                      >
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: "var(--grey-700)" }}
                        >
                          Change Summary:
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--grey-600)" }}
                        >
                          {version.changes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(version)}
                        className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "var(--brand-blue, #1D4ED8)",
                        }}
                      >
                        <Eye className="size-4" />
                        {isViewing ? "Viewing" : "View"}
                      </button>
                      <button
                        onClick={() => handleDownload(version)}
                        disabled={downloadingId === version.id}
                        className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--grey-100)",
                          color: "var(--grey-900)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--grey-200)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--grey-100)";
                        }}
                      >
                        {downloadingId === version.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          className="px-6 py-4 border-t flex-shrink-0"
          style={{
            backgroundColor: "var(--grey-50)",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--grey-500)" }}>
            Showing {versions.length} version{versions.length !== 1 ? "s" : ""}{" "}
            • All versions permanently archived
          </p>
        </div>
      </div>
    </div>
  );
}
