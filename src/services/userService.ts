
import { supabase } from "./baseService";
import { User } from "@/types";

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as User;
  } catch (error) {
    console.error(`Error getting user with ID ${id}:`, error);
    return null;
  }
};

// Note: In a real application, you would use auth functions to handle user creation
// This is a simplified version that only updates the 'users' table
export const addUser = async (user: Omit<User, "id" | "created_at">): Promise<User> => {
  try {
    // Generate a random UUID for demo purposes
    // In a real app, this would come from Supabase Auth when creating the user
    const id = `user-${Date.now()}`;
    
    const newUser: Omit<User, "created_at"> = {
      id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as User;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const updateUser = async (user: Omit<User, "created_at">): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
        role: user.role
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as User;
  } catch (error) {
    console.error(`Error updating user with ID ${user.id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get current authenticated user from Supabase Auth
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      return null;
    }
    
    // Get user data from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Added the missing function
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
    
    // Get user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error("Error getting user data:", userError);
      return null;
    }
    
    return userData as User;
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
};
