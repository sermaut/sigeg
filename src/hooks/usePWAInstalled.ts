import { useState, useEffect } from 'react';

export function usePWAInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se está em standalone mode (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone || isIOSStandalone);
  }, []);

  return isInstalled;
}
