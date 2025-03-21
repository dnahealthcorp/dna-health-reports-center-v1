
import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user && window.location.pathname !== "/login") {
        navigate('/login');
      }
      setCheckingAuth(false);
    }
  }, [user, isLoading, navigate]);

  if (isLoading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
