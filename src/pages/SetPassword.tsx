import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract token from URL
  const token = searchParams.get("token") || "";
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Verify the token is valid by trying to get user info
        const { data, error } = await supabase.auth.getUser(token);
        
        if (error || !data.user) {
          console.error("Invalid or expired token:", error);
          setIsValidToken(false);
          toast({
            title: "Invalid Invitation",
            description: "This invitation link is invalid or has expired.",
            variant: "destructive"
          });
          return;
        }
        
        // Set email from token data
        setEmail(data.user.email || "");
        
        // Try to get user invitation data
        const { data: invitationData, error: invitationError } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('email', data.user.email)
          .maybeSingle();
          
        if (invitationError) {
          console.error("Error fetching invitation data:", invitationError);
        } else if (invitationData) {
          // Pre-fill name if available from invitation
          setName(data.user.user_metadata?.name || "");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsValidToken(false);
        toast({
          title: "Error",
          description: "Could not verify invitation link.",
          variant: "destructive"
        });
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setIsValidToken(false);
    }
  }, [token, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidToken) {
      return;
    }
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter and confirm your password.",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the user's password and profile information using the token directly
      const { data, error } = await supabase.auth.updateUser({
        password,
        data: { 
          name: name
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Get the role from the invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('user_invitations')
        .select('role')
        .eq('email', email)
        .maybeSingle();
        
      if (invitationError) {
        console.error("Error fetching invitation:", invitationError);
      }
      
      toast({
        title: "Success",
        description: "Your password has been set successfully."
      });
      
      // Sign in the user with their new credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error("Sign-in error:", signInError);
        toast({
          title: "Warning",
          description: "Password set successfully, but automatic login failed. Please login manually.",
          variant: "destructive"
        });
        navigate("/login");
      } else {
        toast({
          title: "Welcome",
          description: "You have been logged in successfully."
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Set password error:", error);
      toast({
        title: "Error",
        description: `Failed to set password: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/DNA Logo - Grey.svg" alt="DNA Health" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight">Complete Your Registration</h1>
          <p className="text-muted-foreground mt-1">Set your password to get started</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Setting Password..." : "Set Password & Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetPassword;
