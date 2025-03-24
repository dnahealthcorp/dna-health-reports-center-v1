
import { User } from "@/types";
import { supabase, initializeFromMockData } from "./baseService";

const mapUserFromDB = (dbUser: any): User => {
  // Ensure role is one of the allowed values
  let role: 'nurse' | 'doctor' | 'admin' = 'nurse'; // Default
  
  if (dbUser.role === 'nurse' || dbUser.role === 'doctor' || dbUser.role === 'admin') {
    role = dbUser.role as 'nurse' | 'doctor' | 'admin';
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: role
  };
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(mapUserFromDB);
  } catch (error) {
    console.error("Error getting users from Supabase:", error);
    
    // Fallback to mock data
    const { mockUsers } = await initializeFromMockData();
    return mockUsers;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get authentication state
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      return null;
    }
    
    // Get user from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data ? mapUserFromDB(data) : null;
  } catch (error) {
    console.error("Error getting current user from Supabase:", error);
    
    // Fallback to first user in mock data
    const { mockUsers } = await initializeFromMockData();
    return mockUsers[0] || null;
  }
};

export const setCurrentUser = async (user: User): Promise<User> => {
  try {
    // Check if user exists
    const { data, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id);
      
    if (checkError) {
      throw checkError;
    }
    
    // Insert or update
    let error;
    if (data && data.length > 0) {
      // Update
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          role: user.role
        })
        .eq('id', user.id);
        
      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }]);
        
      error = insertError;
    }
    
    if (error) {
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error("Error setting current user in Supabase:", error);
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
    
    // Get user from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      throw userError;
    }
    
    return userData ? mapUserFromDB(userData) : null;
  } catch (error) {
    console.error("Error logging in user with Supabase:", error);
    return null;
  }
};
