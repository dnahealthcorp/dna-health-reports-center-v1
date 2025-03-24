
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { loginUser, getUsers, createDemoAdmin } from "@/services/userService";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("User already logged in, redirecting to homepage");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  // Fetch demo users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Create a demo admin if it doesn't exist
        await createDemoAdmin();
        
        // Fetch all users for demo login
        const users = await getUsers();
        setDemoUsers(users || []);
      } catch (error) {
        console.error("Error fetching demo users:", error);
      }
    };
    
    if (!checkingSession) {
      fetchUsers();
    }
  }, [checkingSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email) {
      setLoginError("Please enter an email");
      return;
    }
    
    if (!password) {
      setLoginError("Please enter a password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Attempting to login with ${email}`);
      const user = await loginUser(email, password);
      
      if (user) {
        toast({
          title: "Success",
          description: `Welcome back, ${user.name}!`
        });
        
        navigate("/");
      } else {
        setLoginError("Invalid email or password");
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error?.message || "An error occurred during login");
      toast({
        title: "Error",
        description: error?.message || "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = async (demoUser: User) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // For demo purposes, we'll use a standard password
      let demoPassword = "password123";
      if (demoUser.email === "admin@dnahealthcorp.com") {
        demoPassword = "adminPassword123";
      }
      
      console.log(`Attempting demo login with ${demoUser.email}`);
      const user = await loginUser(demoUser.email, demoPassword);
      
      if (user) {
        toast({
          title: "Success",
          description: `Welcome to demo account, ${user.name}!`
        });
        
        navigate("/");
      } else {
        setLoginError("Could not log in with demo account");
        toast({
          title: "Error",
          description: "Could not log in with demo account",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Demo login error:", error);
      setLoginError(error?.message || "Could not log in with demo account");
      toast({
        title: "Error",
        description: error?.message || "Could not log in with demo account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/DNA Logo - Grey.svg" alt="DNA Health" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to DNA Health</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          {loginError && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              variant="link"
              className="text-sm text-primary p-0 h-auto"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? "Hide demo accounts" : "Show demo accounts"}
            </Button>
            
            {showDemo && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Click to sign in with a demo account:
                </p>
                {demoUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-start text-left mb-2"
                    onClick={() => handleDemoLogin(user)}
                    disabled={isLoading}
                  >
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email} ({user.role})
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                className="text-sm text-primary p-0 h-auto"
                onClick={() => navigate("/admin")}
              >
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
