
import { useToast } from "@/components/ui/use-toast";
import { PatientFormData, Medication } from "@/types";
import { generatePDF } from "@/lib/pdfService";

export const usePDFExport = () => {
  const { toast } = useToast();
  
  const handleExportPDF = async (formData: PatientFormData, medications: Medication[]) => {
    if (!formData) return;
    
    try {
      // Generate the PDF
      const fileName = await generatePDF(formData, medications);
      
      toast({
        title: "PDF Generated",
        description: "Patient report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Could not generate PDF",
        variant: "destructive"
      });
    }
  };
  
  return { handleExportPDF };
};
