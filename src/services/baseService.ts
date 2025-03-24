
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types";

// Helper function to safely convert JSON values to typed arrays with improved type safety
export function safeJsonArrayConversion<T>(jsonArray: Json | null | undefined, typeGuard: (item: any) => item is T): T[] {
  if (!jsonArray || !Array.isArray(jsonArray)) {
    return [];
  }
  
  return jsonArray.filter(typeGuard);
}

// Initialize with mock data for fallback
export const initializeFromMockData = async () => {
  try {
    // Import mock data only if needed
    const mockData = await import("@/lib/mockData");
    return {
      mockPatients: mockData.mockPatients,
      mockMedications: mockData.mockMedications,
      mockUsers: mockData.mockUsers,
      getPatientFormData: mockData.getPatientFormData
    };
  } catch (error) {
    console.error("Failed to initialize mock data:", error);
    return {
      mockPatients: [],
      mockMedications: [],
      mockUsers: [],
      getPatientFormData: () => Promise.resolve(null)
    };
  }
};

// Helper function to safely cast to JSON for Supabase
export function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

// Helper function to safely cast arrays for JSON
export function safeJsonArray<T>(values: T[]): Json {
  return values as unknown as Json;
}

export { supabase };
