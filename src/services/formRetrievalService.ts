
import { PatientFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getPatientById } from "./patientService";
import type { Json } from "@/integrations/supabase/types";

// Form data retrieval operations
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
    
    // Use the savePatientFormData from the other file
    await import('./formSavingService').then(module => module.savePatientFormData(patientId, emptyFormData));
    return emptyFormData;
  }
  
  // Convert from database format to application format
  const patientInfo = await getPatientById(patientId);
  
  // Safely parse JSON data with fallbacks
  const vitals = data.vitals as Json || {};
  const summaryFindings = data.summary_findings as Json || {};
  const medications = data.medications as Json || [];
  const supplements = data.supplements as Json || [];
  
  return {
    patientInfo: {
      name: patientInfo?.name || '',
      dateOfBirth: patientInfo?.dateOfBirth || '',
      gender: patientInfo?.gender || '',
      medicalRecordNumber: patientInfo?.medicalRecordNumber || ''
    },
    vitals: typeof vitals === 'object' ? {
      bloodPressure: (vitals as any)?.bloodPressure || '',
      height: (vitals as any)?.height || '',
      weight: (vitals as any)?.weight || ''
    } : {
      bloodPressure: '',
      height: '',
      weight: ''
    },
    summaryFindings: typeof summaryFindings === 'object' ? {
      glucoseMetabolism: (summaryFindings as any)?.glucoseMetabolism || '',
      lipidProfile: (summaryFindings as any)?.lipidProfile || '',
      inflammation: (summaryFindings as any)?.inflammation || '',
      uricAcid: (summaryFindings as any)?.uricAcid || '',
      vitamins: (summaryFindings as any)?.vitamins || '',
      minerals: (summaryFindings as any)?.minerals || '',
      sexHormones: (summaryFindings as any)?.sexHormones || '',
      renalLiverFunction: (summaryFindings as any)?.renalLiverFunction || '',
      cancerMarkers: (summaryFindings as any)?.cancerMarkers || ''
    } : {
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
    medications: Array.isArray(medications) ? medications as any[] : [],
    supplements: Array.isArray(supplements) ? supplements as any[] : [],
    exerciseRecommendations: data.exercise_recommendations || '',
    nurseNotes: data.nurse_notes || '',
    doctorNotes: data.doctor_notes || '',
    diagnosis: data.diagnosis || '',
    treatmentPlan: data.treatment_plan || '',
    showInsulinResistance: data.show_insulin_resistance || false,
    nutritionRecommendations: typeof data.nutrition_recommendations === 'object' ? {
      nutritionalPlan: (data.nutrition_recommendations as any)?.nutritionalPlan || '',
      proteinConsumption: (data.nutrition_recommendations as any)?.proteinConsumption || '',
      omissions: (data.nutrition_recommendations as any)?.omissions || '',
      additionalConsiderations: (data.nutrition_recommendations as any)?.additionalConsiderations || ''
    } : {
      nutritionalPlan: '',
      proteinConsumption: '',
      omissions: '',
      additionalConsiderations: ''
    },
    exerciseDetail: typeof data.exercise_detail === 'object' ? {
      focusOn: (data.exercise_detail as any)?.focusOn || '',
      walking: (data.exercise_detail as any)?.walking || '',
      avoid: (data.exercise_detail as any)?.avoid || '',
      tracking: (data.exercise_detail as any)?.tracking || ''
    } : {
      focusOn: '',
      walking: '',
      avoid: '',
      tracking: ''
    },
    sleepStressRecommendations: typeof data.sleep_stress_recommendations === 'object' ? {
      sleep: (data.sleep_stress_recommendations as any)?.sleep || '',
      stress: (data.sleep_stress_recommendations as any)?.stress || ''
    } : {
      sleep: '',
      stress: ''
    },
    followUps: Array.isArray(data.follow_ups) ? data.follow_ups as any[] : []
  };
};
