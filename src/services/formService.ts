
// Fix the Form status handling in formService.ts
import { supabase } from "@/integrations/supabase/client";
import { Form, FormType, isValidFormStatus, PatientFormData } from "@/types";

export const getFormTypes = async (): Promise<FormType[]> => {
  try {
    const { data, error } = await supabase
      .from('form_types')
      .select('*')
      .order('title');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching form types:", error);
    return [];
  }
};

export const getPatientForms = async (patientId: string): Promise<Form[]> => {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        formType:form_type_id (
          id, title, description, slug
        )
      `)
      .eq('patient_id', patientId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(form => {
      // Ensure status is a valid Form status
      const validStatus = isValidFormStatus(form.status) ? form.status : 'in-process';
      
      return {
        ...form,
        formType: form.formType as FormType,
        status: validStatus
      };
    });
  } catch (error) {
    console.error(`Error fetching forms for patient ${patientId}:`, error);
    return [];
  }
};

export const getFormById = async (formId: string): Promise<Form | null> => {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        formType:form_type_id (
          id, title, description, slug
        )
      `)
      .eq('id', formId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    // Ensure status is a valid Form status
    const validStatus = isValidFormStatus(data.status) ? data.status : 'in-process';
    
    return {
      ...data,
      formType: data.formType as FormType,
      status: validStatus
    };
  } catch (error) {
    console.error(`Error fetching form ${formId}:`, error);
    return null;
  }
};

export const createForm = async (
  patientId: string, 
  formTypeId: string, 
  userId: string | null
): Promise<Form | null> => {
  try {
    const { data, error } = await supabase
      .from('forms')
      .insert([{
        patient_id: patientId,
        form_type_id: formTypeId,
        created_by: userId,
        status: 'in-process',
        pdf_exported: false
      }])
      .select(`
        *,
        formType:form_type_id (
          id, title, description, slug
        )
      `)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    // Create empty form data based on form type
    await createFormSpecificData(data.id, formTypeId);
    
    return {
      ...data,
      formType: data.formType as FormType,
      // We know this is 'in-process' because we just set it
      status: 'in-process' as const
    };
  } catch (error) {
    console.error("Error creating form:", error);
    return null;
  }
};

// New function to create form-specific data based on form type
export const createFormSpecificData = async (formId: string, formTypeId: string): Promise<boolean> => {
  try {
    // Check form type to determine which table to insert into
    const { data: formType, error: formTypeError } = await supabase
      .from('form_types')
      .select('slug')
      .eq('id', formTypeId)
      .single();
    
    if (formTypeError) {
      throw formTypeError;
    }
    
    if (!formType) {
      throw new Error(`Form type with ID ${formTypeId} not found`);
    }
    
    // Insert into the appropriate table based on form type
    if (formType.slug === 'executive-health-screening') {
      const { error } = await supabase
        .from('health_screening_data')
        .insert([{
          form_id: formId,
          vitals: {},
          summary_findings: {},
          medications: [],
          supplements: [],
          nurse_notes: '',
          doctor_notes: '',
          diagnosis: '',
          treatment_plan: '',
          show_insulin_resistance: false,
          nutrition_recommendations: {},
          exercise_detail: {},
          sleep_stress_recommendations: {},
          follow_ups: [],
        }]);
      
      if (error) throw error;
    } else if (formType.slug === 'food-intolerance') {
      const { error } = await supabase
        .from('food_intolerance_data')
        .insert([{
          form_id: formId,
          test_results: {},
          tested_foods: [],
          symptoms: [],
          recommendations: '',
          followup_plan: '',
        }]);
      
      if (error) throw error;
    }
    // Add other form types as needed
    
    return true;
  } catch (error) {
    console.error(`Error creating form-specific data for form ${formId}:`, error);
    return false;
  }
};

