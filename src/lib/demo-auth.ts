import { useSyncExternalStore } from "react";
import { apiFetch, getToken, setToken } from "@/lib/api/client";
import { SESSION_KEY, type AuthSession } from "@/lib/auth/session";
import { resetDemoApi } from "@/lib/mocks/demo-api";
import type { UserOut } from "@/lib/types";

export type DemoRole = "client" | "superadmin";

export interface DemoAccount {
  id: string;
  role: DemoRole;
  name: string;
  title: string;
  email: string;
  company: string;
  initials: string;
  home: "/dashboard" | "/internal";
}

export const DEMO_ACCOUNTS: Record<DemoRole, DemoAccount> = {
  client: {
    id: "u_001",
    role: "client",
    name: "Jordan Avery",
    title: "Client",
    email: "jordan.avery@brightpath.co",
    company: "BrightPath Ventures",
    initials: "JA",
    home: "/dashboard",
  },
  superadmin: {
    id: "u_admin",
    role: "superadmin",
    name: "Leandre John Sabado",
    title: "SuperAdmin",
    email: "leandrejs@cyberbacker.com",
    company: "Cyberbacker",
    initials: "LS",
    home: "/internal",
  },
};

const SESSION_STORAGE_KEY = "cb-auth-session";
const DEMO_KEY = "cb-demo-session"; // sessionStorage: { mode: "demo", role }
const LEGACY_DEMO_KEY = "cb-demo-account"; // pre-demo-mode storage; cleaned up
const EVENT = "cb-demo-account-change";

function readSessionRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as AuthSession;
    return s.role === "client" || s.role === "superadmin" ? s : null;
  } catch {
    return null;
  }
}

interface DemoSession {
  mode: "demo";
  role: DemoRole;
}

function readDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSession;
    return parsed?.mode === "demo" && (parsed.role === "client" || parsed.role === "superadmin") ? parsed : null;
  } catch {
    return null;
  }
}

/** True while a front-end-only demo session is active (no token, no backend calls). */
export function isDemoSession(): boolean {
  return readDemoSession() !== null;
}

/** The active demo role, or null outside demo mode. */
export function demoRole(): DemoRole | null {
  return readDemoSession()?.role ?? null;
}

export function readDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const session = parseSession(readSessionRaw());
  if (session) return session.role;
  const demo = readDemoSession();
  if (demo) return demo.role;
  // Migrate the pre-demo-mode localStorage flag.
  const legacy = window.localStorage.getItem(LEGACY_DEMO_KEY);
  if (legacy === "client" || legacy === "superadmin") {
    window.sessionStorage.setItem(DEMO_KEY, JSON.stringify({ mode: "demo", role: legacy }));
    window.localStorage.removeItem(LEGACY_DEMO_KEY);
    return legacy;
  }
  return null;
}

function demoRoleFromSessionStorage(): DemoRole | null {
  const demo = readDemoSession();
  return demo?.role ?? null;
}

export function selectDemoRole(role: DemoRole) {
  setToken(null);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_DEMO_KEY);
  window.sessionStorage.setItem(DEMO_KEY, JSON.stringify({ mode: "demo", role }));
  resetDemoApi();
  window.dispatchEvent(new Event(EVENT));
}

/** Signed in through the real FastAPI login. */
export function selectSession(session: AuthSession) {
  window.sessionStorage.removeItem(DEMO_KEY);
  window.localStorage.removeItem(LEGACY_DEMO_KEY);
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  resetDemoApi();
  window.dispatchEvent(new Event(EVENT));
}

export function signOut() {
  setToken(null);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(DEMO_KEY);
  window.localStorage.removeItem(LEGACY_DEMO_KEY);
  resetDemoApi();
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function snapshot(): string | null {
  const raw = readSessionRaw();
  if (raw) return `s:${raw}`;
  const role = demoRoleFromSessionStorage();
  return role ? `d:${role}` : null;
}

const cache = new Map<string, DemoAccount>();
function toAccount(key: string): DemoAccount | null {
  if (cache.has(key)) return cache.get(key)!;
  let account: DemoAccount | null = null;
  if (key.startsWith("d:")) account = DEMO_ACCOUNTS[key.slice(2) as DemoRole] ?? null;
  else {
    const s = parseSession(key.slice(2));
    if (s) {
      const base = DEMO_ACCOUNTS[s.role];
      account = {
        ...base,
        id: s.email,
        name: s.name,
        email: s.email,
        title: s.position || base.title,
        initials: s.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?",
      };
    }
  }
  if (account) cache.set(key, account);
  return account;
}

export function useDemoAccount() {
  const key = useSyncExternalStore(subscribe, snapshot, () => null);
  return key ? toAccount(key) : null;
}

/** Reactive flag for the slim demo banner. */
export function useIsDemo() {
  const key = useSyncExternalStore(subscribe, snapshot, () => null);
  return key?.startsWith("d:") ?? false;
}

export function canAccessPath(role: DemoRole, pathname: string) {
  if (pathname === "/settings") return true;
  if (role === "superadmin") return pathname === "/internal" || pathname.startsWith("/internal/");
  return !pathname.startsWith("/internal") && pathname !== "/" && pathname !== "/forgot-password";
}

/**
 * Restore a real session on app load: if a token exists, ask the backend who
 * we are. Returns null when there is nothing to restore (demo or signed out).
 */
export async function restoreSessionFromApi(): Promise<AuthSession | null> {
  if (typeof window === "undefined") return null;
  if (!getToken() || isDemoSession()) return null;
  try {
    const me = await apiFetch<UserOut>("/users/me");
    const p = (me.position ?? "").trim().toLowerCase();
    if (p !== "superadmin" && p !== "client") {
      signOut();
      return null;
    }
    const session: AuthSession = {
      role: p,
      email: me.email,
      name: me.name,
      position: me.position ?? "",
    };
    selectSession(session);
    return session;
  } catch {
    return null;
  }
}
