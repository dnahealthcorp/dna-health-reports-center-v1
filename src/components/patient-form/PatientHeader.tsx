
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

  useEffect(() => {
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
          return;
        }
        
        // Transform the data to match our PDFFile interface
        const transformedData: PDFFile[] = (data || []).map(item => ({
          id: item.id,
          patient_id: item.patient_id,
          file_name: item.file_name,
          created_at: item.created_at,
          created_by: item.created_by || "Unknown",
          url: item.url,
          // Add aliases for compatibility with the rest of the code
          fileName: item.file_name,
          patientId: item.patient_id,
          createdAt: item.created_at,
          createdBy: item.created_by || "Unknown"
        }));
        
        setPdfFiles(transformedData);
      } catch (error) {
        console.error("Error fetching PDF files:", error);
      } finally {
        setLoading(false);
      }
    };
    
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
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = pdfFile.url;
      link.download = pdfFile.file_name; // Use file_name instead of fileName
      link.target = '_blank';
      
      // Programmatically click the link to trigger download
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
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
        {pdfFiles.length > 0 ? (
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
                  <DropdownMenuContent align="end">
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
        ) : null}
        
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
