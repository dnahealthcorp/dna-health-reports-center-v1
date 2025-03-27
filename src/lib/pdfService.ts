
// Entry point for PDF service - redirects to the new modular implementation
import { PatientFormData, Medication } from "@/types";
import { generatePDF as generatePDFImpl } from "./pdf/pdfGenerator";
import { getPatientById, getCurrentUser, savePDFReference, updatePatient } from "@/services/databaseService";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<string> => {
  try {
    // Get patient and user information for the PDF
    const patient = await getPatientById(formData.patientInfo.medicalRecordNumber);
    const currentUser = await getCurrentUser();
    
    // Make sure patient info is properly set in form data
    if (patient && (!formData.patientInfo.name || formData.patientInfo.name.trim() === '')) {
      formData.patientInfo.name = patient.name;
    }
    
    // Generate the PDF
    const pdfOutput = await generatePDFImpl(formData, medications);
    
    // Save PDF reference to database if we have a patient
    let fileName = "";
    if (patient) {
      // Format the current date as YYYY-MM-DD
      const currentDate = new Date().toISOString().slice(0, 10);
      
      // Format the filename according to requirements: patient's_name's Health Screening Report- Date
      // Handle apostrophe formatting for names ending with 's'
      const patientName = patient.name.replace(/\s+/g, '_');
      const apostrophe = patientName.endsWith('s') ? "'" : "'s";
      fileName = `${patientName}${apostrophe} Health Screening Report- ${currentDate}.pdf`;
      
      try {
        // Save to Supabase database with proper UUID format using uuidv4
        await savePDFReference(patient.id, fileName);
        
        // Update the patient's pdf_exported flag to true and set status to completed
        // Use a properly typed status value to satisfy TypeScript
        const updatedPatient = {
          ...patient,
          pdf_exported: true,
          status: 'completed' as 'completed', // Type assertion to ensure it's the correct literal type
          lastUpdated: new Date().toISOString()
        };
        
        await updatePatient(updatedPatient);
        
        // Call update_patient_statuses database function to update status immediately
        try {
          const { error } = await supabase.rpc('update_patient_statuses');
          if (error) {
            console.error("Error calling update_patient_statuses:", error);
          }
        } catch (funcError) {
          console.error("Failed to call update_patient_statuses function:", funcError);
        }
      } catch (error) {
        console.error("Error saving PDF reference:", error);
        // Continue even if saving reference fails
      }
    } else {
      // Fallback filename if no patient is found
      const currentDate = new Date().toISOString().slice(0, 10);
      fileName = `Patient_Health_Screening_Report-${currentDate}.pdf`;
    }
    
    // For debugging
    console.log("PDF generated successfully with data:", {
      patientName: formData.patientInfo.name,
      medicationsCount: medications.length,
      supplementsCount: formData.supplements?.length || 0,
      currentUser: currentUser?.name,
      pdfExported: patient?.pdf_exported,
      status: patient?.status
    });
    
    return fileName;
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Return a default filename in case of error
    return `Error_Report_${Date.now()}.pdf`;
  }
};
