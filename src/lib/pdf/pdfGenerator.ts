
import jsPDF from 'jspdf';
import { PatientFormData, Medication } from '@/types';
import { generateHeader } from './generators/headerGenerator';
import { generatePatientInfo } from './generators/patientInfoGenerator';
import { generateVitals } from './generators/vitalsGenerator';
import { generateMedications } from './generators/medicationsGenerator';
import { generateRecommendations } from './generators/recommendationsGenerator';
import { generateFollowUps } from './generators/followUpsGenerator';

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<Uint8Array> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set constants for margins and dimensions
  const topMargin = 10;
  const leftMargin = 15;
  const pageWidth = 210; // A4 width in mm
  const contentWidth = pageWidth - (leftMargin * 2);
  
  // Generate PDF sections
  await generateHeader(pdf, leftMargin, topMargin);
  generatePatientInfo(pdf, formData.patientInfo, leftMargin, topMargin);
  
  // Generate vitals section and get the new Y position
  let currentY = generateVitals(pdf, formData.vitals, leftMargin, topMargin + 65);
  
  // Add medications to a new page
  pdf.addPage();
  currentY = topMargin + 10;
  
  // Generate medications section
  currentY = generateMedications(pdf, formData.medications, medications, leftMargin, currentY);
  
  // Generate recommendations
  currentY = generateRecommendations(pdf, formData, leftMargin, currentY);
  
  // Generate follow-ups
  if (formData.followUps?.length) {
    currentY = generateFollowUps(pdf, formData.followUps, leftMargin, currentY);
  }
  
  // Add footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("© DNA Health Corp", contentWidth / 2 + leftMargin - 15, 285);
  
  // Convert to Uint8Array and return
  return new Uint8Array(pdf.output('arraybuffer'));
};
