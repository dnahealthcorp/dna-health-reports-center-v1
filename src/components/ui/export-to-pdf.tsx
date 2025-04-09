
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { convertHtmlToPdf, downloadPdf } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { FilePdf, Loader2 } from "lucide-react";

interface ExportToPdfProps {
  html: string;
  fileName?: string;
  css?: string;
  className?: string;
  buttonText?: string;
}

export function ExportToPdf({
  html,
  fileName = "document.pdf",
  css = "",
  className = "",
  buttonText = "Export to PDF"
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
      const pdfBlob = await convertHtmlToPdf(html, fileName, css);
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
      ) : (
        <>
          <FilePdf className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
