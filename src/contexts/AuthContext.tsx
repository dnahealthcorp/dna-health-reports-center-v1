
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{
    session: any | null;
    user: User | null;
    error: any | null;
  }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ session: null, user: null, error: null }),
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    // Check for existing session
    const initialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user data including role
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
            return;
          }
          
          if (data) {
            setUser({
              id: data.id,
              name: data.name,
              email: data.email, 
              role: data.role as 'nurse' | 'doctor' | 'admin'
            });
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial session:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to restore your session. Please sign in again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
          } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            // Fetch user data including role from our users table
            try {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (error) {
                console.error("Error fetching user data:", error);
                return;
              }
              
              if (data) {
                setUser({
                  id: data.id,
                  name: data.name,
                  email: data.email,
                  role: data.role as 'nurse' | 'doctor' | 'admin'
                });
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }
        }
      );
      
      return data.subscription;
    };

    // First setup the listener, then check initial session
    subscription = setupAuthListener();
    initialSession();
    
    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if MFA is required
      if (data && data.session === null) {
        // MFA is required, return without error
        return { session: null, user: null, error: null };
      }
      
      if (data.user) {
        // Fetch user data after login
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) throw userError;
        
        if (userData) {
          const user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as 'nurse' | 'doctor' | 'admin'
          };
          
          setUser(user);
          return { session: data.session, user, error: null };
        }
      }
      return { session: data.session, user: null, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { session: null, user: null, error };
    }
  };
  
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login Failed",
        description: "Could not log in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate("/login");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
