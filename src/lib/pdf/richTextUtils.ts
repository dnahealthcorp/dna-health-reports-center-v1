
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
  
  return processed;
};
