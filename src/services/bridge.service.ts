import type {
  AlfaTeveWindow,
  CloseWebviewTarget,
  NativeBridgeAction,
} from '@/types/bridge';

const getHostWindow = (): AlfaTeveWindow | null =>
  typeof window === 'undefined' ? null : (window as AlfaTeveWindow);

const hasNativeBridge = (host: AlfaTeveWindow): boolean =>
  Boolean(
    host.AlfaTeveBridge?.postMessage ||
      host.AndroidBridge?.postMessage ||
      host.webkit?.messageHandlers?.AlfaTeveBridge?.postMessage
  );

export const isEmbedded = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.parent !== window;
};

export const sendToNativeApp = (payload: NativeBridgeAction): boolean => {
  const host = getHostWindow();
  if (!host) {
    return false;
  }

  const message = JSON.stringify(payload);

  if (host.AlfaTeveBridge?.postMessage) {
    host.AlfaTeveBridge.postMessage(message);
    return true;
  }

  if (host.AndroidBridge?.postMessage) {
    host.AndroidBridge.postMessage(message);
    return true;
  }

  if (host.webkit?.messageHandlers?.AlfaTeveBridge?.postMessage) {
    host.webkit.messageHandlers.AlfaTeveBridge.postMessage(message);
    return true;
  }

  if (host.parent !== host) {
    host.parent.postMessage(payload, '*');
    return true;
  }

  return false;
};

export const closeWebview = (): CloseWebviewTarget => {
  const host = getHostWindow();
  if (!host) {
    return 'browser';
  }

  const nativeAvailable = hasNativeBridge(host);

  if (nativeAvailable) {
    sendToNativeApp({ type: 'CLOSE_WEBVIEW' });
  }

  host.parent.postMessage({ action: 'close_webview' }, '*');

  return nativeAvailable ? 'native' : 'browser';
};
