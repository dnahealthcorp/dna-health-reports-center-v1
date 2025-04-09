
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { renderHtmlInPdfCell } from "@/lib/pdf/htmlRenderer";

interface ExportToPdfProps {
  html: string;
  fileName?: string;
  css?: string;
  className?: string;
  buttonText?: string;
  children?: React.ReactNode;
}

export function ExportToPdf({
  html,
  fileName = "document.pdf",
  css = "",
  className = "",
  buttonText = "Export to PDF",
  children
}: ExportToPdfProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!html) {
      toast({
        title: "No content to export",
        description: "Please add some content before exporting to PDF",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Add logo if available
      try {
        const logo = new Image();
        logo.src = '/assets/DNA Logo - Grey.svg';
        doc.addImage(logo, 'SVG', 10, 10, 60, 20);
      } catch (e) {
        console.warn('Could not add logo to PDF:', e);
      }
      
      // Define page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      
      // Add title if the content appears to be a table
      if (html.includes('<table')) {
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (titleMatch && titleMatch[1]) {
          const title = titleMatch[1].replace(/<[^>]+>/g, ''); // Strip HTML from title
          doc.setFontSize(18);
          doc.setTextColor(153, 188, 68); // Primary green color
          doc.setFont('helvetica', 'bold');
          doc.text(title, pageWidth/2, margin + 10, { align: 'center' });
        }
      }
      
      // First, check if the HTML contains a table structure
      if (html.includes('<table')) {
        // Extract table data from HTML
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        const table = parsed.querySelector('table');
        
        if (table) {
          const rows = table.querySelectorAll('tr');
          
          // Extract header data
          const headers: string[] = [];
          const headerRow = table.querySelector('thead tr');
          if (headerRow) {
            headerRow.querySelectorAll('th').forEach(th => {
              headers.push(th.textContent || '');
            });
          }
          
          // Extract body data
          const body: Array<Array<string | {content: string, rawHtml: string}>> = [];
          table.querySelectorAll('tbody tr').forEach(tr => {
            const row: Array<string | {content: string, rawHtml: string}> = [];
            tr.querySelectorAll('td').forEach((td, index) => {
              // For first column (parameter labels), use the text content
              if (index === 0) {
                row.push(td.textContent || '');
              } else {
                // For value columns, use the rawHtml approach
                row.push({
                  content: "", // Empty string so autoTable doesn't print anything
                  rawHtml: td.innerHTML || ""
                });
              }
            });
            body.push(row);
          });
          
          // Pre-calculate approximate row heights based on content length
          const estimateRowHeight = (content: string): number => {
            if (!content.trim()) return 10;
            
            // Average chars per line based on font size and available width
            const availableWidth = pageWidth - (margin * 2) - 50;
            const charsPerLine = availableWidth / 2;
            // Count lines based on text length and average chars per line
            const lines = Math.ceil(content.length / charsPerLine);
            // Set minimum height and add more for longer content
            return Math.max(10, lines * 4.5 + 10);
          };
          
          // Draw table with autoTable
          autoTable(doc, {
            startY: margin + 25, // Positioning after title and logo
            head: headers.length ? [headers] : undefined,
            body: body,
            theme: 'grid',
            styles: {
              fontSize: 10,
              cellPadding: 5,
              overflow: 'linebreak',
              font: 'helvetica',
              minCellHeight: 12,
            },
            headStyles: {
              fillColor: [153, 188, 68],
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            willDrawCell: (data) => {
              // Dynamically adjust row heights based on content
              if (data.section === 'body' && data.column.index === 1) {
                const cell = data.cell;
                if (cell && cell.raw && typeof cell.raw === 'object' && 'rawHtml' in cell.raw) {
                  const rawHtml = (cell.raw as {rawHtml: string}).rawHtml;
                  if (rawHtml) {
                    // Estimate appropriate row height based on content
                    const estimatedHeight = estimateRowHeight(rawHtml);
                    if (estimatedHeight > data.row.height) {
                      data.row.height = estimatedHeight;
                    }
                  }
                }
              }
            },
            didDrawCell: (data) => {
              // Process cells in the body section that have raw HTML
              if (data.section === 'body' && data.column.index > 0) {
                const cell = data.cell;
                
                // Check if cell has rawHtml property
                if (cell && cell.raw && typeof cell.raw === 'object' && 'rawHtml' in cell.raw) {
                  const rawHtml = (cell.raw as {rawHtml: string}).rawHtml;
                  
                  if (rawHtml && rawHtml.trim() !== '') {
                    // Clear any text that autoTable might have rendered
                    const rect = {
                      x: data.cell.x,
                      y: data.cell.y,
                      w: data.cell.width,
                      h: data.cell.height
                    };
                    doc.setFillColor(data.row.index % 2 === 0 ? 255 : 245);
                    doc.rect(rect.x, rect.y, rect.w, rect.h, 'F');
                    
                    // Fixed: Use our custom HTML renderer without trying to store its return value
                    renderHtmlInPdfCell(
                      doc,
                      rawHtml,
                      data.cell.x,
                      data.cell.y,
                      data.cell.width
                    );
                  }
                }
              }
            }
          });
        }
      } else {
        // For regular HTML content (non-table)
        const contentX = margin;
        const contentY = margin + 30; // Allow space for title/logo
        const contentWidth = pageWidth - margin * 2;
        
        // Use our custom HTML renderer for the entire content
        renderHtmlInPdfCell(
          doc,
          html,
          contentX,
          contentY,
          contentWidth
        );
      }

      // Download the PDF file
      doc.save(fileName);
      
      toast({
        title: "PDF exported successfully",
        description: `${fileName} has been downloaded`,
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Export failed",
        description: "Could not export to PDF. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || !html}
      className={className}
      variant="outline"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
