import { supabase } from "../baseService";
import { Patient } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Get all patients
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Map database fields to Patient type
    return data.map(record => ({
      id: record.id,
      name: record.name,
      dateOfBirth: record.date_of_birth,
      gender: record.gender,
      medicalRecordNumber: record.medical_record_number,
      lastUpdated: record.last_updated,
      status: record.status as 'nurse-pending' | 'doctor-pending' | 'completed'
    }));
  } catch (error) {
    console.error("Error getting patients:", error);
    return [];
  }
};

// Get recent patients (limited to 5)
export const getRecentPatients = async (limit = 5): Promise<Patient[]> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    // Map database fields to Patient type
    return data.map(record => ({
      id: record.id,
      name: record.name,
      dateOfBirth: record.date_of_birth,
      gender: record.gender,
      medicalRecordNumber: record.medical_record_number,
      lastUpdated: record.last_updated,
      status: record.status as 'nurse-pending' | 'doctor-pending' | 'completed'
    }));
  } catch (error) {
    console.error("Error getting recent patients:", error);
    return [];
  }
};

// Get a single patient by ID
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map database fields to Patient type
    return {
      id: data.id,
      name: data.name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      medicalRecordNumber: data.medical_record_number,
      lastUpdated: data.last_updated,
      status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
    };
  } catch (error) {
    console.error(`Error getting patient with ID ${id}:`, error);
    return null;
  }
};

// Add a new patient
export const addPatient = async (patient: Partial<Patient>): Promise<Patient> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          name: patient.name,
          date_of_birth: patient.dateOfBirth,
          gender: patient.gender,
          medical_record_number: patient.medicalRecordNumber,
          status: patient.status || 'nurse-pending',
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map database response to Patient type
    return {
      id: data.id,
      name: data.name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      medicalRecordNumber: data.medical_record_number,
      lastUpdated: data.last_updated,
      status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
    };
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

// Update an existing patient
export const updatePatient = async (patient: Patient): Promise<Patient> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({
        name: patient.name,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        medical_record_number: patient.medicalRecordNumber,
        status: patient.status,
        last_updated: new Date().toISOString()
      })
      .eq('id', patient.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map database response to Patient type
    return {
      id: data.id,
      name: data.name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      medicalRecordNumber: data.medical_record_number,
      lastUpdated: data.last_updated,
      status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
    };
  } catch (error) {
    console.error(`Error updating patient with ID ${patient.id}:`, error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting patient with ID ${id}:`, error);
    throw error;
  }
};

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
    
    // Map database fields to Patient type
    return {
      id: data.id,
      name: data.name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      medicalRecordNumber: data.medical_record_number,
      lastUpdated: data.last_updated,
      status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
    };
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
