
import { useState, useRef, useEffect } from 'react';

export type InstallState = 'can-install' | 'ios-hint' | 'installed' | 'not-available';

export const useInstallPrompt = () => {
  const [installState, setInstallState] = useState<InstallState>('not-available');
  const installPromptRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('installed');
      return;
    }
    
    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e;
      setInstallState('can-install');
    };
    
    const appInstalledHandler = () => {
      setInstallState('installed');
      installPromptRef.current = null;
    };
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('ios-hint');
    }
    
    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);
    
    if (installState === 'ios-hint' && localStorage.getItem('ios-install-dismissed') === 'true') {
      setInstallState('not-available');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, [installState]);

  const promptInstall = async () => {
    if (installState === 'can-install' && installPromptRef.current) {
      try {
        await installPromptRef.current.prompt();
        const choiceResult = await installPromptRef.current.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setInstallState('installed');
        }
        installPromptRef.current = null;
      } catch (err) {
        console.error('Error prompting install:', err);
      }
    }
  };

  const dismissIOSHint = () => {
    if (installState === 'ios-hint') {
      setInstallState('not-available');
      localStorage.setItem('ios-install-dismissed', 'true');
    }
  };

  return { installState, promptInstall, dismissIOSHint };
};

