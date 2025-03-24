
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
    if (patient && formData.patientInfo) {
      // Ensure patient name is properly set
      if (!formData.patientInfo.name || formData.patientInfo.name.trim() === '') {
        formData.patientInfo.name = patient.name;
      }
      
      // Ensure other patient fields are properly set
      if (!formData.patientInfo.dateOfBirth || formData.patientInfo.dateOfBirth.trim() === '') {
        formData.patientInfo.dateOfBirth = patient.dateOfBirth;
      }
      if (!formData.patientInfo.gender || formData.patientInfo.gender.trim() === '') {
        formData.patientInfo.gender = patient.gender;
      }
      if (!formData.patientInfo.medicalRecordNumber || formData.patientInfo.medicalRecordNumber.trim() === '') {
        formData.patientInfo.medicalRecordNumber = patient.medicalRecordNumber;
      }
    }
    
    // Generate the PDF
    const pdfOutput = await generatePDFImpl(formData, medications);
    
    // Create a Blob from the PDF data
    const blob = new Blob([pdfOutput], { type: 'application/pdf' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Save PDF reference to database if we have a patient
    let fileName = "";
    if (patient) {
      fileName = `${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      try {
        // Create a unique ID for the PDF file
        const pdfId = uuidv4();
        
        // Upload to Supabase Storage if available
        if (supabase.storage) {
          try {
            const { data, error } = await supabase.storage
              .from('patient-pdfs')
              .upload(`${patient.id}/${fileName}`, blob);
            
            if (error) {
              console.error("Error uploading PDF to storage:", error);
            } else {
              console.log("PDF uploaded to storage:", data);
              
              // Get public URL
              const { data: urlData } = supabase.storage
                .from('patient-pdfs')
                .getPublicUrl(`${patient.id}/${fileName}`);
                
              // Save PDF reference with URL
              await savePDFReference(patient.id, fileName, urlData.publicUrl, pdfId);
            }
          } catch (storageError) {
            console.error("Error accessing storage:", storageError);
          }
        } else {
          // If storage not available, just save the reference
          await savePDFReference(patient.id, fileName);
        }
      } catch (error) {
        console.error("Error saving PDF reference:", error);
        // Continue even if saving reference fails
      }
    } else {
      fileName = `Patient_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    }
    
    // Set up download
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
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
