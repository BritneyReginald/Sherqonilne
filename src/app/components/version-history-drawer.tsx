import { X, FileText, Download, Eye, Clock, User } from "lucide-react";

interface DocumentVersion {
  revision: string;
  date: string;
  user: string;
  fileSize: string;
  changes: string;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  docId: string;
  currentRevision: string;
  versions: DocumentVersion[];
}

export function VersionHistoryDrawer({
  isOpen,
  onClose,
  documentName,
  docId,
  currentRevision,
  versions,
}: VersionHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl shadow-2xl z-50 flex flex-col"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="px-6 py-5 border-b flex items-start justify-between"
          style={{ borderColor: "var(--grey-200)" }}
        >
          <div className="flex-1">
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
            <h3 className="font-medium mb-1" style={{ color: "var(--grey-900)" }}>
              {documentName}
            </h3>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--grey-600)" }}>
              <span className="font-mono">{docId}</span>
              <span>•</span>
              <span>Current: Rev {currentRevision}</span>
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
          className="mx-6 mt-6 px-4 py-3 rounded-lg border-l-4"
          style={{
            backgroundColor: "var(--brand-blue)05",
            borderColor: "var(--brand-blue)",
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "var(--grey-900)" }}>
            Audit Trail Maintained
          </p>
          <p className="text-sm" style={{ color: "var(--grey-700)" }}>
            All document revisions are permanently retained for legal and compliance purposes.
            No versions are ever deleted from the system.
          </p>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.revision}
                className="border rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "white",
                  borderColor: "var(--grey-200)",
                }}
              >
                <div className="p-5">
                  {/* Version Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
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
                      <div>
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
                          className="flex items-center gap-3 text-sm"
                          style={{ color: "var(--grey-600)" }}
                        >
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {new Date(version.date).toLocaleDateString("en-ZA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(version.date).toLocaleTimeString("en-ZA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="size-3.5" />
                            {version.user}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: "var(--grey-100)",
                        color: "var(--grey-600)",
                      }}
                    >
                      {version.fileSize}
                    </span>
                  </div>

                  {/* Changes Description */}
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
                    <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                      {version.changes}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--brand-blue)" }}
                    >
                      <Eye className="size-4" />
                      View PDF
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
                      <Download className="size-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          className="px-6 py-4 border-t"
          style={{
            backgroundColor: "var(--grey-50)",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--grey-500)" }}>
            Showing {versions.length} version{versions.length !== 1 ? "s" : ""} •
            All versions permanently archived
          </p>
        </div>
      </div>
    </>
  );
}
