
import { jsPDF } from "jspdf";
import { Medication, PatientFormData } from "@/types";
import { addLogoToPage } from "./logoRenderer";
import { addFooter } from "./generators/headerFooter";
import { generateImagesSection, generateIntroductionSection } from "./generators/coverPage";
import { generateVitalsSection } from "./generators/vitalsSection";
import { generateSummarySection } from "./generators/findingsSection";
import { generateInsulinCardioSection } from "./generators/insulinCardioSection";
import { 
  generateDoctorsRecommendationsSection, 
  generateExerciseSleepSection 
} from "./generators/recommendationsSection";
import { generateMedicationsSupplementsSection } from "./generators/medicationsSupplementsSection";
import { generateFollowUpsSection } from "./generators/followUpsSection";

/**
 * Main PDF Generator.
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
  let pageNumber = 1;

  // 1) First page (cover) with images (and logo), no page number
  currentY = generateImagesSection(doc, currentY, pageWidth, contentMargin, contentWidth);

  // Force new page after cover
  addFooter(doc, pageWidth); // Footer on cover
  doc.addPage();
  addLogoToPage(doc);
  currentY = 40; // reset Y
  pageNumber++;

  // 2) Introduction & Greeting
  currentY = generateIntroductionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 3) Vital Signs
  currentY = generateVitalsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, pageNumber);

  // 4) Summary Findings
  currentY = generateSummarySection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, pageNumber);

  // 5) Insulin Resistance & Cardiovascular Risk
  currentY = generateInsulinCardioSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, pageNumber);

  // 6) Doctor's Recommendations
  currentY = generateDoctorsRecommendationsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, pageNumber);

  // 7) Exercise & Sleep/Stress
  currentY = generateExerciseSleepSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, pageNumber);

  // 8) Medications & Supplements
  currentY = generateMedicationsSupplementsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, medications, pageNumber);

  // 9) Follow-ups (plus new links, then signature)
  currentY = generateFollowUpsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, pageNumber);

  // Add a final footer if needed
  addFooter(doc, pageWidth);

  // Return the PDF as a Blob instead of saving it
  return doc.output('blob');
};
