
import { supabase } from "@/integrations/supabase/client";

// Initialize mock data for development
export const initializeStorage = async () => {
  try {
    // Import mock data
    const mockData = await import("@/lib/mockData");
    
    // Check if we already have data in Supabase
    const { data: existingPatients } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    // If no data exists, seed the database with mock data
    if (!existingPatients || existingPatients.length === 0) {
      // Create mock users
      for (const user of mockData.mockUsers) {
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
          });
        
        if (error) console.error("Error seeding user:", error);
      }
      
      // Create mock patients
      for (const patient of mockData.mockPatients) {
        const { data: newPatient, error } = await supabase
          .from('patients')
          .insert({
            id: patient.id,
            name: patient.name,
            date_of_birth: patient.dateOfBirth,
            gender: patient.gender,
            medical_record_number: patient.medicalRecordNumber,
            status: patient.status as 'nurse-pending' | 'doctor-pending' | 'completed',
            last_updated: patient.lastUpdated
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error seeding patient:", error);
        } else if (newPatient) {
          // Create form data for this patient
          const formData = await mockData.getPatientFormData(patient.id);
          await savePatientFormData(patient.id, formData);
        }
      }
      
      // Create mock medications
      for (const medication of mockData.mockMedications) {
        const { error } = await supabase
          .from('medications')
          .insert({
            id: medication.id,
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            notes: medication.notes,
            type: medication.type,
            link: medication.link
          });
        
        if (error) console.error("Error seeding medication:", error);
      }
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

// Function to save patient form data (used during initialization)
const savePatientFormData = async (patientId: string, formData: any): Promise<any> => {
  const formDataToSave = {
    patient_id: patientId,
    vitals: formData.vitals,
    summary_findings: formData.summaryFindings,
    medications: formData.medications,
    supplements: formData.supplements,
    exercise_recommendations: formData.exerciseRecommendations,
    nurse_notes: formData.nurseNotes,
    doctor_notes: formData.doctorNotes,
    diagnosis: formData.diagnosis,
    treatment_plan: formData.treatmentPlan,
    show_insulin_resistance: formData.showInsulinResistance,
    nutrition_recommendations: formData.nutritionRecommendations,
    exercise_detail: formData.exerciseDetail,
    sleep_stress_recommendations: formData.sleepStressRecommendations,
    follow_ups: formData.followUps,
    last_updated: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('patient_form_data')
    .insert(formDataToSave);
  
  if (error) {
    console.error("Error saving patient form data:", error);
    throw error;
  }
  
  return formData;
};

// Initialize on module import
initializeStorage();

// Generate a unique MRN (used in patient service)
export const generateMRN = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let mrn = "MRN-";
  for (let i = 0; i < 8; i++) {
    mrn += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return mrn;
};
