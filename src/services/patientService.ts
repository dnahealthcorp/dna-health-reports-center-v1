
import { Patient } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { generateMRN } from "./baseService";
import { getPatientFormData } from "./formService";

// Patient operations
export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('last_updated', { ascending: false });
  
  if (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
  
  return data.map(patient => ({
    id: patient.id,
    name: patient.name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    medicalRecordNumber: patient.medical_record_number,
    lastUpdated: patient.last_updated,
    status: patient.status as 'nurse-pending' | 'doctor-pending' | 'completed'
  }));
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  let query = supabase.from('patients').select('*');
  
  // Check if id is a MRN or a UUID
  if (id.startsWith('MRN-')) {
    query = query.eq('medical_record_number', id);
  } else {
    query = query.eq('id', id);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error("Error fetching patient:", error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    medicalRecordNumber: data.medical_record_number,
    lastUpdated: data.last_updated,
    status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
  };
};

export const addPatient = async (patient: Patient): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      id: patient.id,
      name: patient.name,
      date_of_birth: patient.dateOfBirth,
      gender: patient.gender,
      medical_record_number: patient.medicalRecordNumber,
      status: patient.status,
      last_updated: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    medicalRecordNumber: data.medical_record_number,
    lastUpdated: data.last_updated,
    status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
  };
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
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
    console.error("Error updating patient:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    medicalRecordNumber: data.medical_record_number,
    lastUpdated: data.last_updated,
    status: data.status as 'nurse-pending' | 'doctor-pending' | 'completed'
  };
};

export const deletePatient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};

// Re-export the generateMRN function for ease of use
export { generateMRN };
