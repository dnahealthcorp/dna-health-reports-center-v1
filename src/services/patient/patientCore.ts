
import { Patient } from "@/types";
import { supabase, initializeFromMockData } from "../baseService";
import { v4 as uuidv4 } from 'uuid';
import { createEmptyPatientFormData } from './patientFormData';

// Helper function to convert snake_case database objects to camelCase application objects
const mapPatientFromDB = (dbPatient: any): Patient => {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    dateOfBirth: dbPatient.date_of_birth,
    gender: dbPatient.gender,
    medicalRecordNumber: dbPatient.medical_record_number,
    lastUpdated: dbPatient.last_updated,
    status: dbPatient.status,
    pdfFiles: dbPatient.pdfFiles || undefined
  };
};

// Patient operations
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Map database format to application format
    return (data || []).map(mapPatientFromDB);
  } catch (error) {
    console.error("Error getting patients from Supabase:", error);
    
    // Fallback to mock data
    const { mockPatients } = await initializeFromMockData();
    return mockPatients;
  }
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    // First try by ID
    let { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // If not found by ID, try by medical record number
      const { data: mrnData, error: mrnError } = await supabase
        .from('patients')
        .select('*')
        .eq('medical_record_number', id)
        .single();
        
      if (mrnError) {
        throw mrnError;
      }
      
      data = mrnData;
    }
    
    return data ? mapPatientFromDB(data) : null;
  } catch (error) {
    console.error(`Error getting patient by ID ${id} from Supabase:`, error);
    
    // Fallback to mock data
    const { mockPatients } = await initializeFromMockData();
    return mockPatients.find(p => p.id === id || p.medicalRecordNumber === id) || null;
  }
};

export const addPatient = async (patient: Patient): Promise<Patient> => {
  try {
    // Make sure patient has an ID if not provided
    const patientWithId = {
      ...patient,
      id: patient.id || uuidv4()
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        id: patientWithId.id,
        name: patientWithId.name,
        date_of_birth: patientWithId.dateOfBirth,
        gender: patientWithId.gender,
        medical_record_number: patientWithId.medicalRecordNumber,
        last_updated: new Date().toISOString(),
        status: patientWithId.status
      }])
      .select();
    
    if (error) {
      throw error;
    }
    
    // Create an empty form data for this patient
    await createEmptyPatientFormData(patientWithId.id);
    
    return patientWithId;
  } catch (error) {
    console.error("Error adding patient to Supabase:", error);
    throw error;
  }
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
  try {
    const { error } = await supabase
      .from('patients')
      .update({
        name: patient.name,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        medical_record_number: patient.medicalRecordNumber,
        last_updated: new Date().toISOString(),
        status: patient.status
      })
      .eq('id', patient.id);
    
    if (error) {
      throw error;
    }
    
    return patient;
  } catch (error) {
    console.error(`Error updating patient ${patient.id} in Supabase:`, error);
    throw error;
  }
};

export const deletePatient = async (id: string): Promise<void> => {
  try {
    // Delete patient form data first
    const { error: formError } = await supabase
      .from('patient_form_data')
      .delete()
      .eq('patient_id', id);
      
    if (formError) {
      console.warn(`Error deleting form data for patient ${id}:`, formError);
    }
    
    // Then delete the patient
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting patient ${id} from Supabase:`, error);
    throw error;
  }
};
