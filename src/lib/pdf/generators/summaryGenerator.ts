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

  // Section Title
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

  // Prepare table structure only
  const tableData = [
    ["Glucose Metabolism", formData.summaryFindings.glucoseMetabolism || ''],
    ["Proteins", formData.summaryFindings.proteins || ''],
    ["Lipid Profile", formData.summaryFindings.lipidProfile || ''],
    ["Inflammation", formData.summaryFindings.inflammation || ''],
    ["Metabolic", formData.summaryFindings.metabolic || ''],
    ["Homocysteine", formData.summaryFindings.homocysteine || ''],
    ["Vitamins/Minerals", formData.summaryFindings.vitaminsMinerals || ''],
    ["Iron Profile", formData.summaryFindings.ironProfile || ''],
    ["Sex Hormones", formData.summaryFindings.sexHormones || ''],
    ["Kidney Function and Electrolytes", formData.summaryFindings.kidneyFunctionElectrolytes || ''],
    ["Liver Functions", formData.summaryFindings.liverFunctions || ''],
    ["Tumor Markers", formData.summaryFindings.tumorMarkers || ''],
    ["Blood Counts", formData.summaryFindings.bloodCounts || '']
  ];

  // Capture rich text to draw later
  const richTextToRender: {
    html: string;
    x: number;
    y: number;
    width: number;
  }[] = [];

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255,255,255], fontStyle: 'bold' } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255,255,255], fontStyle: 'bold' } }
      ]
    ],
    body: tableData,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230], fontStyle: 'bold' },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      addLogoToPage(doc);
      if (data.pageNumber < doc.getNumberOfPages()) {
        addFooter(doc, pageWidth);
      }
    },
    willDrawCell: (data) => {
      if (
        data.section === "body" &&
        data.column.index === 1 &&
        typeof data.cell.raw === "string" &&
        data.cell.raw.includes("<")
      ) {
        // Store rich text content to draw after table rendering
        richTextToRender.push({
          html: data.cell.raw,
          x: data.cell.x + 2,
          y: data.cell.y + 3,
          width: data.cell.width - 4
        });

        // Clear the cell to avoid overlapping text
        data.cell.text = [""];
      }
    }
  });

  // Render rich text manually after the table is drawn
  richTextToRender.forEach(({ html, x, y, width }) => {
    renderRichText(doc, prepareHtmlForPdf(html), x, y, width);
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
