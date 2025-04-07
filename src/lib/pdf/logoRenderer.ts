
import { jsPDF } from "jspdf";

/**
 * Adds the DNA Health logo to the top right corner of the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    const margin = 10; // Margin from the page edge
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 20;
    const logoHeight = 20; // Adjusted height for better aspect ratio
    // Calculate x-coordinate so that the logo appears at the top right
    const x = pageWidth - logoWidth - margin;
    const y = margin;
    
    // Use an absolute path for the logo
    const logoPath = `${window.location.origin}/assets/DNA Logo - Grey.svg`;
    
    // Add the image using addImage
    doc.addImage(logoPath, 'SVG', x, y, logoWidth, logoHeight);
    console.log("Logo added to PDF successfully at the top right corner");
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    
    // Fallback to using standard image with absolute path if SVG fails
    try {
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 20;
      const logoHeight = 20;
      const x = pageWidth - logoWidth - margin;
      const y = margin;
      
      const logoPath = `${window.location.origin}/assets/dna-logo.png`;
      doc.addImage(logoPath, 'PNG', x, y, logoWidth, logoHeight);
      console.log("Fallback logo added successfully");
    } catch (fallbackError) {
      console.error("Failed to add fallback logo:", fallbackError);
    }
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
