import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, User, LogOut, Shield, Users, Menu, Eye, EyeOff, Music } from "lucide-react";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { RoleNotificationBadge } from "@/components/common/RoleNotificationBadge";
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAdmin, isMember } = useAuth();
  const { t } = useTranslation();
  const [showCode, setShowCode] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (showCode) {
      const timer = setTimeout(() => {
        setShowCode(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCode]);

  const getDisplayInfo = () => {
    if (!user) return { name: 'Usuário', code: '---', icon: User };

    if (isAdmin()) {
      const admin = user.data as any;
      return {
        name: admin.name || 'Administrador',
        code: admin.access_code,
        icon: Shield
      };
    } else {
      const member = user.data as any;
      return {
        name: member.name || 'Membro',
        code: member.member_code,
        icon: Users
      };
    }
  };

  const { name, code, icon: UserIcon } = getDisplayInfo();

  return (
    <header className="relative h-16 border-b border-cyan-500/25 
                       bg-gradient-to-r from-slate-900/95 via-cyan-950/95 to-blue-950/95 
                       backdrop-blur-xl shadow-xl shadow-cyan-500/15 sticky top-0 z-50
                       supports-[backdrop-filter]:bg-background/95">
      
      {/* Linha decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400/80 via-blue-400/80 to-cyan-400/80" />
      
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden bg-cyan-700/30 hover:bg-cyan-600/40 text-white w-11 h-11 border-2 border-cyan-400/50 hover:border-cyan-300 transition-all duration-300"
        >
          <Menu className="w-6 h-6" />
        </Button>

        {/* Logo SIGEG (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3 mr-6">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center
                          shadow-soft hover:scale-110 transition-transform duration-300 cursor-pointer">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">SIGEG-BV</span>
            <span className="text-xs text-cyan-100 leading-tight">Sistema de Gestão</span>
          </div>
        </div>

        {/* Search com efeito aprimorado */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                              text-white/70 w-4 h-4 
                              group-focus-within:text-cyan-300 transition-colors z-10" />
            <Input
              placeholder="Buscar grupos, membros..."
              className="pl-10 h-10 
                         bg-white/60 backdrop-blur-sm
                         border-2 border-primary/20
                         focus:border-primary focus:bg-white
                         focus:ring-4 focus:ring-primary/10 
                         transition-all duration-300 
                         hover:border-primary/40 hover:bg-white/80
                         placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* User info section */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <LanguageSelector />
          
          {/* Notificação de atribuições */}
          <RoleNotificationBadge />
          
          {/* Separador elegante */}
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent 
                          hidden md:block" />
          
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* User info */}
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-semibold text-white leading-tight">
                {name}
              </p>
              <div className="flex items-center justify-end space-x-1">
                <p className="text-xs text-cyan-100">Código:</p>
                {showCode ? (
                  <span className="text-xs text-white font-mono font-semibold">{code}</span>
                ) : (
                  <span className="text-xs text-cyan-100">••••••</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCode(!showCode)}
                  className="h-4 w-4 p-0 text-cyan-100 hover:text-white transition-colors"
                >
                  {showCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            
            {/* Avatar com gradiente */}
            {isMobile ? (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 gradient-primary rounded-full blur opacity-0 
                                    group-hover:opacity-75 transition-opacity duration-500" />
                    <Button variant="outline" size="icon" 
                            className="relative rounded-full w-8 h-8 border-2 
                                       border-primary/20 hover:border-primary hover:scale-110 
                                       transition-all duration-300 gradient-primary shadow-soft">
                      <UserIcon className="w-3 h-3 text-white" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 bg-background/95 backdrop-blur-xl border-primary/20
                             animate-in slide-in-from-top-2 fade-in-50 duration-300"
                  sideOffset={8}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-border/50
                                    animate-in fade-in-50 slide-in-from-left-1 duration-300 delay-75">
                      <div className="gradient-primary rounded-full w-12 h-12 flex items-center justify-center shadow-soft
                                      animate-in scale-in-95 duration-300 delay-100">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isAdmin() ? 'Administrador' : 'Membro'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2
                                    animate-in fade-in-50 slide-in-from-left-1 duration-300 delay-150">
                      <span className="text-xs text-muted-foreground">Código:</span>
                      <div className="flex items-center gap-1.5">
                        {showCode ? (
                          <span className="text-xs text-foreground font-mono font-semibold">{code}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">••••••</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCode(!showCode)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground
                                     transition-all duration-200 hover:scale-110"
                        >
                          {showCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setPopoverOpen(false);
                        toast({
                          title: "Logout realizado",
                          description: "Até logo! 👋",
                        });
                        setTimeout(() => logout(), 300);
                      }}
                      className="w-full flex items-center justify-center gap-2
                                 animate-in fade-in-50 slide-in-from-bottom-1 duration-300 delay-200
                                 transition-all hover:scale-105"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="relative group">
                <div className="absolute inset-0 gradient-primary rounded-full blur opacity-0 
                                group-hover:opacity-75 transition-opacity duration-500" />
                <Button variant="outline" size="icon" 
                        className="relative rounded-full w-10 h-10 border-2 
                                   border-primary/20 hover:border-primary hover:scale-110 
                                   transition-all duration-300 gradient-primary shadow-soft">
                  <UserIcon className="w-4 h-4 text-white" />
                </Button>
              </div>
            )}
            
            {/* Botão logout */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 
                         w-8 h-8 md:w-10 md:h-10 hidden md:flex transition-all duration-300
                         hover:scale-110 hover:rotate-12"
              title="Sair do sistema"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}