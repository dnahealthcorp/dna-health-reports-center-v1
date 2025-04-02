
import { supabase } from "@/integrations/supabase/client";
import { FormType, FormInstance, HealthScreeningData, FoodIntoleranceData } from "@/types/multiforms";
import { Patient } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from "./databaseService";

// Get all form types
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

// Get a form type by slug
export const getFormTypeBySlug = async (slug: string): Promise<FormType | null> => {
  try {
    const { data, error } = await supabase
      .from('form_types')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error(`Error fetching form type by slug ${slug}:`, error);
    return null;
  }
};

// Get a form type by ID
export const getFormTypeById = async (id: string): Promise<FormType | null> => {
  try {
    const { data, error } = await supabase
      .from('form_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error(`Error fetching form type by ID ${id}:`, error);
    return null;
  }
};

// Get forms by patient ID
export const getFormsByPatientId = async (patientId: string): Promise<FormInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        form_type:form_type_id (*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match our expected types
    return (data || []).map(form => ({
      ...form,
      formType: form.form_type
    }));
  } catch (error) {
    console.error(`Error fetching forms for patient ${patientId}:`, error);
    return [];
  }
};

// Get a form by ID with its form type
export const getFormById = async (formId: string): Promise<FormInstance | null> => {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        form_type:form_type_id (*),
        patient:patient_id (*)
      `)
      .eq('id', formId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    return {
      ...data,
      formType: data.form_type,
      patient: data.patient
    };
  } catch (error) {
    console.error(`Error fetching form by ID ${formId}:`, error);
    return null;
  }
};

// Create a new form instance
export const createFormInstance = async (patientId: string, formTypeId: string): Promise<FormInstance | null> => {
  try {
    const currentUser = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('forms')
      .insert({
        id: uuidv4(),
        patient_id: patientId,
        form_type_id: formTypeId,
        status: 'draft',
        created_by: currentUser?.id
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) return null;
    
    // Initialize the corresponding data table based on form type
    const formType = await getFormTypeById(formTypeId);
    if (formType) {
      await initializeFormData(data[0].id, formType.slug);
    }
    
    return data[0];
  } catch (error) {
    console.error("Error creating form instance:", error);
    return null;
  }
};

// Initialize form data for a new form instance
const initializeFormData = async (formId: string, formTypeSlug: string): Promise<boolean> => {
  try {
    switch (formTypeSlug) {
      case 'health-screening':
        await supabase
          .from('health_screening_data')
          .insert({
            form_id: formId,
            vitals: {},
            summary_findings: {},
            medications: [],
            supplements: [],
            show_insulin_resistance: false,
            nutrition_recommendations: {},
            exercise_detail: {},
            sleep_stress_recommendations: {},
            follow_ups: []
          });
        break;
      case 'food-intolerance':
        await supabase
          .from('food_intolerance_data')
          .insert({
            form_id: formId,
            symptoms: [],
            tested_foods: [],
            test_results: {}
          });
        break;
      default:
        console.error(`Unknown form type slug: ${formTypeSlug}`);
        return false;
    }
    return true;
  } catch (error) {
    console.error(`Error initializing data for form ${formId}:`, error);
    return false;
  }
};

// Get health screening data for a form
export const getHealthScreeningData = async (formId: string): Promise<HealthScreeningData | null> => {
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

// Get food intolerance data for a form
export const getFoodIntoleranceData = async (formId: string): Promise<FoodIntoleranceData | null> => {
  try {
    const { data, error } = await supabase
      .from('food_intolerance_data')
      .select('*')
      .eq('form_id', formId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching food intolerance data for form ${formId}:`, error);
    return null;
  }
};

// Update a form's status
export const updateFormStatus = async (formId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forms')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', formId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating status for form ${formId}:`, error);
    return false;
  }
};

// Update form's PDF exported status
export const updateFormPdfExported = async (formId: string, pdfExported: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forms')
      .update({ 
        pdf_exported: pdfExported,
        status: pdfExported ? 'completed' : 'in-process',
        updated_at: new Date().toISOString()
      })
      .eq('id', formId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating PDF exported status for form ${formId}:`, error);
    return false;
  }
};

// Save PDF reference for a form
export const saveFormPdfReference = async (formId: string, fileName: string): Promise<boolean> => {
  try {
    const form = await getFormById(formId);
    if (!form) throw new Error(`Form with ID ${formId} not found`);
    
    const currentUser = await getCurrentUser();
    
    const { error } = await supabase
      .from('pdf_files')
      .insert({
        form_id: formId,
        patient_id: form.patient_id,
        file_name: fileName,
        url: fileName,
        created_by: currentUser?.id
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving PDF reference for form ${formId}:`, error);
    return false;
  }
};

// Save health screening data
export const saveHealthScreeningData = async (formId: string, data: Partial<HealthScreeningData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('health_screening_data')
      .update({
        ...data,
        last_updated: new Date().toISOString()
      })
      .eq('form_id', formId);
    
    if (error) {
      throw error;
    }
    
    // Update the form's last updated timestamp
    await supabase
      .from('forms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', formId);
    
    return true;
  } catch (error) {
    console.error(`Error saving health screening data for form ${formId}:`, error);
    return false;
  }
};

// Save food intolerance data
export const saveFoodIntoleranceData = async (formId: string, data: Partial<FoodIntoleranceData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('food_intolerance_data')
      .update({
        ...data,
        last_updated: new Date().toISOString()
      })
      .eq('form_id', formId);
    
    if (error) {
      throw error;
    }
    
    // Update the form's last updated timestamp
    await supabase
      .from('forms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', formId);
    
    return true;
  } catch (error) {
    console.error(`Error saving food intolerance data for form ${formId}:`, error);
    return false;
  }
};

// Delete a form and its associated data
export const deleteForm = async (formId: string): Promise<boolean> => {
  try {
    // The cascade delete will remove the associated data
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', formId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting form ${formId}:`, error);
    return false;
  }
};
