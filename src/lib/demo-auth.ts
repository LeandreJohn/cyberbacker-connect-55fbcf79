import { useSyncExternalStore } from "react";
import { setToken } from "@/lib/api/client";
import { SESSION_KEY, type AuthSession } from "@/lib/auth/session";

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
    title: "Superadmin",
    email: "leandrejs@cyberbacker.com",
    company: "Cyberbacker",
    initials: "LS",
    home: "/internal",
  },
};

const STORAGE_KEY = "cb-demo-account";
const EVENT = "cb-demo-account-change";

function readSessionRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
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

export function readDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const session = parseSession(readSessionRaw());
  if (session) return session.role;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "client" || value === "superadmin" ? value : null;
}

export function selectDemoRole(role: DemoRole) {
  window.localStorage.removeItem(SESSION_KEY);
  setToken(null);
  window.localStorage.setItem(STORAGE_KEY, role);
  window.dispatchEvent(new Event(EVENT));
}

/** Signed in through the real FastAPI login. */
export function selectSession(session: AuthSession) {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
}

export function clearDemoRole() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  setToken(null);
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
  const role = readDemoRole();
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

export function canAccessPath(role: DemoRole, pathname: string) {
  if (pathname === "/settings") return true;
  if (role === "superadmin") return pathname === "/internal" || pathname.startsWith("/internal/");
  return !pathname.startsWith("/internal") && pathname !== "/" && pathname !== "/forgot-password";
}
