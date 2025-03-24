
import { jsPDF } from 'jspdf';
import { Vital } from '@/types';

export const generateVitals = (
  pdf: jsPDF,
  vitals: Vital | undefined,
  leftMargin: number,
  startY: number
) => {
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Vitals", leftMargin, startY);
  
  if (!vitals) return startY + 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  let yPos = startY + 10;
  if (vitals.height) pdf.text(`Height: ${vitals.height}`, leftMargin, yPos), yPos += 5;
  if (vitals.weight) pdf.text(`Weight: ${vitals.weight}`, leftMargin, yPos), yPos += 5;
  if (vitals.bloodPressure) pdf.text(`Blood Pressure: ${vitals.bloodPressure}`, leftMargin, yPos), yPos += 5;
  if (vitals.heartRate) pdf.text(`Heart Rate: ${vitals.heartRate}`, leftMargin, yPos), yPos += 5;
  if (vitals.temperature) pdf.text(`Temperature: ${vitals.temperature}`, leftMargin, yPos), yPos += 5;
  if (vitals.respiratoryRate) pdf.text(`Respiratory Rate: ${vitals.respiratoryRate}`, leftMargin, yPos), yPos += 5;
  if (vitals.oxygenSaturation) pdf.text(`Oxygen Saturation: ${vitals.oxygenSaturation}`, leftMargin, yPos), yPos += 5;
  
  return yPos;
};
