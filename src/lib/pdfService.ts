
// Entry point for PDF service - redirects to the new modular implementation
import { PatientFormData, Medication } from "@/types";
import { generatePDF as generatePDFImpl } from "./pdf/pdfGenerator";
import { getPatientById, getCurrentUser, savePDFReference } from "@/services/databaseService";
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
    
    // Generate the PDF - this returns the blob
    const pdfBlob = await generatePDFImpl(formData, medications);
    
    // Create a URL for the blob and trigger the download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    
    // Generate file name
    let fileName = "";
    if (patient) {
      fileName = `${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      try {
        // Save to Supabase database with proper UUID format using uuidv4
        await savePDFReference(patient.id, fileName);
      } catch (error) {
        console.error("Error saving PDF reference:", error);
        // Continue even if saving reference fails
      }
    } else {
      fileName = `Patient_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    }
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
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
