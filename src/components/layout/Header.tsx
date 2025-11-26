import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, User, LogOut, Shield, Users, Menu, Eye, EyeOff, Music, RefreshCw } from "lucide-react";
import { getRoleLabel } from "@/lib/memberHelpers";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { RoleNotificationBadge } from "@/components/common/RoleNotificationBadge";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { useTranslation } from 'react-i18next';
import { useCacheClearer } from "@/lib/cacheUtils";
import { InlineLoader } from "@/components/common/LoadingIndicators";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAdmin, isMember, isGroup } = useAuth();
  const { t } = useTranslation();
  const { clearCache, isClearing } = useCacheClearer();
  const [showCode, setShowCode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

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
    } else if (isGroup?.()) {
      const group = user.data as any;
      return {
        name: group.name || 'Grupo',
        code: group.access_code,
        icon: Music
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

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setDialogOpen(true);
    }, 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

        {/* Global Search */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <GlobalSearch />
        </div>

        {/* User info section */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Notification Center */}
          <NotificationCenter />
          
          <LanguageSelector />
          
          {/* Notificação de atribuições */}
          <RoleNotificationBadge />
          
          {/* Separador elegante */}
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent 
                          hidden md:block" />
          
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* User info - Desktop */}
            <div className="text-right hidden md:block">
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
            
            {/* Avatar com Dialog - Click ou Hover */}
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-full blur opacity-0 
                              group-hover:opacity-75 transition-opacity duration-500" />
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="relative rounded-full w-8 h-8 md:w-10 md:h-10 border-2 
                               border-red-500 hover:border-red-400 hover:scale-110 
                               transition-all duration-300 bg-primary shadow-soft"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <UserIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-base font-bold">Informações da Sessão</DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex flex-col gap-3 py-2">
                    {/* Avatar e Nome */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 border-2 border-primary shadow-lg">
                        <AvatarImage 
                          src={user?.type === 'member' ? (user.data as any).profile_image_url : undefined}
                          alt={name}
                        />
                        <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold">{name}</h3>
                        <p className="text-xs text-muted-foreground capitalize font-medium">
                          {isAdmin() ? 'Administrador' : isGroup?.() ? 'Grupo' : 'Membro'}
                        </p>
                        {isMember() && (user.data as any).role && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {getRoleLabel((user.data as any).role)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Código com toggle visibility */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Código de Acesso
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-lg border-2 bg-muted/30 px-2.5 py-1.5 font-mono text-xs font-semibold">
                          {showCode ? code : '••••••'}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowCode(!showCode)}
                          className="h-8 w-8 rounded-lg border-2"
                        >
                          {showCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Botões de ação em linha */}
                    <div className="flex gap-1.5 pt-1">
                      <Button 
                        onClick={() => setDialogOpen(false)} 
                        variant="outline"
                        className="flex-1 rounded-lg h-9 text-xs font-semibold bg-blue-500/10 border-2 border-blue-500 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Fechar
                      </Button>
                      <Button 
                        onClick={async () => {
                          await clearCache();
                          setDialogOpen(false);
                        }} 
                        variant="outline"
                        className="flex-1 rounded-lg border-2 h-9 text-xs font-semibold bg-green-500/10 border-green-500 text-green-600 hover:bg-green-500/20 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <>
                            <InlineLoader className="mr-1" />
                            <span className="hidden sm:inline">Limpando...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Cache</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => {
                          logout();
                          setDialogOpen(false);
                        }} 
                        variant="destructive"
                        className="flex-1 rounded-lg h-9 text-xs font-semibold"
                      >
                        <LogOut className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Sair</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Botão limpar cache - Desktop */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={clearCache}
              disabled={isClearing}
              className="text-white hover:text-cyan-100 hover:bg-cyan-700/30 
                         w-8 h-8 md:w-10 md:h-10 hidden md:flex transition-all duration-300
                         hover:scale-110 hover:rotate-12 disabled:opacity-50 disabled:cursor-not-allowed
                         relative group"
              title={isClearing ? "Limpando cache..." : "Limpar cache do aplicativo"}
            >
              {isClearing ? (
                <InlineLoader className="text-white" />
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:rotate-180 duration-500" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Button>
            
            {/* Botão logout - Desktop */}
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