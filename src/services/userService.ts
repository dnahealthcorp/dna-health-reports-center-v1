
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

export const createUser = async (email: string, password: string, name: string, role: 'nurse' | 'doctor' | 'admin'): Promise<User | null> => {
  try {
    // Create user in auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });

    if (error) {
      console.error("Error creating user in auth:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error("User creation failed");
    }

    // Create user in database
    const newUser: User = {
      id: data.user.id,
      name,
      email,
      role
    };

    await setCurrentUser(newUser);
    return newUser;
  } catch (error) {
    console.error("Error in createUser:", error);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: 'nurse' | 'doctor' | 'admin'): Promise<boolean> => {
  try {
    // Update user in the database
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Delete user from auth (this should cascade to the users table)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Error deleting user:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log(`Attempting to sign in: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !data.user) {
      console.error("Error signing in:", error);
      return null;
    }
    
    console.log("Sign-in successful, fetching user profile");
    return getCurrentUser();
  } catch (error) {
    console.error("Exception during login:", error);
    return null;
  }
};

// Create a demo admin account
export const createDemoAdmin = async (): Promise<User | null> => {
  const adminEmail = "admin@dnahealthcorp.com";
  const adminPassword = "adminPassword123";
  const adminName = "Demo Admin";
  
  try {
    // Check if the admin already exists
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle();
    
    if (data) {
      console.log("Demo admin already exists");
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as 'admin'
      };
    }
    
    // Create the admin user
    return createUser(adminEmail, adminPassword, adminName, 'admin');
  } catch (error) {
    console.error("Error creating demo admin:", error);
    return null;
  }
};
