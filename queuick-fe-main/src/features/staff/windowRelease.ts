export const CLAIMED_WINDOW_ID_STORAGE_KEY = "claimed_window_id";

const getReleaseEndpointUrl = () => {
  const fallbackPath = "/api/sessions/release";
  const apiBase =
    (import.meta.env.VITE_API_URL as string | undefined) || "/api/";

  try {
    const resolvedBase = new URL(apiBase, window.location.origin);
    const normalizedPath = resolvedBase.pathname.endsWith("/")
      ? resolvedBase.pathname
      : `${resolvedBase.pathname}/`;

    return `${resolvedBase.origin}${normalizedPath}sessions/release`;
  } catch {
    return new URL(fallbackPath, window.location.origin).toString();
  }
};

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const toNumberOrNull = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const readClaimedWindowIdFromSession = (): number | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return toNumberOrNull(
    window.sessionStorage.getItem(CLAIMED_WINDOW_ID_STORAGE_KEY),
  );
};

export const writeClaimedWindowIdToSession = (windowId: number | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (windowId == null) {
    window.sessionStorage.removeItem(CLAIMED_WINDOW_ID_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(
    CLAIMED_WINDOW_ID_STORAGE_KEY,
    String(windowId),
  );
};

export const sendReleaseBeacon = (windowId: number): boolean => {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    typeof navigator.sendBeacon !== "function"
  ) {
    return false;
  }

  const payload = JSON.stringify({ window_id: windowId });
  const body = new Blob([payload], { type: "application/json" });
  return navigator.sendBeacon(getReleaseEndpointUrl(), body);
};

export const sendReleaseKeepalive = (windowId: number): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const csrf = readCookie("csrftoken");
  if (csrf) {
    headers["X-CSRFToken"] = csrf;
  }

  // keepalive requests are best-effort during unload and cannot be awaited.
  fetch(getReleaseEndpointUrl(), {
    method: "POST",
    keepalive: true,
    credentials: "include",
    headers,
    body: JSON.stringify({ window_id: windowId }),
  }).catch(() => {
    // ignore - unload path is fire-and-forget
  });

  return true;
};
