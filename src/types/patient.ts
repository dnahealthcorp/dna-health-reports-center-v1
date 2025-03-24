
// Patient-related type definitions
import { PDFFile } from './pdf';
import { MedicationItem, SupplementItem } from './medication';

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

// Type guard functions for patient data
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
