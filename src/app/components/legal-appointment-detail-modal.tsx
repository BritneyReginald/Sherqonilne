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
  PenLine,
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
import { SignaturePad } from "./legal-appointment-signature-pad";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface LegalAppointmentDetailModalProps {
  appointment: LegalAppointment;
  onClose: () => void;
}

const DUTIES_PREVIEW_COUNT = 3;

function formatDate(date: string | null | undefined) {
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
      throw new Error(`Image fetch failed with status ${res.status}`);
    }
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to load image for PDF:", err);
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

/** Two-column label/value table used for the summary and appendix tables */
function LetterTable({
  rows,
  labelClass,
  borderColor,
  textColor,
}: {
  rows: { label: string; value: string }[];
  labelClass?: string;
  borderColor: string;
  textColor: string;
}) {
  return (
    <div
      className="rounded overflow-hidden text-sm"
      style={{ border: `1px solid ${borderColor}`, color: textColor }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-3"
          style={{
            borderTop: i === 0 ? "none" : `1px solid ${borderColor}`,
          }}
        >
          <div
            className={`col-span-1 p-2 font-semibold ${labelClass ?? ""}`}
            style={{ borderRight: `1px solid ${borderColor}` }}
          >
            {row.label}
          </div>
          <div className="col-span-2 p-2 whitespace-pre-line">
            {row.value || "—"}
          </div>
        </div>
      ))}
    </div>
  );
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

  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

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

  const hasSignature = !!appointment.signatureData;

  // Once signed (on-screen, or a signed document uploaded) the acknowledgement
  // shows the employee's name and number
  const isSigned = hasSignature || appointment.signatureStatus === "Signed";

  const templateKey =
    appointmentTypeMap[appointment.appointmentType]?.templateKey;

  // Company name is the selected site's name (Company & Sites page)
  const letter = templateKey
    ? generateAppointmentLetter(templateKey, {
        employeeName: appointment.employeeName,
        jobTitle: appointment.jobTitle,
        employeeNumber: appointment.employeeNumber,
        signed: isSigned,
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

  const extraDutiesCount = letter
    ? Math.max(letter.duties.length - DUTIES_PREVIEW_COUNT, 0)
    : 0;

  // Anything that only shows once the letter is expanded
  const hasExtraContent =
    !!letter &&
    (extraDutiesCount > 0 ||
      !!letter.reportingLine ||
      !!letter.summaryRows?.length ||
      !!letter.appendices?.length ||
      !!letter.acknowledgement ||
      !!letter.legalReferences?.length);

  const daysRemaining = calculateDaysRemaining(appointment.endDate);

  // Either an on-screen signature OR an uploaded signed document
  // satisfies this appointment — Milly's requirement: if the
  // employee signed electronically, an uploaded document isn't needed.
  const isFulfilled = appointment.documentUploaded || hasSignature;

  const downloadPDF = async () => {
    if (!letter) return;
    setIsExporting(true);
    try {
      const logoForExport = siteLogo ?? (await fetchSiteLogo(appointment.id));

      const doc = new jsPDF();
      const LEFT = 10;
      const WIDTH = 190;
      const PAGE_BOTTOM = 280;
      let y = 15;

      /* ---------- layout helpers ---------- */

      const ensureSpace = (needed: number) => {
        if (y + needed > PAGE_BOTTOM) {
          doc.addPage();
          y = 15;
        }
      };

      /** Writes wrapped text line by line so long blocks flow across pages. */
      const writeBlock = (
        text: string,
        opts: {
          size?: number;
          bold?: boolean;
          x?: number;
          width?: number;
          gap?: number;
        } = {},
      ) => {
        const {
          size = 10,
          bold = false,
          x = LEFT,
          width = WIDTH,
          gap = 4,
        } = opts;
        const lineHeight = size * 0.5;
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        const lines: string[] = doc.splitTextToSize(text, width);
        lines.forEach((line) => {
          ensureSpace(lineHeight);
          doc.text(line, x, y);
          y += lineHeight;
        });
        y += gap;
        doc.setFont("helvetica", "normal");
      };

      /** Bordered two-column table (summary + appendices). */
      const drawTable = (
        rows: { label: string; value: string }[],
        labelWidth: number,
      ) => {
        const pad = 2;
        const valueWidth = WIDTH - labelWidth;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setDrawColor(150);

        rows.forEach((row) => {
          const valueLines = row.value
            .split("\n")
            .flatMap(
              (l) =>
                doc.splitTextToSize(l || " ", valueWidth - pad * 2) as string[],
            );
          const rowHeight = Math.max(valueLines.length, 1) * 4.5 + pad * 2;
          ensureSpace(rowHeight);

          doc.rect(LEFT, y, labelWidth, rowHeight);
          doc.rect(LEFT + labelWidth, y, valueWidth, rowHeight);

          doc.setFont("helvetica", "bold");
          doc.text(row.label, LEFT + pad, y + pad + 3);
          doc.setFont("helvetica", "normal");
          valueLines.forEach((line, i) => {
            doc.text(line, LEFT + labelWidth + pad, y + pad + 3 + i * 4.5);
          });

          y += rowHeight;
        });

        doc.setDrawColor(0);
        y += 6;
      };

      /* ---------- header: doc number, logo, company name ---------- */

      if (letter.docNo) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(letter.docNo, 200, 10, { align: "right" });
      }

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
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        const companyLines = doc.splitTextToSize(
          letter.companyName,
          190 - (textX - 10),
        );
        const companyTextY = logoLoaded ? y + logoSize / 2 + 3 : y + 6;
        doc.text(companyLines, textX, companyTextY);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
      }

      y += logoLoaded || letter.companyName ? logoSize + 10 : 0;

      /* ---------- title, summary table, appointing text ---------- */

      writeBlock(letter.headerTitle, { size: 11, bold: true, gap: 6 });

      if (letter.summaryRows?.length) {
        drawTable(letter.summaryRows, 50);
      }

      writeBlock(letter.appointingParagraph.map((s) => s.text).join(""));
      writeBlock(letter.validityLine);

      letter.introParagraphs?.forEach((p) => writeBlock(p));

      writeBlock(letter.dutiesIntro);

      letter.duties.forEach((duty) => {
        writeBlock(`•  ${duty}`, { x: 12, width: 185, gap: 2 });
      });

      y += 2;
      if (letter.reportingLine) {
        writeBlock(letter.reportingLine, { gap: 10 });
      } else {
        y += 8;
      }

      /* ---------- appendices table (GMR 2(1) letter) ---------- */

      if (letter.appendices?.length) {
        if (letter.appendicesIntro) writeBlock(letter.appendicesIntro);
        drawTable(
          letter.appendices.map((a) => ({
            label: a.reference,
            value: a.requirement,
          })),
          30,
        );
      }

      /* ---------- 16(2) signature + acknowledgement (newer letters) ---------- */

      // if (letter.acknowledgement) {
      //   ensureSpace(60);
      //   y += 4;
      //   doc.line(10, y, 90, y);
      //   doc.line(110, y, 190, y);
      //   y += 5;
      //   doc.setFontSize(9);
      //   doc.text("SIGNATURE 16(2)", 10, y);
      //   doc.text("DATE", 110, y);
      //   y += 12;

      //   writeBlock("ACKNOWLEDGEMENT OF DESIGNATION", { bold: true, gap: 2 });
      //   writeBlock(letter.acknowledgement, { gap: 14 });
      // }

      /* ---------- employee footer: DATE / Signature ---------- */

      // Filled in with the captured signature image and its date when available.
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("DATE", 10, y);
      doc.line(28, y, 90, y);
      if (appointment.signedAt) {
        doc.text(formatDate(appointment.signedAt), 30, y - 2);
      }

      doc.text("Signature", 110, y);
      doc.line(135, y, 195, y);

      if (hasSignature && appointment.signatureData) {
        const sigDataUrl = await loadImageAsDataUrl(appointment.signatureData);
        if (sigDataUrl) {
          try {
            doc.addImage(sigDataUrl, "PNG", 137, y - 14, 55, 13);
          } catch (err) {
            console.error("Failed to embed signature in PDF:", err);
          }
        }
      }

      /* ---------- attached legal references ---------- */

      if (letter.legalReferences?.length) {
        doc.addPage();
        y = 15;
        letter.legalReferences.forEach((ref) => {
          writeBlock(ref.title, { bold: true, gap: 2 });
          if (ref.heading) {
            writeBlock(ref.heading, { size: 9, bold: true, gap: 2 });
          }
          ref.body.forEach((paragraph) =>
            writeBlock(paragraph, { size: 9, gap: 1.5 }),
          );
          y += 5;
        });
      }

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

  const handleSaveSignature = async (dataUrl: string) => {
    setIsSavingSignature(true);
    try {
      await updateAppointment(appointment.id, {
        signatureData: dataUrl,
        signedAt: new Date().toISOString(),
        signatureStatus: "Signed",
      });
      setShowSignaturePad(false);
    } catch (err) {
      console.error("Failed to save signature:", err);
      alert("Failed to save the signature. Please try again.");
    } finally {
      setIsSavingSignature(false);
    }
  };

  const letterBorder = "rgba(148, 163, 184, 0.3)";

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
            {letter.docNo && (
              <p
                className="text-xs text-right mb-2"
                style={{ color: colors.subText }}
              >
                {letter.docNo}
              </p>
            )}

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

            {showFullLetter && letter.summaryRows?.length ? (
              <div className="mb-3">
                <LetterTable
                  rows={letter.summaryRows}
                  borderColor={letterBorder}
                  textColor={colors.primaryText}
                />
              </div>
            ) : null}

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

            {letter.introParagraphs?.map((paragraph, i) => (
              <p
                key={i}
                className="text-sm mb-3"
                style={{ color: colors.primaryText }}
              >
                {paragraph}
              </p>
            ))}

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

            {hasExtraContent && (
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
                    {extraDutiesCount > 0
                      ? `View full letter (${extraDutiesCount} more)`
                      : "View full letter"}{" "}
                    <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            )}

            {showFullLetter && (
              <div className="space-y-4">
                {letter.reportingLine && (
                  <p className="text-sm" style={{ color: colors.primaryText }}>
                    {letter.reportingLine}
                  </p>
                )}

                {letter.appendices?.length ? (
                  <div className="space-y-2">
                    {letter.appendicesIntro && (
                      <p
                        className="text-sm"
                        style={{ color: colors.primaryText }}
                      >
                        {letter.appendicesIntro}
                      </p>
                    )}
                    <LetterTable
                      rows={letter.appendices.map((a) => ({
                        label: a.reference,
                        value: a.requirement,
                      }))}
                      borderColor={letterBorder}
                      textColor={colors.primaryText}
                    />
                  </div>
                ) : null}

                {letter.acknowledgement && (
                  <div>
                    <p
                      className="text-xs font-bold uppercase mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      Acknowledgement of designation
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: colors.primaryText }}
                    >
                      {letter.acknowledgement}
                    </p>
                  </div>
                )}

                {letter.legalReferences?.map((ref, i) => (
                  <div
                    key={i}
                    className="rounded p-3"
                    style={{ border: `1px solid ${letterBorder}` }}
                  >
                    <p
                      className="text-xs font-bold uppercase mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {ref.title}
                    </p>
                    {ref.heading && (
                      <p
                        className="text-sm font-semibold mb-2"
                        style={{ color: colors.primaryText }}
                      >
                        {ref.heading}
                      </p>
                    )}
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {ref.body.map((paragraph, j) => (
                        <p
                          key={j}
                          className="text-xs"
                          style={{ color: colors.subText }}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Signature — sits between the letter and the upload section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: colors.primaryText }}
            >
              Employee Signature
            </p>
            {hasSignature ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4" style={{ color: "#10B981" }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#10B981" }}
                >
                  Signed{" "}
                  {appointment.signedAt ? formatDate(appointment.signedAt) : ""}
                </span>
              </div>
            ) : (
              <span
                className="text-xs font-medium"
                style={{ color: "#F59E0B" }}
              >
                Not signed
              </span>
            )}
          </div>

          {hasSignature ? (
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <img
                src={appointment.signatureData!}
                alt="Employee signature"
                className="h-16 rounded bg-white px-2"
              />
              <button
                type="button"
                onClick={() => setShowSignaturePad(true)}
                className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "rgba(59,130,246,0.1)",
                  color: "#3B82F6",
                }}
              >
                Re-sign
              </button>
            </div>
          ) : showSignaturePad ? (
            <SignaturePad
              onSave={handleSaveSignature}
              onCancel={() => setShowSignaturePad(false)}
              saving={isSavingSignature}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowSignaturePad(true)}
              className="w-full py-3 rounded-lg border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2"
              style={{
                borderColor: colors.border || "rgba(148,163,184,0.3)",
                color: colors.primaryText,
              }}
            >
              <PenLine className="size-4" />
              Sign Now
            </button>
          )}

          <p className="text-xs mt-2" style={{ color: colors.subText }}>
            {hasSignature
              ? "Signed electronically — uploading a document below is optional."
              : "If the employee isn't available to sign now, a signed document can be uploaded below instead."}
          </p>
        </div>

        {/* Document status — fulfilled by either a signature or an upload */}
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: colors.primaryText }}
          >
            Appointment Letter
          </p>
          {isFulfilled ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4" style={{ color: "#10B981" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#10B981" }}
              >
                {appointment.documentUploaded ? "Uploaded" : "Signed"}
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
