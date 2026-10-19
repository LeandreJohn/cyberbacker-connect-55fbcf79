export function validatePasswordChange(current: string, next: string, confirm: string): string | null {
  if (!current) return "Enter your current password.";
  if (next.length < 8) return "New password must be at least 8 characters.";
  if (next === current) return "New password must be different from your current password.";
  if (next !== confirm) return "Passwords do not match.";
  return null;
}
