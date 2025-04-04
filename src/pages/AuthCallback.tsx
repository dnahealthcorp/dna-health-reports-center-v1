
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the OAuth callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
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
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-lg">Completing authentication...</div>
    </div>
  );
};

export default AuthCallback;
