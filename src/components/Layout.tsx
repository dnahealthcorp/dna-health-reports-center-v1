
import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    // Only handle redirect if not already redirecting, loading has completed,
    // and we haven't tried to redirect too many times (to prevent loops)
    if (!redirecting && !isLoading && redirectAttempts < 5) {
      if (!user && location.pathname !== "/login") {
        console.log("No user detected, redirecting to login");
        setRedirecting(true);
        navigate('/login');
        
        // Increment redirect attempts
        setRedirectAttempts(prev => prev + 1);
        
        // Reset redirecting state after a short delay
        setTimeout(() => {
          setRedirecting(false);
        }, 1000);
      }
    }
  }, [user, isLoading, navigate, location.pathname, redirecting, redirectAttempts]);

  // Show loading state during initial authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show a minimal loading state to prevent flashing content
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If we're not loading and have no user, don't render the layout
  // This prevents flashing the layout before redirecting to login
  if (!user && location.pathname !== "/login") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // For login page, render just the content without sidebar
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  // For authenticated pages with user, render the full layout
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8 pt-6 md:ml-64">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
