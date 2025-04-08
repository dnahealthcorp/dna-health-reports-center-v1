
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage, addFooter, ensureSpace } from "../pdfUtilities";
import { prepareHtmlForPdf } from "@/lib/pdf/richTextUtils";
import { renderRichText } from "@/lib/pdf/richTextRenderer";

/**
 * Section 6: Doctor's Recommendations (Nutrition), striped.
 */
export function generateDoctorsRecommendationsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  doc.text("Doctors Recommendations", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Nutrition", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Nutritional Style", formData.nutritionRecommendations?.nutritionalStyle || ""],
      ["Protein Consumption", formData.nutritionRecommendations?.proteinConsumption || ""],
      ["Eating Window", formData.nutritionRecommendations?.eatingWindow || ""],
      ["Limitations", formData.nutritionRecommendations?.limitations || ""],
      ["Additional Considerations", formData.nutritionRecommendations?.additionalConsiderations || ""]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
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
    // Custom cell renderer to handle rich text
    didDrawCell: (data) => {
      // Only process cells in the second column (index 1) that contain HTML
      if (data.column.index === 1 && data.cell.raw && typeof data.cell.raw === 'string' && 
          data.cell.raw.includes('<')) {
        // Access cell properties correctly
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        
        // Use our rich text renderer within the cell boundaries
        const padding = 2; // Match cell padding from styles
        
        renderRichText(
          doc, 
          prepareHtmlForPdf(data.cell.raw), 
          cellX + padding, 
          cellY + padding + 2, // Add a bit more vertical padding
          cellWidth - (padding * 2)
        );
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
