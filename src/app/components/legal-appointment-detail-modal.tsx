import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import {
  X,
  User,
  Calendar,
  Shield,
  FileCheck,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../contexts/theme-context";
import {
  LegalAppointment,
  useLegalAppointments,
} from "../contexts/legal-appointments-context";
import {
  appointmentTypeMap,
  generateAppointmentLetter,
} from "../templates/appointment-templates";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface LegalAppointmentDetailModalProps {
  appointment: LegalAppointment;
  onClose: () => void;
}

const DUTIES_PREVIEW_COUNT = 3;

function formatDate(date: string) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDaysRemaining(endDate: string) {
  if (!endDate) return null;
  const today = new Date();
  const d = new Date(endDate);
  const diff = d.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusStyle(status: LegalAppointment["status"]) {
  switch (status) {
    case "Active":
      return { backgroundColor: "#10B981", color: "white" };
    case "Expired":
      return { backgroundColor: "#EF4444", color: "white" };
    case "Pending":
      return { backgroundColor: "#F59E0B", color: "#0F172A" };
  }
}

/** Convert an image source (data URL or http URL) to a data URL for the PDF. */
async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    if (url.startsWith("data:")) return url;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Logo fetch failed with status ${res.status}`);
    }
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to load logo for PDF:", err);
    return null;
  }
}

/**
 * The site's registered logo (from the Company & Sites page). Only the
 * single-appointment endpoint returns it (`site_logo`), so the register
 * list stays light.
 */
async function fetchSiteLogo(appointmentId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/legal-appointments/${appointmentId}`);
    if (!res.ok) throw new Error(`Failed to load appointment (${res.status})`);
    const fresh = await res.json();
    return fresh.site_logo ?? null;
  } catch (err) {
    console.error("Failed to load site logo:", err);
    return null;
  }
}

/**
 * The uploaded document's URL is a short-lived SAS link, so re-fetch the
 * appointment right before opening it to always use a fresh URL.
 */
async function getFreshDocumentUrl(appointmentId: string, fallback?: string) {
  try {
    const res = await fetch(`${API_URL}/legal-appointments/${appointmentId}`);
    if (!res.ok)
      throw new Error(`Failed to refresh appointment (${res.status})`);
    const fresh = await res.json();
    return fresh.document_url ?? fallback ?? null;
  } catch (err) {
    console.error("Failed to refresh document URL before opening:", err);
    return fallback ?? null;
  }
}

