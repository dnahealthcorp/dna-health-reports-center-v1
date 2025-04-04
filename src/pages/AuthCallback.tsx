
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from '@/components/ui/label';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Check if MFA is required in the URL
  const mfaRequired = searchParams.get('mfa_required') === 'true';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        // Check if MFA is required
        if (mfaRequired) {
          setRequiresMFA(true);
          setIsLoading(false);
          return;
        }

        toast({
          title: "Authentication Successful",
          description: "You have been signed in successfully.",
        });

        // Redirect to main page
        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, toast, mfaRequired]);

  const handleMFAVerification = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: 'totp', // Time-based One-Time Password
        code: verificationCode
      });

      if (error) {
        setError("Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }

      toast({
        title: "Verification Successful",
        description: "You have been verified successfully.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('MFA verification error:', error);
      setError(error.message || "Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Completing authentication...</div>
      </div>
    );
  }

  if (requiresMFA) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the verification code from your Google Authenticator app to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <InputOTP 
                maxLength={6} 
                value={verificationCode} 
                onChange={setVerificationCode}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleMFAVerification}
              disabled={verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div>Redirecting to dashboard...</div>
    </div>
  );
};

export default AuthCallback;
