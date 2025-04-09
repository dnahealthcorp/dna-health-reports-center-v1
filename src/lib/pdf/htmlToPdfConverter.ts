
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
  
  let currentY = y + 5; // Starting position with additional padding to prevent text overlap
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
      const textLines = doc.splitTextToSize(text, cellWidth - 10); // Increased padding from 4 to 10
      
      textLines.forEach(line => {
        doc.text(line, x + 5, currentY); // Increased left padding from 2 to 5
        currentY += lineHeight;
      });
      
      // Add underline if needed
      if (styles.underline) {
        textLines.forEach(line => {
          const textWidth = doc.getTextWidth(line);
          const underlineY = currentY - lineHeight + 1;
          doc.setDrawColor(0);
          doc.line(x + 5, underlineY, x + 5 + textWidth, underlineY);
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
        currentY += lineHeight;
      }
      
      // Process child nodes with updated styles
      Array.from(element.childNodes).forEach(child => {
        processNode(child, newStyles);
      });
      
      // Add spacing after paragraphs and list items
      if (tag === 'p' || tag === 'li') {
        currentY += lineHeight;
      }
      
      // Add extra spacing after lists
      if ((tag === 'ul' || tag === 'ol') && element.childNodes.length > 0) {
        currentY += lineHeight;
      }
    }
  }
  
  // Process all body content
  Array.from(parsedHtml.body.childNodes).forEach(node => {
    processNode(node);
  });
  
  return currentY;
}

/**
 * Draw table borders for PDF cells
 */
export function drawCellBorders(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number[] = [204, 204, 204]  // Changed to #CCCCCC to match other tables
): void {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.1);
  
  // Draw rectangle around the cell
  doc.rect(x, y, width, height);
}

/**
 * Enhanced HTML table renderer for PDF
 * Handles rendering of a complete section with headers and rows
 * with improved handling of page breaks and cell sizing
 */
