import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { databaseService } from "@/services/databaseService"; // adjust import if needed

/****************************************************************************
 * Utility Functions
 ****************************************************************************/

/**
 * Adds the DNA Health logo to the top-left or top-right corner of the PDF.
 * Adjust coordinates as needed.
 */
function addLogoToPage(doc: jsPDF): void {
  try {
    const margin = 5;
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;
    const logoHeight = 20;
    const x = pageWidth - logoWidth - margin;
    const y = margin;

    doc.addImage("/assets/dna-logo.png", "PNG", x, y, logoWidth, logoHeight);
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
  }
}

/**
 * Draws a page number in the footer, typically center or bottom-right.
 */
function addPageNumber(doc: jsPDF, currentPageNumber: number, pageWidth: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(String(currentPageNumber), pageWidth - 10, pageHeight - 10);
}

/**
 * Helper to check if there's enough space on the current page for a block
 * of `requiredHeight` mm. If not, adds a new page and resets `currentY`.
 */
function ensureSpace(
  doc: jsPDF,
  currentY: number,
  requiredHeight: number,
  topMargin: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 10; // adjust if needed

  if (currentY + requiredHeight > pageHeight - bottomMargin) {
    doc.addPage();
    return topMargin; // reset currentY
  }
  return currentY;
}

/****************************************************************************
 * Section Functions
 ****************************************************************************/

/**
 * Example: Generates the first “section” (images) on the PDF.
 * Removes forced doc.addPage() and uses `currentY` to place content.
 */
function generateFirstSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number
): number {
  addLogoToPage(doc);

  // Suppose these images occupy ~130mm in height
  const blockHeight = 130;
  currentY = ensureSpace(doc, currentY, blockHeight, 20);

  // Place images (example)
  const imageWidth = 100;
  const imageHeight = 66;
  const imageStartX = (pageWidth - imageWidth) / 2;

  doc.addImage("/assets/picture1.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
  currentY += imageHeight + 10; // gap

  doc.addImage("/assets/picture2.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
  currentY += imageHeight + 10; // gap

  // Page number if you like:
  addPageNumber(doc, 1, pageWidth);

  return currentY;
}

/**
 * Example: Another section with text and an autoTable for “vital signs”.
 */
function generateVitalsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  // Title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titleHeight = 10;
  currentY = ensureSpace(doc, currentY, titleHeight, 20);

  doc.text("Key Vital Signs", contentMargin, currentY);
  currentY += 8; // move down a bit

  // Now place the table
  // We'll let autoTable handle page breaks if it doesn't fit.
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Vitals", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Value", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Target Range", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]
    ],
    body: [
      ["Age (years)", "30", "-"],
      ["Blood Pressure", "120/80", "120/60-140/85"],
      // ...
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    margin: { left: contentMargin, right: contentMargin }
  });

  // autoTable sets doc.lastAutoTable.finalY after rendering
  const finalY = (doc as any).lastAutoTable.finalY;
  return finalY + 10; // gap after table
}

/**
 * Example: “Summary Findings” section with a table
 */
function generateSummaryFindings(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  // Enough space for ~60mm table?
  const approximateTableHeight = 60;
  currentY = ensureSpace(doc, currentY, approximateTableHeight, 20);

  doc.text("Summary of Findings", contentMargin, currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Key findings", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]
    ],
    body: [
      ["Glucose Metabolism", "Some details..."],
      ["Lipid Profile", "Some details..."]
      // ...
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    margin: { left: contentMargin, right: contentMargin }
  });

  const finalY = (doc as any).lastAutoTable.finalY;
  return finalY + 10;
}

/****************************************************************************
 * Main Generator
 ****************************************************************************/

export async function generatePDF(
  formData: PatientFormData,
  medications: Medication[]
): Promise<string> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Global styles
  doc.setFont("helvetica");

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();  // 210 mm for A4
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm for A4
  const contentMargin = 20;
  const contentWidth = pageWidth - contentMargin * 2;

  // We'll track our current vertical position
  let currentY = 20; // start a bit down from the top

  // 1) First "section" (images)
  currentY = generateFirstSection(doc, currentY, pageWidth, contentMargin, contentWidth);

  // 2) Vital signs section
  currentY = generateVitalsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 3) Summary of Findings
  currentY = generateSummaryFindings(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // ... More sections (Insulin Resistance, Doctor’s Recommendations, etc.)
  // Each function receives doc, currentY, etc. and returns updated currentY.

  // Finally, name & save the PDF
  const patientName = formData.patientInfo.name?.replace(/\s+/g, "_") || "Patient";
  const fileName = `${patientName}_Medical_Report.pdf`;
  doc.save(fileName);

  // Optionally save a reference in DB
  if (formData.patientInfo.medicalRecordNumber) {
    await databaseService.savePDFReference(formData.patientInfo.medicalRecordNumber, fileName);
  }

  return fileName;
}
