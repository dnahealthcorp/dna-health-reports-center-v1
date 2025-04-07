
// Form related type definitions
export type FormTemplate = {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
};

export type FormField = {
  id: string;
  type: 'text' | 'select' | 'number' | 'date' | 'textarea' | 'medication';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  section: 'patient' | 'vitals' | 'medications' | 'nurse' | 'doctor' | 'summaryFindings';
};

export type Form = {
  id: string;
  patient_id: string;
  form_type_id: string;
  status: 'draft' | 'in-process' | 'late' | 'completed';
  pdf_exported: boolean;
  created_at: string;
  updated_at: string;
  status_updated_at?: string;
  created_by?: string;
  formType?: FormType;
};

export type FormType = {
  id: string;
  title: string;
  description?: string;
  slug: string;
  created_at: string;
  updated_at: string;
  pdf_template_path?: string;
};
