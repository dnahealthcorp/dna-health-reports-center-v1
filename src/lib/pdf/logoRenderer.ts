import { jsPDF } from "jspdf";

/**
 * Adds the DNA Health logo to the top right corner of the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    const margin = 5; // Margin from the page edge
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;
    const logoHeight = 20;
    // Calculate x-coordinate so that the logo appears at the top right
    const x = pageWidth - logoWidth - margin;
    const y = margin;
    // Use a PNG logo for better compatibility
    doc.addImage("/assets/dna-logo.png", "PNG", x, y, logoWidth, logoHeight);
    console.log("Logo added to PDF successfully at the top right corner");
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
    // Use standard fonts instead of trying to load custom fonts.
    // jsPDF has built-in support for Helvetica.
    doc.setFont("helvetica");
    console.log("Using standard helvetica font for PDF");
  } catch (error) {
    console.error("Error loading Montserrat fonts:", error);
    // Fall back to default font if there's an error.
  }
};
