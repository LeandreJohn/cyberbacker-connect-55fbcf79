// Settings endpoints (client portal).
import { apiFetch } from "@/lib/api/client";
import type { PasswordChange, Preferences, PreferencesUpdate, Profile, ProfileUpdate, TutorialState } from "@/lib/types";

const CP = "/api/v1/cb_client_portal";

export function fetchProfile(): Promise<Profile> {
  return apiFetch<Profile>(`${CP}/settings/profile`);
}
export function updateProfile(input: ProfileUpdate): Promise<Profile> {
  return apiFetch<Profile>(`${CP}/settings/profile`, { method: "PUT", body: JSON.stringify(input) });
}
/** 204 on success; a 400 means the current password is wrong (never logs out). */
export function changePassword(input: PasswordChange): Promise<void> {
  return apiFetch<void>(`${CP}/settings/change_password`, { method: "POST", body: JSON.stringify(input) });
}
export function fetchPreferences(): Promise<Preferences> {
  return apiFetch<Preferences>(`${CP}/settings/preferences`);
}
export function updatePreferences(patch: PreferencesUpdate): Promise<Preferences> {
  return apiFetch<Preferences>(`${CP}/settings/preferences`, { method: "PATCH", body: JSON.stringify(patch) });
}
export function fetchTutorials(): Promise<TutorialState> {
  return apiFetch<TutorialState>(`${CP}/settings/tutorials`);
}
export function completeTutorial(pageKey: string): Promise<TutorialState> {
  return apiFetch<TutorialState>(`${CP}/settings/tutorials/complete`, {
    method: "POST",
    body: JSON.stringify({ page_key: pageKey }),
  });
}
export function replayTutorials(): Promise<TutorialState> {
  return apiFetch<TutorialState>(`${CP}/settings/tutorials/replay`, { method: "POST" });
}
