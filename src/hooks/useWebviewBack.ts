'use client';

import { useEffect, useRef } from 'react';

interface WebviewBackOptions {
  enabled: boolean;
  atRoot: boolean;
  onBack: () => void;
  onExit: () => void;
}

export const useWebviewBack = ({
  enabled,
  atRoot,
  onBack,
  onExit,
}: WebviewBackOptions): void => {
  const handlersRef = useRef({ atRoot, onBack, onExit });
  handlersRef.current = { atRoot, onBack, onExit };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.history.pushState({ stayinGuard: true }, '');

    const handlePopState = () => {
      const handlers = handlersRef.current;
      if (handlers.atRoot) {
        handlers.onExit();
        return;
      }
      handlers.onBack();
      window.history.pushState({ stayinGuard: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled]);
};
