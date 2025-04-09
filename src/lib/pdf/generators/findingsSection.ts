
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./headerFooter";

/**
 * Helper function to strip HTML tags from text for PDF output
 */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

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

  // Process HTML content in summary findings
  const processedSummaryFindings = {
    glucoseMetabolism: stripHtml(formData.summaryFindings.glucoseMetabolism || ""),
    proteins: stripHtml(formData.summaryFindings.proteins || ""),
    lipidProfile: stripHtml(formData.summaryFindings.lipidProfile || ""),
    inflammation: stripHtml(formData.summaryFindings.inflammation || ""),
    metabolic: stripHtml(formData.summaryFindings.metabolic || ""),
    homocysteine: stripHtml(formData.summaryFindings.homocysteine || ""),
    vitaminsMinerals: stripHtml(formData.summaryFindings.vitaminsMinerals || ""),
    ironProfile: stripHtml(formData.summaryFindings.ironProfile || ""),
    sexHormones: stripHtml(formData.summaryFindings.sexHormones || ""),
    kidneyFunctionElectrolytes: stripHtml(formData.summaryFindings.kidneyFunctionElectrolytes || ""),
    liverFunctions: stripHtml(formData.summaryFindings.liverFunctions || ""),
    tumorMarkers: stripHtml(formData.summaryFindings.tumorMarkers || ""),
    bloodCounts: stripHtml(formData.summaryFindings.bloodCounts || "")
  };

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
      ["Glucose Metabolism", processedSummaryFindings.glucoseMetabolism],
      ["Proteins", processedSummaryFindings.proteins],
      ["Lipid Profile", processedSummaryFindings.lipidProfile],
      ["Inflammation", processedSummaryFindings.inflammation],
      ["Metabolic", processedSummaryFindings.metabolic],
      ["Homocysteine", processedSummaryFindings.homocysteine],
      ["Vitamins/Minerals", processedSummaryFindings.vitaminsMinerals],
      ["Iron Profile", processedSummaryFindings.ironProfile],
      ["Sex Hormones", processedSummaryFindings.sexHormones],
      ["Kidney Function and Electrolytes", processedSummaryFindings.kidneyFunctionElectrolytes],
      ["Liver Functions", processedSummaryFindings.liverFunctions],
      ["Tumor Markers", processedSummaryFindings.tumorMarkers],
      ["Blood Counts", processedSummaryFindings.bloodCounts]
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
