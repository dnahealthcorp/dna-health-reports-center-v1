
import { jsPDF } from "jspdf";
import { addLogoToPage, addFooter } from "../pdfUtilities";

/**
 * Section 1: Images on the first page (cover).
 * Includes logo on the first page, no page number shown.
 */
export function generateImagesSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number
): number {
  // Add logo on the very first page
  addLogoToPage(doc);

  const blockHeight = 150;
  currentY = ensureSpace(doc, currentY, blockHeight, 40, pageWidth);

  const imageWidth = 100;
  const imageHeight = 66;
  const imageStartX = (pageWidth - imageWidth) / 2;

  try {
    doc.addImage("/assets/picture1.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    doc.addImage("/assets/picture2.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    doc.addImage("/assets/picture3.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
  } catch (error) {
    console.error("Error adding images to PDF:", error);
  }
  return currentY;
}

// Helper function to ensure there's enough space on the page
// Moved from main pdfGenerator.ts
function ensureSpace(
  doc: jsPDF,
  currentY: number,
  neededHeight: number,
  topMargin = 40,
  pageWidth: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 15;
  if (currentY + neededHeight > pageHeight - bottomMargin) {
    addFooter(doc, pageWidth);
    doc.addPage();
    addLogoToPage(doc);
    return topMargin;
  }
  return currentY;
}
