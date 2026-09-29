import { useEffect, useRef } from "react";

type UseQueueWebSocketOptions = {
  enabled?: boolean;
  path?: string;
  onOpen?: (socket: WebSocket) => void;
  onMessage?: (event: MessageEvent) => void;
};

const DEFAULT_WS_PATH = "/ws/dashboard/";
const MAX_RECONNECT_ATTEMPTS = 8;

const buildWsUrl = (path: string) => {
  const explicitWsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN as
    | string
    | undefined;

  if (explicitWsUrl) {
    const base = explicitWsUrl.endsWith("/")
      ? explicitWsUrl.slice(0, -1)
      : explicitWsUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return new URL(`${base}${cleanPath}`).toString();
  }

  if (backendOrigin) {
    const wsBase = backendOrigin.replace(/^http/i, "ws").replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return new URL(`${wsBase}${cleanPath}`).toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${protocol}//${window.location.host}${cleanPath}`).toString();
};

export const useQueueWebSocket = ({
  enabled = true,
  path = DEFAULT_WS_PATH,
  onOpen,
  onMessage,
}: UseQueueWebSocketOptions) => {
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const websocketRef = useRef<WebSocket | null>(null);

  // ✅ Store callbacks in refs so they never trigger re-runs
  const onOpenRef = useRef(onOpen);
  const onMessageRef = useRef(onMessage);

  // ✅ Keep refs updated on every render without re-running effect
  useEffect(() => {
    onOpenRef.current = onOpen;
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!enabled) return;

    let isUnmounted = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const connect = () => {
      clearReconnectTimer();

      const wsUrl = buildWsUrl(path);
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        onOpenRef.current?.(ws); // ✅ use ref, not the prop directly
      };

      ws.onmessage = (event) => {
        onMessageRef.current?.(event); // ✅ use ref
      };

      ws.onclose = () => {
        if (isUnmounted) return;

        reconnectAttemptsRef.current += 1;
        if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
          return;
        }

        const baseDelay = Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          30000,
        );
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelay + jitter;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearReconnectTimer();
      websocketRef.current?.close();
      websocketRef.current = null;
    };
  }, [enabled, path]); // ✅ only re-run if enabled or path changes
};
