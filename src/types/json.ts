
// JSON utility types and functions
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Helper function to safely cast to JSON for Supabase
export function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

// Helper function to safely cast arrays for JSON
export function safeJsonArray<T>(values: T[]): Json {
  return values as unknown as Json;
}
