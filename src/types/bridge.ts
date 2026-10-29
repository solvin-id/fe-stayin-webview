export type NativeBridgeAction =
  | { type: 'CLOSE_WEBVIEW' }
  | { type: 'NAVIGATE_BACK'; canGoBack: boolean }
  | { type: 'OPEN_DEEP_LINK'; url: string }
  | { type: 'BOOKING_SUCCESS'; bookingId: string }
  | { type: 'SHARE_VOUCHER'; text: string; url: string };

export interface NativeBridgeHandler {
  postMessage: (message: string) => void;
}

export interface AlfaTeveWindow extends Window {
  AlfaTeveBridge?: NativeBridgeHandler;
  AndroidBridge?: NativeBridgeHandler;
  webkit?: {
    messageHandlers?: {
      AlfaTeveBridge?: {
        postMessage: (payload: string) => void;
      };
    };
  };
}

export type CloseWebviewTarget = 'native' | 'browser';
