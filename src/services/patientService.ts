
// Patient-related database operations
import { Patient, PatientFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from "./userService";
import { createEmptyPatientFormData, getPatientFormData, savePatientFormData } from "./formService";

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
    pdfFiles: dbPatient.pdfFiles || undefined,
    created_at: dbPatient.created_at,
    pdf_exported: dbPatient.pdf_exported,
    status_updated_at: dbPatient.status_updated_at,
    created_by: dbPatient.created_by,
    createdByName: dbPatient.users?.name || "Unknown"
  };
};

// Patient operations
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        users:created_by (
          name
        )
      `)
      .order('last_updated', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Map database format to application format
    return (data || []).map(mapPatientFromDB);
  } catch (error) {
    console.error("Error getting patients from Supabase:", error);
    
    // Fallback to mock data
    const { getMockPatients } = await import("@/lib/mockData");
    return getMockPatients();
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
    const { getMockPatients } = await import("@/lib/mockData");
    const mockPatients = await getMockPatients();
    return mockPatients.find(p => p.id === id || p.medicalRecordNumber === id) || null;
  }
};

export const addPatient = async (patient: Patient): Promise<Patient> => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
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
        status: patientWithId.status,
        created_at: new Date().toISOString(),
        pdf_exported: false,
        created_by: currentUser?.id || null
      }])
      .select();
    
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    
    // Create an empty form data for this patient
    await createEmptyPatientFormData(patientWithId.id);
    
    // Add the createdByName for display purposes
    patientWithId.createdByName = currentUser?.name || "Unknown";
    
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
        status: patient.status,
        pdf_exported: patient.pdf_exported
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
    console.log(`PatientService: Starting deletion process for patient with ID: ${id}`);
    
    // Step 1: Delete patient form data
    const { error: formError } = await supabase
      .from('patient_form_data')
      .delete()
      .eq('patient_id', id);
      
    if (formError) {
      console.error(`PatientService: Error deleting form data for patient ${id}:`, formError);
      throw new Error(`Failed to delete patient form data: ${formError.message}`);
    }
    
    console.log(`PatientService: Successfully deleted form data for patient ${id}`);
    
    // Step 2: Delete any PDF files associated with the patient
    const { error: pdfError } = await supabase
      .from('pdf_files')
      .delete()
      .eq('patient_id', id);
      
    if (pdfError) {
      console.error(`PatientService: Error deleting PDF files for patient ${id}:`, pdfError);
      // We'll continue with patient deletion even if PDF deletion fails
      // but we log the error for debugging purposes
    } else {
      console.log(`PatientService: Successfully deleted any PDF files for patient ${id}`);
    }
    
    // Step 3: Delete the patient record itself
    const { error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (patientError) {
      console.error(`PatientService: Error in final patient deletion step for ${id}:`, patientError);
      throw new Error(`Failed to delete patient record: ${patientError.message}`);
    }
    
    console.log(`PatientService: Successfully deleted patient with ID: ${id}`);
  } catch (error) {
    console.error(`PatientService: Error deleting patient ${id} from Supabase:`, error);
    throw error; // Re-throw to allow calling code to handle the error
  }
};

// Generate a unique MRN
export const generateMRN = (): string => {
  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mrn = "MRN-";
    for (let i = 0; i < 8; i++) {
      mrn += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return mrn;
  } catch (error) {
    console.error("Error generating MRN:", error);
    return `MRN-${Date.now()}`;
  }
};
