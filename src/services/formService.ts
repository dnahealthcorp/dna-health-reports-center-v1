
import { PatientFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getPatientById } from "./patientService";

// Form data operations
export const getPatientFormData = async (patientId: string): Promise<PatientFormData | null> => {
  const { data, error } = await supabase
    .from('patient_form_data')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching patient form data:", error);
    return null;
  }
  
  if (!data) {
    // Create a new empty form data if none exists
    const patient = await getPatientById(patientId);
    if (!patient) return null;
    
    const emptyFormData: PatientFormData = {
      patientInfo: {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      },
      vitals: {
        bloodPressure: '',
        height: '',
        weight: ''
      },
      summaryFindings: {
        glucoseMetabolism: '',
        lipidProfile: '',
        inflammation: '',
        uricAcid: '',
        vitamins: '',
        minerals: '',
        sexHormones: '',
        renalLiverFunction: '',
        cancerMarkers: ''
      },
      medications: [],
      exerciseRecommendations: '',
      nurseNotes: '',
      doctorNotes: '',
      diagnosis: '',
      treatmentPlan: '',
      showInsulinResistance: false,
      nutritionRecommendations: {
        nutritionalPlan: '',
        proteinConsumption: '',
        omissions: '',
        additionalConsiderations: ''
      },
      exerciseDetail: {
        focusOn: '',
        walking: '',
        avoid: '',
        tracking: ''
      },
      sleepStressRecommendations: {
        sleep: '',
        stress: ''
      },
      followUps: []
    };
    
    await savePatientFormData(patientId, emptyFormData);
    return emptyFormData;
  }
  
  // Convert from database format to application format
  const patientInfo = await getPatientById(patientId);
  
  return {
    patientInfo: {
      name: patientInfo?.name || '',
      dateOfBirth: patientInfo?.dateOfBirth || '',
      gender: patientInfo?.gender || '',
      medicalRecordNumber: patientInfo?.medicalRecordNumber || ''
    },
    vitals: data.vitals || {
      bloodPressure: '',
      height: '',
      weight: ''
    },
    summaryFindings: data.summary_findings || {
      glucoseMetabolism: '',
      lipidProfile: '',
      inflammation: '',
      uricAcid: '',
      vitamins: '',
      minerals: '',
      sexHormones: '',
      renalLiverFunction: '',
      cancerMarkers: ''
    },
    medications: data.medications || [],
    exerciseRecommendations: data.exercise_recommendations || '',
    nurseNotes: data.nurse_notes || '',
    doctorNotes: data.doctor_notes || '',
    diagnosis: data.diagnosis || '',
    treatmentPlan: data.treatment_plan || '',
    showInsulinResistance: data.show_insulin_resistance || false,
    nutritionRecommendations: data.nutrition_recommendations || {
      nutritionalPlan: '',
      proteinConsumption: '',
      omissions: '',
      additionalConsiderations: ''
    },
    exerciseDetail: data.exercise_detail || {
      focusOn: '',
      walking: '',
      avoid: '',
      tracking: ''
    },
    sleepStressRecommendations: data.sleep_stress_recommendations || {
      sleep: '',
      stress: ''
    },
    followUps: data.follow_ups || []
  };
};

export const savePatientFormData = async (patientId: string, formData: PatientFormData): Promise<PatientFormData> => {
  // Check if form data already exists
  const { data: existingData } = await supabase
    .from('patient_form_data')
    .select('id')
    .eq('patient_id', patientId)
    .maybeSingle();
  
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
