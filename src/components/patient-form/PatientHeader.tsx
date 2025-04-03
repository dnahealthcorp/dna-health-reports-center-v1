
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Save, Loader2, FileText } from "lucide-react";
import { Patient, PDFFile } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface PatientHeaderProps {
  patient: Patient;
  handleExportPDF: () => void;
  handleSave: () => void;
  isSaving: boolean;
  isExportingPDF?: boolean;
}

export const PatientHeader = ({ 
  patient, 
  handleExportPDF, 
  handleSave, 
  isSaving,
  isExportingPDF = false
}: PatientHeaderProps) => {
  const navigate = useNavigate();
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPDFFiles = async () => {
    if (!patient?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pdf_files')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching PDF files:", error);
        toast({
          title: "Error",
          description: "Could not load PDF files",
          variant: "destructive"
        });
        return;
      }
      
      console.log("PDF files fetched:", data?.length || 0, "files");
      
      // Transform the data to match our PDFFile interface
      const transformedData: PDFFile[] = (data || []).map(item => ({
        id: item.id,
        patient_id: item.patient_id,
        file_name: item.file_name,
        created_at: item.created_at,
        created_by: item.created_by || "Unknown",
        url: item.url,
        // Aliases for compatibility with the rest of the code
        fileName: item.file_name,
        patientId: item.patient_id,
        createdAt: item.created_at,
        createdBy: item.created_by || "Unknown"
      }));
      
      setPdfFiles(transformedData);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
      toast({
        title: "Error",
        description: "Could not load PDF files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPDFFiles();
    
    // Subscribe to changes in the pdf_files table for this patient
    const channel = supabase
      .channel('pdf-files-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pdf_files',
        filter: `patient_id=eq.${patient?.id}`
      }, (payload) => {
        console.log('PDF files updated:', payload);
        fetchPDFFiles();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [patient?.id]);
  
  const handleDownloadPDF = async (pdfFile: PDFFile) => {
    try {
      // Append timestamp to avoid browser caching
      const timestamp = Date.now();
      const modifiedUrl = pdfFile.url.includes('?') 
        ? `${pdfFile.url}&t=${timestamp}` 
        : `${pdfFile.url}?t=${timestamp}`;
      
      // Fetch the file from the URL
      const response = await fetch(modifiedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create a dynamic filename with timestamp to prevent caching
      const filenameParts = pdfFile.file_name.split('.');
      const extension = filenameParts.pop() || 'pdf';
      const baseFilename = filenameParts.join('.');
      const downloadFilename = `${baseFilename}_${timestamp}.${extension}`;
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = downloadFilename;
      link.style.display = 'none';
      
      // Programmatically click the link to trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 3000); // Extended timeout to ensure download starts completely
      
      toast({
        title: "Download started",
        description: `Downloading ${pdfFile.file_name}`,
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Could not download the PDF file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-3xl font-semibold tracking-tight">{patient?.name || "Patient"}</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-muted-foreground">
            MRN: {patient?.medicalRecordNumber || "N/A"}
          </p>
          <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
          <p className="text-muted-foreground">
            DOB: {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        {loading ? (
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading files...
          </Button>
        ) : pdfFiles.length > 0 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      PDF Files ({pdfFiles.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                    {pdfFiles.map((file) => (
                      <DropdownMenuItem 
                        key={file.id} 
                        onClick={() => handleDownloadPDF(file)}
                        className="cursor-pointer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {file.file_name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download previous PDF exports</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            No PDF Files
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleExportPDF} 
          disabled={isExportingPDF}
        >
          {isExportingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </>
          )}
        </Button>
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Form
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
