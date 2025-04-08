
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
      // Skip non-text cells or cells with already processed text
      if (!data.cell.text || typeof data.cell.text !== 'string' || Array.isArray(data.cell.text)) {
        return;
      }
      
      const text = data.cell.text as string;
      let formattedContent = [];
      
      // Check for formatting tags
      if (text.includes('<b>') || text.includes('<i>') || text.includes('<u>')) {
        // Process the text to handle multiple formatting tags
        let currentIndex = 0;
        let remainingText = text;
        
        // Find all formatting tags in sequence
        while (currentIndex < remainingText.length) {
          // Check for bold text
          const boldStartIndex = remainingText.indexOf('<b>', currentIndex);
          if (boldStartIndex !== -1) {
            // Add text before the bold tag
            if (boldStartIndex > currentIndex) {
              formattedContent.push({
                text: remainingText.substring(currentIndex, boldStartIndex),
                style: {}
              });
            }
            
            const boldEndIndex = remainingText.indexOf('</b>', boldStartIndex);
            if (boldEndIndex !== -1) {
              // Add the bold text
              formattedContent.push({
                text: remainingText.substring(boldStartIndex + 3, boldEndIndex),
                style: { bold: true }
              });
              currentIndex = boldEndIndex + 4; // Move past the closing tag
            } else {
              // No closing tag, treat the rest as normal text
              formattedContent.push({
                text: remainingText.substring(currentIndex),
                style: {}
              });
              break;
            }
          } 
          // Check for italic text
          else if (remainingText.indexOf('<i>', currentIndex) !== -1) {
            const italicStartIndex = remainingText.indexOf('<i>', currentIndex);
            
            // Add text before the italic tag
            if (italicStartIndex > currentIndex) {
              formattedContent.push({
                text: remainingText.substring(currentIndex, italicStartIndex),
                style: {}
              });
            }
            
            const italicEndIndex = remainingText.indexOf('</i>', italicStartIndex);
            if (italicEndIndex !== -1) {
              // Add the italic text
              formattedContent.push({
                text: remainingText.substring(italicStartIndex + 3, italicEndIndex),
                style: { italic: true }
              });
              currentIndex = italicEndIndex + 4; // Move past the closing tag
            } else {
              // No closing tag, treat the rest as normal text
              formattedContent.push({
                text: remainingText.substring(currentIndex),
                style: {}
              });
              break;
            }
          } 
          // Add any remaining text without formatting
          else {
            formattedContent.push({
              text: remainingText.substring(currentIndex),
              style: {}
            });
            break;
          }
        }
        
        // Update cell content with formatted parts if we found any
        if (formattedContent.length > 0) {
          data.cell.text = formattedContent;
        }
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
