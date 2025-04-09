
// User-related database operations
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'nurse' | 'doctor' | 'admin'
    }));
  } catch (error) {
    console.error("Error getting users from Supabase:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get authentication state
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      return null;
    }
    
    // Get user from the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data ? {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as 'nurse' | 'doctor' | 'admin'
    } : null;
  } catch (error) {
    console.error("Error getting current user from Supabase:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error logging out user from Supabase:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      return null;
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      throw userError;
    }
    
    return userData ? {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as 'nurse' | 'doctor' | 'admin'
    } : null;
  } catch (error) {
    console.error("Error logging in user with Supabase:", error);
    throw error;
  }
};

export async function getAllDoctors(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'doctor'
    }));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}
