
import { FormTemplate } from './forms';
import { Patient } from './patients';
import { Json } from './json';

export type FormType = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  pdf_template_path: string | null;
  created_at: string;
  updated_at: string;
};

export type FormStatus = 'draft' | 'in-process' | 'completed' | 'late';

export type FormInstance = {
  id: string;
  patient_id: string;
  form_type_id: string;
  status: FormStatus;
  pdf_exported: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  status_updated_at?: string | null;
  formType?: FormType;
  patient?: Patient;
};

export type HealthScreeningData = {
  id: string;
  form_id: string;
  vitals: Json | null;
  summary_findings: Json | null;
  medications: Json | null;
  supplements: Json | null;
  nurse_notes?: string | null;
  doctor_notes?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  show_insulin_resistance: boolean | null;
  nutrition_recommendations: Json | null;
  exercise_detail: Json | null;
  sleep_stress_recommendations: Json | null;
  follow_ups: Json | null;
  last_updated: string;
};

export type FoodIntoleranceData = {
  id: string;
  form_id: string;
  symptoms: Json | null;
  tested_foods: Json | null;
  test_results: Json | null;
  recommendations?: string | null;
  followup_plan?: string | null;
  last_updated: string;
};
