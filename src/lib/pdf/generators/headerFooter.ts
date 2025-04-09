
import { jsPDF } from "jspdf";
import { addLogoToPage } from "../logoRenderer";

/**
 * Draws the footer on the current page.
 * Footer text: "Executive Summary | DNA Health" in 8px helvetica regular,
 * right aligned, color #a5a4a4.
 */
export function addFooter(doc: jsPDF, pageWidth: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#a5a4a4");
  // Right align, 10mm from the bottom
  doc.text("Executive Summary | DNA Health", pageWidth - 10, pageHeight - 10, { align: "right" as "right" });
}

/**
 * Checks if there's enough vertical space on the current page.
 * If not, draws a footer, adds a new page (with header logo), and resets currentY to topMargin.
 */
export function ensureSpace(
  doc: jsPDF,
  currentY: number,
  neededHeight: number,
  topMargin = 40,
  pageWidth: number,
  pageNumber: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 15;
  if (currentY + neededHeight > pageHeight - bottomMargin) {
    addFooter(doc, pageWidth);
    doc.addPage();
    addLogoToPage(doc);
    return pageNumber > 2 ? topMargin : 40; // Use higher top margin after page 2
  }
  return currentY;
}
