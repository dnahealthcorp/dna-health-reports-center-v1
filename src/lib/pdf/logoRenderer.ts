
import { jsPDF } from "jspdf";
import sanitizeHtml from "sanitize-html";

/**
 * Adds the DNA Health logo to the top right corner of the PDF page
 */
export const addLogoToPage = (doc: jsPDF): void => {
  try {
    const margin = 10; // Margin from the page edge
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fixed dimensions to maintain correct aspect ratio - DNA logo has ~2.7:1 ratio
    const logoWidth = 30; // Slightly larger for better visibility
    const logoHeight = 11; // Maintains proper aspect ratio
    
    // Calculate x-coordinate for top right positioning
    const x = pageWidth - logoWidth - margin;
    const y = margin;
    
    // Use absolute path with origin for reliable access across environments
    const logoPath = `${window.location.origin}/assets/dna-logo.svg`;
    
    // Add the image with correct dimensions
    doc.addImage(logoPath, 'SVG', x, y, logoWidth, logoHeight);
    console.log("Logo added to PDF successfully");
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    
    // Fallback to PNG version if SVG fails
    try {
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 30;
      const logoHeight = 11;
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
 * Converts HTML to plain text with formatting preservation for PDF
 * This handles basic formatting like paragraphs, lists, bold/italic text
 */
export const convertHtmlToFormattedText = (html: string): string => {
  if (!html) return '';
  
  try {
    // Sanitize HTML first for safety
    const sanitizedHtml = sanitizeHtml(html, {
      allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'span', 'h1', 'h2', 'h3', 'h4'],
      allowedAttributes: {
        'span': ['style'],
        'p': ['style']
      }
    });
    
    // Replace common HTML elements with text formatting that jsPDF can handle
    let formattedText = sanitizedHtml
      // Handle paragraph breaks properly
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      
      // Handle line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      
      // Handle list items with bullets
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/?ul>/gi, '\n')
      .replace(/<\/?ol>/gi, '\n')
      
      // Handle headers with spacing
      .replace(/<h[1-4][^>]*>/gi, '\n')
      .replace(/<\/h[1-4]>/gi, '\n')
      
      // Remove style markup but preserve content
      .replace(/<strong>|<b>/gi, '')
      .replace(/<\/strong>|<\/b>/gi, '')
      .replace(/<em>|<i>/gi, '')
      .replace(/<\/em>|<\/i>/gi, '')
      
      // Handle common HTML entities
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"');
      
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
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

/**
 * Adds a footer to the current page
 */
export const addFooterToPage = (doc: jsPDF, pageWidth: number): void => {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#a5a4a4");
  doc.text("Executive Summary | DNA Health", pageWidth - 10, pageHeight - 10, { align: "right" });
};

/**
 * Splits long text content across multiple pages if necessary
 * Returns the updated Y position after rendering the text
 */
export const addMultiPageText = (
  doc: jsPDF, 
  text: string, 
  startY: number, 
  contentMargin: number, 
  contentWidth: number, 
  pageWidth: number,
  fontSize: number = 10,
  topMargin: number = 40,
  bottomMargin: number = 20
): number => {
  if (!text || text.trim() === '') {
    return startY;
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = startY;
  
  // Set font properties
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  
  // Split text into lines based on content width
  const lines = doc.splitTextToSize(text, contentWidth);
  const lineHeight = fontSize * 0.5;

  // Process each line and check for page breaks
  for (let i = 0; i < lines.length; i++) {
    // Check if we need a page break
    if (currentY + lineHeight > pageHeight - bottomMargin) {
      addFooterToPage(doc, pageWidth);
      doc.addPage();
      addLogoToPage(doc);
      currentY = topMargin;
    }
    
    doc.text(lines[i], contentMargin, currentY);
    currentY += lineHeight + 1; // Add 1 for spacing between lines
  }
  
  return currentY + 5; // Add a small margin after text block
};

