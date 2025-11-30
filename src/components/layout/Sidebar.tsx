import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Home, 
  Settings, 
  Music, 
  UserPlus, 
  LogOut,
  X,
  Shield,
  FileText,
  Briefcase,
  MessageCircle
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ className, isOpen, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const permissions = usePermissions();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleRestrictedClick = (label: string) => {
    toast({
      title: t('sidebar.accessDenied'),
      description: t('sidebar.onlyAdmins'),
      variant: "destructive",
    });
  };

  const navigationItems = [
    { icon: Home, label: t('navigation.home'), href: "/", show: true },
    { icon: Users, label: t('navigation.groups'), href: "/groups", show: true },
    { icon: UserPlus, label: t('navigation.newMember'), href: "/members/new", show: permissions.canAccessNewMember },
    { icon: Briefcase, label: t('navigation.services'), href: "/services", show: true },
    { 
      icon: FileText, 
      label: t('navigation.reports'), 
      href: "/reports", 
      show: true,
      restricted: !permissions.canAccessReports,
      onClick: !permissions.canAccessReports ? () => handleRestrictedClick(t('navigation.reports')) : undefined
    },
    { 
      icon: Shield, 
      label: t('navigation.admin'), 
      href: "/admin", 
      show: true,
      restricted: !permissions.canAccessAdmins,
      onClick: !permissions.canAccessAdmins ? () => handleRestrictedClick(t('navigation.admin')) : undefined
    },
    { 
      icon: Settings, 
      label: t('navigation.settings'), 
      href: "/settings", 
      show: true,
      restricted: !permissions.canAccessSettings,
      onClick: !permissions.canAccessSettings ? () => handleRestrictedClick(t('navigation.settings')) : undefined
    },
    { icon: MessageCircle, label: t('navigation.contact'), href: "/contact", show: true },
  ].filter(item => item.show);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full bg-gradient-to-b from-slate-900/95 via-cyan-950/95 to-blue-950/95 backdrop-blur-md border-r border-cyan-500/25 shadow-soft transition-all duration-300",
        "w-[75vw] max-w-[280px] lg:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30 bg-cyan-900/40">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white">SIGEG</span>
              <span className="text-xs text-cyan-100">Sistema de Gestão</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="transition-smooth lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-smooth hover:bg-cyan-800/35 px-4 text-white border-l-4 border-transparent text-base",
                location.pathname === item.href && "bg-cyan-700/50 border-l-4 border-cyan-400 text-white font-medium"
              )}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (!item.restricted) {
                  navigate(item.href);
                  onOpenChange(false);
                }
              }}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="ml-3 text-base">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-400/30">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-4 text-base"
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className="ml-3 text-base">{t('auth.logout')}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
