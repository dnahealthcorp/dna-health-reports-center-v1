
// JSON-related type definitions

// Define a JSON type that matches Supabase's Json type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// Helper function to safely convert any value to JSON
export function toJson(value: any): Json {
  // If value is null or undefined, return null
  if (value === null || value === undefined) {
    return null;
  }

  // If value is already a primitive that fits Json type, return as is
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // For dates, convert to ISO string
  if (value instanceof Date) {
    return value.toISOString();
  }

  // For arrays, map each item recursively
  if (Array.isArray(value)) {
    return value.map(item => toJson(item));
  }

  // For objects, convert each property recursively
  if (typeof value === 'object') {
    const result: { [key: string]: Json } = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = toJson(value[key]);
      }
    }
    return result;
  }

  // If none of the above, convert to string as fallback
  return String(value);
}

// Helper function to safely handle JSON arrays
export function safeJsonArray<T>(json: Json | null | undefined): T[] {
  if (!json || !Array.isArray(json)) {
    return [];
  }
  return json as unknown as T[];
}
