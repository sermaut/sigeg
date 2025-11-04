import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Home, 
  Settings, 
  Music, 
  UserPlus, 
  BarChart3,
  LogOut,
  X,
  Shield,
  CreditCard
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ className, isOpen, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Users, label: "Grupos", href: "/groups" },
    { icon: UserPlus, label: "Novo Grupo", href: "/groups/new" },
    { icon: CreditCard, label: "Planos Mensais", href: "/plans" },
    { icon: Music, label: "Serviços Musicais", href: "/services" },
    { icon: BarChart3, label: "Relatórios", href: "/reports" },
  ];

  // Add admin management for users with permission
  if (hasPermission('manage_admins')) {
    navigationItems.push({ icon: Shield, label: "Administradores", href: "/admin" });
  }

  navigationItems.push({ icon: Settings, label: "Configurações", href: "/settings" });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full bg-gradient-to-b from-purple-900/92 via-violet-950/92 to-purple-950/92 backdrop-blur-md border-r border-purple-400/25 shadow-soft transition-all duration-300",
        "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-400/30 bg-purple-900/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white">SIGEG</span>
              <span className="text-xs text-purple-100">Sistema de Gestão</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="transition-smooth lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-smooth hover:bg-purple-600/30 px-4 text-white",
                location.pathname === item.href && "bg-purple-600/45 text-white font-medium animate-pulse"
              )}
              onClick={() => {
                navigate(item.href);
                onOpenChange(false); // Close sidebar on mobile after navigation
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-purple-400/30">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-4"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="ml-3">Sair</span>
          </Button>
        </div>
      </div>
    </>
  );
}