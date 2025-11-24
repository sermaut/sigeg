import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Verificar se usuário já ignorou nesta sessão
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        // Mostrar prompt após 30 segundos de uso
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (showPrompt && deferredPrompt) {
      toast({
        title: "📱 Instalar SIGEG-BV",
        description: "Instale o aplicativo no seu dispositivo para acesso mais rápido e offline!",
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  
                  if (outcome === 'accepted') {
                    toast({
                      title: "✅ Instalado com sucesso!",
                      description: "SIGEG-BV foi adicionado à tela inicial.",
                    });
                  }
                  
                  setDeferredPrompt(null);
                  setShowPrompt(false);
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                sessionStorage.setItem('pwa-install-dismissed', 'true');
                setShowPrompt(false);
              }}
            >
              Agora não
            </Button>
          </div>
        ),
        duration: Infinity,
      });
      
      setShowPrompt(false);
    }
  }, [showPrompt, deferredPrompt]);

  return null;
}
