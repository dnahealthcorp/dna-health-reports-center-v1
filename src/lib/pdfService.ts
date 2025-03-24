
// Entry point for PDF service - redirects to the new modular implementation
import { PatientFormData, Medication } from "@/types";
import { generatePDF as generatePDFImpl } from "./pdf/pdfGenerator";
import { getPatientById, getCurrentUser, savePDFReference } from "@/services/databaseService";

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<void> => {
  try {
    // Get patient and user information for the PDF
    const patient = await getPatientById(formData.patientInfo.medicalRecordNumber);
    const currentUser = await getCurrentUser();
    
    // Generate the PDF
    const pdfOutput = generatePDFImpl(formData, medications);
    
    // Save PDF reference to database if we have a patient
    if (patient) {
      const fileName = `${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      await savePDFReference(patient.id, fileName);
    }
    
    // For debugging
    console.log("PDF generated successfully with data:", {
      patientName: formData.patientInfo.name,
      medicationsCount: medications.length,
      currentUser: currentUser?.name
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
