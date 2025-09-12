import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            {t('common.error')}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('messages.errorGeneral')}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-mono">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="flex-1"
          >
            Recarregar página
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error caught by boundary:', error, errorInfo);
        }
        
        // Here you could send error to logging service
        // Example: logError(error, errorInfo);
      }}
      onReset={() => {
        // Clear any error state when resetting
        window.location.hash = '';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}