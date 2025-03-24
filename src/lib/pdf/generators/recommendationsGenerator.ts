
import { jsPDF } from 'jspdf';
import { PatientFormData } from '@/types';

export const generateRecommendations = (
  pdf: jsPDF,
  formData: PatientFormData,
  leftMargin: number,
  startY: number
) => {
  let yPos = startY;
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Recommendations", leftMargin, yPos);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  yPos += 10;
  
  // Nutrition Recommendations
  if (formData.nutritionRecommendations && Object.values(formData.nutritionRecommendations).some(val => val && val.trim() !== '')) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Nutrition", leftMargin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 5;
    
    const nutrition = formData.nutritionRecommendations;
    if (nutrition.nutritionalPlan) pdf.text(`Plan: ${nutrition.nutritionalPlan}`, leftMargin, yPos), yPos += 5;
    if (nutrition.proteinConsumption) pdf.text(`Protein: ${nutrition.proteinConsumption}`, leftMargin, yPos), yPos += 5;
    if (nutrition.omissions) pdf.text(`Omissions: ${nutrition.omissions}`, leftMargin, yPos), yPos += 5;
    if (nutrition.additionalConsiderations) pdf.text(`Additional: ${nutrition.additionalConsiderations}`, leftMargin, yPos), yPos += 10;
  }
  
  // Exercise Recommendations
  if (formData.exerciseDetail && Object.values(formData.exerciseDetail).some(val => val && val.trim() !== '')) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Exercise", leftMargin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 5;
    
    const exercise = formData.exerciseDetail;
    if (exercise.focusOn) pdf.text(`Focus on: ${exercise.focusOn}`, leftMargin, yPos), yPos += 5;
    if (exercise.walking) pdf.text(`Walking: ${exercise.walking}`, leftMargin, yPos), yPos += 5;
    if (exercise.avoid) pdf.text(`Avoid: ${exercise.avoid}`, leftMargin, yPos), yPos += 5;
    if (exercise.tracking) pdf.text(`Tracking: ${exercise.tracking}`, leftMargin, yPos), yPos += 10;
  }
  
  return yPos;
};
