import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  minLevel?: number;
  fallback?: string;
}

export function ProtectedRoute({ 
  children, 
  permission, 
  minLevel, 
  fallback = '/auth' 
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, getPermissionLevel } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não possui permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  // Check minimum permission level
  if (minLevel && getPermissionLevel() > minLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Nível Insuficiente</h2>
          <p className="text-muted-foreground">
            Seu nível de acesso não permite visualizar este conteúdo.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}