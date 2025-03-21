
import { Medication } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Medication operations
export const getMedications = async (): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*');
  
  if (error) {
    console.error("Error fetching medications:", error);
    return [];
  }
  
  return data.map(med => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    notes: med.notes,
    type: med.type as 'medication' | 'supplement',
    link: med.link
  }));
};

export const addMedication = async (medication: Medication): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      notes: medication.notes,
      type: medication.type,
      link: medication.link
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding medication:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dosage: data.dosage,
    frequency: data.frequency,
    notes: data.notes,
    type: data.type as 'medication' | 'supplement',
    link: data.link
  };
};

export const updateMedication = async (medication: Medication): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .update({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      notes: medication.notes,
      type: medication.type,
      link: medication.link
    })
    .eq('id', medication.id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dosage: data.dosage,
    frequency: data.frequency,
    notes: data.notes,
    type: data.type as 'medication' | 'supplement',
    link: data.link
  };
};

export const deleteMedication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
};
