
// Define interface for our application data model
export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  medicalRecordNumber: string;
  lastUpdated: string;
  status: 'nurse-pending' | 'doctor-pending' | 'completed';
  pdfFiles?: PDFFile[];
}

export interface PDFFile {
  id: string;
  patientId: string;
  fileName: string;
  createdAt: string;
  createdBy: string;
  url: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  type: 'medication' | 'supplement';
  notes?: string;
  link?: string;
}

export interface Vital {
  bloodPressure: string;
  height: string;
  weight: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
}

export interface SummaryFinding {
  glucoseMetabolism: string;
  lipidProfile: string;
  inflammation: string;
  uricAcid: string;
  vitamins: string;
  minerals: string;
  sexHormones: string;
  renalLiverFunction: string;
  cancerMarkers: string;
}

export interface NutritionRecommendation {
  nutritionalPlan: string;
  proteinConsumption: string;
  omissions: string;
  additionalConsiderations: string;
}

export interface ExerciseRecommendation {
  focusOn: string;
  walking: string;
  avoid: string;
  tracking: string;
}

export interface SleepStressRecommendation {
  sleep: string;
  stress: string;
}

export interface FollowUp {
  withDoctor: string;
  forReason: string;
  date: string;
}

export interface MedicationItem {
  id: string;
  medicationId: string;
  dosage: string;
  notes?: string;
}

export interface SupplementItem {
  id: string;
  supplementId: string;
  dosage: string;
  source: string;
}

export interface PatientFormData {
  patientInfo: {
    name: string;
    dateOfBirth: string;
    gender: string;
    medicalRecordNumber: string;
  };
  vitals: Vital;
  summaryFindings: SummaryFinding;
  medications: MedicationItem[];
  supplements?: SupplementItem[];
  exerciseRecommendations: string;
  nurseNotes: string;
  doctorNotes: string;
  diagnosis: string;
  treatmentPlan: string;
  showInsulinResistance: boolean;
  nutritionRecommendations: NutritionRecommendation;
  exerciseDetail: ExerciseRecommendation;
  sleepStressRecommendations: SleepStressRecommendation;
  followUps: FollowUp[];
}

export interface User {
  id: string;
  name: string;
  role: 'nurse' | 'doctor' | 'admin';
  email: string;
}

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

// Add a Json type to handle Supabase JSON data
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Type guard functions with improved type safety
export function isVital(json: any): json is Vital {
  return (
    json &&
    typeof json === 'object' &&
    'bloodPressure' in json &&
    'height' in json &&
    'weight' in json
  );
}

export function isSummaryFinding(json: any): json is SummaryFinding {
  return (
    json &&
    typeof json === 'object' &&
    'glucoseMetabolism' in json &&
    'lipidProfile' in json &&
    'inflammation' in json &&
    'uricAcid' in json
  );
}

export function isNutritionRecommendation(json: any): json is NutritionRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'nutritionalPlan' in json
  );
}

export function isExerciseRecommendation(json: any): json is ExerciseRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'focusOn' in json
  );
}

export function isSleepStressRecommendation(json: any): json is SleepStressRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'sleep' in json &&
    'stress' in json
  );
}

export function isFollowUp(json: any): json is FollowUp {
  return (
    json &&
    typeof json === 'object' &&
    'withDoctor' in json &&
    'forReason' in json &&
    'date' in json
  );
}

export function isMedicationItem(json: any): json is MedicationItem {
  return (
    json &&
    typeof json === 'object' &&
    'id' in json &&
    'medicationId' in json &&
    'dosage' in json
  );
}

export function isSupplementItem(json: any): json is SupplementItem {
  return (
    json &&
    typeof json === 'object' &&
    'id' in json &&
    'supplementId' in json &&
    'dosage' in json &&
    'source' in json
  );
}

// Helper function to safely cast to JSON for Supabase
export function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

// Helper function to safely cast arrays for JSON
export function safeJsonArray<T>(values: T[]): Json {
  return values as unknown as Json;
}
