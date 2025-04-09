
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
    body: [
      ["Glucose Metabolism", findings.glucoseMetabolism],
      ["Proteins", findings.proteins],
      ["Lipid Profile", findings.lipidProfile],
      ["Inflammation", findings.inflammation],
      ["Metabolic", findings.metabolic],
      ["Homocysteine", findings.homocysteine],
      ["Vitamins/Minerals", findings.vitaminsMinerals],
      ["Iron Profile", findings.ironProfile],
      ["Sex Hormones", findings.sexHormones],
      ["Kidney Function and Electrolytes", findings.kidneyFunctionElectrolytes],
      ["Liver Functions", findings.liverFunctions],
      ["Tumor Markers", findings.tumorMarkers],
      ["Blood Counts", findings.bloodCounts]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
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
        const cellContent = data.cell.raw as string;
        
        // Check if content is HTML
        if (typeof cellContent === 'string' && cellContent.includes('<')) {
          // Clear cell content - we'll draw it ourselves
          data.cell.styles.halign = 'left';
          data.cell.styles.valign = 'top';
          
          // We'll manually render HTML in this cell
          renderHtmlInPdfCell(
            doc,
            cellContent,
            data.cell.x,
            data.cell.y,
            data.cell.width
          );
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
