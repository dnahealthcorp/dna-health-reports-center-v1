
// Medication-related type definitions
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  type: 'medication' | 'supplement';
  notes?: string;
  link?: string;
}

export interface MedicationItem {
  id: string;
  medicationId: string;
  dosage: string;
  notes?: string;
}

export interface SupplementItem {
  id: string;
  supplementId: string;
  dosage: string;
  source: string;
}

// Type guard functions for medication data
export function isMedicationItem(json: any): json is MedicationItem {
  return (
    json &&
    typeof json === 'object' &&
    'id' in json &&
    'medicationId' in json &&
    'dosage' in json
  );
}

export function isSupplementItem(json: any): json is SupplementItem {
  return (
    json &&
    typeof json === 'object' &&
    'id' in json &&
    'supplementId' in json &&
    'dosage' in json &&
    'source' in json
  );
}
