
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

// Get current user - get from Supabase auth session
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First, check if we have an active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      return null;
    }
    
    if (!session?.user) {
      console.log("No active session found");
      return null;
    }
    
    // We have a session, now get the user details from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error("Error getting user from database:", error);
      
      // If the user doesn't exist in our table but is authenticated, create a record
      if (error.code === 'PGRST116') { // No rows returned
        const newUser: Partial<User> = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'New User',
          role: 'nurse' // Default role
        };
        
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating user:", createError);
          return null;
        }
        
        return createdUser as User;
      }
      
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

// Login user using Supabase Auth
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    if (!session?.user) {
      throw new Error('Login successful but no user session returned');
    }
    
    // Get user details from our users table
    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      // If the user doesn't exist in our table but is authenticated, create a record
      if (userError.code === 'PGRST116') { // No rows returned
        const newUser: Partial<User> = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'New User',
          role: 'nurse' // Default role
        };
        
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating user:", createError);
          return null;
        }
        
        return createdUser as User;
      }
      
      console.error("Error getting user from database:", userError);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Register a new user with Supabase Auth
export const registerUser = async (email: string, password: string, name: string, role: string = 'nurse'): Promise<User | null> => {
  try {
    // Register the user with Supabase Auth
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    if (!user) {
      throw new Error('Registration successful but no user returned');
    }
    
    // Create entry in our users table
    const newUser: Partial<User> = {
      id: user.id,
      email,
      name,
      role
    };
    
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();
    
    if (insertError) {
      console.error("Error inserting new user into database:", insertError);
      // Clean up the auth user if we couldn't create the database record
      await supabase.auth.admin.deleteUser(user.id);
      throw insertError;
    }
    
    return data as User;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Add a new user
export const addUser = async (user: Partial<User>): Promise<User> => {
  try {
    // Generate a random password for the new user
    const password = Math.random().toString(36).slice(-8);
    
    // First, create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email!,
      password,
      email_confirm: true, // Auto-confirm the email
    });
    
    if (authError) {
      throw authError;
    }
    
    if (!authUser.user) {
      throw new Error('User created in Auth but no user returned');
    }
    
    // Then, create the user in our users table
    const newUser = {
      id: authUser.user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'nurse'
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();
    
    if (error) {
      // If we couldn't create the user in our table, delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
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
    // Update the user in our database
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
    
    // If the email was changed, update it in Supabase Auth too
    if (user.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email: user.email }
      );
      
      if (authError) {
        console.error("Error updating user email in auth:", authError);
      }
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
    // Delete the user from Supabase Auth first
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      throw authError;
    }
    
    // Then delete from our database
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
