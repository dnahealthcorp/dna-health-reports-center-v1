
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser } from "@/services/userService";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;
        
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          try {
            if (session) {
              // First try to get the user from the users table
              const currentUser = await getCurrentUser();
              
              if (currentUser) {
                setUser(currentUser);
              } else {
                // Create user in users table if they don't exist yet
                console.log("User authenticated but not found in users table, creating user record");
                const newUser = {
                  id: session.user.id,
                  name: session.user.email?.split('@')[0] || 'New User',
                  email: session.user.email || '',
                  role: 'nurse' // Default role is set to 'nurse'
                };
                
                // Create the user in the database
                await setCurrentUser(newUser);
                setUser(newUser);
              }
            }
          } catch (error) {
            console.error("Error fetching user after auth change:", error);
            // Don't sign out on error, just set a basic user if we have a session
            if (session) {
              setUser({
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'New User',
                email: session.user.email || '',
                role: 'nurse' // Default role is set to 'nurse'
              });
            }
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
            navigate("/login");
          }
        } else {
          // For other events, just update loading state
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    );

    // THEN check for existing session
    const fetchUser = async () => {
      try {
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        // Only try to get the current user if we have a session
        if (session) {
          try {
            const currentUser = await getCurrentUser();
            if (currentUser && isMounted) {
              setUser(currentUser);
            } else if (isMounted) {
              // User is authenticated but not in our users table
              console.log("User authenticated but not found in users table, creating fallback user");
              const newUser = {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'New User',
                email: session.user.email || '',
                role: 'nurse' // Default role is set to 'nurse'
              };
              
              // Try to create the user in the database
              try {
                await setCurrentUser(newUser);
              } catch (createError) {
                console.error("Error creating user:", createError);
              }
              
              setUser(newUser);
            }
          } catch (error) {
            console.error("Error fetching user:", error);
            // Use session data as fallback if we have a session
            if (session.user && isMounted) {
              setUser({
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'New User',
                email: session.user.email || '',
                role: 'nurse' // Default role is set to 'nurse'
              });
            }
          }
        } else if (isMounted) {
          // No session, so no user
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
