
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./headerFooter";

/**
 * Section 4: Summary of Findings (striped).
 */
export function generateSummarySection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData,
  pageNumber: number
): number {
  currentY = ensureSpace(doc, currentY, 60, 40, pageWidth, pageNumber);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

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
      ["Glucose Metabolism", formData.summaryFindings.glucoseMetabolism || ""],
      ["Proteins", formData.summaryFindings.proteins || ""],
      ["Lipid Profile", formData.summaryFindings.lipidProfile || ""],
      ["Inflammation", formData.summaryFindings.inflammation || ""],
      ["Metabolic", formData.summaryFindings.metabolic || ""],
      ["Homocysteine", formData.summaryFindings.homocysteine || ""],
      ["Vitamins/Minerals", formData.summaryFindings.vitaminsMinerals || ""],
      ["Iron Profile", formData.summaryFindings.ironProfile || ""],
      ["Sex Hormones", formData.summaryFindings.sexHormones || ""],
      ["Kidney Function and Electrolytes", formData.summaryFindings.kidneyFunctionElectrolytes || ""],
      ["Liver Functions", formData.summaryFindings.liverFunctions || ""],
      ["Tumor Markers", formData.summaryFindings.tumorMarkers || ""],
      ["Blood Counts", formData.summaryFindings.bloodCounts || ""]
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
