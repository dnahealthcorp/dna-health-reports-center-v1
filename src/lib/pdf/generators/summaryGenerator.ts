
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage, addFooter, ensureSpace } from "../pdfUtilities";
import { htmlToPdfMakeContent } from "@/lib/pdf/richTextUtils";

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

  // Create table body with formatted HTML content
  // Using htmlToPdfMakeContent to preserve formatting
  const tableBody = [
    ["Glucose Metabolism", htmlToPdfMakeContent(formData.summaryFindings.glucoseMetabolism || '')],
    ["Proteins", htmlToPdfMakeContent(formData.summaryFindings.proteins || '')],
    ["Lipid Profile", htmlToPdfMakeContent(formData.summaryFindings.lipidProfile || '')],
    ["Inflammation", htmlToPdfMakeContent(formData.summaryFindings.inflammation || '')],
    ["Metabolic", htmlToPdfMakeContent(formData.summaryFindings.metabolic || '')],
    ["Homocysteine", htmlToPdfMakeContent(formData.summaryFindings.homocysteine || '')],
    ["Vitamins/Minerals", htmlToPdfMakeContent(formData.summaryFindings.vitaminsMinerals || '')],
    ["Iron Profile", htmlToPdfMakeContent(formData.summaryFindings.ironProfile || '')],
    ["Sex Hormones", htmlToPdfMakeContent(formData.summaryFindings.sexHormones || '')],
    ["Kidney Function and Electrolytes", htmlToPdfMakeContent(formData.summaryFindings.kidneyFunctionElectrolytes || '')],
    ["Liver Functions", htmlToPdfMakeContent(formData.summaryFindings.liverFunctions || '')],
    ["Tumor Markers", htmlToPdfMakeContent(formData.summaryFindings.tumorMarkers || '')],
    ["Blood Counts", htmlToPdfMakeContent(formData.summaryFindings.bloodCounts || '')]
  ];

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255,255,255], fontStyle: 'bold' } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255,255,255], fontStyle: 'bold' } }
      ]
    ],
    body: tableBody,
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