export function LegalAppointmentDetailModal({
  appointment,
  onClose,
}: LegalAppointmentDetailModalProps) {
  const { colors } = useTheme();
  const { updateAppointment, uploadDocument } = useLegalAppointments();
  const [showFullLetter, setShowFullLetter] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpeningDocument, setIsOpeningDocument] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  // Load the selected site's logo when the modal opens
  useEffect(() => {
    let cancelled = false;
    fetchSiteLogo(appointment.id).then((logo) => {
      if (!cancelled) setSiteLogo(logo);
    });
    return () => {
      cancelled = true;
    };
  }, [appointment.id, appointment.siteId]);

  const templateKey =
    appointmentTypeMap[appointment.appointmentType]?.templateKey;

  // Company name is the selected site's name (Company & Sites page)
  const letter = templateKey
    ? generateAppointmentLetter(templateKey, {
        employeeName: appointment.employeeName,
        companyName: appointment.siteName,
        siteName: appointment.siteName,
        appointerName: appointment.appointerName,
        startDate: formatDate(appointment.startDate),
        logoUrl: siteLogo,
      })
    : null;

  const dutiesToShow = letter
    ? showFullLetter
      ? letter.duties
      : letter.duties.slice(0, DUTIES_PREVIEW_COUNT)
    : [];

  const daysRemaining = calculateDaysRemaining(appointment.endDate);

  const downloadPDF = async () => {
    if (!letter) return;
    setIsExporting(true);
    try {
      const logoForExport = siteLogo ?? (await fetchSiteLogo(appointment.id));

      const doc = new jsPDF();
      let y = 15;

      // Site logo on the left, site (company) name next to it
      const logoSize = 26;
      let textX = 10;
      let logoLoaded = false;

      if (logoForExport) {
        const dataUrl = await loadImageAsDataUrl(logoForExport);
        if (dataUrl) {
          const mimeMatch = dataUrl.match(/^data:image\/(\w+)/);
          const rawFormat = mimeMatch ? mimeMatch[1].toUpperCase() : "PNG";
          const format = rawFormat === "JPG" ? "JPEG" : rawFormat;
          try {
            doc.addImage(
              dataUrl,
              format,
              10,
              y,
              logoSize,
              logoSize,
              undefined,
              "FAST",
            );
            logoLoaded = true;
            textX = 10 + logoSize + 6;
          } catch (err) {
            console.error("Failed to embed logo in PDF:", err);
          }
        }
      }

      if (letter.companyName) {
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.setTextColor(59, 130, 246);
        const companyLines = doc.splitTextToSize(
          letter.companyName,
          190 - (textX - 10),
        );
        const companyTextY = logoLoaded ? y + logoSize / 2 + 3 : y + 6;
        doc.text(companyLines, textX, companyTextY);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
      }

      y += logoLoaded || letter.companyName ? logoSize + 10 : 0;

      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      const headerLines = doc.splitTextToSize(letter.headerTitle, 190);
      doc.text(headerLines, 10, y);
      doc.setFont(undefined, "normal");
      y += headerLines.length * 5 + 6;

      doc.setFontSize(10);
      const appointingText = letter.appointingParagraph
        .map((s) => s.text)
        .join("");
      const appointingLines = doc.splitTextToSize(appointingText, 190);
      doc.text(appointingLines, 10, y);
      y += appointingLines.length * 5 + 4;

      const validityLines = doc.splitTextToSize(letter.validityLine, 190);
      doc.text(validityLines, 10, y);
      y += validityLines.length * 5 + 4;

      const dutiesIntroLines = doc.splitTextToSize(letter.dutiesIntro, 190);
      doc.text(dutiesIntroLines, 10, y);
      y += dutiesIntroLines.length * 5 + 4;

      letter.duties.forEach((duty) => {
        const lines = doc.splitTextToSize(`•  ${duty}`, 185);
        if (y + lines.length * 5 > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(lines, 12, y);
        y += lines.length * 5 + 2;
      });

      if (y > 260) {
        doc.addPage();
        y = 15;
      }

      const reportingLines = doc.splitTextToSize(letter.reportingLine, 190);
      doc.text(reportingLines, 10, y);

      doc.save(
        `${appointment.employeeName.replace(/\s+/g, "_")}_Appointment.pdf`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadDocument(appointment.id, file);
    } catch (err) {
      console.error("Failed to upload signed letter:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRenew = async () => {
    try {
      await updateAppointment(appointment.id, { status: "Active" });
    } catch (err) {
      console.error("Failed to renew appointment:", err);
    }
  };

  const handleViewDocument = async () => {
    if (!appointment.documentUploaded) return;
    setIsOpeningDocument(true);
    try {
      const freshUrl = await getFreshDocumentUrl(
        appointment.id,
        appointment.documentUrl,
      );
      if (freshUrl) {
        window.open(freshUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("Unable to open the document right now. Please try again.");
      }
    } finally {
      setIsOpeningDocument(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl p-6"
        style={{ backgroundColor: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
            >
              <User className="size-6" style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                {appointment.employeeName}
              </h3>
              <p className="text-sm" style={{ color: colors.subText }}>
                {appointment.employeeNumber} • {appointment.jobTitle || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <X className="size-4" style={{ color: colors.subText }} />
          </button>
        </div>

        {/* Core details */}
        <div className="space-y-4 mb-6">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: colors.subText }}
            >
              Appointment Type
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: colors.primaryText }}
            >
              {appointment.appointmentType}
            </p>
          </div>

          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: colors.subText }}
            >
              Legal Section
            </p>
            <div className="flex items-center gap-2">
              <Shield className="size-4" style={{ color: "#3B82F6" }} />
              <p
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                {appointment.legalSection}
              </p>
            </div>
          </div>

          {appointment.siteName && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.subText }}
              >
                Site
              </p>
              <p className="text-sm" style={{ color: colors.primaryText }}>
                {appointment.siteName}
              </p>
            </div>
          )}

          {appointment.reportsTo && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.subText }}
              >
                Reports To
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                {appointment.reportsTo}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.subText }}
              >
                Start Date
              </p>
              <div className="flex items-center gap-2">
                <Calendar
                  className="size-4"
                  style={{ color: colors.subText }}
                />
                <p className="text-sm" style={{ color: colors.primaryText }}>
                  {formatDate(appointment.startDate)}
                </p>
              </div>
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.subText }}
              >
                End Date
              </p>
              <div className="flex items-center gap-2">
                <Calendar
                  className="size-4"
                  style={{ color: colors.subText }}
                />
                <p className="text-sm" style={{ color: colors.primaryText }}>
                  {appointment.endDate ? formatDate(appointment.endDate) : "—"}
                </p>
              </div>
            </div>
          </div>

          {daysRemaining !== null && (
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colors.subText }}
              >
                Days Remaining
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: daysRemaining < 90 ? "#F59E0B" : "#10B981" }}
              >
                {daysRemaining} days
              </p>
            </div>
          )}

          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: colors.subText }}
            >
              Status
            </p>
            <span
              className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={getStatusStyle(appointment.status)}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Generated letter — site logo + site name, bolded Act heading, appointing paragraph */}
        {letter && (
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              backgroundColor:
                colors.background === "#0F172A"
                  ? "rgba(15, 23, 42, 0.6)"
                  : "rgba(0, 0, 0, 0.02)",
            }}
          >
            {(letter.logoUrl || letter.companyName) && (
              <div className="flex items-center gap-3 mb-4">
                {letter.logoUrl && (
                  <img
                    src={letter.logoUrl}
                    alt={`${letter.companyName} logo`}
                    className="h-14 object-contain flex-shrink-0"
                  />
                )}
                {letter.companyName && (
                  <span
                    className="text-xl font-bold px-2 py-1 rounded"
                    style={{
                      color: "#3B82F6",
                      backgroundColor: "rgba(59, 130, 246, 0.12)",
                    }}
                  >
                    {letter.companyName}
                  </span>
                )}
              </div>
            )}

            <p
              className="text-xs font-bold uppercase leading-snug mb-3"
              style={{ color: colors.primaryText }}
            >
              {letter.headerTitle}
            </p>

            <p className="text-sm mb-3" style={{ color: colors.primaryText }}>
              {letter.appointingParagraph.map((seg, i) =>
                seg.bold ? (
                  <strong key={i}>{seg.text}</strong>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>

            <p className="text-sm mb-3" style={{ color: colors.primaryText }}>
              {letter.validityLine}
            </p>

            <p className="text-sm mb-2" style={{ color: colors.primaryText }}>
              {letter.dutiesIntro}
            </p>

            <ul className="space-y-2 mb-2">
              {dutiesToShow.map((duty, i) => (
                <li
                  key={i}
                  className="text-sm flex gap-2"
                  style={{ color: colors.primaryText }}
                >
                  <span style={{ color: "#3B82F6" }}>•</span>
                  <span>{duty}</span>
                </li>
              ))}
            </ul>

            {letter.duties.length > DUTIES_PREVIEW_COUNT && (
              <button
                onClick={() => setShowFullLetter((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium mb-3"
                style={{ color: "#3B82F6" }}
              >
                {showFullLetter ? (
                  <>
                    Show less <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    View full letter (
                    {letter.duties.length - DUTIES_PREVIEW_COUNT} more){" "}
                    <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            )}

            {showFullLetter && (
              <p className="text-sm" style={{ color: colors.primaryText }}>
                {letter.reportingLine}
              </p>
            )}
          </div>
        )}

        {/* Document status */}
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: colors.primaryText }}
          >
            Appointment Letter
          </p>
          {appointment.documentUploaded ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4" style={{ color: "#10B981" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#10B981" }}
              >
                Uploaded
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="size-4" style={{ color: "#EF4444" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#EF4444" }}
              >
                Missing
              </span>
            </div>
          )}
        </div>

        {appointment.documentUploaded ? (
          <div
            role="button"
            tabIndex={0}
            onClick={handleViewDocument}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleViewDocument();
              }
            }}
            className="flex items-center gap-3 p-3 rounded-lg mb-6 cursor-pointer transition-opacity hover:opacity-80"
            style={{ backgroundColor: colors.background }}
            aria-disabled={isOpeningDocument}
          >
            <FileCheck className="size-8" style={{ color: "#3B82F6" }} />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: colors.primaryText }}
              >
                {appointment.documentFileName || "Signed appointment letter"}
              </p>
              <p className="text-xs" style={{ color: colors.subText }}>
                {isOpeningDocument ? "Opening…" : "Click to view"}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDocument();
              }}
              disabled={isOpeningDocument}
              className="p-2 rounded-lg transition-colors disabled:opacity-60"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              title="View document"
            >
              <Download className="size-4" style={{ color: "#3B82F6" }} />
            </button>
          </div>
        ) : (
          <label
            className="w-full py-3 rounded-lg border-2 border-dashed text-sm font-medium cursor-pointer flex flex-col items-center justify-center mb-6"
            style={{
              borderColor: colors.border || "rgba(148,163,184,0.3)",
              color: colors.primaryText,
            }}
          >
            <Upload className="size-5 mb-1" />
            {isUploading ? "Uploading…" : "Upload Signed Document"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadPDF}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-60"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "#3B82F6",
            }}
          >
            <Download className="size-4" />
            <span>{isExporting ? "Preparing…" : "Download Letter"}</span>
          </button>
          <button
            onClick={handleRenew}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#3B82F6", color: "white" }}
          >
            <RefreshCw className="size-4" />
            <span>Renew</span>
          </button>
        </div>
      </div>
    </div>
  );
}
