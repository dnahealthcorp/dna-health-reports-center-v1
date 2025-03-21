
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PatientFormData, Patient, User } from "@/types";
import { savePatientFormData, updatePatient } from "@/services/databaseService";
import { generatePDF } from "@/lib/pdfService";

export const useFormActions = (
  formData: PatientFormData | null, 
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData | null>>,
  patient: Patient | null,
  setPatient: React.Dispatch<React.SetStateAction<Patient | null>>,
  currentUser: User | null,
  medications: Array<any>
) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!formData || !patient) return;
    
    setIsSaving(true);
    
    try {
      // Save form data
      await savePatientFormData(patient.id, formData);
      
      // Update patient status if needed
      let updatedStatus = patient.status;
      
      if (currentUser?.role === "nurse" && patient?.status === "nurse-pending") {
        updatedStatus = "doctor-pending";
      } else if (currentUser?.role === "doctor" && patient?.status === "doctor-pending") {
        updatedStatus = "completed";
      }
      
      if (updatedStatus !== patient.status) {
        const updatedPatient = {
          ...patient,
          status: updatedStatus
        };
        
        await updatePatient(updatedPatient);
        setPatient(updatedPatient);
      }
      
      toast({
        title: "Form saved",
        description: "Patient form has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Could not save patient form",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!formData || !patient) return;
    
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

  return {
    handleSave,
    handleExportPDF,
    isSaving
  };
};
