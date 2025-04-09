
import { jsPDF } from "jspdf";
import { PatientFormData, Medication } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./pdfUtils";
import { generateImagesSection } from "../sections/imagesSection";
import { generateIntroductionSection } from "../sections/introductionSection";
import { generateVitalsSection } from "../sections/vitalsSection";
import { generateSummarySection } from "../sections/summarySection";
import { generateInsulinCardioSection } from "../sections/insulinCardioSection";
import { generateDoctorsRecommendationsSection } from "../sections/doctorsRecommendationsSection";
import { generateExerciseSleepSection } from "../sections/exerciseSleepSection";
import { generateMedicationsSupplementsSection } from "../sections/medicationsSupplementsSection";
import { generateFollowUpsSection } from "../sections/followUpsSection";

/**
 * Main PDF Generator.
 * This is the primary export function.
 */
export const generatePDF = async (
  formData: PatientFormData,
  medications: Medication[]
): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  doc.setFont("helvetica");

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm for A4
  const contentMargin = 20;
  const contentWidth = pageWidth - contentMargin * 2;

  // Start at 40mm from the top for extra spacing
  let currentY = 40;

  // 1) First page (cover) with images (and logo), no page number
  currentY = generateImagesSection(doc, currentY, pageWidth, contentMargin, contentWidth);

  // Force new page after cover
  addFooter(doc, pageWidth); // Footer on cover
  doc.addPage();
  addLogoToPage(doc);
  currentY = 40; // reset Y

  // 2) Introduction & Greeting
  currentY = generateIntroductionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 3) Vital Signs
  currentY = generateVitalsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 4) Summary Findings
  currentY = generateSummarySection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 5) Insulin Resistance & Cardiovascular Risk
  currentY = generateInsulinCardioSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 6) Doctor's Recommendations
  currentY = generateDoctorsRecommendationsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 7) Exercise & Sleep/Stress
  currentY = generateExerciseSleepSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 8) Medications & Supplements
  currentY = generateMedicationsSupplementsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, medications);

  // 9) Follow-ups (plus new links, then signature)
  currentY = generateFollowUpsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // Add a final footer if needed
  addFooter(doc, pageWidth);

  // Return the PDF as a Blob instead of saving it
  return doc.output('blob');
};
