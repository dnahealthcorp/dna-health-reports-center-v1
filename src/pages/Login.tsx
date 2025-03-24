
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { loginUser, getUsers } from "@/services/databaseService";
import { User } from "@/types";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch demo users on mount
  useState(() => {
    const fetchUsers = async () => {
      const users = await getUsers();
      setDemoUsers(users || []);
    };
    
    fetchUsers();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await loginUser(email, password);
      
      if (user) {
        toast({
          title: "Success",
          description: `Welcome back, ${user.name}!`
        });
        
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = async (demoUser: User) => {
    setIsLoading(true);
    
    try {
      const user = await loginUser(demoUser.email, "password");
      
      if (user) {
        toast({
          title: "Success",
          description: `Welcome to demo account, ${user.name}!`
        });
        
        navigate("/");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      toast({
        title: "Error",
        description: "Could not log in with demo account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/DNA Logo - Grey.svg" alt="DNA Health" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to DNA Health</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
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
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? "Hide demo accounts" : "Show demo accounts"}
            </button>
            
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
