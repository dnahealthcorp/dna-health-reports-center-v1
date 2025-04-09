
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./headerFooter";
import { renderHtmlInPdfCell } from "../htmlRenderer";

/**
 * Section 4: Summary of Findings (striped).
 * Uses custom HTML rendering for rich content.
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

  // Get findings content
  const findings = {
    glucoseMetabolism: formData.summaryFindings.glucoseMetabolism || "",
    proteins: formData.summaryFindings.proteins || "",
    lipidProfile: formData.summaryFindings.lipidProfile || "",
    inflammation: formData.summaryFindings.inflammation || "",
    metabolic: formData.summaryFindings.metabolic || "",
    homocysteine: formData.summaryFindings.homocysteine || "",
    vitaminsMinerals: formData.summaryFindings.vitaminsMinerals || "",
    ironProfile: formData.summaryFindings.ironProfile || "",
    sexHormones: formData.summaryFindings.sexHormones || "",
    kidneyFunctionElectrolytes: formData.summaryFindings.kidneyFunctionElectrolytes || "",
    liverFunctions: formData.summaryFindings.liverFunctions || "",
    tumorMarkers: formData.summaryFindings.tumorMarkers || "",
    bloodCounts: formData.summaryFindings.bloodCounts || ""
  };

  // Prepare the table body with proper content and rawHtml properties
  const tableBody = [
    ["Glucose Metabolism", { content: "", rawHtml: findings.glucoseMetabolism }],
    ["Proteins", { content: "", rawHtml: findings.proteins }],
    ["Lipid Profile", { content: "", rawHtml: findings.lipidProfile }],
    ["Inflammation", { content: "", rawHtml: findings.inflammation }],
    ["Metabolic", { content: "", rawHtml: findings.metabolic }],
    ["Homocysteine", { content: "", rawHtml: findings.homocysteine }],
    ["Vitamins/Minerals", { content: "", rawHtml: findings.vitaminsMinerals }],
    ["Iron Profile", { content: "", rawHtml: findings.ironProfile }],
    ["Sex Hormones", { content: "", rawHtml: findings.sexHormones }],
    ["Kidney Function and Electrolytes", { content: "", rawHtml: findings.kidneyFunctionElectrolytes }],
    ["Liver Functions", { content: "", rawHtml: findings.liverFunctions }],
    ["Tumor Markers", { content: "", rawHtml: findings.tumorMarkers }],
    ["Blood Counts", { content: "", rawHtml: findings.bloodCounts }]
  ];

  // Generate PDF table with the HTML content rendering
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } }
      ]
    ],
    body: tableBody,
    styles: {
      fontSize: 10,
      cellPadding: 5, // Increased padding to give more space for text
      font: "helvetica",
      textColor: [60, 60, 60],
      overflow: 'linebreak',
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
    didDrawCell: (data) => {
      // Only process the findings cells, which are in column 1 (index 1)
      if (data.section === 'body' && data.column.index === 1) {
        const cell = data.cell;
        
        // Check if cell has rawHtml property
        if (cell && cell.raw && typeof cell.raw === 'object' && 'rawHtml' in cell.raw) {
          const rawHtml = (cell.raw as {rawHtml: string}).rawHtml;
          
          if (rawHtml && rawHtml.trim() !== '') {
            // We'll manually render HTML in this cell
            renderHtmlInPdfCell(
              doc,
              rawHtml,
              data.cell.x,
              data.cell.y,
              data.cell.width
            );
          }
        }
      }
    },
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
