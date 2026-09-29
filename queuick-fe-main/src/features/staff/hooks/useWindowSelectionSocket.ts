import { useEffect, useRef } from "react";
import type {
  WindowSelectionStatus,
  WindowSelectionWindow,
} from "@/features/staff/api";
import { useWindowSelectionStore } from "@/store/windowSelectionStore";

interface WindowStatusUpdateMessage {
  type: "window_status_update";
  data?: {
    service_id?: number;
    windows?: Array<Partial<WindowSelectionWindow>>;
  };
}

interface UseWindowSelectionSocketOptions {
  serviceId?: number;
  enabled?: boolean;
  onWindowsUpdate?: (windows: WindowSelectionWindow[]) => void;
}

const MAX_RECONNECT_ATTEMPTS = 8;
const MAX_RECONNECT_DELAY_MS = 15_000;

const toWsUrl = (serviceId: number) => {
  const path = `/ws/service/${serviceId}/windows/`;
  const explicitWsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN as
    | string
    | undefined;

  if (explicitWsUrl) {
    const base = explicitWsUrl.endsWith("/")
      ? explicitWsUrl.slice(0, -1)
      : explicitWsUrl;
    return new URL(`${base}${path}`).toString();
  }

  if (backendOrigin) {
    const wsBase = backendOrigin.replace(/^http/i, "ws").replace(/\/$/, "");
    return new URL(`${wsBase}${path}`).toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new URL(`${protocol}//${window.location.host}${path}`).toString();
};

const normalizeWindow = (
  windowData: Partial<WindowSelectionWindow>,
): WindowSelectionWindow => {
  const status = (windowData.status as WindowSelectionStatus) ?? "inactive";
  const isInUse =
    typeof windowData.is_in_use === "boolean" ? windowData.is_in_use : false;
  return {
    id: Number(windowData.id ?? 0),
    name: String(windowData.name ?? ""),
    number: Number(
      windowData.number ??
        (
          windowData as Partial<WindowSelectionWindow> & {
            window_number?: number;
          }
        ).window_number ??
        0,
    ),
    status,
    is_in_use: isInUse,
    is_available:
      typeof windowData.is_available === "boolean"
        ? windowData.is_available
        : status === "active" && !isInUse,
    claimed_by: windowData.claimed_by ?? null,
    current_staff_name:
      typeof windowData.current_staff_name === "string" ||
      windowData.current_staff_name === null
        ? windowData.current_staff_name
        : undefined,
    current_staff:
      typeof windowData.current_staff === "number" ||
      windowData.current_staff === null
        ? windowData.current_staff
        : undefined,
  };
};

export const useWindowSelectionSocket = ({
  serviceId,
  enabled = true,
  onWindowsUpdate,
}: UseWindowSelectionSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  // true while we are intentionally closing (unmount / serviceId change).
  // onclose should NOT schedule reconnect when this is true.
  const manualCloseRef = useRef(false);

  // Keep the callback in a ref so it never appears in effect deps.
  // The socket effect only reads from this ref, so changing the callback
  // does not tear down and recreate the WebSocket.
  const onWindowsUpdateRef = useRef(onWindowsUpdate);
  useEffect(() => {
    onWindowsUpdateRef.current = onWindowsUpdate;
  }); // intentionally no dep array – update on every render

  // Zustand setters are stable (created once by the store), but we read
  // them once here and use them inside the effect via closure.
  const { setWindows, setSocketState, setError } = useWindowSelectionStore();

  useEffect(() => {
    if (!enabled || !serviceId) {
      return;
    }

    const wsUrl = toWsUrl(serviceId);

    // Guard: do not create a second socket for the same service while one
    // is already OPEN or in the process of connecting.
    const existing = wsRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Mark this effect run as intentional (not a manual close yet).
    manualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeSocketManually = () => {
      if (manualCloseRef.current) {
        return;
      }

      manualCloseRef.current = true;
      clearReconnectTimer();

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (manualCloseRef.current) {
        // Intentional close – do not reconnect.
        return;
      }

      clearReconnectTimer();
      reconnectAttemptsRef.current += 1;

      if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
        setSocketState(false, false);
        setError("Window connection offline. Please refresh to reconnect.");
        return;
      }

      const delay =
        Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          MAX_RECONNECT_DELAY_MS,
        ) + Math.floor(Math.random() * 500);

      setSocketState(false, true);
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    };

    const connect = () => {
      if (manualCloseRef.current) {
        return;
      }

      // Another guard inside the reconnect path.
      const cur = wsRef.current;
      if (
        cur &&
        (cur.readyState === WebSocket.OPEN ||
          cur.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setSocketState(false, reconnectAttemptsRef.current > 0);

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setSocketState(true, false);
        setError(null);
        ws.send(JSON.stringify({ type: "refresh" }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(
            String(event.data),
          ) as WindowStatusUpdateMessage;
          if (payload?.type !== "window_status_update") {
            return;
          }

          const windows = (payload.data?.windows ?? []).map(normalizeWindow);
          setWindows(windows);
          // Read from ref – calling the latest version of the callback
          // without putting it in effect deps.
          onWindowsUpdateRef.current?.(windows);
        } catch {
          setError("Received malformed realtime update for windows.");
        }
      };

      ws.onerror = () => {
        // onerror is always followed by onclose, so close and let onclose
        // decide whether to reconnect.
        ws.close();
      };

      ws.onclose = () => {
        setSocketState(false, !manualCloseRef.current);
        scheduleReconnect();
      };
    };

    connect();

    const handleBeforeUnload = () => {
      closeSocketManually();
    };

    const handlePageHide = () => {
      closeSocketManually();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    // Cleanup: runs on unmount OR when serviceId/enabled changes.
    // Setting manualCloseRef prevents onclose from scheduling a reconnect.
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      closeSocketManually();
      setSocketState(false, false);
    };
    // Effect ONLY re-runs when the service we are watching changes.
    // Callbacks and Zustand setters must NOT be here – they change every
    // render and would tear down the socket on each state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, serviceId]);
};
