
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";

interface MFASetupProps {
  userId: string;
}

const MFASetup = ({ userId }: MFASetupProps) => {
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if MFA is already enabled
  useEffect(() => {
    const checkMFAStatus = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;
        
        // Check if MFA is already set up
        setIsMFAEnabled(data.currentLevel === 'aal2');
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking MFA status:', error);
        setIsLoading(false);
      }
    };

    checkMFAStatus();
  }, [userId]);

  const startMFASetup = async () => {
    try {
      setIsSettingUp(true);
      setError(null);

      // Start the MFA enrollment process
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp', // Time-based One-Time Password
      });

      if (error) throw error;

      // Display the QR code and secret
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (error: any) {
      console.error('Error setting up MFA:', error);
      setError(error.message || "Failed to set up MFA. Please try again.");
      setIsSettingUp(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verify the code and complete enrollment
      const { error } = await supabase.auth.mfa.challenge({
        factorId: 'totp',
        code: verificationCode,
      });

      if (error) {
        setError("Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }

      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });

      setIsMFAEnabled(true);
      setIsSettingUp(false);
    } catch (error: any) {
      console.error('Error verifying MFA code:', error);
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Unenroll from MFA
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: 'totp',
      });

      if (error) throw error;

      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled.",
      });

      setIsMFAEnabled(false);
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading MFA settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Secure your account with Google Authenticator
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSettingUp ? (
          <div className="flex items-center space-x-4">
            <Switch
              checked={isMFAEnabled}
              disabled={isLoading}
              onCheckedChange={(checked) => {
                if (checked) {
                  startMFASetup();
                } else {
                  disableMFA();
                }
              }}
            />
            <div>
              <p className="font-medium">
                {isMFAEnabled ? "Two-factor authentication is enabled" : "Enable two-factor authentication"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isMFAEnabled
                  ? "Your account is protected with Google Authenticator"
                  : "Add an extra layer of security to your account"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-center text-sm">
                Scan this QR code with your Google Authenticator app, or enter the setup key manually.
              </p>
              {qrCode && (
                <div className="bg-white p-4 rounded-md">
                  <img src={qrCode} alt="QR Code for Google Authenticator" className="w-48 h-48" />
                </div>
              )}
              {secret && (
                <div className="text-center">
                  <p className="text-sm font-medium">Setup key:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{secret}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
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
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSettingUp(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={verifyAndEnableMFA}
                disabled={verificationCode.length !== 6 || isLoading}
              >
                {isLoading ? "Verifying..." : "Verify and Enable"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;
