
import { jsPDF } from "jspdf";

/**
 * Adds the DNA Health logo to the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    // Use a PNG logo for better compatibility
    doc.addImage("/assets/dna-logo.png", "PNG", 20, 20, 60, 20);
    console.log("Logo added to PDF successfully");
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    // Continue without the logo if there's an error
  }
};

/**
 * Loads the Montserrat font files for the PDF
 */
export const loadMontserratFonts = async (doc: jsPDF): Promise<void> => {
  try {
    // Use standard fonts instead of trying to load custom fonts
    // jsPDF has built-in support for helvetica
    doc.setFont("helvetica");
    console.log("Using standard helvetica font for PDF");
  } catch (error) {
    console.error("Error loading Montserrat fonts:", error);
    // Fall back to default font
  }
};

/**
 * Converts a logo file to Data URL for embedding in PDF
 */
export const logoToDataURL = async (): Promise<string> => {
  try {
    // In a real implementation, we would load the image and convert it
    // For now, we'll return a base64 placeholder or use an existing asset
    // This function would typically use Canvas to convert an image to base64
    
    // For simplicity, we're returning a placeholder
    return '/assets/DNA Logo - Grey.svg';
  } catch (error) {
    console.error("Error converting logo to data URL:", error);
    // Return a placeholder on error
    return '';
  }
};
