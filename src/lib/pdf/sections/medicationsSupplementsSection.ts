
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "../core/pdfUtils";

/**
 * Section 8: Medications and Supplements, striped.
 * Re-apply heading style after ensureSpace for "Supplements"
 */
export function generateMedicationsSupplementsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData,
  medications: Medication[]
): number {
  // Medications
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  doc.text("Medications", contentMargin, currentY);
  currentY += 8;

  const medicationRows = formData.medications.map(med => {
    const medication = medications.find(m => m.id === med.medicationId);
    return [
      medication?.name || "",
      med.dosage || "",
      "Prescription"
    ];
  }).filter(row => row[0] || row[1]);

  if (medicationRows.length === 0) {
    medicationRows.push(["No medications prescribed", "", ""]);
  }

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Medications", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Dosage", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Type", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: medicationRows,
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
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
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

  // Supplements
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14); // reapply heading style
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  doc.text("Supplements", contentMargin, currentY);
  currentY += 8;

  const supplementRows = (formData.supplements || []).map(sup => {
    const supplement = medications.find(m => m.id === sup.supplementId);
    return [
      supplement?.name || "",
      sup.dosage || "",
      sup.source || ""
    ];
  }).filter(row => row[0] || row[1] || row[2]);

  if (supplementRows.length === 0) {
    supplementRows.push(["No supplements recommended", "", ""]);
  }

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Supplements", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Dosage", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Source", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: supplementRows,
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
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
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
