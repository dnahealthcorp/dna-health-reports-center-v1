
import { 
  PatientFormData, Vital, SummaryFinding, Json, 
  FollowUp, MedicationItem, SupplementItem, NutritionRecommendation, 
  ExerciseRecommendation, SleepStressRecommendation, isVital, 
  isSummaryFinding, isNutritionRecommendation, isExerciseRecommendation, 
  isSleepStressRecommendation, isFollowUp, isMedicationItem, isSupplementItem 
} from "@/types";
import { supabase, initializeFromMockData, safeJsonArrayConversion } from "../baseService";
import { toJson, safeJsonArray } from "@/types/common";
import { getPatientById, updatePatient } from './patientCore';

// Create empty form data for a new patient
export const createEmptyPatientFormData = async (patientId: string): Promise<void> => {
  try {
    const patient = await getPatientById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
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
        weight: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: ''
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
      supplements: [],
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
  } catch (error) {
    console.error(`Error creating empty form data for patient ${patientId}:`, error);
    throw error;
  }
};

// Form data operations
export const getPatientFormData = async (patientId: string): Promise<PatientFormData | null> => {
  try {
    const { data, error } = await supabase
      .from('patient_form_data')
      .select('*')
      .eq('patient_id', patientId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Set up default values
    const defaultVitals: Vital = {
      bloodPressure: '',
      height: '',
      weight: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    };
    
    const defaultSummaryFindings: SummaryFinding = {
      glucoseMetabolism: '',
      lipidProfile: '',
      inflammation: '',
      uricAcid: '',
      vitamins: '',
      minerals: '',
      sexHormones: '',
      renalLiverFunction: '',
      cancerMarkers: ''
    };
    
    const defaultNutritionRecs: NutritionRecommendation = {
      nutritionalPlan: '',
      proteinConsumption: '',
      omissions: '',
      additionalConsiderations: ''
    };
    
    const defaultExerciseDetail: ExerciseRecommendation = {
      focusOn: '',
      walking: '',
      avoid: '',
      tracking: ''
    };
    
    const defaultSleepStressRecs: SleepStressRecommendation = {
      sleep: '',
      stress: ''
    };
    
    // Safely check and convert the JSON fields with proper type handling
    const vitals = data.vitals && typeof data.vitals === 'object' && isVital(data.vitals)
      ? data.vitals
      : defaultVitals;
      
    const summaryFindings = data.summary_findings && typeof data.summary_findings === 'object' && isSummaryFinding(data.summary_findings)
      ? data.summary_findings
      : defaultSummaryFindings;
    
    const medications = safeJsonArrayConversion<MedicationItem>(
      data.medications as Json, 
      isMedicationItem
    );
    
    const supplements = safeJsonArrayConversion<SupplementItem>(
      data.supplements as Json,
      isSupplementItem
    );
    
    const nutritionRecommendations = data.nutrition_recommendations && typeof data.nutrition_recommendations === 'object' && isNutritionRecommendation(data.nutrition_recommendations)
      ? data.nutrition_recommendations
      : defaultNutritionRecs;
    
    const exerciseDetail = data.exercise_detail && typeof data.exercise_detail === 'object' && isExerciseRecommendation(data.exercise_detail)
      ? data.exercise_detail
      : defaultExerciseDetail;
    
    const sleepStressRecommendations = data.sleep_stress_recommendations && typeof data.sleep_stress_recommendations === 'object' && isSleepStressRecommendation(data.sleep_stress_recommendations)
      ? data.sleep_stress_recommendations
      : defaultSleepStressRecs;
    
    const followUps = safeJsonArrayConversion<FollowUp>(
      data.follow_ups as Json,
      isFollowUp
    );
    
    const formData: PatientFormData = {
      patientInfo: {
        name: '',
        dateOfBirth: '',
        gender: '',
        medicalRecordNumber: ''
      },
      vitals,
      summaryFindings,
      medications,
      supplements,
      exerciseRecommendations: data.exercise_recommendations || '',
      nurseNotes: data.nurse_notes || '',
      doctorNotes: data.doctor_notes || '',
      diagnosis: data.diagnosis || '',
      treatmentPlan: data.treatment_plan || '',
      showInsulinResistance: Boolean(data.show_insulin_resistance),
      nutritionRecommendations,
      exerciseDetail,
      sleepStressRecommendations,
      followUps
    };
    
    // Get patient info
    const patient = await getPatientById(patientId);
    if (patient) {
      formData.patientInfo = {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      };
    }
    
    return formData;
  } catch (error) {
    console.error(`Error getting form data for patient ${patientId} from Supabase:`, error);
    
    // Fallback to mock data
    const { getPatientFormData: getMockPatientFormData } = await initializeFromMockData();
    return getMockPatientFormData(patientId);
  }
};

export const savePatientFormData = async (patientId: string, formData: PatientFormData): Promise<PatientFormData> => {
  try {
    // Check if record exists
    const { data, error: checkError } = await supabase
      .from('patient_form_data')
      .select('id')
      .eq('patient_id', patientId);
      
    if (checkError) {
      throw checkError;
    }
    
    // Convert form data to database format - casting complex objects to JSON
    const dbFormData = {
      patient_id: patientId,
      vitals: toJson(formData.vitals),
      summary_findings: toJson(formData.summaryFindings),
      medications: safeJsonArray(formData.medications),
      supplements: safeJsonArray(formData.supplements || []),
      exercise_recommendations: formData.exerciseRecommendations,
      nurse_notes: formData.nurseNotes,
      doctor_notes: formData.doctorNotes,
      diagnosis: formData.diagnosis,
      treatment_plan: formData.treatmentPlan,
      show_insulin_resistance: formData.showInsulinResistance,
      nutrition_recommendations: toJson(formData.nutritionRecommendations),
      exercise_detail: toJson(formData.exerciseDetail),
      sleep_stress_recommendations: toJson(formData.sleepStressRecommendations),
      follow_ups: safeJsonArray(formData.followUps),
      last_updated: new Date().toISOString()
    };
    
    // Insert or update
    let error;
    if (data && data.length > 0) {
      // Update
      const { error: updateError } = await supabase
        .from('patient_form_data')
        .update(dbFormData)
        .eq('patient_id', patientId);
        
      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('patient_form_data')
        .insert([dbFormData]);
        
      error = insertError;
    }
    
    if (error) {
      throw error;
    }
    
    // Update last updated time on patient
    const patient = await getPatientById(patientId);
    if (patient) {
      patient.lastUpdated = new Date().toISOString();
      await updatePatient(patient);
    }
    
    return formData;
  } catch (error) {
    console.error(`Error saving form data for patient ${patientId} to Supabase:`, error);
    throw error;
  }
};
