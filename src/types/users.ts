
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
