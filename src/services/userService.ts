
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// User operations
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  
  return data.map(user => ({
    id: user.id,
    name: user.name,
    role: user.role as 'nurse' | 'doctor' | 'admin',
    email: user.email
  }));
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  
  if (error || !data) {
    console.error("Error fetching current user:", error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    role: data.role as 'nurse' | 'doctor' | 'admin',
    email: data.email
  };
};

export const setCurrentUser = async (user: User): Promise<User> => {
  // In Supabase, this would update the user's profile
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email
    });
  
  if (error) {
    console.error("Error setting current user:", error);
    throw error;
  }
  
  return user;
};

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.error("Error signing in:", error);
    return null;
  }
  
  return getCurrentUser();
};
