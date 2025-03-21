
import { PatientFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export const savePatientFormData = async (patientId: string, formData: PatientFormData): Promise<PatientFormData> => {
  // Check if form data already exists
  const { data: existingData } = await supabase
    .from('patient_form_data')
    .select('id')
    .eq('patient_id', patientId)
    .maybeSingle();
  
  // Convert application format to database format
  const formDataToSave = {
    patient_id: patientId,
    vitals: formData.vitals as unknown as Json,
    summary_findings: formData.summaryFindings as unknown as Json,
    medications: formData.medications as unknown as Json,
    supplements: formData.supplements as unknown as Json,
    exercise_recommendations: formData.exerciseRecommendations,
    nurse_notes: formData.nurseNotes,
    doctor_notes: formData.doctorNotes,
    diagnosis: formData.diagnosis,
    treatment_plan: formData.treatmentPlan,
    show_insulin_resistance: formData.showInsulinResistance,
    nutrition_recommendations: formData.nutritionRecommendations as unknown as Json,
    exercise_detail: formData.exerciseDetail as unknown as Json,
    sleep_stress_recommendations: formData.sleepStressRecommendations as unknown as Json,
    follow_ups: formData.followUps as unknown as Json,
    last_updated: new Date().toISOString()
  };
  
  let error;
  if (existingData) {
    // Update existing form data
    const result = await supabase
      .from('patient_form_data')
      .update(formDataToSave)
      .eq('id', existingData.id);
    
    error = result.error;
  } else {
    // Insert new form data
    const result = await supabase
      .from('patient_form_data')
      .insert(formDataToSave);
    
    error = result.error;
  }
  
  if (error) {
    console.error("Error saving patient form data:", error);
    throw error;
  }
  
  // Update patient's last updated timestamp
  await supabase
    .from('patients')
    .update({ last_updated: new Date().toISOString() })
    .eq('id', patientId);
  
  return formData;
};
