
import { jsPDF } from "jspdf";
import { Medication } from "@/types";

/**
 * Calculates age from date of birth
 */
export const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return '-';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

/**
 * Converts weight to kg if needed
 */
export const convertToKg = (weight: string): string => {
  if (!weight) return '-';
  
  const numWeight = parseFloat(weight);
  if (isNaN(numWeight)) return '-';
  
  if (weight.toLowerCase().includes('lb')) {
    return (numWeight * 0.45359237).toFixed(1);
  }
  
  return numWeight.toFixed(1);
};

/**
 * Calculates BMI based on height and weight
 */
export const calculateBMI = (height: string, weight: string): string => {
  if (!height || !weight) return '-';
  
  // Handle height in different formats
  let heightInMeters = 0;
  if (height.includes("'")) {
    // Format like 5'10"
    const parts = height.replace(/"/g, '').split("'");
    const feet = parseFloat(parts[0]);
    const inches = parseFloat(parts[1] || '0');
    heightInMeters = ((feet * 12) + inches) * 0.0254;
  } else {
    // Assume height is in cm
    heightInMeters = parseFloat(height) / 100;
  }
  
  // Convert weight to kg if it's in lbs
  const weightInKg = parseFloat(convertToKg(weight));
  
  if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters === 0) return '-';
  
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

/**
 * Draw a stat box with rounded corners
 */
export const drawStatBox = (doc: jsPDF, text: string, y: number, contentMargin: number, contentWidth: number, pageWidth: number) => {
  // Draw rounded rectangle
  doc.setDrawColor(153, 188, 68); // #99bc44
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.roundedRect(contentMargin, y, contentWidth, 40, 5, 5, 'FD');
  
  // Add text
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFontSize(14);
  doc.setFont("Montserrat", "bold");
  
  // Split text into lines and center
  const lines = doc.splitTextToSize(text, contentWidth - 20);
  const lineHeight = 7;
  const totalTextHeight = lines.length * lineHeight;
  const startY = y + (40 - totalTextHeight) / 2;
  
  lines.forEach((line: string, index: number) => {
    doc.text(line, pageWidth / 2, startY + (index * lineHeight), { align: "center" });
  });
};

/**
 * Add page number to the current page
 */
export const addPageNumber = (doc: jsPDF, pageNumber: number, pageWidth: number) => {
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(pageNumber.toString(), pageWidth / 2, 280, { align: "center" });
};
