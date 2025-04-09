
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

  // Pre-calculate approximate row heights based on content length
  const estimateRowHeight = (content: string): number => {
    if (!content.trim()) return 10;
    
    // Average chars per line based on font size and cell width
    const charsPerLine = (contentWidth - 50) / 2;
    // Count lines based on text length and average chars per line
    const lines = Math.ceil(content.length / charsPerLine);
    // Set minimum height and add more for longer content
    return Math.max(10, lines * 4.5 + 10);
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
      minCellHeight: 12, // Set minimum cell height
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
            // Clear any text that autoTable might have rendered
            const rect = {
              x: data.cell.x,
              y: data.cell.y,
              w: data.cell.width,
              h: data.cell.height
            };
            doc.setFillColor(data.row.index % 2 === 0 ? 255 : 245);
            doc.rect(rect.x, rect.y, rect.w, rect.h, 'F');
            
            // Fixed: Using renderHtmlInPdfCell with the correct parameter types
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
    willDrawCell: (data) => {
      // Dynamically adjust row heights based on content
      if (data.section === 'body' && data.column.index === 1) {
        const cell = data.cell;
        if (cell && cell.raw && typeof cell.raw === 'object' && 'rawHtml' in cell.raw) {
          const rawHtml = (cell.raw as {rawHtml: string}).rawHtml;
          if (rawHtml) {
            // Estimate appropriate row height based on content
            const estimatedHeight = estimateRowHeight(rawHtml);
            if (estimatedHeight > data.row.height) {
              data.row.height = estimatedHeight;
            }
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
