
import { jsPDF } from "jspdf";

/**
 * Adds the DNA Health logo to the top-right corner of the PDF page
 * without stretching (aspect ratio preserved).
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    const pageWidth = doc.internal.pageSize.getWidth();

    // We set only the desiredWidth; setting height = 0 preserves aspect ratio in jsPDF
    const desiredWidth = 25; // Reduced from 30 to make it smaller
    const marginRight = 15; // Increased from 10 to give more space from the right edge
    const marginTop = 5;   // Reduced from 10 to move it higher up

    // Compute x so that the image is right-aligned
    const x = pageWidth - desiredWidth - marginRight;
    const y = marginTop;
    
    try {
      // Try PNG first: pass height as 0 to keep aspect ratio
      doc.addImage("/assets/dna-logo.png", "PNG", x, y, desiredWidth, 0);
      console.log("Logo added to PDF using PNG with preserved ratio");
    } catch (pngError) {
      console.warn("Could not add PNG logo, trying SVG fallback:", pngError);
      
      // Use an inline SVG fallback
      const svgLogo = `
      <svg xmlns="http://www.w3.org/2000/svg" width="236" height="86" viewBox="0 0 236 86" fill="none">
        <path d="M55.9 69.1C45.2 69.1 34.6 62.6 28.5 52.5C22.2 42.2 21.1 29.7 25.6 18.9C30.1 8 39.4 0.9 51 0.9H87.3V50.1C87.3 60.8 78.5 69.1 67.2 69.1H55.9Z" fill="#A4A5A5"/>
        <path d="M55.9 68.2C45.2 68.2 34.6 61.7 28.5 51.6C22.2 41.3 21.1 28.8 25.6 18C30.1 7.1 39.4 0 51 0H87.3V49.2C87.3 59.9 78.5 68.2 67.2 68.2H55.9Z" fill="#A4A5A5"/>
        <path d="M153.8 67.6C159.7 59.9 156.8 48 147.2 44.2C138.8 40.8 128.8 43.9 123.9 51.4C116.8 62.2 109.8 73.1 102.8 83.9C102.2 84.8 101.7 85.8 100.9 86.6H127C136.1 86.6 145.5 80.9 150.6 72.8C151.8 71 152.8 69.3 153.8 67.6Z" fill="#99BC44"/>
        <path d="M140.1 18.5C135.9 16.7 130.9 16.9 126.9 18.9C123.1 20.9 120.2 24.4 118 28.4C113.7 36.2 113.9 47 119.3 55.1C119.4 55.3 119.6 55.5 119.7 55.6C120.4 54.7 121 53.7 121.6 52.7C126.8 44.6 132 36.5 137.2 28.4C138.5 26.4 139.2 24.1 140.1 18.5Z" fill="#99BC44"/>
      </svg>
      `;
      // Again, pass 0 as height to preserve aspect ratio
      doc.addSvgAsImage(svgLogo, x, y, desiredWidth, 0);
      console.log("Logo added to PDF using SVG fallback (ratio preserved)");
    }
  } catch (error) {
    console.error("Error adding logo to PDF:", error);

    // Final fallback: text-based label, also right-aligned
    try {
      doc.setFontSize(12);
      doc.setTextColor(153, 188, 68); // DNA green
      doc.text("DNA HEALTH", doc.internal.pageSize.getWidth() - 50, 15);
      console.log("Text fallback for logo used");
    } catch (fallbackError) {
      console.error("All logo methods failed:", fallbackError);
    }
  }
};

/**
 * Loads Montserrat fonts or defaults to Helvetica
 */
export const loadMontserratFonts = async (doc: jsPDF): Promise<void> => {
  try {
    doc.setFont("helvetica");
    console.log("Using standard helvetica font for PDF");
  } catch (error) {
    console.error("Error loading Montserrat fonts:", error);
  }
};
