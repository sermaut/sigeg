import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado com sucesso');
      // Verificar atualizações a cada 60 minutos
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Erro ao registrar Service Worker:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: "🎉 Nova versão disponível!",
        description: "Uma atualização do SIGEG-BV está pronta para instalar.",
        action: (
          <Button 
            size="sm"
            onClick={() => updateServiceWorker(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Atualizar Agora
          </Button>
        ),
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
