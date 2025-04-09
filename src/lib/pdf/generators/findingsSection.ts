
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./headerFooter";

/**
 * Helper function to process HTML text for PDF output with formatting
 * This preserves basic formatting like bold, italic, and lists
 */
function processHtmlForPdf(html: string): string {
  if (!html) return "";
  
  // For plain text (no HTML), just return it
  if (!html.includes('<')) return html;
  
  // We'll still need text content for table cells that don't support HTML
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
    glucoseMetabolism: processHtmlForPdf(formData.summaryFindings.glucoseMetabolism || ""),
    proteins: processHtmlForPdf(formData.summaryFindings.proteins || ""),
    lipidProfile: processHtmlForPdf(formData.summaryFindings.lipidProfile || ""),
    inflammation: processHtmlForPdf(formData.summaryFindings.inflammation || ""),
    metabolic: processHtmlForPdf(formData.summaryFindings.metabolic || ""),
    homocysteine: processHtmlForPdf(formData.summaryFindings.homocysteine || ""),
    vitaminsMinerals: processHtmlForPdf(formData.summaryFindings.vitaminsMinerals || ""),
    ironProfile: processHtmlForPdf(formData.summaryFindings.ironProfile || ""),
    sexHormones: processHtmlForPdf(formData.summaryFindings.sexHormones || ""),
    kidneyFunctionElectrolytes: processHtmlForPdf(formData.summaryFindings.kidneyFunctionElectrolytes || ""),
    liverFunctions: processHtmlForPdf(formData.summaryFindings.liverFunctions || ""),
    tumorMarkers: processHtmlForPdf(formData.summaryFindings.tumorMarkers || ""),
    bloodCounts: processHtmlForPdf(formData.summaryFindings.bloodCounts || "")
  };

  // Using HTML content directly with autoTable
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
