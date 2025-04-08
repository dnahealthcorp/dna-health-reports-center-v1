
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage, addFooter, ensureSpace } from "../pdfUtilities";
import { htmlToFormattedText } from "@/services/pdfService";

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

  // Using the enhanced htmlToFormattedText function
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255,255,255], fontStyle: 'bold' } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255,255,255], fontStyle: 'bold' } }
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
    },
    // Enhanced cell parser to handle text formatting
    didParseCell: function(data) {
      // Check for markers in the cell content that indicate formatting
      if (data.cell.text && typeof data.cell.text === 'string') {
        const text = data.cell.text as string;
        
        // If text contains bold markers <b>...</b>
        if (text.includes('<b>')) {
          const parts: Array<{text: string, style: Record<string, any>}> = [];
          const boldParts = text.split('<b>');
          
          // Add the first part (before any bold tags)
          parts.push({ text: boldParts[0], style: {} });
          
          // Process each bold section
          for (let i = 1; i < boldParts.length; i++) {
            const boldContent = boldParts[i].split('</b>');
            if (boldContent.length > 1) {
              // This is the bold text
              parts.push({ text: boldContent[0], style: { bold: true } });
              // This is the text after the bold section
              parts.push({ text: boldContent[1], style: {} });
            } else {
              // If there's no closing tag, treat it as normal text
              parts.push({ text: boldContent[0], style: {} });
            }
          }
          
          // Replace the text with the formatted parts
          data.cell.text = parts;
        }
        
        // Handle italic text if present
        if (text.includes('<i>') && typeof data.cell.text === 'string') {
          const italicText = data.cell.text as string;
          const parts: Array<{text: string, style: Record<string, any>}> = [];
          const italicParts = italicText.split('<i>');
          
          parts.push({ text: italicParts[0], style: {} });
          
          for (let i = 1; i < italicParts.length; i++) {
            const italicContent = italicParts[i].split('</i>');
            if (italicContent.length > 1) {
              parts.push({ text: italicContent[0], style: { italic: true } });
              parts.push({ text: italicContent[1], style: {} });
            } else {
              parts.push({ text: italicContent[0], style: {} });
            }
          }
          
          data.cell.text = parts;
        }
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
