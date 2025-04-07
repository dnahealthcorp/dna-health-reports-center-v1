
// Form-related database operations
import { 
  PatientFormData, Json, Vital, SummaryFinding,
  MedicationItem, SupplementItem, FollowUp,
  toJson, safeJsonArray, NutritionRecommendation, ExerciseRecommendation,
  SleepStressRecommendation, isVital, isSummaryFinding, isNutritionRecommendation,
  isExerciseRecommendation, isSleepStressRecommendation, isFollowUp, 
  isMedicationItem, isSupplementItem, Form, FormType
} from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getPatientById } from "./patientService";
import { v4 as uuidv4 } from 'uuid';

// Function to safely convert JSON values to typed arrays with improved type safety
export function safeJsonArrayConversion<T>(jsonArray: Json | null | undefined, typeGuard: (item: any) => boolean): T[] {
  if (!jsonArray || !Array.isArray(jsonArray)) {
    return [];
  }
  
  // Filter the array first to get only items that pass the type guard
  const filteredArray = jsonArray.filter(item => typeGuard(item));
  
  // Then do a type assertion to T[] since we've verified the types
  return filteredArray as unknown as T[];
}

// Helper functions to convert types for database storage
export const jsonToVital = (json: Json | null | undefined): Vital => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return { bloodPressure: '', height: '', weight: '', heartRate: '', temperature: '', respiratoryRate: '', oxygenSaturation: '' };
  }
  
  const jsonObj = json as Record<string, any>;
  
  return {
    bloodPressure: String(jsonObj.bloodPressure || ''),
    height: String(jsonObj.height || ''),
    weight: String(jsonObj.weight || ''),
    heartRate: String(jsonObj.heartRate || ''),
    temperature: String(jsonObj.temperature || ''),
    respiratoryRate: String(jsonObj.respiratoryRate || ''),
    oxygenSaturation: String(jsonObj.oxygenSaturation || '')
  };
};

export const jsonToSummaryFinding = (json: Json | null | undefined): SummaryFinding => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {
      glucoseMetabolism: '',
      proteins: '',
      lipidProfile: '',
      inflammation: '',
      metabolic: '',
      homocysteine: '',
      vitaminsMinerals: '',
      ironProfile: '',
      sexHormones: '',
      kidneyFunctionElectrolytes: '',
      liverFunctions: '',
      tumorMarkers: '',
      bloodCounts: ''
    };
  }
  
  const jsonObj = json as Record<string, any>;
  
  return {
    glucoseMetabolism: String(jsonObj.glucoseMetabolism || ''),
    proteins: String(jsonObj.proteins || ''),
    lipidProfile: String(jsonObj.lipidProfile || ''),
    inflammation: String(jsonObj.inflammation || ''),
    metabolic: String(jsonObj.metabolic || ''),
    homocysteine: String(jsonObj.homocysteine || ''),
    vitaminsMinerals: String(jsonObj.vitaminsMinerals || ''),
    ironProfile: String(jsonObj.ironProfile || ''),
    sexHormones: String(jsonObj.sexHormones || ''),
    kidneyFunctionElectrolytes: String(jsonObj.kidneyFunctionElectrolytes || ''),
    liverFunctions: String(jsonObj.liverFunctions || ''),
    tumorMarkers: String(jsonObj.tumorMarkers || ''),
    bloodCounts: String(jsonObj.bloodCounts || '')
  };
};

export const jsonToNutritionRecommendation = (json: Json | null | undefined): NutritionRecommendation => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {
      nutritionalStyle: '',
      proteinConsumption: '',
      eatingWindow: '',
      limitations: '',
      additionalConsiderations: ''
    };
  }
  
  const jsonObj = json as Record<string, any>;
  
  return {
    nutritionalStyle: String(jsonObj.nutritionalStyle || ''),
    proteinConsumption: String(jsonObj.proteinConsumption || ''),
    eatingWindow: String(jsonObj.eatingWindow || ''),
    limitations: String(jsonObj.limitations || ''),
    additionalConsiderations: String(jsonObj.additionalConsiderations || '')
  };
};

export const jsonToExerciseRecommendation = (json: Json | null | undefined): ExerciseRecommendation => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {
      focusOn: '',
      walking: '',
      restRecovery: '',
      tracking: ''
    };
  }
  
  const jsonObj = json as Record<string, any>;
  
  return {
    focusOn: String(jsonObj.focusOn || ''),
    walking: String(jsonObj.walking || ''),
    restRecovery: String(jsonObj.restRecovery || ''),
    tracking: String(jsonObj.tracking || '')
  };
};

