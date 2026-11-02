// Shared FastAPI client. Base URL comes from VITE_API_BASE_URL (.env).
// Demo sessions never reach the network: every request is answered in-memory
// by src/lib/mocks/demo-api.ts, which mirrors the reference paths and shapes.
import { isDemoSession, demoRole } from "@/lib/demo-auth";
import { demoApi } from "@/lib/mocks/demo-api";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";

const TOKEN_KEY = "cb-auth-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Turn a reference error body into a readable message. */
function detailFromBody(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown })?.detail;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail)) {
    const msgs = detail.map((d) => {
      const item = d as { msg?: unknown; loc?: unknown[] };
      const field = Array.isArray(item.loc) ? item.loc.filter((p) => p !== "body").join(".") : "";
      const msg = typeof item.msg === "string" ? item.msg : "";
      return field ? `${field}: ${msg}` : msg;
    }).filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }
  return fallback;
}

let redirectingToLogin = false;
function handle401() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  setToken(null);
  window.sessionStorage.removeItem("cb-demo-session");
  window.localStorage.removeItem("cb-auth-session");
  window.location.assign("/");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (isDemoSession()) return demoApi<T>(path, init, demoRole() ?? "client");

  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // FormData bodies must keep the browser-generated multipart boundary.
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check that it's running and try again.");
  }
  if (res.status === 401 && getToken()) {
    handle401();
    throw new ApiError(401, "Your session expired. Please sign in again.");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = detailFromBody(await res.json(), detail);
    } catch { /* non-JSON body */ }
    throw new ApiError(res.status, detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * Authenticated file download (attachments, Excel template). A plain link would
 * return 401 because the Authorization header can't be attached, so fetch the
 * blob and trigger a save.
 */
export async function downloadFile(path: string, fallbackName = "download"): Promise<void> {
  if (isDemoSession()) throw new ApiError(0, "Not available in demo");
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { headers });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check that it's running and try again.");
  }
  if (res.status === 401 && getToken()) {
    handle401();
    throw new ApiError(401, "Your session expired. Please sign in again.");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = detailFromBody(await res.json(), detail); } catch { /* ignore */ }
    throw new ApiError(res.status, detail || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const name = (res.headers.get("content-disposition")?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/)?.[1]) ?? fallbackName;
  a.download = decodeURIComponent(name);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
