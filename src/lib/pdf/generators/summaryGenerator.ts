import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage, addFooter, ensureSpace } from "../pdfUtilities";
import { prepareHtmlForPdf } from "@/lib/pdf/richTextUtils";
import { renderRichText } from "@/lib/pdf/richTextRenderer";

export function generateSummarySection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 60, 40, pageWidth);

  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

  const findings = formData.summaryFindings;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        {
          content: "Parameter",
          styles: {
            fillColor: [153, 188, 68],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          }
        },
        {
          content: "Key findings and next steps",
          styles: {
            fillColor: [153, 188, 68],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          }
        }
      ]
    ],
    body: [
      ["Glucose Metabolism", { content: "", raw: findings.glucoseMetabolism || "" }],
      ["Proteins", { content: "", raw: findings.proteins || "" }],
      ["Lipid Profile", { content: "", raw: findings.lipidProfile || "" }],
      ["Inflammation", { content: "", raw: findings.inflammation || "" }],
      ["Metabolic", { content: "", raw: findings.metabolic || "" }],
      ["Homocysteine", { content: "", raw: findings.homocysteine || "" }],
      ["Vitamins/Minerals", { content: "", raw: findings.vitaminsMinerals || "" }],
      ["Iron Profile", { content: "", raw: findings.ironProfile || "" }],
      ["Sex Hormones", { content: "", raw: findings.sexHormones || "" }],
      ["Kidney Function and Electrolytes", { content: "", raw: findings.kidneyFunctionElectrolytes || "" }],
      ["Liver Functions", { content: "", raw: findings.liverFunctions || "" }],
      ["Tumor Markers", { content: "", raw: findings.tumorMarkers || "" }],
      ["Blood Counts", { content: "", raw: findings.bloodCounts || "" }]
    ],
    styles: {
      fontSize: 10,
      font: "helvetica",
      cellPadding: 2,
      textColor: [60, 60, 60]
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230], fontStyle: "bold" },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },

    // Add header/footer on each page
    didDrawPage: (data) => {
      addLogoToPage(doc);
      if (data.pageNumber < doc.getNumberOfPages()) {
        addFooter(doc, pageWidth);
      }
    },

    // Custom render rich HTML inside right cells
    didDrawCell: (data) => {
      if (
        data.column.index === 1 &&
        data.cell.raw &&
        typeof data.cell.raw === "string" &&
        data.cell.raw.includes("<")
      ) {
        const padding = 2;
        const x = data.cell.x + padding;
        const y = data.cell.y + padding + 1;
        const width = data.cell.width - padding * 2;

        renderRichText(doc, prepareHtmlForPdf(data.cell.raw), x, y, width);
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
