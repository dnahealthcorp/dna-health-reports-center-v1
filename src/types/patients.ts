
// Patient related type definitions
export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  medicalRecordNumber: string;
  lastUpdated: string;
  status: 'in-process' | 'late' | 'completed';
  pdfFiles?: PDFFile[];
  created_at?: string;
  pdf_exported?: boolean;
  status_updated_at?: string;
  created_by?: string;
  createdByName?: string; // Display name of creator
}

export interface PDFFile {
  id: string;
  patient_id: string;
  file_name: string;
  created_at: string;
  created_by: string;
  url: string;
  // Add aliases for compatibility with previous code
  patientId?: string;
  fileName?: string;
  createdAt?: string;
  createdBy?: string;
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
  doctorName: string; // Required field for the doctor's name
  showInsulinResistance: boolean;
  nutritionRecommendations: NutritionRecommendation;
  exerciseDetail: ExerciseRecommendation;
  sleepStressRecommendations: SleepStressRecommendation;
  followUps: FollowUp[];
}

// Importing dependencies from other type files
import { Vital, SummaryFinding, NutritionRecommendation, ExerciseRecommendation, SleepStressRecommendation, FollowUp } from './medical';
import { MedicationItem, SupplementItem } from './medications';
