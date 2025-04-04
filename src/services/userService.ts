
// User-related database operations
import { User, ensureValidRole, isValidRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Helper function to convert snake_case database objects to camelCase application objects
const mapUserFromDB = (dbUser: any): User => {
  // Ensure role is one of the allowed values
  let role = ensureValidRole(dbUser.role);
  
  return {
    id: dbUser.id,
    name: dbUser.name || dbUser.profiles?.name || 'Unknown',
    email: dbUser.email,
    role: role,
    profileId: dbUser.profiles?.id
  };
};

// User operations
export const getUsers = async (): Promise<User[]> => {
  try {
    // First get users from auth.users (via profiles)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        name,
        email,
        role
      `)
      .order('name');
    
    if (profileError) {
      // Try to handle error and continue with original approach
      console.error("Error getting user profiles from Supabase:", profileError);
    }
    
    if (profileData && profileData.length > 0) {
      // If we successfully got profiles, use those, making sure to validate roles
      return profileData.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        email: profile.email || '',
        role: ensureValidRole(profile.role)
      }));
    }
    
    // Fallback to original approach if profiles not available
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Make sure to validate role for each user
    return (data || []).map(user => mapUserFromDB(user));
  } catch (error) {
    console.error("Error getting users from Supabase:", error);
    
    // Fallback to mock data
    const { getMockUsers } = await import("@/lib/mockData");
    return getMockUsers();
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get authentication state
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      return null;
    }
    
    // Try to get user from profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();
      
    if (profileData && !profileError) {
      return {
        id: profileData.id,
        name: profileData.name || 'Unknown',
        email: profileData.email || authData.session.user.email || '',
        role: ensureValidRole(profileData.role)
      };
    }
    
    // If no profile, check the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();
    
    if (error) {
      // Create a default profile if none exists
      const defaultUser = {
        id: authData.session.user.id,
        name: authData.session.user.user_metadata?.name || 'User',
        email: authData.session.user.email || '',
        role: 'nurse' as const
      };
      
      // Try to add this user to the user_profiles table
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          role: defaultUser.role
        }]);
        
      if (insertError) {
        console.error("Error creating default user profile:", insertError);
      }
      
      return defaultUser;
    }
    
    return data ? mapUserFromDB(data) : null;
  } catch (error) {
    console.error("Error getting current user from Supabase:", error);
    
    // Fallback to first user in mock data
    const { getMockUsers } = await import("@/lib/mockData");
    const mockUsers = await getMockUsers();
    return mockUsers[0] || null;
  }
};

export const setCurrentUser = async (user: User): Promise<User> => {
  try {
    // Verify user has a valid UUID
    if (!user.id || user.id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    
    // Check if user profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id);
      
    // Insert or update user profile
    let profileError2;
    if (profileData && profileData.length > 0) {
      // Update profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: user.name,
          email: user.email,
          role: user.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      profileError2 = error;
    } else {
      // Insert profile
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }]);
        
      profileError2 = error;
    }
    
    if (profileError2) {
      console.error("Error updating user profile:", profileError2);
    }
    
    // Check if user exists in users table
    const { data, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id);
      
    if (checkError) {
      throw checkError;
    }
    
    // Insert or update in users table (for backwards compatibility)
    let error;
    if (data && data.length > 0) {
      // Update
      console.log('Updating existing user:', user);
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
      console.log('Creating new user:', user);
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: new Date().toISOString()
        }]);
        
      error = insertError;
    }
    
    if (error) {
      console.error('Error in database operation:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error("Error setting current user in Supabase:", error);
    throw error;
  }
};

export const addUser = async (user: User): Promise<User> => {
  try {
    // Verify user has a valid UUID
    if (!user.id || user.id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    
    // Insert into user_profiles
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }]);
      
    if (profileError) {
      console.error("Error creating user profile:", profileError);
    }
    
    // Insert new user (for backwards compatibility)
    const { error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: new Date().toISOString()
      }]);
      
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error("Error adding user to Supabase:", error);
    throw error;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    // Update user_profiles
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        name: user.name,
        email: user.email,
        role: user.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (profileError) {
      console.error("Error updating user profile:", profileError);
    }
    
    // Update users table (for backwards compatibility)
    const { error } = await supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
        role: user.role
      })
      .eq('id', user.id);
      
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error(`Error updating user ${user.id} in Supabase:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    // The user_profiles table should be automatically cleaned up due to ON DELETE CASCADE
    // when the auth.users record is deleted
    
    // Delete from users table (for backwards compatibility)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting user ${id} from Supabase:`, error);
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
    
    // Try to get user from profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileData && !profileError) {
      return {
        id: profileData.id,
        name: profileData.name || 'Unknown',
        email: profileData.email || data.user.email || '',
        role: ensureValidRole(profileData.role)
      };
    }
    
    // If no profile, check the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      // Create a basic profile if one doesn't exist
      return {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'User',
        email: data.user.email || '',
        role: 'nurse' as const
      };
    }
    
    return userData ? mapUserFromDB(userData) : null;
  } catch (error) {
    console.error("Error logging in user with Supabase:", error);
    return null;
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
      console.error('Error fetching doctors:', error);
      return [];
    }
    
    // Make sure to validate roles when returning users
    return (data || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: ensureValidRole(user.role)
    }));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}
