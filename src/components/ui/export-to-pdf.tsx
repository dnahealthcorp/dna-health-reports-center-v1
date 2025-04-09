
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { convertHtmlToPdf, downloadPdf } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";

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
      // Prepare the HTML content for better rendering
      const preparedHtml = html
        .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')  // Replace empty paragraphs
        .replace(/<p><br\s*\/?><\/p>/g, '<p>&nbsp;</p>'); // Replace paragraphs with just line breaks
      
      // Add some custom CSS to enhance rendering of HTML content
      const enhancedCSS = `
        ${css}
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        strong, b { font-weight: bold !important; }
        em, i { font-style: italic !important; }
        ul, ol { padding-left: 20px !important; margin: 8px 0 !important; }
        li { margin: 4px 0 !important; }
        p { margin: 8px 0 !important; display: block !important; }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 16px !important;
          margin-bottom: 8px !important;
          font-weight: bold !important;
        }
        h1 { font-size: 24px !important; }
        h2 { font-size: 20px !important; }
        h3 { font-size: 16px !important; }
        table { width: 100% !important; border-collapse: collapse !important; }
        th, td { padding: 8px !important; border: 1px solid #ddd !important; }
        th { background-color: #99BC44 !important; color: white !important; }
        /* Make sure no raw HTML tags are displayed */
        .html-content * {
          display: revert !important;
        }
      `;
      
      const pdfBlob = await convertHtmlToPdf(preparedHtml, fileName, enhancedCSS);
      downloadPdf(pdfBlob, fileName);
      
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
