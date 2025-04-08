
/**
 * Utility functions for handling rich text in PDFs
 */

/**
 * Sanitizes HTML to prevent XSS and ensure compatibility with pdfMake
 * @param html Raw HTML from the editor
 * @returns Sanitized HTML
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Remove potentially dangerous tags and attributes
  let sanitized = html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove iframe, object, embed tags
    .replace(/<(iframe|object|embed|frame|frameset)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove event handlers
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    // Clean up empty paragraphs that might cause rendering issues
    .replace(/<p>\s*<\/p>/gi, '<p>&nbsp;</p>')
    .replace(/<div>\s*<\/div>/gi, '<div>&nbsp;</div>');
  
  return sanitized.trim();
};

/**
 * Processes HTML content to ensure it renders correctly in the PDF
 * @param html HTML content from the editor
 * @returns Processed HTML ready for PDF conversion
 */
export const prepareHtmlForPdf = (html: string): string => {
  if (!html) return '';
  
  // First sanitize the HTML
  let processed = sanitizeHtml(html);
  
  // Ensure lists are properly formatted
  processed = processed
    // Ensure all list items are inside proper list containers
    .replace(/<li>(?![\s\S]*?<\/[ou]l>)/gi, '<ul><li>')
    .replace(/<\/li>(?![\s\S]*?<\/[ou]l>)/gi, '</li></ul>')
    // Fix nested lists
    .replace(/<\/[ou]l>\s*<\/li>/gi, '</li></ul>')
    // Normalize whitespace inside list items
    .replace(/<li>\s+/gi, '<li>')
    .replace(/\s+<\/li>/gi, '</li>');
  
  // Make sure br tags are properly closed
  processed = processed.replace(/<br>/gi, '<br />');
  
  // Ensure paragraphs have content
  processed = processed.replace(/<p>\s*<\/p>/gi, '<p>&nbsp;</p>');
  
  return processed;
};

/**
 * Converts HTML to a content structure compatible with pdfMake
 * Uses browser's native DOM parser for browser compatibility
 */
export const htmlToPdfMakeContent = (html: string): any => {
  if (!html || html === '') return '';
  
  try {
    // Clean and prepare HTML
    const processedHtml = prepareHtmlForPdf(html);
    
    // Use the browser's built-in DOMParser instead of JSDOM
    const htmlToPdfmake = require('html-to-pdfmake');
    
    // Create a temporary document to hold our HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(processedHtml, 'text/html');
    
    // Convert HTML to pdfMake content
    const content = htmlToPdfmake(processedHtml, {
      window: window,
      defaultStyles: {
        b: { bold: true },
        strong: { bold: true },
        i: { italics: true },
        em: { italics: true },
        u: { decoration: 'underline' },
        s: { decoration: 'lineThrough' },
        ul: { margin: [0, 5, 0, 5] },
        ol: { margin: [0, 5, 0, 5] },
        li: { margin: [0, 2, 0, 2] }
      }
    });
    
    return content;
  } catch (error) {
    console.error('Error converting HTML to pdfMake content:', error);
    // Fallback to text without formatting
    return html.replace(/<[^>]*>?/gm, '');
  }
};
