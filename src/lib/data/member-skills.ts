import { useSyncExternalStore } from "react";
import type { ProfileProficiency } from "./types";

export interface AddedSkill { category: string; name: string; proficiency: ProfileProficiency }
export interface MemberSkillState { ratings: Record<string, number>; added: AddedSkill[] }

const KEY = "cb-member-skills";
const EVENT = "cb-member-skills-change";
const EMPTY: MemberSkillState = { ratings: {}, added: [] };

export function clampRating(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(1, Math.round(value)));
}

let cacheRaw: string | null = null;
let cache: Record<string, MemberSkillState> = {};
function readAll(): Record<string, MemberSkillState> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try { cache = raw ? JSON.parse(raw) : {}; } catch { cache = {}; }
  }
  return cache;
}
function writeAll(all: Record<string, MemberSkillState>) {
  window.localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT));
}

export function rateSkill(memberId: string, skill: string, value: number) {
  const all = readAll(); const cur = all[memberId] ?? EMPTY;
  writeAll({ ...all, [memberId]: { ...cur, ratings: { ...cur.ratings, [skill]: clampRating(value) } } });
}

export function addSkill(memberId: string, skill: AddedSkill) {
  const name = skill.name.trim();
  if (!name) return false;
  const all = readAll(); const cur = all[memberId] ?? EMPTY;
  if (cur.added.some((s) => s.name.toLowerCase() === name.toLowerCase())) return false;
  writeAll({ ...all, [memberId]: { ...cur, added: [...cur.added, { ...skill, name, category: skill.category.trim() || "Added skills" }] } });
  return true;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb); window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}

export function useMemberSkills(memberId: string): MemberSkillState {
  return useSyncExternalStore(subscribe, () => readAll()[memberId] ?? EMPTY, () => EMPTY);
}
