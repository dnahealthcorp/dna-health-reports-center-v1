
// Fix the Form status handling in formService.ts

// Only updating the necessary parts to fix the status issues:

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
    
    // Create empty form data
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
