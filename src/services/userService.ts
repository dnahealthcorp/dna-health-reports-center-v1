
import { supabase } from './baseService';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Get current user - simulation for demo purposes
export const getCurrentUser = async (): Promise<User | null> => {
  // For demo purposes, we're returning a mock user
  // In a real app, you'd get this from Supabase auth session or localStorage
  return {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'admin'
  };
};

// Login user
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // This is a simplified login for demo purposes
    // In a real app, you would use Supabase auth.signIn
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('User not found');
    }
    
    // In a real app, you would verify password here
    // We're bypassing that for the demo
    
    // Store user session somewhere (e.g. localStorage)
    localStorage.setItem('currentUser', JSON.stringify(data));
    
    return data as User;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  // For demo purposes, we're just clearing localStorage
  // In a real app, you'd use Supabase auth.signOut
  localStorage.removeItem('currentUser');
};

// Add a new user
export const addUser = async (user: Partial<User>): Promise<User> => {
  try {
    // In a real app, you would use Supabase auth.signUp for creating users
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          name: user.name,
          email: user.email,
          role: user.role || 'nurse'
        }
      ])
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

// Update an existing user
export const updateUser = async (user: User): Promise<User> => {
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

// Delete a user
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
