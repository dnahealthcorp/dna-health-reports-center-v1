
import { Json } from "@/types";
import { createClient } from '@supabase/supabase-js';
import { mockMedications, mockPatients, getPatientFormData as getMockPatientFormData } from "@/lib/mockData";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Use the supabase client from the integrations folder
export const supabase = supabaseClient;

// Initialize mock data
let mockPatientsData: any[] = [];
let mockMedicationsData: any[] = [];

export const initializeFromMockData = async () => {
  if (mockPatientsData.length === 0 && mockMedicationsData.length === 0) {
    // Use the directly imported mock data
    mockPatientsData = mockPatients;
    mockMedicationsData = mockMedications;
  }
  
  return {
    mockPatients: mockPatientsData,
    mockMedications: mockMedicationsData,
    getPatientFormData: getMockPatientFormData
  };
};

// Add the missing utility functions for JSON conversion
export const toJson = <T>(value: T): Json => {
  return value as unknown as Json;
};

export const safeJsonArray = <T>(values: T[]): Json => {
  return values as unknown as Json;
};

// Utility function to convert JSON string to array safely
export const safeJsonArrayConversion = <T>(json: Json, typeGuard: (item: any) => item is T): T[] => {
  if (!json || !Array.isArray(json)) {
    return [];
  }
  
  return json.filter(typeGuard) as T[];
};
