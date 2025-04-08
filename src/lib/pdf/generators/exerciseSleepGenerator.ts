
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage, addFooter, ensureSpace } from "../pdfUtilities";

/**
 * Section 7: Exercise and Sleep/Stress Recommendations, striped.
 */
export function generateExerciseSleepSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  // Title for Exercise
  doc.text("Exercise", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Exercise", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Focus on", formData.exerciseDetail?.focusOn || ""],
      ["Walking", formData.exerciseDetail?.walking || ""],
      ["Rest/Recovery", formData.exerciseDetail?.restRecovery || ""],
      ["Tracking", formData.exerciseDetail?.tracking || ""]
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

  // Title for Sleep & Stress
  doc.text("Sleep and Stress", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Sleep and Stress", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Sleep", formData.sleepStressRecommendations?.sleep || ""],
      ["Stress", formData.sleepStressRecommendations?.stress || ""]
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
