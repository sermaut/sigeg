import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  require?: keyof ReturnType<typeof usePermissions>;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, require, fallback = null }: PermissionGuardProps) {
  const permissions = usePermissions();
  
  if (!require) {
    return <>{children}</>;
  }
  
  const hasPermission = permissions[require];
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
