
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "../core/pdfUtils";

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
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
