import { useRef, useState } from "react";
import {
  Upload,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import type { ApiEmployee } from "../../api/documentLibrary";

interface UploadDocumentModalProps {
  mode: "new" | "version";
  documentName?: string;
  defaultExpiry?: string | null;
  employees: ApiEmployee[];
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const BLUE = "var(--brand-blue, #1D4ED8)";
const MAX_SIZE = 25 * 1024 * 1024; // must match the multer limit on the server
const ALLOWED =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.txt";

const today = () => new Date().toISOString().slice(0, 10);

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function UploadDocumentModal({
  mode,
  documentName,
  defaultExpiry,
  employees,
  onClose,
  onSubmit,
}: UploadDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState(documentName ?? "");
  const [updatedById, setUpdatedById] = useState("");
  const [updatedDate, setUpdatedDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(defaultExpiry ?? "");
  const [changeSummary, setChangeSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (f: File | null) => {
    if (!f) return;

    if (f.size > MAX_SIZE) {
      setError(
        `That file is ${formatSize(f.size)}. The maximum size is 25 MB.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setFile(f);
    if (mode === "new" && !name.trim()) {
      setName(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const removeFile = () => {
    setFile(null);
    // Reset so choosing the same file again still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openPicker = () => fileInputRef.current?.click();

  const handleSubmit = async () => {
    if (!file) return setError("Please choose a file");
    if (mode === "new" && !name.trim())
      return setError("Please enter a document name");
    if (!updatedById) return setError("Please select who updated the document");

    const fd = new FormData();
    fd.append("file", file);
    if (mode === "new") fd.append("name", name.trim());
    fd.append("updatedById", updatedById);
    fd.append("updatedDate", updatedDate);
    fd.append("expiryDate", expiryDate);
    fd.append("changeSummary", changeSummary);

    setSaving(true);
    setError("");
    try {
      await onSubmit(fd);
      onClose();
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setSaving(false);
    }
  };

  const inputStyle = {
    borderColor: "var(--grey-200)",
    color: "var(--grey-900)",
  };
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg rounded-lg shadow-xl flex flex-col overflow-hidden pointer-events-auto"
          style={{ backgroundColor: "white", maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (fixed) */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
            style={{ borderColor: "var(--grey-200)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--brand-blue)10" }}
              >
                <Upload className="size-5" style={{ color: BLUE }} />
              </div>
              <div>
                <h2 className="text-xl" style={{ color: "var(--grey-900)" }}>
                  {mode === "new" ? "Upload Document" : "Upload New Version"}
                </h2>
                {mode === "version" && (
                  <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                    {documentName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary"
              aria-label="Close"
            >
              <X className="size-5" style={{ color: "var(--grey-500)" }} />
            </button>
          </div>

          {/* Body (scrolls) */}
          <div className="px-6 py-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
            {/* File picker */}
            <div>
              <label
                className={labelClass}
                style={{ color: "var(--grey-700)" }}
              >
                File
              </label>

              {/* Hidden native input, driven by the buttons below */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                  className="rounded-lg border-2 border-dashed px-4 py-6 flex flex-col items-center text-center transition-colors"
                  style={{
                    borderColor: dragging ? BLUE : "var(--grey-300, #D1D5DB)",
                    backgroundColor: dragging
                      ? "var(--brand-blue)10"
                      : "var(--grey-50)",
                  }}
                >
                  <button
                    type="button"
                    onClick={openPicker}
                    className="px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BLUE, color: "#ffffff" }}
                  >
                    <FolderOpen className="size-4" />
                    Choose File
                  </button>
                  <p
                    className="text-sm mt-3"
                    style={{ color: "var(--grey-600)" }}
                  >
                    or drag and drop it here
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--grey-500)" }}
                  >
                    PDF, Word, Excel, PowerPoint, images or text • max 25 MB
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-lg border-2 px-4 py-3 flex items-center gap-3"
                  style={{
                    borderColor: BLUE,
                    backgroundColor: "var(--brand-blue)05",
                  }}
                >
                  <div
                    className="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--brand-blue)15" }}
                  >
                    <FileText className="size-5" style={{ color: BLUE }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--grey-900)" }}
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p
                      className="text-xs flex items-center gap-1 mt-0.5"
                      style={{ color: "var(--grey-600)" }}
                    >
                      <CheckCircle2
                        className="size-3.5"
                        style={{ color: "var(--compliance-success, #16A34A)" }}
                      />
                      Ready to upload • {formatSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openPicker}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BLUE, color: "#ffffff" }}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 rounded-lg hover:bg-secondary flex-shrink-0"
                    aria-label="Remove file"
                    title="Remove file"
                  >
                    <X
                      className="size-4"
                      style={{ color: "var(--grey-500)" }}
                    />
                  </button>
                </div>
              )}
            </div>

            {mode === "new" && (
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--grey-700)" }}
                >
                  Document name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={inputStyle}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--grey-700)" }}
                >
                  Updated by
                </label>
                <select
                  value={updatedById}
                  onChange={(e) => setUpdatedById(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none bg-white"
                  style={inputStyle}
                >
                  <option value="">Select employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--grey-700)" }}
                >
                  Last updated
                </label>
                <input
                  type="date"
                  value={updatedDate}
                  onChange={(e) => setUpdatedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label
                className={labelClass}
                style={{ color: "var(--grey-700)" }}
              >
                Expiry date{" "}
                <span style={{ color: "var(--grey-500)" }}>(optional)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className={labelClass}
                style={{ color: "var(--grey-700)" }}
              >
                Change summary{" "}
                <span style={{ color: "var(--grey-500)" }}>(optional)</span>
              </label>
              <textarea
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border outline-none"
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                className="text-sm"
                style={{ color: "var(--compliance-danger)" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer (always visible) */}
          <div
            className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0"
            style={{
              backgroundColor: "var(--grey-50)",
              borderColor: "var(--grey-200)",
            }}
          >
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 min-w-[140px] transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: BLUE, color: "#ffffff" }}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {saving
                ? "Uploading..."
                : mode === "new"
                  ? "Upload Document"
                  : "Upload Version"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
