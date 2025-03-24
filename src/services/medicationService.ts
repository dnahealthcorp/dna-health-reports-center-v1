
import { Medication } from "@/types";
import { supabase, initializeFromMockData } from "./baseService";
import { v4 as uuidv4 } from 'uuid';

const mapMedicationFromDB = (dbMedication: any): Medication => {
  return {
    id: dbMedication.id,
    name: dbMedication.name,
    dosage: dbMedication.dosage,
    notes: dbMedication.notes || undefined,
    type: dbMedication.type as 'medication' | 'supplement',
    link: dbMedication.link || undefined
  };
};

export const getMedications = async (): Promise<Medication[]> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Transform from database schema to application schema
    const medications: Medication[] = (data || []).map(mapMedicationFromDB);
    
    return medications;
  } catch (error) {
    console.error("Error getting medications from Supabase:", error);
    
    // Fallback to mock data
    const { mockMedications } = await initializeFromMockData();
    return mockMedications;
  }
};

export const addMedication = async (medication: Medication): Promise<Medication> => {
  try {
    // Make sure medication has an ID if not provided
    const medicationWithId = {
      ...medication,
      id: medication.id || uuidv4()
    };
    
    const { error } = await supabase
      .from('medications')
      .insert({
        id: medicationWithId.id,
        name: medicationWithId.name,
        dosage: medicationWithId.dosage,
        notes: medicationWithId.notes,
        type: medicationWithId.type,
        link: medicationWithId.link
      });
    
    if (error) {
      throw error;
    }
    
    return medicationWithId;
  } catch (error) {
    console.error("Error adding medication to Supabase:", error);
    throw error;
  }
};

export const updateMedication = async (medication: Medication): Promise<Medication> => {
  try {
    const { error } = await supabase
      .from('medications')
      .update({
        name: medication.name,
        dosage: medication.dosage,
        notes: medication.notes,
        type: medication.type,
        link: medication.link
      })
      .eq('id', medication.id);
    
    if (error) {
      throw error;
    }
    
    return medication;
  } catch (error) {
    console.error(`Error updating medication ${medication.id} in Supabase:`, error);
    throw error;
  }
};

export const deleteMedication = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting medication ${id} from Supabase:`, error);
    throw error;
  }
};
