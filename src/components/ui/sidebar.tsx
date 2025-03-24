
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Settings,
  PillIcon,
  Home,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-background border-r h-full w-64 fixed left-0 top-16 p-4">
      <div className="space-y-2">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          text="Dashboard"
          to="/"
          active={isActive("/")}
        />
        <SidebarItem
          icon={<Users className="h-5 w-5" />}
          text="Patients"
          to="/patients"
          active={isActive("/patients")}
        />
        <SidebarItem
          icon={<FileText className="h-5 w-5" />}
          text="Forms"
          to="/forms"
          active={isActive("/forms")}
        />
        <SidebarItem
          icon={<PillIcon className="h-5 w-5" />}
          text="Medications"
          to="/medications"
          active={isActive("/medications")}
        />
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          text="Settings"
          to="/settings"
          active={isActive("/settings")}
        />
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active: boolean;
}

const SidebarItem = ({ icon, text, to, active }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
};

export default Sidebar;
