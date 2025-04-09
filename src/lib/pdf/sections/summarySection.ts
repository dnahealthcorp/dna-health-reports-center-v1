
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { renderHtmlInPdfCell, renderHtmlTableSection } from "../htmlToPdfConverter";

/**
 * Section 4: Summary of Findings (striped).
 * Updated to use enhanced HTML table renderer with improved page break handling
 */
export function generateSummarySection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY += 10;
  
  // Define summary fields in a structured way for consistent rendering
  const summaryFields = [
    { label: "Glucose Metabolism", value: formData.summaryFindings.glucoseMetabolism || "" },
    { label: "Proteins", value: formData.summaryFindings.proteins || "" },
    { label: "Lipid Profile", value: formData.summaryFindings.lipidProfile || "" },
    { label: "Inflammation", value: formData.summaryFindings.inflammation || "" },
    { label: "Metabolic", value: formData.summaryFindings.metabolic || "" },
    { label: "Homocysteine", value: formData.summaryFindings.homocysteine || "" },
    { label: "Vitamins/Minerals", value: formData.summaryFindings.vitaminsMinerals || "" },
    { label: "Iron Profile", value: formData.summaryFindings.ironProfile || "" },
    { label: "Sex Hormones", value: formData.summaryFindings.sexHormones || "" },
    { label: "Kidney Function and Electrolytes", value: formData.summaryFindings.kidneyFunctionElectrolytes || "" },
    { label: "Liver Functions", value: formData.summaryFindings.liverFunctions || "" },
    { label: "Tumor Markers", value: formData.summaryFindings.tumorMarkers || "" },
    { label: "Blood Counts", value: formData.summaryFindings.bloodCounts || "" }
  ];

  // Calculate whether content has HTML
  const hasHtmlContent = summaryFields.some(field => 
    field.value.includes('<') && field.value.includes('>')
  );

  // If we have HTML content, use our enhanced rendering approach
  if (hasHtmlContent) {
    // Prepare data structure for the renderer
    const rows = summaryFields.map(field => ({
      label: field.label,
      value: field.value
    }));
    
    // Use our enhanced renderer with improved page break handling
    currentY = renderHtmlTableSection(
      doc,
      "Summary of findings",
      ["Parameter", "Key findings and next steps"],
      rows,
      currentY,
      contentMargin,
      contentWidth
    );
    
    return currentY;
  } else {
    // For non-HTML content, use the existing autoTable approach
    const tableBody = summaryFields.map(field => [field.label, field.value]);
    
    autoTable(doc, {
      startY: currentY,
      theme: "grid",
      head: [[
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]],
      body: tableBody,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        font: "helvetica",
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 50, fillColor: [240, 250, 230] },
        1: { cellWidth: contentWidth - 50 }
      },
      didDrawPage: (data) => {
        // Add logo and footer to each page
        const { addLogoToPage } = require("../logoRenderer");
        addLogoToPage(doc);
        
        // Add footer only on completed pages
        if (data.pageNumber < doc.getNumberOfPages()) {
          const { addFooter } = require("../core/pdfUtils");
          addFooter(doc, pageWidth);
        }
      }
    });
    
    return (doc as any).lastAutoTable.finalY + 10;
  }
}
