
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

  // Initialize auth state
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    // Set up auth state listener first
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsLoading(false);
            return;
          } 
          
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            // Use setTimeout to defer supabase calls to avoid recursion
            setTimeout(async () => {
              try {
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
                setIsLoading(false);
              } catch (error) {
                console.error("Error fetching user data:", error);
                setIsLoading(false);
              }
            }, 0);
          } else {
            setIsLoading(false);
          }
        }
      );
      
      return data.subscription;
    };

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found");
          setIsLoading(false);
          return;
        }
        
        console.log("Session found:", session.user.id);
        
        // Fetch user data
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
        } else {
          console.log("No user data found for ID:", session.user.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial session:", error);
        setIsLoading(false);
      }
    };

    // First set up the listener, then check session
    subscription = setupAuthListener();
    checkSession();
    
    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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
      
      if (!data.user) {
        return { session: data.session, user: null, error: null };
      }
      
      // Fetch user data after login
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user data after login:", userError);
        throw userError;
      }
      
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
