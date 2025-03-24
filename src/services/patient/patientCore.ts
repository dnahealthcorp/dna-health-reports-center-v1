
import { supabase } from "../baseService";
import { Patient } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Add the missing function to get a patient by medical record number
export const getPatientByMedicalRecordNumber = async (medicalRecordNumber: string): Promise<Patient | null> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('medical_record_number', medicalRecordNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found, return null
        return null;
      }
      throw error;
    }
    
    return data as Patient;
  } catch (error) {
    console.error(`Error getting patient with MRN ${medicalRecordNumber}:`, error);
    return null;
  }
};

// Add this export to the file with other patient-related functions
export const generateMRN = (): string => {
  // Generate a medical record number in the format P followed by 6 digits
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return `P${randomDigits}`;
};
