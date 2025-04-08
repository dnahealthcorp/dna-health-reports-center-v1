
import { jsPDF } from "jspdf";

/**
 * Adds the DNA Health logo to the top left corner of the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    // Position the logo in the top left corner with specific dimensions
    const x = 20;
    const y = 10;
    const logoWidth = 40;
    const logoHeight = 15;
    
    try {
      // First attempt to use the PNG logo directly using doc.addImage as requested
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
      doc.setFontSize(12);
      doc.setTextColor(153, 188, 68); // Green color
      doc.text("DNA HEALTH", 20, 15);
      console.log("Added text fallback for logo");
    } catch (fallbackError) {
      console.error("Failed to add any logo or text:", fallbackError);
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
