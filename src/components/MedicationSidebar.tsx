
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Users, Pill, Stethoscope, FileText, Settings } from 'lucide-react';

export const MedicationSidebar = () => {
  const location = useLocation();
  
  // Navigation items for the sidebar
  const navItems = [
    { title: 'Dashboard', path: '/', icon: Home },
    { title: 'Patients', path: '/patients', icon: Users },
    { title: 'Medications', path: '/medications', icon: Pill },
    { title: 'Supplements', path: '/supplements', icon: Stethoscope },
    { title: 'Forms', path: '/forms', icon: FileText },
    { title: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-4 py-2">DNA Health</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/medications' && location.pathname.includes('/medications')) ||
                (item.path === '/supplements' && location.pathname.includes('/supplements'));
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={isActive ? 'bg-primary text-primary-foreground' : ''}>
                    <Link to={item.path}>
                      <item.icon className="w-5 h-5 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
