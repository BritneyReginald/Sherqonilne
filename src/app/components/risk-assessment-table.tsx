import React, { useRef } from "react";
// import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PageLayout } from "../components/page-layout";
import {
  BeforeControlsData,
  AfterControlsData,
  DetailsData,
} from "./new-risk-assessment";
import {
  calculateRiskScore,
  calculateRiskRating,
} from "@/app/utils/risk-utils";

interface RiskAssessmentTableProps {
  beforeControls: BeforeControlsData;
  afterControls: AfterControlsData | null;
  details: DetailsData;
  onBack: () => void;
  onGenerate: (pdfBlob: Blob) => void;
}

export const RiskAssessmentTable: React.FC<
  RiskAssessmentTableProps
> = ({
  beforeControls,
  afterControls,
  details,
  onBack,
  onGenerate,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

const buildPDF = () => {
  const pdf = new jsPDF("l", "mm", "a4");

  const hazards = beforeControls?.hazards ?? [];
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ================= HEADER =================

  pdf.setFontSize(18);
  pdf.text(details.companyName || "Company Name", 14, 15);

  if (details.companyLogo) {
    try {
      pdf.addImage(
        details.companyLogo,
        "PNG",
        pageWidth - 45,
        8,
        30,
        20
      );
    } catch (err) {
      console.warn("Logo failed to load");
    }
  }

  pdf.setFontSize(12);
  pdf.text("Risk Assessment Report", 14, 24);

  pdf.setFontSize(10);
  pdf.text(`Task: ${details.taskDescription || "-"}`, 14, 32);
  pdf.text(
    `Assessors: ${
      details.assessors?.filter(Boolean).join(", ") || "-"
    }`,
    14,
    38
  );
  pdf.text(`Date: ${details.assessmentDate || "-"}`, 14, 44);

  // ================= TABLE =================

  const tableBody = hazards.map((hazard, index) => {
    const beforeScore =
      hazard.severity !== null &&
      hazard.probability !== null
        ? calculateRiskScore(
            hazard.severity,
            hazard.probability
          )
        : "-";

    const beforeRating =
      beforeScore !== "-"
        ? calculateRiskRating(Number(beforeScore))
        : "-";

    const afterHazard =
      afterControls?.hazards?.find(
        (h) => h.id === hazard.id
      );

    const afterScore =
      afterHazard?.severity &&
      afterHazard?.probability
        ? calculateRiskScore(
            Number(afterHazard.severity),
            Number(afterHazard.probability)
          )
        : "-";

    const afterRating =
      afterScore !== "-"
        ? calculateRiskRating(Number(afterScore))
        : "-";

    return [
      index + 1,
      hazard.hazard || "-",
      hazard.risks?.join(", ") || "-",
      hazard.severity ?? "-",
      hazard.probability ?? "-",
      beforeScore,
      beforeRating,
      hazard.controls?.join(", ") || "-",
      afterHazard?.severity ?? "-",
      afterHazard?.probability ?? "-",
      afterScore,
      afterRating,
    ];
  });

  autoTable(pdf, {
  startY: 50,
  head: [[
    "ID",
    "What are the Hazards and / or Aspects?",
    "What are the Risks",
    "Severity (Before)",
    "Probability (Before)",
    "Risk Score (Before)",
    "Rating (Before)",
    "Current Control Measures",
    "Severity (After)",
    "Probability (After)",
    "Risk Score (After)",
    "Rating (After)",
  ]],
  body: tableBody,
  styles: {
    fontSize: 6,
    cellPadding: 2,
    overflow: "linebreak",
  },
  headStyles: {
    fillColor: [40, 40, 40],
    textColor: 255,
    halign: "center",
  },
  bodyStyles: {
    valign: "middle",
  },
  theme: "grid",
  margin: { left: 10, right: 10 },

  // ✅ ADD THIS BACK
  didParseCell: function (data) {
    if (data.section === "body") {
      const columnIndex = data.column.index;
      const rating = data.cell.raw;

      if (columnIndex === 6 || columnIndex === 11) {
        switch (rating) {
          case "Critical":
            data.cell.styles.fillColor = [220, 38, 38]; // red
            data.cell.styles.textColor = 255;
            break;

          case "High Risk":
            data.cell.styles.fillColor = [249, 115, 22]; // orange
            data.cell.styles.textColor = 255;
            break;

          case "Substantial Risk":
            data.cell.styles.fillColor = [250, 204, 21]; // yellow
            data.cell.styles.textColor = 0;
            break;

          case "Possible Risk":
            data.cell.styles.fillColor = [59, 130, 246]; // blue
            data.cell.styles.textColor = 255;
            break;

          case "Low Risk":
            data.cell.styles.fillColor = [34, 197, 94]; // green
            data.cell.styles.textColor = 255;
            break;
        }
      }
    }
  },

  
});


// ================= METHODOLOGY PAGE =================
pdf.addPage();

pdf.setFontSize(18);
pdf.text("Risk Assessment Methodology", 14, 15);

pdf.setFontSize(11);
pdf.text(
  "This methodology is used to evaluate workplace hazards by determining the level of risk before and after control measures are applied.",
  14,
  22,
  { maxWidth: pageWidth - 28 }
);

// ===== Formula Box =====
pdf.setFontSize(12);
pdf.text("Risk Calculation Formula", 14, 35);

pdf.setFontSize(11);
pdf.text(
  "Risk Score (C) = Severity (A) × Probability (B)",
  14,
  42
);

// ===== Severity Table =====
pdf.setFontSize(13);
pdf.text("A. Consequence (Severity)", 14, 55);

autoTable(pdf, {
  startY: 60,
  head: [["Weight", "Impact"]],
  body: [
    [1, "Noticeable"],
    [2, "Important"],
    [3, "Serious"],
    [4, "Very Serious"],
    [5, "Disaster"],
  ],
  styles: { fontSize: 10 },
  headStyles: { fillColor: [40, 40, 40], textColor: 255 },
  theme: "grid",
});

// ===== Probability Table =====
pdf.setFontSize(13);
pdf.text("B. Exposure (Probability)", 14, pdf.lastAutoTable.finalY + 15);

autoTable(pdf, {
  startY: pdf.lastAutoTable.finalY + 20,
  head: [["Weight", "Impact", "Effect"]],
  body: [
    [1, "Conceivable", "Has never happened but is possible (e.g 1 in 1000)"],
    [2, "Remotely possible", "Less possible coincidence (e.g 1 in 100)"],
    [3, "Unusual but possible", "More possible occurrence (e.g 1 in 10)"],
    [4, "Likely", "50/50 chance of occurrence"],
    [5, "Almost certain", "Most likely outcome if event occurs"],
  ],
  styles: { fontSize: 9 },
  headStyles: { fillColor: [40, 40, 40], textColor: 255 },
  theme: "grid",
});

// ===== Risk Rating Table =====
pdf.setFontSize(13);
pdf.text("Risk Rating Categories", 14, pdf.lastAutoTable.finalY + 15);

autoTable(pdf, {
  startY: pdf.lastAutoTable.finalY + 20,
  head: [["Risk Category", "Risk Rating"]],
  body: [
    ["Critical", "25"],
    ["High Risk", "15 – 24"],
    ["Substantial Risk", "12 – 14"],
    ["Possible Risk", "4 – 11"],
    ["Low Risk", "1 – 3"],
  ],
  styles: { fontSize: 10 },
  headStyles: { fillColor: [40, 40, 40], textColor: 255 },
  theme: "grid",
  didParseCell: function (data) {
  if (data.section === "body" && data.column.index === 1) {
    const ratingValue = data.cell.raw;

    switch (ratingValue) {
      case "25":
        data.cell.styles.fillColor = [220, 38, 38]; // Critical - Red
        data.cell.styles.textColor = 255;
        break;

      case "15 – 24":
        data.cell.styles.fillColor = [249, 115, 22]; // High - Orange
        data.cell.styles.textColor = 255;
        break;

      case "12 – 14":
        data.cell.styles.fillColor = [250, 204, 21]; // Substantial - Yellow
        data.cell.styles.textColor = 0;
        break;

      case "4 – 11":
        data.cell.styles.fillColor = [59, 130, 246]; // Possible - Blue
        data.cell.styles.textColor = 255;
        break;

      case "1 – 3":
        data.cell.styles.fillColor = [34, 197, 94]; // Low - Green
        data.cell.styles.textColor = 255;
        break;
    }
  }
}

});

// ================= GLOBAL FOOTER =================
const totalPages = pdf.getNumberOfPages();

for (let i = 1; i <= totalPages; i++) {
  pdf.setPage(i);

  pdf.setFontSize(8);

  // Page numbering (ALL pages)
  pdf.text(
    `Page ${i} of ${totalPages}`,
    pageWidth - 35,
    pageHeight - 5
  );

  // Signature block ONLY on first page
  if (i === 1) {
    const footerY = pageHeight - 15;

    pdf.text(
      "Prepared by: __________________________",
      14,
      footerY
    );
    pdf.text(
      "Signature: __________________________",
      110,
      footerY
    );
    pdf.text(
      "Date: ____________________",
      210,
      footerY
    );
  }
}


  return pdf;
};


const handleSaveToRegister = () => {
  const pdf = buildPDF();
  const blob = pdf.output("blob");
  onGenerate(blob);
};

const handleDownloadPDF = () => {
  const pdf = buildPDF();
  const fileName = `Risk_Assessment_${
    details.taskDescription || "Report"
  }.pdf`;
  pdf.save(fileName);
};

const handlePrintPDF = () => {
  const pdf = buildPDF();
  pdf.autoPrint();
  window.open(pdf.output("bloburl"), "_blank");
};



  const ratingClass = (rating: string) => {
    switch (rating) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High Risk":
        return "bg-orange-500 text-white";
      case "Substantial Risk":
        return "bg-yellow-400 text-black";
      case "Possible Risk":
        return "bg-blue-400 text-white";
      case "Low Risk":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const hazards = beforeControls?.hazards ?? [];

  return (
    <>
      {/* ✅ PDF CONTENT */}
      <div ref={reportRef}>
        <PageLayout
          title="Risk Assessment Report"
          description="Summary of risk assessment before and after controls."
        >
          {/* ===== Company Header ===== */}
          <div className="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-6 text-gray-900">
            {details.companyLogo && (
              <img
                src={details.companyLogo}
                alt="Company Logo"
                className="h-20 w-auto object-contain"
              />
            )}

            <div>
              <h1 className="text-2xl font-bold">
                {details.companyName || "Company Name"}
              </h1>
              <p className="text-sm text-gray-500">
                Risk Assessment Report
              </p>
            </div>
          </div>

          {/* ===== Task Details ===== */}
          <div className="bg-white rounded-xl shadow p-6 mb-6 space-y-4 text-gray-900">
            <div>
              <h2 className="font-semibold">Task / Activity</h2>
              <p>{details.taskDescription || "-"}</p>
            </div>

            <div>
              <h2 className="font-semibold">
                Persons Conducting Risk Assessment
              </h2>
              <p>
                {details.assessors?.filter(Boolean).join(", ") ||
                  "-"}
              </p>
            </div>

            <div>
              <h2 className="font-semibold">Assessment Date</h2>
              <p>{details.assessmentDate || "-"}</p>
            </div>
          </div>

          {/* ===== Table ===== */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-900">
                  <th className="border p-2">Task ID</th>
                  <th className="border p-2">What are the Hazards and / or Aspects?</th>
                  <th className="border p-2">What are the Risks?</th>
                  <th className="border p-2">Severity (Before)</th>
                  <th className="border p-2">Probability (Before)</th>
                  <th className="border p-2">Score (Before)</th>
                  <th className="border p-2">Rating (Before)</th>
                  <th className="border p-2">Controls</th>
                  <th className="border p-2">Severity (After)</th>
                  <th className="border p-2">Probability (After)</th>
                  <th className="border p-2">Score (After)</th>
                  <th className="border p-2">Rating (After)</th>
                </tr>
              </thead>

              <tbody>
                {hazards.map((hazard, index) => {
                  const beforeScore =
                    hazard.severity !== null &&
                    hazard.probability !== null
                      ? calculateRiskScore(
                          hazard.severity,
                          hazard.probability
                        )
                      : null;

                  const beforeRating =
                    beforeScore !== null
                      ? calculateRiskRating(beforeScore)
                      : null;

                  const afterHazard =
                    afterControls?.hazards?.find(
                      (h) => h.id === hazard.id
                    );

                  const afterScore =
                    afterHazard?.severity &&
                    afterHazard?.probability
                      ? calculateRiskScore(
                          Number(afterHazard.severity),
                          Number(afterHazard.probability)
                        )
                      : null;

                  const afterRating =
                    afterScore !== null
                      ? calculateRiskRating(afterScore)
                      : null;

                  return (
                    <tr key={hazard.id}>
                      <td className="border p-2 text-center font-semibold">
                        {index + 1}
                      </td>
                      <td className="border p-2">
                        {hazard.hazard}
                      </td>
                      <td className="border p-2">
                        {hazard.risks?.join(", ") || "-"}
                      </td>
                      <td className="border p-2 text-center">
                        {hazard.severity ?? "-"}
                      </td>
                      <td className="border p-2 text-center">
                        {hazard.probability ?? "-"}
                      </td>
                      <td className="border p-2 text-center">
                        {beforeScore ?? "-"}
                      </td>
                      <td
                        className={`border p-2 text-center font-semibold ${
                          beforeRating
                            ? ratingClass(beforeRating)
                            : ""
                        }`}
                      >
                        {beforeRating ?? "-"}
                      </td>
                      <td className="border p-2">
                        {hazard.controls?.join(", ") || "-"}
                      </td>
                      <td className="border p-2 text-center">
                        {afterHazard?.severity ?? "-"}
                      </td>
                      <td className="border p-2 text-center">
                        {afterHazard?.probability ?? "-"}
                      </td>
                      <td className="border p-2 text-center">
                        {afterScore ?? "-"}
                      </td>
                      <td
                        className={`border p-2 text-center font-semibold ${
                          afterRating
                            ? ratingClass(afterRating)
                            : ""
                        }`}
                      >
                        {afterRating ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PageLayout>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-400 text-white rounded"
        >
          Back
        </button>

        <div className="flex gap-3">

         <button
  onClick={handleSaveToRegister}
  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Save Assessment
</button>

<button
  onClick={handleDownloadPDF}
  className="px-6 py-3 bg-blue-600 text-white rounded"
>
  Save as PDF
</button>

<button
  onClick={handlePrintPDF}
  className="px-6 py-3 bg-green-600 text-white rounded"
>
  Print PDF
</button>

        </div>
      </div>
    </>
  );
};
