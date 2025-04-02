
import { FormTemplate } from './forms';
import { Patient } from './patients';

export type FormType = {
  id: string;
  slug: string;
  title: string;
  description: string;
  pdf_template_path?: string;
  created_at: string;
  updated_at: string;
};

export type FormInstance = {
  id: string;
  patient_id: string;
  form_type_id: string;
  status: 'draft' | 'in-process' | 'completed' | 'late';
  pdf_exported: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  status_updated_at?: string;
  formType?: FormType;
  patient?: Patient;
};

export type HealthScreeningData = {
  id: string;
  form_id: string;
  vitals: any;
  summary_findings: any;
  medications: any;
  supplements: any;
  nurse_notes?: string;
  doctor_notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
  show_insulin_resistance: boolean;
  nutrition_recommendations: any;
  exercise_detail: any;
  sleep_stress_recommendations: any;
  follow_ups: any;
  last_updated: string;
};

export type FoodIntoleranceData = {
  id: string;
  form_id: string;
  symptoms: any;
  tested_foods: any;
  test_results: any;
  recommendations?: string;
  followup_plan?: string;
  last_updated: string;
};