export const jsonToSleepStressRecommendation = (json: Json | null | undefined): SleepStressRecommendation => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {
      sleep: '',
      stress: ''
    };
  }
  
  const jsonObj = json as Record<string, any>;
  
  return {
    sleep: String(jsonObj.sleep || ''),
    stress: String(jsonObj.stress || '')
  };
};

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
        proteins: '',
        lipidProfile: '',
        inflammation: '',
        metabolic: '',
        homocysteine: '',
        vitaminsMinerals: '',
        ironProfile: '',
        sexHormones: '',
        kidneyFunctionElectrolytes: '',
        liverFunctions: '',
        tumorMarkers: '',
        bloodCounts: ''
      },
      medications: [],
      supplements: [],
      exerciseRecommendations: '',
      nurseNotes: '',
      doctorNotes: '',
      diagnosis: '',
      treatmentPlan: '',
      doctorName: '',
      showInsulinResistance: false,
      nutritionRecommendations: {
        nutritionalStyle: '',
        proteinConsumption: '',
        eatingWindow: '',
        limitations: '',
        additionalConsiderations: ''
      },
      exerciseDetail: {
        focusOn: '',
        walking: '',
        restRecovery: '',
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
      proteins: '',
      lipidProfile: '',
      inflammation: '',
      metabolic: '',
      homocysteine: '',
      vitaminsMinerals: '',
      ironProfile: '',
      sexHormones: '',
      kidneyFunctionElectrolytes: '',
      liverFunctions: '',
      tumorMarkers: '',
      bloodCounts: ''
    };
    
    const defaultNutritionRecs: NutritionRecommendation = {
      nutritionalStyle: '',
      proteinConsumption: '',
      eatingWindow: '',
      limitations: '',
      additionalConsiderations: ''
    };
    
    const defaultExerciseDetail: ExerciseRecommendation = {
      focusOn: '',
      walking: '',
      restRecovery: '',
      tracking: ''
    };
    
    const defaultSleepStressRecs: SleepStressRecommendation = {
      sleep: '',
      stress: ''
    };
    
    // Safely convert JSON to typed objects
    const vitals = jsonToVital(data.vitals as Json);
    const summaryFindings = jsonToSummaryFinding(data.summary_findings as Json);
    const medications = safeJsonArrayConversion<MedicationItem>(data.medications as Json, isMedicationItem);
    const supplements = safeJsonArrayConversion<SupplementItem>(data.supplements as Json, isSupplementItem);
    const nutritionRecommendations = jsonToNutritionRecommendation(data.nutrition_recommendations as Json);
    const exerciseDetail = jsonToExerciseRecommendation(data.exercise_detail as Json);
    const sleepStressRecommendations = jsonToSleepStressRecommendation(data.sleep_stress_recommendations as Json);
    const followUps = safeJsonArrayConversion<FollowUp>(data.follow_ups as Json, isFollowUp);
    
    // Safely handle doctor_name by checking if it exists in the data object
    // If it doesn't exist or is null, default to empty string
    const doctorName = data && 'doctor_name' in data ? (data.doctor_name as string) || '' : '';
    
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
      doctorName: doctorName,
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
    const { getMockPatientFormData } = await import("@/lib/mockData");
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
    
    // Convert all complex objects to JSON before saving
    const dbFormData = {
      patient_id: patientId,
      vitals: toJson(formData.vitals),
      summary_findings: toJson(formData.summaryFindings),
      medications: toJson(formData.medications),
      supplements: toJson(formData.supplements || []),
      exercise_recommendations: formData.exerciseRecommendations,
      nurse_notes: formData.nurseNotes,
      doctor_notes: formData.doctorNotes,
      doctor_name: formData.doctorName || '',
      diagnosis: formData.diagnosis,
      treatment_plan: formData.treatmentPlan,
      show_insulin_resistance: formData.showInsulinResistance,
      nutrition_recommendations: toJson(formData.nutritionRecommendations),
      exercise_detail: toJson(formData.exerciseDetail),
      sleep_stress_recommendations: toJson(formData.sleepStressRecommendations),
      follow_ups: toJson(formData.followUps),
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
      const { updatePatient } = await import("./patientService");
      await updatePatient(patient);
    }
    
    return formData;
  } catch (error) {
    console.error(`Error saving form data for patient ${patientId} to Supabase:`, error);
    throw error;
  }
};

// Get all forms for a patient
export const getFormsByPatientId = async (patientId: string): Promise<Form[]> => {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        formType:form_type_id (
          *
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map database response to application types
    const forms: Form[] = (data || []).map(form => ({
      id: form.id,
      patient_id: form.patient_id,
      form_type_id: form.form_type_id,
      status: form.status as 'draft' | 'in-process' | 'late' | 'completed',
      pdf_exported: form.pdf_exported,
      created_at: form.created_at,
      updated_at: form.updated_at,
      status_updated_at: form.status_updated_at || undefined,
      created_by: form.created_by || undefined,
      formType: form.formType as FormType
    }));

    return forms;
  } catch (error) {
    console.error(`Error getting forms for patient ${patientId} from Supabase:`, error);
    return [];
  }
};

// Create a new form
export const createForm = async (patientId: string, formTypeId: string): Promise<Form | null> => {
  try {
    const { getCurrentUser } = await import('./userService');
    const currentUser = await getCurrentUser();

    const newForm = {
      id: uuidv4(),
      patient_id: patientId,
      form_type_id: formTypeId,
      status: 'draft' as const,
      pdf_exported: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: currentUser?.id || null
    };

    const { data, error } = await supabase
      .from('forms')
      .insert(newForm)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get the form type details
    const { data: formTypeData, error: formTypeError } = await supabase
      .from('form_types')
      .select('*')
      .eq('id', formTypeId)
      .single();

    if (formTypeError) {
      throw formTypeError;
    }

    // Return the new form with form type
    return {
      id: data.id,
      patient_id: data.patient_id,
      form_type_id: data.form_type_id,
      status: data.status as 'draft' | 'in-process' | 'late' | 'completed',
      pdf_exported: data.pdf_exported,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status_updated_at: data.status_updated_at || undefined,
      created_by: data.created_by || undefined,
      formType: formTypeData as FormType
    };
  } catch (error) {
    console.error(`Error creating form for patient ${patientId} in Supabase:`, error);
    return null;
  }
};

// Get all form types
export const getFormTypes = async (): Promise<FormType[]> => {
  try {
    const { data, error } = await supabase
      .from('form_types')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      throw error;
    }

    return data as FormType[];
  } catch (error) {
    console.error("Error getting form types from Supabase:", error);
    return [];
  }
};
