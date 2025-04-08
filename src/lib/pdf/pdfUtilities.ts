
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
    // Position the logo in the top right corner with proper dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 30;
    const logoHeight = 16;
    const x = pageWidth - logoWidth - 10; // Position from right with proper margin
    const y = 10; // Position from top
    
    try {
      // Try using the grey version of the logo which looks better in PDFs
      doc.addImage("/assets/DNA Logo - Grey.svg", "SVG", x, y, logoWidth, logoHeight);
      console.log("Grey logo added to PDF successfully");
    } catch (svgError) {
      console.warn("Could not add SVG grey logo:", svgError);
      
      // Try standard logo as SVG
      try {
        doc.addSvgAsImage("/assets/dna-logo.svg", x, y, logoWidth, logoHeight);
        console.log("Standard SVG logo added to PDF successfully");
      } catch (stdSvgError) {
        console.warn("Could not add standard SVG logo:", stdSvgError);
        
        // Fallback to PNG
        try {
          doc.addImage("/assets/dna-logo.png", "PNG", x, y, logoWidth, logoHeight);
          console.log("PNG logo added to PDF successfully");
        } catch (pngError) {
          console.warn("Could not add PNG logo, using text fallback:", pngError);
          
          // Final text fallback
          doc.setFontSize(14);
          doc.setTextColor(153, 188, 68); // Green color for DNA
          doc.setFont("helvetica", "bold");
          doc.text("DNA HEALTH", pageWidth - 10, 15, { align: "right" });
          console.log("Added text fallback for logo");
        }
      }
    }
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    
    // Ultimate fallback - create a text-based label if all else fails
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(14);
      doc.setTextColor(153, 188, 68); // Green color
      doc.setFont("helvetica", "bold");
      doc.text("DNA HEALTH", pageWidth - 10, 15, { align: "right" });
      console.log("Added text fallback for logo due to error");
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
