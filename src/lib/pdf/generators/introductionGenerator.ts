
import { jsPDF } from "jspdf";
import { PatientFormData } from "@/types";
import { ensureSpace } from "../pdfUtilities";

/**
 * Section 2: Introduction & Greeting.
 * Reduced top spacing for "Your step towards optimal health."
 */
export function generateIntroductionSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  // Title line: "Your step towards optimal health."
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  const title = "Your step towards optimal health.";
  const titleWidth = doc.getTextWidth(title);
  const centerX = pageWidth / 2;
  const titleY = currentY + 5; // reduced top spacing
  const titleX = centerX - (titleWidth / 2);
  doc.setTextColor(100, 100, 100);
  doc.text(title, titleX, titleY);
  currentY = titleY + 10;

  // Multi-line approach text
  doc.setFontSize(18);
  doc.setFont("Helvetica", "bold");

  const line1 = "Our approach is proactive, rather than reactive,";
  const line2Part1 = "giving you ";
  const line2Part2 = "control of your health";
  const line2Part3 = " throughout";
  const line3 = "your life.";

  const line1Width = doc.getTextWidth(line1);
  const line1X = centerX - line1Width / 2;
  doc.setTextColor(100, 100, 100);
  doc.text(line1, line1X, currentY);
  currentY += 10;

  // line2
  const line2Full = line2Part1 + line2Part2 + line2Part3;
  const line2Width = doc.getTextWidth(line2Full);
  const line2X = centerX - line2Width / 2;
  let segX = line2X;

  doc.setTextColor(100, 100, 100);
  doc.text(line2Part1, segX, currentY);
  segX += doc.getTextWidth(line2Part1);

  doc.setTextColor(153, 188, 68);
  doc.text(line2Part2, segX, currentY);
  segX += doc.getTextWidth(line2Part2);

  doc.setTextColor(100, 100, 100);
  doc.text(line2Part3, segX, currentY);
  currentY += 10;

  // line3
  const line3Width = doc.getTextWidth(line3);
  const line3X = centerX - line3Width / 2;
  doc.text(line3, line3X, currentY);
  currentY += 10;

  // Greeting & intro text
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  const greeting = `Dear ${formData.patientInfo.name || "Patient"},`;
  doc.text(greeting, contentMargin, currentY);
  currentY += 6;
  const introLines = [
    "It has been a pleasure to welcome you to our Clinic. The entire DNA Health team feels privileged",
    "to be a part of your journey to wellness and longevity."
  ];
  introLines.forEach(line => {
    doc.text(line, contentMargin, currentY, { maxWidth: contentWidth, align: "left" as "left" });
    currentY += 6;
  });
  return currentY + 10;
}
