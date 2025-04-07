
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

// Form type definitions for the multi-form system
export interface FormType {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  pdf_template_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  patient_id: string;
  form_type_id: string;
  created_by: string | null;
  status: 'in-process' | 'late' | 'completed' | 'draft';
  pdf_exported: boolean;
  created_at: string;
  updated_at: string;
  status_updated_at: string | null;
  formType?: FormType; // For JOIN operations
}

// Helper function to check if a status string is a valid Form status
export function isValidFormStatus(status: string): status is Form['status'] {
  return ['in-process', 'late', 'completed', 'draft'].includes(status);
}
