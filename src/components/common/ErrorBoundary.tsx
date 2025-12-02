import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };
  
  const clearCacheAndRetry = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
      console.log('Cache limpo com sucesso');
      window.location.href = '/auth';
    } catch (err) {
      console.error('Erro ao limpar cache:', err);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            Ocorreu um erro
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Verifique a sua ligação e recarrega a página.
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
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={clearCacheAndRetry}
            variant="default"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar cache e voltar ao login
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
