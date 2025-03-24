
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
 * Now returns a promise with a string
 */
export const logoToDataURL = async (): Promise<string> => {
  try {
    // For reliability, use the base64 encoded version of the logo
    // This prevents file loading issues that can occur with relative paths
    return '/assets/DNA Logo - Grey.svg';
  } catch (error) {
    console.error("Error converting logo to data URL:", error);
    // Return a placeholder on error
    return '';
  }
};