export function renderHtmlTableSection(
  doc: jsPDF,
  title: string,
  headers: string[],
  rows: { label: string, value: string }[],
  startY: number,
  contentMargin: number,
  contentWidth: number
): number {
  // Get page dimensions
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Draw section title
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text(title, contentMargin, startY);
  startY += 10; // Increased spacing after title to prevent overlap
  
  // Table dimensions
  const headerHeight = 10; // Increased from 8
  const paramColWidth = 50;
  const valueColWidth = contentWidth - paramColWidth;
  const minRowHeight = 20; // Reduced from 30 to make rows less tall
  const emptyRowHeight = 8; // Changed from 15 to 8 as requested by user
  
  // Border color to match other tables (#CCCCCC)
  const borderColor = [204, 204, 204];

  // Draw header background
  doc.setFillColor(153, 188, 68);
  doc.rect(contentMargin, startY, paramColWidth, headerHeight, 'F');
  doc.rect(contentMargin + paramColWidth, startY, valueColWidth, headerHeight, 'F');
  
  // Draw header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(headers[0], contentMargin + 5, startY + 7); // Adjusted position
  doc.text(headers[1], contentMargin + paramColWidth + 5, startY + 7); // Adjusted position
  startY += headerHeight;
  
  // Draw header borders
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.rect(contentMargin, startY - headerHeight, paramColWidth, headerHeight);
  doc.rect(contentMargin + paramColWidth, startY - headerHeight, valueColWidth, headerHeight);
  
  // Draw each row
  let currentY = startY;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Check if row is empty or has minimal content
    const isEmpty = !row.value || row.value.trim() === '';
    const rowHeight = isEmpty ? emptyRowHeight : minRowHeight;
    
    // Check if we need to add a new page
    const estimatedRowHeight = isEmpty ? emptyRowHeight : Math.max(minRowHeight, 
        doc.getTextDimensions(row.value).h + 10); // Reduced padding from 15 to 10
    
    if (currentY + estimatedRowHeight > pageHeight - 20) {
      // Add footer to current page if needed
      doc.setFontSize(8);
      doc.setTextColor("#a5a4a4");
      doc.setFont("helvetica", "normal");
      doc.text("Executive Summary | DNA Health", pageWidth - 10, pageHeight - 10, { align: "right" as "right" });
      
      // Add a new page
      doc.addPage();
      
      // Add logo to new page
      try {
        const logoImg = "/assets/DNA Logo - Grey.svg";
        doc.addImage(logoImg, "SVG", 20, 10, 40, 20);
      } catch (err) {
        console.error("Failed to add logo to new page:", err);
      }
      
      // Reset current Y position to top of new page with margin
      currentY = 40;
      
      // Redraw header if this is the first row of a new page
      if (i === 0 || true) { // Always redraw headers on new pages
        // Draw section title on new page
        doc.setFontSize(14);
        doc.setTextColor(153, 188, 68);
        doc.setFont("helvetica", "bold");
        doc.text(title + " (continued)", contentMargin, currentY);
        currentY += 10;
        
        // Draw header background
        doc.setFillColor(153, 188, 68);
        doc.rect(contentMargin, currentY, paramColWidth, headerHeight, 'F');
        doc.rect(contentMargin + paramColWidth, currentY, valueColWidth, headerHeight, 'F');
        
        // Draw header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(headers[0], contentMargin + 5, currentY + 7);
        doc.text(headers[1], contentMargin + paramColWidth + 5, currentY + 7);
        
        // Draw header borders
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(contentMargin, currentY, paramColWidth, headerHeight);
        doc.rect(contentMargin + paramColWidth, currentY, valueColWidth, headerHeight);
        
        currentY += headerHeight;
      }
    }
    
    // Alternate row background colors
    const rowBgColor = i % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
    const paramBgColor = [240, 250, 230]; // Light green for parameter column
    
    // Measure how much space we need for this row's content
    const valueStartY = currentY;
    
    // Draw parameter cell background and text first
    doc.setFillColor(paramBgColor[0], paramBgColor[1], paramBgColor[2]);
    doc.rect(contentMargin, currentY, paramColWidth, rowHeight, 'F');
    
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Center text vertically in smaller empty cells
    const textY = isEmpty ? currentY + (rowHeight / 2) + 3 : currentY + 10;
    doc.text(row.label, contentMargin + 5, textY);
    
    // Render HTML content for value cell
    doc.setFillColor(rowBgColor[0], rowBgColor[1], rowBgColor[2]);
    doc.rect(contentMargin + paramColWidth, currentY, valueColWidth, rowHeight, 'F');
    
    // For empty cells, we don't need to render content
    let contentEndY = valueStartY + rowHeight;
    
    if (!isEmpty) {
      // Render the HTML content for non-empty cells
      contentEndY = renderHtmlInPdfCell(
        doc,
        row.value,
        contentMargin + paramColWidth,
        currentY,
        valueColWidth,
        10, // font size
        5   // line height
      );
      
      // Calculate actual row height based on content
      const actualRowHeight = Math.max(rowHeight, contentEndY - valueStartY);
      
      // If content height is more than minimum, redraw cells with correct height
      if (actualRowHeight > rowHeight) {
        // Redraw parameter cell with correct height
        doc.setFillColor(paramBgColor[0], paramBgColor[1], paramBgColor[2]);
        doc.rect(contentMargin, currentY, paramColWidth, actualRowHeight, 'F');
        
        // Redraw value cell with correct height
        doc.setFillColor(rowBgColor[0], rowBgColor[1], rowBgColor[2]);
        doc.rect(contentMargin + paramColWidth, currentY, valueColWidth, actualRowHeight, 'F');
        
        // Redraw parameter text
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(row.label, contentMargin + 5, currentY + 10);
        
        // Re-render HTML content
        renderHtmlInPdfCell(
          doc,
          row.value,
          contentMargin + paramColWidth,
          currentY,
          valueColWidth,
          10,
          5
        );
        
        contentEndY = valueStartY + actualRowHeight;
      }
    }
    
    // Draw cell borders with updated color
    drawCellBorders(doc, contentMargin, currentY, paramColWidth, contentEndY - currentY, borderColor);
    drawCellBorders(doc, contentMargin + paramColWidth, currentY, valueColWidth, contentEndY - currentY, borderColor);
    
    // Move to next row
    currentY = contentEndY;
  }
  
  // Return the Y position after the table
  return currentY + 10; // Add some padding after the table
}

