// Skill endorsements (client portal). Every call returns the refreshed list.
import { apiFetch } from "@/lib/api/client";
import type { SkillEndorsement } from "@/lib/types";

const CP = "/api/v1/cb_client_portal";

export function fetchEndorsements(cyberbackerId: number): Promise<SkillEndorsement[]> {
  return apiFetch<SkillEndorsement[]>(`${CP}/skill_endorsements?cyberbacker_id=${cyberbackerId}`);
}

export function endorseSkill(cyberbackerId: number, skill: string): Promise<SkillEndorsement[]> {
  return apiFetch<SkillEndorsement[]>(`${CP}/skill_endorsements`, {
    method: "POST",
    body: JSON.stringify({ cyberbacker_id: cyberbackerId, skill }),
  });
}

export function unendorseSkill(cyberbackerId: number, skill: string): Promise<SkillEndorsement[]> {
  return apiFetch<SkillEndorsement[]>(
    `${CP}/skill_endorsements?cyberbacker_id=${cyberbackerId}&skill=${encodeURIComponent(skill)}`,
    { method: "DELETE" },
  );
}
