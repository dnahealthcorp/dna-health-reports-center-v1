
// Patient related type definitions
export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  medicalRecordNumber: string;
  lastUpdated: string;
  status: 'in-review' | 'nurse-pending' | 'doctor-pending' | 'completed';
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

// Importing dependencies from other type files
import { Vital, SummaryFinding, NutritionRecommendation, ExerciseRecommendation, SleepStressRecommendation, FollowUp } from './medical';
import { MedicationItem, SupplementItem } from './medications';
