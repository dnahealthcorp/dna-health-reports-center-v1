import { Json } from "@/types";
import { createClient } from '@supabase/supabase-js';
import { getMockData } from "@/lib/mockData";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize mock data
let mockPatients: any[] = [];
let mockMedications: any[] = [];
let mockPatientFormData: any = {};

export const initializeFromMockData = async () => {
  if (mockPatients.length === 0 && mockMedications.length === 0) {
    const mockData = await getMockData();
    mockPatients = mockData.patients;
    mockMedications = mockData.medications;
    mockPatientFormData = mockData.patientFormData;
  }
  
  return {
    mockPatients,
    mockMedications,
    getPatientFormData: (patientId: string) => mockPatientFormData[patientId] || null
  };
};

// Utility function to convert JSON string to array safely
export const safeJsonArrayConversion = <T>(json: Json, typeGuard: (item: any) => item is T): T[] => {
  if (!json || !Array.isArray(json)) {
    return [];
  }
  
  return json.filter(typeGuard);
};
