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

/**
 * Adds the DNA Health logo to the top right corner of the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    // Position the logo in the top right corner with better dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = pageWidth - 60; // Position from right
    const y = 15; // Position from top
    const logoWidth = 40;
    const logoHeight = 15;
    
    try {
      // Use the PNG logo directly
      doc.addImage("/assets/dna-logo.png", "PNG", x, y, logoWidth, logoHeight);
      console.log("Logo added to PDF successfully using direct PNG method");
    } catch (directImageError) {
      console.warn("Could not add logo directly, trying SVG method:", directImageError);
      
      // Use the SVG logo from the public directory as a fallback
      const svgLogo = `
      <svg xmlns="http://www.w3.org/2000/svg" width="236" height="86" viewBox="0 0 236 86" fill="none">
        <path d="M55.9 69.1C45.2 69.1 34.6 62.6 28.5 52.5C22.2 42.2 21.1 29.7 25.6 18.9C30.1 8 39.4 0.9 51 0.9H87.3V50.1C87.3 60.8 78.5 69.1 67.2 69.1H55.9Z" fill="#A4A5A5"/>
        <path d="M55.9 68.2C45.2 68.2 34.6 61.7 28.5 51.6C22.2 41.3 21.1 28.8 25.6 18C30.1 7.1 39.4 0 51 0H87.3V49.2C87.3 59.9 78.5 68.2 67.2 68.2H55.9Z" fill="#A4A5A5"/>
        <path d="M153.8 67.6C159.7 59.9 156.8 48 147.2 44.2C138.8 40.8 128.8 43.9 123.9 51.4C116.8 62.2 109.8 73.1 102.8 83.9C102.2 84.8 101.7 85.8 100.9 86.6H127C136.1 86.6 145.5 80.9 150.6 72.8C151.8 71 152.8 69.3 153.8 67.6Z" fill="#99BC44"/>
        <path d="M140.1 18.5C135.9 16.7 130.9 16.9 126.9 18.9C123.1 20.9 120.2 24.4 118 28.4C113.7 36.2 113.9 47 119.3 55.1C119.4 55.3 119.6 55.5 119.7 55.6C120.4 54.7 121 53.7 121.6 52.7C126.8 44.6 132 36.5 137.2 28.4C138.5 26.4 139.2 24.1 140.1 18.5Z" fill="#99BC44"/>
      </svg>
      `;
      
      doc.addSvgAsImage(svgLogo, x, y, logoWidth, logoHeight);
      console.log("Logo added to PDF using SVG fallback method");
    }
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    
    // Final fallback - create a text-based "DNA Health" label if all else fails
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(12);
      doc.setTextColor(153, 188, 68); // Green color
      doc.text("DNA HEALTH", pageWidth - 20, 15, { align: "right" });
      console.log("Added text fallback for logo");
    } catch (fallbackError) {
      console.error("Failed to add any logo or text:", fallbackError);
    }
  }
};

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
