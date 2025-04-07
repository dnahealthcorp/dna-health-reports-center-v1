
// Function to add the logo to the PDF page
import { jsPDF } from "jspdf";

export const addLogoToPage = (doc: jsPDF): void => {
  try {
    // Get page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo dimensions and position (right-aligned at top)
    const logoWidth = 25; // mm
    const logoHeight = 10; // mm
    const logoX = pageWidth - logoWidth - 20; // 20mm from right margin
    const logoY = 20; // 20mm from top

    // Add logo image to the page
    doc.addImage("/assets/dna-logo.svg", "SVG", logoX, logoY, logoWidth, logoHeight);
    console.log("Logo added to PDF successfully at the top right corner");
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    
    // Fallback to PNG if SVG fails
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 25; // mm
      const logoHeight = 10; // mm
      const logoX = pageWidth - logoWidth - 20;
      const logoY = 20;
      
      doc.addImage("/assets/dna-logo.png", "PNG", logoX, logoY, logoWidth, logoHeight);
      console.log("Logo added to PDF successfully using fallback PNG");
    } catch (fallbackError) {
      console.error("Failed to add logo using fallback PNG:", fallbackError);
    }
  }
};
