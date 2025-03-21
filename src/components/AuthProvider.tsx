
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/userService";
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
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        // Don't set user to null here, just log the error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error("Error fetching user after auth change:", error);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          navigate("/login");
        }
        setIsLoading(false);
      }
    );

    return () => {
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
