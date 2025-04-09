
import { useState } from "react";
import { PatientFormData, Patient, Medication } from "@/types";
import { generatePDF } from "@/lib/pdfService";
import { useToast } from "@/hooks/use-toast";
import { getPatientById, updatePatient } from "@/services/databaseService";

export const usePdfExporter = (
  patientId: string | undefined,
  patient: Patient | null,
  setPatient: React.Dispatch<React.SetStateAction<Patient | null>>,
  formData: PatientFormData | null,
  saveForm: () => Promise<boolean>
) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async (medications: Medication[]) => {
    if (!formData || !patient || !patientId) return;
    
    // First save the form
    const saveSuccess = await saveForm();
    if (!saveSuccess) return;
    
    try {
      setIsExportingPDF(true);
      
      const fileName = await generatePDF(formData, medications);
      
      // Refresh patient data to get updated PDF status
      const refreshedPatient = await getPatientById(patientId);
      if (refreshedPatient) {
        setPatient(refreshedPatient);
      }
      
      toast({
        title: "PDF Generated",
        description: `"${fileName}" has been generated and patient status updated to completed`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Could not generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return {
    isExportingPDF,
    handleExportPDF
  };
};
