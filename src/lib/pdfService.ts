
// Entry point for PDF service - redirects to the new modular implementation
import { PatientFormData, Medication } from "@/types";
import { generatePDF as generatePDFImpl } from "./pdf/pdfGenerator";
import { getPatientById, getCurrentUser, savePDFReference } from "@/services";
import { supabase } from "@/integrations/supabase/client";

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<string> => {
  try {
    // Get patient and user information for the PDF
    const patient = await getPatientById(formData.patientInfo.medicalRecordNumber);
    const currentUser = await getCurrentUser();
    
    // Generate the PDF
    const pdfOutput = generatePDFImpl(formData, medications);
    
    // Save PDF reference to database if we have a patient
    let fileName = "";
    if (patient) {
      fileName = `${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      try {
        // Save to Supabase database
        await savePDFReference(patient.id, fileName);
      } catch (error) {
        console.error("Error saving PDF reference:", error);
        // Continue even if saving reference fails
      }
    } else {
      fileName = `Patient_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    }
    
    // For debugging
    console.log("PDF generated successfully with data:", {
      patientName: formData.patientInfo.name,
      medicationsCount: medications.length,
      supplementsCount: formData.supplements?.length || 0,
      currentUser: currentUser?.name
    });
    
    return fileName;
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Return a default filename in case of error
    return `Error_Report_${Date.now()}.pdf`;
  }
};
