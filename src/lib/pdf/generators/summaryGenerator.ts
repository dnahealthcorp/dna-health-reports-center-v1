
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage, addFooter, ensureSpace } from "../pdfUtilities";

/**
 * Section 4: Summary of Findings (striped).
 */
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

  // Import the HTML converter function
  const { htmlToFormattedText } = require('@/services/pdfService');

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Glucose Metabolism", htmlToFormattedText(formData.summaryFindings.glucoseMetabolism || '')],
      ["Proteins", htmlToFormattedText(formData.summaryFindings.proteins || '')],
      ["Lipid Profile", htmlToFormattedText(formData.summaryFindings.lipidProfile || '')],
      ["Inflammation", htmlToFormattedText(formData.summaryFindings.inflammation || '')],
      ["Metabolic", htmlToFormattedText(formData.summaryFindings.metabolic || '')],
      ["Homocysteine", htmlToFormattedText(formData.summaryFindings.homocysteine || '')],
      ["Vitamins/Minerals", htmlToFormattedText(formData.summaryFindings.vitaminsMinerals || '')],
      ["Iron Profile", htmlToFormattedText(formData.summaryFindings.ironProfile || '')],
      ["Sex Hormones", htmlToFormattedText(formData.summaryFindings.sexHormones || '')],
      ["Kidney Function and Electrolytes", htmlToFormattedText(formData.summaryFindings.kidneyFunctionElectrolytes || '')],
      ["Liver Functions", htmlToFormattedText(formData.summaryFindings.liverFunctions || '')],
      ["Tumor Markers", htmlToFormattedText(formData.summaryFindings.tumorMarkers || '')],
      ["Blood Counts", htmlToFormattedText(formData.summaryFindings.bloodCounts || '')]
    ],
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
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and footer to each page
      addLogoToPage(doc);
      
      // Add footer only on completed pages
      if (data.pageNumber < doc.getNumberOfPages()) {
        addFooter(doc, pageWidth);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
