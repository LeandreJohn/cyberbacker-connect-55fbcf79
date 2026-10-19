import { useSyncExternalStore } from "react";

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

export function readDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "client" || value === "superadmin" ? value : null;
}

export function selectDemoRole(role: DemoRole) {
  window.localStorage.setItem(STORAGE_KEY, role);
  window.dispatchEvent(new Event(EVENT));
}

export function clearDemoRole() {
  window.localStorage.removeItem(STORAGE_KEY);
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

export function useDemoAccount() {
  const role = useSyncExternalStore(subscribe, readDemoRole, () => null);
  return role ? DEMO_ACCOUNTS[role] : null;
}

export function canAccessPath(role: DemoRole, pathname: string) {
  if (pathname === "/settings") return true;
  if (role === "superadmin") return pathname === "/internal" || pathname.startsWith("/internal/");
  return !pathname.startsWith("/internal") && pathname !== "/" && pathname !== "/forgot-password";
}