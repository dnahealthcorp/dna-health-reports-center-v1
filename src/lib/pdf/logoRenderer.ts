
import { jsPDF } from "jspdf";
import sanitizeHtml from "sanitize-html";
import parse from "html-react-parser";

/**
 * Adds the DNA Health logo to the top right corner of the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    const margin = 10; // Margin from the page edge
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 20; // Keep width fixed
    const logoHeight = 10; // Adjusted height for correct aspect ratio (1:0.5 ratio)
    // Calculate x-coordinate so that the logo appears at the top right
    const x = pageWidth - logoWidth - margin;
    const y = margin;
    
    // Use an absolute path for the logo with origin
    const logoPath = `${window.location.origin}/assets/DNA Logo - Grey.svg`;
    
    // Add the image using addImage with proper aspect ratio
    doc.addImage(logoPath, 'SVG', x, y, logoWidth, logoHeight);
    console.log("Logo added to PDF successfully at the top right corner");
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    
    // Fallback to using standard image with absolute path if SVG fails
    try {
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 20;
      const logoHeight = 10; // Maintain the same aspect ratio in fallback
      const x = pageWidth - logoWidth - margin;
      const y = margin;
      
      // Try using the PNG version with full path
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

/**
 * Converts HTML to plain text with simple formatting preservation for PDF
 * This handles basic formatting like paragraphs, lists, bold/italic text
 */
export const convertHtmlToFormattedText = (html: string): string => {
  if (!html) return '';
  
  try {
    // Sanitize HTML first for safety
    const sanitizedHtml = sanitizeHtml(html, {
      allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'span'],
      allowedAttributes: {
        'span': ['style'],
        'p': ['style']
      }
    });
    
    // Replace common HTML elements with text formatting that jsPDF can handle
    let formattedText = sanitizedHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/?ul>/gi, '')
      .replace(/<\/?ol>/gi, '')
      .replace(/<strong>|<b>/gi, '')
      .replace(/<\/strong>|<\/b>/gi, '')
      .replace(/<em>|<i>/gi, '')
      .replace(/<\/em>|<\/i>/gi, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');
      
    // Remove any other HTML tags
    formattedText = formattedText.replace(/<[^>]*>/g, '');
    
    // Trim extra whitespace and normalize line breaks
    formattedText = formattedText
      .replace(/\n{3,}/g, '\n\n')  // Limit consecutive line breaks
      .trim();
      
    return formattedText;
  } catch (error) {
    console.error('Error converting HTML to text:', error);
    // Return plain text as fallback
    return html.replace(/<[^>]*>/g, '');
  }
};
