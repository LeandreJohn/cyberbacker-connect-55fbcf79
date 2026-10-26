import { useSyncExternalStore } from "react";

/** Client endorsements, kept separate from the member's own profile skills. */
export interface MemberSkillState { endorsed: string[]; added: string[] }

const KEY = "cb-member-skills";
const EVENT = "cb-member-skills-change";
const EMPTY: MemberSkillState = { endorsed: [], added: [] };

/** Migrates legacy `{ ratings, added: AddedSkill[] }` data into endorsements. */
export function normalizeState(raw: unknown): MemberSkillState {
  const r = (raw ?? {}) as { endorsed?: unknown; ratings?: Record<string, number>; added?: unknown[] };
  const added = (r.added ?? []).map((s) => (typeof s === "string" ? s : (s as { name?: string })?.name ?? "")).filter(Boolean) as string[];
  const endorsed = Array.isArray(r.endorsed) ? (r.endorsed as string[]) : [...Object.keys(r.ratings ?? {}), ...added];
  return { endorsed: [...new Set(endorsed)], added: [...new Set(added)] };
}

export function toggle(state: MemberSkillState, skill: string): MemberSkillState {
  if (state.endorsed.includes(skill)) return { endorsed: state.endorsed.filter((s) => s !== skill), added: state.added.filter((s) => s !== skill) };
  return { ...state, endorsed: [...state.endorsed, skill] };
}

export function addEndorsed(state: MemberSkillState, name: string, existing: string[]): MemberSkillState | null {
  const n = name.trim();
  if (!n) return null;
  const lower = n.toLowerCase();
  const match = existing.find((s) => s.toLowerCase() === lower);
  if (match) return state.endorsed.includes(match) ? null : { ...state, endorsed: [...state.endorsed, match] };
  if (state.added.some((s) => s.toLowerCase() === lower)) return null;
  return { endorsed: [...state.endorsed, n], added: [...state.added, n] };
}

let cacheRaw: string | null = null;
let cache: Record<string, MemberSkillState> = {};
function readAll(): Record<string, MemberSkillState> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try { const parsed = raw ? JSON.parse(raw) : {}; cache = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, normalizeState(v)])); } catch { cache = {}; }
  }
  return cache;
}
function write(memberId: string, next: MemberSkillState) {
  window.localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [memberId]: next }));
  window.dispatchEvent(new Event(EVENT));
}

export function toggleEndorsement(memberId: string, skill: string) { write(memberId, toggle(readAll()[memberId] ?? EMPTY, skill)); }
export function addEndorsedSkill(memberId: string, name: string, existing: string[]) {
  const next = addEndorsed(readAll()[memberId] ?? EMPTY, name, existing);
  if (!next) return false;
  write(memberId, next); return true;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb); window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}

export function useMemberSkills(memberId: string): MemberSkillState {
  return useSyncExternalStore(subscribe, () => readAll()[memberId] ?? EMPTY, () => EMPTY);
}
