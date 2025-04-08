
/**
 * Rich text rendering utility for PDFs
 * Uses browser's native DOM parsing to render HTML in jsPDF
 */

import { jsPDF } from "jspdf";

/**
 * Renders HTML content into a PDF document with proper formatting
 * 
 * @param doc - jsPDF document instance
 * @param htmlString - HTML string to render
 * @param x - X position to start rendering
 * @param y - Y position to start rendering
 * @param maxWidth - Maximum width for text wrapping
 * @returns The new Y position after rendering
 */
export function renderRichText(
  doc: jsPDF, 
  htmlString: string, 
  x: number, 
  y: number, 
  maxWidth: number = 170
): number {
  if (!htmlString || htmlString === '') return y;
  
  try {
    // Sanitize input - basic cleaning
    const cleanHtml = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Use browser's built-in DOM parser
    const parser = new DOMParser();
    const parsed = parser.parseFromString(cleanHtml, 'text/html');
    const body = parsed.body;
    
    let cursorY = y;
    const lineHeight = 5; // Base line height

    function renderNode(
      node: Node, 
      style: { bold: boolean; italic: boolean; list: boolean; listIndex?: number } = { 
        bold: false, 
        italic: false, 
        list: false 
      }
    ): void {
      // Handle text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (!text) return;

        // Set font style based on formatting
        let fontStyle = 'normal';
        if (style.bold && style.italic) fontStyle = 'bolditalic';
        else if (style.bold) fontStyle = 'bold';
        else if (style.italic) fontStyle = 'italic';

        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(10);
        
        // Handle list items with bullets
        if (style.list && typeof style.listIndex === 'number') {
          const bullet = '• ';
          doc.text(bullet, x, cursorY);
          doc.text(text, x + 5, cursorY, { maxWidth: maxWidth - 5 });
        } else {
          doc.text(text, x, cursorY, { maxWidth });
        }
        
        // Basic text wrapping calculation
        const textWidth = doc.getStringUnitWidth(text) * 10 * 0.352778;
        const lines = Math.ceil(textWidth / maxWidth);
        cursorY += lineHeight * Math.max(1, lines);
      }

      // Handle element nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tag = element.nodeName.toLowerCase();
        const newStyle = { ...style };
        
        // Apply styling based on tags
        if (tag === 'b' || tag === 'strong') newStyle.bold = true;
        if (tag === 'i' || tag === 'em') newStyle.italic = true;
        
        // Handle lists
        if (tag === 'ul' || tag === 'ol') {
          newStyle.list = true;
        }
        
        if (tag === 'li') {
          newStyle.listIndex = newStyle.listIndex || 0;
          newStyle.listIndex++;
        }
        
        // Handle line breaks and paragraphs
        if (tag === 'br') {
          cursorY += lineHeight;
          return;
        }
        
        if (tag === 'p' && element.previousElementSibling) {
          cursorY += lineHeight * 1.5;
        }
        
        // Process child nodes
        node.childNodes.forEach(child => renderNode(child, newStyle));
        
        // Add spacing after paragraphs and list items
        if (tag === 'p' && element.nextElementSibling) {
          cursorY += lineHeight * 0.5;
        }
        
        if (tag === 'li' && element.nextElementSibling) {
          cursorY += lineHeight * 0.5;
        }
      }
    }

    // Start rendering from the body element
    body.childNodes.forEach(child => renderNode(child));
    return cursorY;
  } catch (error) {
    console.error("Error rendering rich text:", error);
    // Fallback to plain text if rendering fails
    doc.text(htmlString.replace(/<[^>]*>?/gm, ''), x, y, { maxWidth });
    return y + 5;
  }
}

/**
 * Helper function to strip HTML tags from a string
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
};
