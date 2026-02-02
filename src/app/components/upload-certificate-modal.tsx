import { X, Upload, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface UploadCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  courseName: string;
  currentStatus: "valid" | "expiring" | "expired" | "missing" | "not-required";
  currentExpiryDate?: string;
}

export function UploadCertificateModal({
  isOpen,
  onClose,
  employeeName,
  courseName,
  currentStatus,
  currentExpiryDate,
}: UploadCertificateModalProps) {
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState(currentExpiryDate || "");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");
    if (pdfFile) {
      setUploadedFile(pdfFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
    }
  };

  const handleSubmit = () => {
    console.log("Uploading certificate:", {
      employeeName,
      courseName,
      issueDate,
      expiryDate,
      file: uploadedFile,
    });
    // In a real app, this would call an API to upload the certificate
    onClose();
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "expired":
      case "missing":
        return "var(--compliance-danger)";
      case "expiring":
        return "var(--compliance-warning)";
      default:
        return "var(--brand-blue)";
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case "expired":
        return "EXPIRED - Requires Immediate Upload";
      case "missing":
        return "MISSING - Certificate Not on File";
      case "expiring":
        return "EXPIRING SOON - Renewal Required";
      default:
        return "Update Certificate";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl shadow-2xl z-50 rounded-lg overflow-hidden"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-5 border-b flex items-start justify-between"
          style={{ borderColor: "var(--grey-200)" }}
        >
          <div className="flex-1">
            <h2 className="text-xl mb-2" style={{ color: "var(--grey-900)" }}>
              Upload Training Certificate
            </h2>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: "var(--grey-900)" }}>
                  Employee:
                </span>
                <span style={{ color: "var(--grey-700)" }}>{employeeName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: "var(--grey-900)" }}>
                  Course:
                </span>
                <span style={{ color: "var(--grey-700)" }}>{courseName}</span>
              </div>
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

        {/* Status Alert */}
        <div
          className="mx-6 mt-6 px-4 py-3 rounded-lg border-l-4 flex items-center gap-3"
          style={{
            backgroundColor: `${getStatusColor()}10`,
            borderColor: getStatusColor(),
          }}
        >
          <div
            className="size-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: getStatusColor() }}
          >
            <FileText className="size-5 text-white" />
          </div>
          <div>
            <p className="font-medium mb-0.5" style={{ color: "var(--grey-900)" }}>
              {getStatusText()}
            </p>
            <p className="text-sm" style={{ color: "var(--grey-700)" }}>
              {currentStatus === "expired" || currentStatus === "missing"
                ? "This employee cannot work on site until a valid certificate is uploaded."
                : "Upload a renewed certificate to maintain compliance status."}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--grey-900)" }}
              >
                Certificate Issue Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                  style={{ color: "var(--grey-400)" }}
                />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--grey-300)",
                    color: "var(--grey-900)",
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--grey-900)" }}
              >
                Certificate Expiry Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                  style={{ color: "var(--grey-400)" }}
                />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--grey-300)",
                    color: "var(--grey-900)",
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--grey-900)" }}
            >
              Upload Certificate (PDF) *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                isDragging ? "border-solid" : ""
              }`}
              style={{
                borderColor: isDragging
                  ? "var(--brand-blue)"
                  : uploadedFile
                  ? "var(--compliance-success)"
                  : "var(--grey-300)",
                backgroundColor: isDragging
                  ? "var(--brand-blue)05"
                  : uploadedFile
                  ? "var(--compliance-success)05"
                  : "var(--grey-50)",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="size-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--compliance-success)20" }}
                  >
                    <CheckCircle2
                      className="size-6"
                      style={{ color: "var(--compliance-success)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1" style={{ color: "var(--grey-900)" }}>
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm" style={{ color: "var(--grey-600)" }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--grey-100)",
                      color: "var(--grey-700)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--grey-200)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--grey-100)";
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className="size-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "var(--brand-blue)10" }}
                  >
                    <Upload
                      className="size-8"
                      style={{ color: "var(--brand-blue)" }}
                    />
                  </div>
                  <p className="font-medium mb-2" style={{ color: "var(--grey-900)" }}>
                    Drag and drop your PDF certificate here
                  </p>
                  <p className="text-sm mb-4" style={{ color: "var(--grey-600)" }}>
                    or click to browse your files
                  </p>
                  <label className="cursor-pointer">
                    <span
                      className="inline-block px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--brand-blue)" }}
                    >
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p
                    className="text-xs mt-3"
                    style={{ color: "var(--grey-500)" }}
                  >
                    Accepted format: PDF only • Max file size: 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Notice */}
          <div
            className="px-4 py-3 rounded-lg border-l-4"
            style={{
              backgroundColor: "var(--brand-blue)05",
              borderColor: "var(--brand-blue)",
            }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "var(--grey-900)" }}>
              Audit & Legal Compliance
            </p>
            <p className="text-sm" style={{ color: "var(--grey-700)" }}>
              All uploaded certificates are permanently stored for legal audit purposes.
              The system will automatically send expiry notifications 90, 60, and 30 days
              before expiration.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: "var(--grey-50)",
            borderColor: "var(--grey-200)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--grey-500)" }}>
            * All fields are required
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
              disabled={!issueDate || !expiryDate || !uploadedFile}
              className="px-6 py-2 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              Upload Certificate
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
