
import { jsPDF } from "jspdf";

/**
 * Sanitizes HTML content by removing potentially problematic tags and attributes
 * that could cause issues in the PDF rendering
 */
export function sanitizeHtmlForPdf(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their contents
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Convert <br> tags to newline characters that jsPDF can handle
  sanitized = sanitized.replace(/<br\s*\/?>/gi, '\n');
  
  // Process lists to maintain formatting
  sanitized = processList(sanitized);
  
  return sanitized;
}

/**
 * Process HTML lists to convert them to a format friendly for PDF rendering
 */
function processList(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Process unordered lists
  const uls = doc.querySelectorAll('ul');
  uls.forEach((ul, ulIndex) => {
    const items = ul.querySelectorAll('li');
    items.forEach((li, i) => {
      li.innerHTML = `• ${li.innerHTML}`;
    });
  });
  
  // Process ordered lists
  const ols = doc.querySelectorAll('ol');
  ols.forEach((ol, olIndex) => {
    const items = ol.querySelectorAll('li');
    items.forEach((li, i) => {
      li.innerHTML = `${i + 1}. ${li.innerHTML}`;
    });
  });
  
  return doc.body.innerHTML;
}

/**
 * Extracts plain text from HTML content
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  
  // Create a temporary div to hold the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get the text content
  return temp.textContent || temp.innerText || '';
}

/**
 * Renders HTML content in a PDF cell more effectively by
 * parsing the HTML and applying appropriate formatting
 */
export function renderHtmlInPdfCell(
  doc: jsPDF,
  html: string,
  x: number,
  y: number,
  cellWidth: number,
  fontSize: number = 10,
  lineHeight: number = 5
): number {
  if (!html) return y;
  
  const sanitized = sanitizeHtmlForPdf(html);
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(sanitized, 'text/html');
  
  let currentY = y + 2; // Starting position with some padding
  doc.setFontSize(fontSize);
  
  // Process text nodes and elements
  function processNode(node: Node, styles = { bold: false, italic: false, underline: false }): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return;
      
      // Apply text styling
      let fontStyle = 'normal';
      if (styles.bold && styles.italic) fontStyle = 'bolditalic';
      else if (styles.bold) fontStyle = 'bold';
      else if (styles.italic) fontStyle = 'italic';
      
      doc.setFont('helvetica', fontStyle);
      
      // Handle text that might need to be wrapped
      const textLines = doc.splitTextToSize(text, cellWidth - 4); // 4 = padding
      
      textLines.forEach(line => {
        doc.text(line, x + 2, currentY);
        currentY += lineHeight;
      });
      
      // Add underline if needed
      if (styles.underline) {
        textLines.forEach(line => {
          const textWidth = doc.getTextWidth(line);
          const underlineY = currentY - lineHeight + 1;
          doc.setDrawColor(0);
          doc.line(x + 2, underlineY, x + 2 + textWidth, underlineY);
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();
      const newStyles = { ...styles };
      
      // Apply styling based on tag
      if (tag === 'strong' || tag === 'b') newStyles.bold = true;
      if (tag === 'em' || tag === 'i') newStyles.italic = true;
      if (tag === 'u') newStyles.underline = true;
      
      // Handle paragraph breaks
      if (tag === 'p' && element.previousElementSibling) {
        currentY += lineHeight / 2;
      }
      
      // Process child nodes with updated styles
      Array.from(element.childNodes).forEach(child => {
        processNode(child, newStyles);
      });
      
      // Add spacing after paragraphs and list items
      if (tag === 'p' || tag === 'li') {
        currentY += lineHeight / 2;
      }
      
      // Add extra spacing after lists
      if ((tag === 'ul' || tag === 'ol') && element.childNodes.length > 0) {
        currentY += lineHeight / 2;
      }
    }
  }
  
  // Process all body content
  Array.from(parsedHtml.body.childNodes).forEach(node => {
    processNode(node);
  });
  
  return currentY;
}
