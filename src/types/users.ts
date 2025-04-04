
// User related type definitions
export interface User {
  id: string;
  name: string;
  role: 'nurse' | 'doctor' | 'admin';
  email: string;
  profileId?: string; // Optional reference to user_profiles table
}

// Interface for user invite data
export interface UserInvite {
  id: string;
  email: string;
  role: 'nurse' | 'doctor' | 'admin';
  invited_by: string;
  created_at: string;
  accepted_at: string | null;
}

// Helper function to validate role type
export function isValidRole(role: string): role is 'nurse' | 'doctor' | 'admin' {
  return role === 'nurse' || role === 'doctor' || role === 'admin';
}

// Helper function to ensure a valid role type
export function ensureValidRole(role: string): 'nurse' | 'doctor' | 'admin' {
  if (isValidRole(role)) {
    return role;
  }
  // Default to 'nurse' if an invalid role is provided
  console.warn(`Invalid role encountered: "${role}". Defaulting to "nurse".`);
  return 'nurse';
}
