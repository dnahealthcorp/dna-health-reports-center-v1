
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { calculateAge, calculateBMI, convertToKg } from "../pdfUtilities";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./headerFooter";

/**
 * Section 3: Vital Signs Table (striped).
 * Headings 14px
 */
export function generateVitalsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData,
  pageNumber: number
): number {
  currentY = ensureSpace(doc, currentY, 15, 40, pageWidth, pageNumber);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Key vital signs", contentMargin, currentY);
  currentY += 8;

  const colWidth = contentWidth / 3;
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Vitals", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Value", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Target Range", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]
    ],
    body: [
      ["Date of Birth", formData.patientInfo.dateOfBirth ? new Date(formData.patientInfo.dateOfBirth).toLocaleDateString() : "-", "-"],
      ["Age (years)", calculateAge(formData.patientInfo.dateOfBirth), "-"],
      ["Blood Pressure", formData.vitals.bloodPressure || "-", "120/60-140/85"],
      ["Height (cm)", formData.vitals.height || "-", "-"],
      ["Weight (Kg)", convertToKg(formData.vitals.weight) || "-", "-"],
      ["Body Mass Index", calculateBMI(formData.vitals.height, formData.vitals.weight), "18.5 – 25.9"]
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
      0: { cellWidth: colWidth, fillColor: [240, 250, 230] },
      1: { cellWidth: colWidth },
      2: { cellWidth: colWidth }
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
