import { apiFetch, ApiError, setToken } from "@/lib/api/client";
import type { DemoRole } from "@/lib/demo-auth";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  email: string;
  name: string;
  position: string | null;
}

export interface AuthSession {
  role: DemoRole;
  email: string;
  name: string;
  position: string;
}

export const SESSION_KEY = "cb-auth-session";

/** SuperAdmin → admin area, Client → client area, anything else → no access. */
export function positionToRole(position: string | null | undefined): DemoRole | null {
  const p = (position ?? "").trim().toLowerCase().replace(/[\s_-]/g, "");
  if (p === "superadmin") return "superadmin";
  if (p === "client") return "client";
  return null;
}

export function homeForRole(role: DemoRole): "/dashboard" | "/internal" {
  return role === "superadmin" ? "/internal" : "/dashboard";
}

export async function loginWithPassword(email: string, password: string): Promise<AuthSession> {
  const body = new URLSearchParams({ username: email.trim(), password });
  let data: LoginResponse;
  try {
    data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) throw new ApiError(401, "Incorrect email or password");
    throw e;
  }
  const role = positionToRole(data.position);
  if (!role) throw new ApiError(403, "This account has no portal access.");
  setToken(data.access_token);
  return { role, email: data.email, name: data.name, position: data.position ?? "" };
}