// Function to get health screening data for a specific form
export const getHealthScreeningDataByFormId = async (formId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('health_screening_data')
      .select('*')
      .eq('form_id', formId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching health screening data for form ${formId}:`, error);
    return null;
  }
};

// Legacy functions for compatibility with old code
export const getPatientFormData = async (patientId: string): Promise<PatientFormData> => {
  try {
    const { data, error } = await supabase
      .from('patient_form_data')
      .select('*')
      .eq('patient_id', patientId)
      .single();
    
    if (error) {
      // If no data exists, create an empty record
      if (error.code === 'PGRST116') {
        return createEmptyPatientFormData(patientId);
      }
      throw error;
    }
    
    // Get patient info to create the complete PatientFormData object
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
      
    if (patientError) {
      throw patientError;
    }
    
    return {
      patientInfo: {
        name: patientData.name,
        dateOfBirth: patientData.date_of_birth,
        gender: patientData.gender,
        medicalRecordNumber: patientData.medical_record_number
      },
      vitals: data.vitals || {},
      summaryFindings: data.summary_findings || {},
      medications: data.medications || [],
      supplements: data.supplements || [],
      nurseNotes: data.nurse_notes || '',
      doctorNotes: data.doctor_notes || '',
      diagnosis: data.diagnosis || '',
      treatmentPlan: data.treatment_plan || '',
      exerciseRecommendations: data.exercise_recommendations || '',
      doctorName: data.doctor_name || '',
      showInsulinResistance: data.show_insulin_resistance || false,
      nutritionRecommendations: data.nutrition_recommendations || {},
      exerciseDetail: data.exercise_detail || {},
      sleepStressRecommendations: data.sleep_stress_recommendations || {},
      followUps: data.follow_ups || []
    };
  } catch (error) {
    console.error(`Error getting form data for patient ${patientId}:`, error);
    return createEmptyPatientFormData(patientId);
  }
};

export const createEmptyPatientFormData = async (patientId: string): Promise<PatientFormData> => {
  try {
    // Get patient info first
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
      
    if (patientError) {
      throw patientError;
    }
    
    // Create an empty form data record
    const emptyFormData = {
      patient_id: patientId,
      vitals: {},
      summary_findings: {},
      medications: [],
      supplements: [],
      nurse_notes: '',
      doctor_notes: '',
      diagnosis: '',
      treatment_plan: '',
      exercise_recommendations: '',
      show_insulin_resistance: false,
      nutrition_recommendations: {},
      exercise_detail: {},
      sleep_stress_recommendations: {},
      follow_ups: [],
      doctor_name: ''
    };
    
    const { data, error } = await supabase
      .from('patient_form_data')
      .insert([emptyFormData])
      .select();
      
    if (error) {
      throw error;
    }
    
    // Return the formatted data
    return {
      patientInfo: {
        name: patientData.name,
        dateOfBirth: patientData.date_of_birth,
        gender: patientData.gender,
        medicalRecordNumber: patientData.medical_record_number
      },
      vitals: {},
      summaryFindings: {},
      medications: [],
      supplements: [],
      nurseNotes: '',
      doctorNotes: '',
      diagnosis: '',
      treatmentPlan: '',
      exerciseRecommendations: '',
      doctorName: '',
      showInsulinResistance: false,
      nutritionRecommendations: {},
      exerciseDetail: {},
      sleepStressRecommendations: {},
      followUps: []
    };
  } catch (error) {
    console.error(`Error creating empty form data for patient ${patientId}:`, error);
    
    // Return a minimal empty object as fallback
    return {
      patientInfo: {
        name: 'Unknown',
        dateOfBirth: '',
        gender: '',
        medicalRecordNumber: ''
      },
      vitals: {},
      summaryFindings: {},
      medications: [],
      supplements: [],
      nurseNotes: '',
      doctorNotes: '',
      diagnosis: '',
      treatmentPlan: '',
      exerciseRecommendations: '',
      doctorName: '',
      showInsulinResistance: false,
      nutritionRecommendations: {},
      exerciseDetail: {},
      sleepStressRecommendations: {},
      followUps: []
    };
  }
};

export const savePatientFormData = async (patientId: string, formData: PatientFormData): Promise<boolean> => {
  try {
    // Convert from UI format to database format
    const dbData = {
      patient_id: patientId,
      vitals: formData.vitals,
      summary_findings: formData.summaryFindings,
      medications: formData.medications,
      supplements: formData.supplements,
      nurse_notes: formData.nurseNotes,
      doctor_notes: formData.doctorNotes,
      diagnosis: formData.diagnosis,
      treatment_plan: formData.treatmentPlan,
      exercise_recommendations: formData.exerciseRecommendations,
      doctor_name: formData.doctorName,
      show_insulin_resistance: formData.showInsulinResistance,
      nutrition_recommendations: formData.nutritionRecommendations,
      exercise_detail: formData.exerciseDetail,
      sleep_stress_recommendations: formData.sleepStressRecommendations,
      follow_ups: formData.followUps,
      last_updated: new Date().toISOString()
    };
    
    // Check if record exists
    const { data, error: selectError } = await supabase
      .from('patient_form_data')
      .select('id')
      .eq('patient_id', patientId);
      
    if (selectError) {
      throw selectError;
    }
    
    if (data && data.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('patient_form_data')
        .update(dbData)
        .eq('patient_id', patientId);
        
      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('patient_form_data')
        .insert([dbData]);
        
      if (insertError) {
        throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving form data for patient ${patientId}:`, error);
    return false;
  }
};

export const updateFormStatus = async (formId: string, status: Form['status']): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forms')
      .update({
        status,
        status_updated_at: new Date().toISOString()
      })
      .eq('id', formId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating form status for form ${formId}:`, error);
    return false;
  }
};
