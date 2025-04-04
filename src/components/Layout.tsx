
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideHome, Users, LogOut, Menu, X, Pill, Settings, UserCog } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({
  children
}: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    // If authentication check is complete and no user is logged in
    // and not on auth pages, redirect to login
    if (!isLoading && !user && 
        location.pathname !== "/login" && 
        location.pathname !== "/set-password" && 
        !location.pathname.startsWith("/auth/")) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [user, isLoading, location.pathname, navigate, toast]);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, isOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading state only while checking auth and before redirecting
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }
  
  // If no user and not on auth pages, render nothing (will redirect in useEffect)
  if (!user) {
    return null;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LucideHome,
      roles: ['nurse', 'doctor', 'admin'] // All roles can access
    }, 
    {
      label: "Patients",
      href: "/patients",
      icon: Users,
      roles: ['nurse', 'doctor', 'admin'] // All roles can access
    },
    {
      label: "Medications & Supplements",
      href: "/medications",
      icon: Pill,
      roles: ['nurse', 'doctor', 'admin'] // All roles can access
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ['admin'] // Only admin
    },
    {
      label: "User Management",
      href: "/user-management",
      icon: UserCog,
      roles: ['admin'] // Only admin
    }
  ];
  
  // Filter nav items based on user role
  const allowedNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Nav Toggle */}
      {isMobile && (
        <button 
          className="fixed z-50 top-4 right-4 p-2 rounded-full bg-primary text-white shadow-md" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out", 
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and app name */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <img src="/assets/DNA Logo - Grey.svg" alt="DNA Health" className="h-10 mr-2" />
            <span className="text-lg font-semibold text-brand-text">DNA Health</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {allowedNavItems.map(item => (
              <Link 
                key={item.href} 
                to={item.href} 
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-lg transition-colors text-left w-full", 
                  location.pathname === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-brand-text hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "mr-3", 
                    location.pathname === item.href 
                      ? "text-primary" 
                      : "text-brand-text/70"
                  )} 
                />
                <span className="text-left">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            {user && (
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {user.name?.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-text">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize text-left">{user.role}</p>
                </div>
              </div>
            )}
            <button 
              className="flex items-center w-full px-4 py-2 text-sm text-left rounded-lg text-brand-text/70 hover:bg-accent hover:text-foreground transition-colors" 
              onClick={handleSignOut}
            >
              <LogOut size={18} className="mr-3 text-brand-text/70" />
              <span className="text-left">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Main content */}
      <main className={cn("flex-1 overflow-auto transition-all duration-300 ease-in-out", !isMobile && "ml-64")}>
        <div className="container py-6 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
