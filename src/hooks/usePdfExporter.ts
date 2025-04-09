
import { useState } from "react";
import { PatientFormData, Patient, Medication } from "@/types";
import { generatePDF } from "@/lib/pdfService";
import { useToast } from "@/hooks/use-toast";
import { getPatientById, updatePatient } from "@/services/databaseService";

// Define export progress states
export type PdfExportStatus = {
  stage: "idle" | "saving" | "generating" | "processing" | "uploading" | "downloading" | "complete" | "error";
  progress: number; // 0-100
  message: string;
};

export const usePdfExporter = (
  patientId: string | undefined,
  patient: Patient | null,
  setPatient: React.Dispatch<React.SetStateAction<Patient | null>>,
  formData: PatientFormData | null,
  saveForm: () => Promise<boolean>
) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportStatus, setExportStatus] = useState<PdfExportStatus>({
    stage: "idle",
    progress: 0,
    message: "Ready to export"
  });
  const { toast } = useToast();

  const handleExportPDF = async (medications: Medication[]) => {
    if (!formData || !patient || !patientId) return;
    
    try {
      setIsExportingPDF(true);
      
      // Initial status
      setExportStatus({
        stage: "saving",
        progress: 10,
        message: "Saving form data..."
      });
      
      // First save the form
      const saveSuccess = await saveForm();
      if (!saveSuccess) {
        setExportStatus({
          stage: "error",
          progress: 0,
          message: "Failed to save form data"
        });
        return;
      }
      
      // Update status to generating
      setExportStatus({
        stage: "generating",
        progress: 30,
        message: "Generating PDF content..."
      });
      
      // Progress updates are handled inside the generatePDF function via callbacks
      const fileName = await generatePDF(
        formData, 
        medications,
        (status: PdfExportStatus) => setExportStatus(status)
      );
      
      // Final status update
      setExportStatus({
        stage: "complete",
        progress: 100,
        message: `PDF "${fileName}" generated successfully`
      });
      
      // Refresh patient data to get updated PDF status
      const refreshedPatient = await getPatientById(patientId);
      if (refreshedPatient) {
        setPatient(refreshedPatient);
      }
      
      toast({
        title: "PDF Generated",
        description: `"${fileName}" has been downloaded and patient status updated to completed`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      setExportStatus({
        stage: "error",
        progress: 0,
        message: "Error generating PDF"
      });
      
      toast({
        title: "Error",
        description: "Could not generate PDF",
        variant: "destructive"
      });
    } finally {
      // Reset export status after a delay
      setTimeout(() => {
        setIsExportingPDF(false);
        setExportStatus({
          stage: "idle",
          progress: 0,
          message: "Ready to export"
        });
      }, 3000);
    }
  };

  return {
    isExportingPDF,
    exportStatus,
    handleExportPDF
  };
};
