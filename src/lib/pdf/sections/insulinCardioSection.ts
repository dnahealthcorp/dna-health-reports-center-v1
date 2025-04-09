
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "../core/pdfUtils";

/**
 * Section 5: Insulin Resistance & Cardiovascular Risk (striped).
 * Reapply heading style after ensureSpace
 */
export function generateInsulinCardioSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  if (formData.showInsulinResistance === true) {
    currentY = ensureSpace(doc, currentY, 80, 40, pageWidth);
    doc.setFontSize(14);
    doc.setTextColor(153, 188, 68);
    doc.setFont("helvetica", "bold");
    doc.text("Insulin Resistance (Metabolic Syndrome)", contentMargin, currentY);
    currentY += 10;
    try {
      doc.addImage("/assets/insulin resistance.jpg", "JPEG", contentMargin, currentY, contentWidth, 60);
    } catch (error) {
      console.error("Error adding insulin resistance image:", error);
    }
    currentY += 60;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Figure 1: Insulin resistance and resulting metabolic disturbance", pageWidth / 2, currentY, { align: "center" as "center" });
    currentY += 10;
  }

  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Cardiovascular risk (*Apo B : Apo A1 ratio)", contentMargin, currentY);
  currentY += 5;

  doc.setFontSize(10);
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Low risk", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Moderate risk", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "High risk", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Men", "0.30-to-0.69", "0.70-to-0.89", "0.90-to-1.2"],
      ["Women", "0.30-to-0.59", "0.60-to-0.79", "0.80-to-1.00"]
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
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and footer to each page
      addLogoToPage(doc);
      
      // Add footer only on completed pages
      if (data.pageNumber < doc.getNumberOfPages()) {
        addFooter(doc, pageWidth);
      }
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        const rowIndex = data.row.index;
        if ((formData.patientInfo.gender === "Male" && rowIndex === 0) ||
            (formData.patientInfo.gender === "Female" && rowIndex === 1)) {
          doc.setFillColor(255, 255, 200);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
          doc.setTextColor(60, 60, 60);
          doc.text(
            data.cell.text,
            data.cell.x + data.cell.padding("left"),
            data.cell.y + data.cell.padding("top") + data.cell.contentHeight / 2 + 1
          );
        }
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}
