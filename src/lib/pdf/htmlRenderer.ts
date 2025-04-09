
import { jsPDF } from "jspdf";

/**
 * Renders HTML content within a PDF cell by parsing and applying styling
 */
export function renderHtmlInPdfCell(
  doc: jsPDF,
  html: string,
  x: number,
  y: number,
  maxWidth: number
): void {
  if (!html || typeof html !== "string") return;
  
  // Clean HTML by replacing empty paragraphs
  const cleanHtml = html
    .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
    .replace(/<p><br\s*\/?><\/p>/g, '<p>&nbsp;</p>');

  // Create parser in browser environment
  const parser = new DOMParser();
  const parsed = parser.parseFromString(cleanHtml, "text/html");
  
  // Starting position
  let currentY = y + 3; // Add some padding from top
  let currentX = x + 2; // Add some padding from left
  const initialX = currentX;
  const lineHeight = 4.5;
  const paragraphSpacing = 2;
  
  // Track the current style state
  let isBold = false;
  let isItalic = false;
  
  function getNodeText(node: Node): string {
    return node.textContent?.trim() || "";
  }
  
  function resetPosition() {
    currentX = initialX;
    currentY += lineHeight;
  }
  
  // Process the DOM tree recursively
  function processNode(node: Node, parentX: number = initialX) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Handle text node
      const text = node.textContent || "";
      if (text.trim()) {
        // Split text to fit within cell width using splitTextToSize
        const availableWidth = maxWidth - (currentX - x) - 4; // Account for current position and padding
        const textLines = doc.splitTextToSize(text, availableWidth);
        
        textLines.forEach((line: string, index: number) => {
          // Check if we need to wrap to next line based on current position
          if (currentX + doc.getTextWidth(line) > x + maxWidth - 2 && currentX > initialX) {
            resetPosition();
          }
          
          doc.text(line, currentX, currentY);
          
          if (index < textLines.length - 1) {
            resetPosition();
          } else {
            currentX += doc.getTextWidth(line);
          }
        });
      }
    } 
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();
      
      const prevFont = doc.getFont();
      // Store the current font size separately since it's not part of the Font object
      const prevFontSize = doc.getFontSize(); 
      let fontStyle = 'normal';
      
      // Apply styling based on tags
      switch (tag) {
        case 'strong':
        case 'b':
          fontStyle = isBold ? (isItalic ? 'bolditalic' : 'bold') : 'bold';
          doc.setFont(prevFont.fontName, fontStyle);
          isBold = true;
          break;
        case 'em':
        case 'i':
          fontStyle = isItalic ? (isBold ? 'bolditalic' : 'italic') : 'italic';
          doc.setFont(prevFont.fontName, fontStyle);
          isItalic = true;
          break;
        case 'u':
          // Underline not directly supported by jsPDF text
          break;
        case 'p':
          if (currentX !== initialX) {
            resetPosition();
          }
          break;
        case 'br':
          resetPosition();
          break;
        case 'ul':
        case 'ol':
          resetPosition();
          currentY += 1; // Extra space before list
          break;
        case 'li':
          resetPosition();
          currentX = initialX + 5; // Indent list items
          doc.text("•", initialX, currentY); // Add bullet point
          break;
      }
      
      // Process child nodes
      let startX = currentX;
      for (let i = 0; i < element.childNodes.length; i++) {
        processNode(element.childNodes[i], startX);
      }
      
      // Handle post-processing for specific tags
      switch (tag) {
        case 'p':
        case 'div':
          if (element.nextElementSibling) {
            resetPosition();
            currentY += paragraphSpacing;
          }
          break;
        case 'li':
          resetPosition();
          break;
      }
      
      // Reset styling
      if (tag === 'strong' || tag === 'b') {
        isBold = false;
        fontStyle = isItalic ? 'italic' : 'normal';
      } else if (tag === 'em' || tag === 'i') {
        isItalic = false;
        fontStyle = isBold ? 'bold' : 'normal';
      }
      
      doc.setFont(prevFont.fontName, fontStyle);
      doc.setFontSize(prevFontSize); // Use the separately stored fontSize
    }
  }

  try {
    // Start processing from body
    const bodyNode = parsed.body;
    processNode(bodyNode);
    
    // Fixed: Removed return statement that was causing Type error
    // This function is declared as void, so it shouldn't return anything
  } catch (error) {
    console.error("Error rendering HTML in PDF:", error);
  }
}
