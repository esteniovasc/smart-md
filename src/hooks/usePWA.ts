import { useEffect, useState } from 'react';

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
}

/**
 * Hook para gerenciar estado PWA
 * Detecta se a app é instalável, está instalada e online
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    // Listener para app instalada
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      setDeferredPrompt(null);
    };

    // Listener para online/offline
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    // Verificar se já está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setState((prev) => ({ ...prev, isInstalled: true }));
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
    }

    setDeferredPrompt(null);
  };

  return {
    ...state,
    installApp,
  };
}
