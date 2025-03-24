
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { LogOut, Home, Users, Settings, Pill } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/services/databaseService";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  children: React.ReactNode;
}

export const AppSidebar = ({ children }: AppSidebarProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        // If no user is logged in, redirect to login
        if (!user && location.pathname !== "/login") {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [location.pathname, navigate]);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully"
      });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: Home
    }, 
    {
      label: "Patients",
      href: "/patients",
      icon: Users
    }
  ];

  // Only show medications & supplements section for admin
  if (currentUser?.role === 'admin') {
    navItems.push({
      label: "Medications & Supplements",
      href: "/medications",
      icon: Pill
    });
    navItems.push({
      label: "Settings",
      href: "/settings",
      icon: Settings
    });
  }

  // If not logged in, just show a loading sidebar
  if (!currentUser && location.pathname !== "/login") {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center h-16 px-6">
                <img src="/assets/DNA Logo - Grey.svg" alt="DNA Health" className="h-10 mr-2" />
                <span className="text-lg font-semibold text-brand-text">DNA Health</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <div className="animate-pulse p-4 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex-1">
            <div className="h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // For login page, don't show the sidebar
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarRail />
          <SidebarHeader>
            <div className="flex items-center h-16 px-6">
              <img src="/assets/DNA Logo - Grey.svg" alt="DNA Health" className="h-10 mr-2" />
              <span className="text-lg font-semibold text-brand-text">DNA Health</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.href}
                        tooltip={item.label}
                      >
                        <Link to={item.href} className={cn(
                          "flex items-center gap-3",
                          location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                        )}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="p-4 border-t border-border">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {currentUser?.name?.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-text">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
                </div>
              </div>
              <button 
                className="flex items-center w-full px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                onClick={handleSignOut}
              >
                <LogOut size={18} className="mr-3" />
                Sign out
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1 overflow-auto">
          <div className="container py-6 mx-auto">
            {children}
          </div>
        </SidebarInset>
        
        {/* Add a sidebar trigger button for mobile */}
        <div className="fixed right-4 top-4 z-50 md:hidden">
          <SidebarTrigger />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
