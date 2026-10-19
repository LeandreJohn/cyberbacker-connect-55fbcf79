# Rates, member skills, admin users, change password

## 1. Remove hourly rate
- Hiring Marketplace: remove "$X/hr" from candidate cards, the "Rate" row in Compare, and the "Lowest rate" sort option.
- My Cyberbackers: make sure no rate shows on cards or in the profile.

## 2. Rate and add skills in My Cyberbackers profile
- In "View profile" (My Cyberbackers only), the Skills & setup tab gets:
  - A 1–5 star "Your rating" control next to each skill and tool.
  - An "Add skill" form (skill name, category, proficiency) that adds the skill to that member.
- Ratings and added skills are saved in the browser per member and persist after reload.
- The Hiring Marketplace profile stays read-only.

## 3. Admin sidebar
- Remove Cyberbacker University from the admin (Internal) sidebar and block admins from that page; clients keep it.
- Replace "User Settings" with "User Management" (new page `/internal/users`): a table of admin/staff users (name, email, role such as Superadmin, Recruiter, Support Agent, Finance, Executive; status; last active), with search, role filter, "Invite admin" dialog, edit role, and deactivate/reactivate. Mock data, browser-only.
- Admins keep access to their own settings via the profile menu.

## 4. Client Settings: Change password tab
- New "Change password" tab next to Profile: current password, new password, confirm, with checks (min 8 chars, matches, differs from current) and a success message. Demo only — no real password is changed.

## Technical details
- Skill ratings/additions: new helper in `src/lib/data` with a localStorage store keyed by member id; `TalentProfileContent` gets an optional `editable` mode used only by My Cyberbackers.
- `demo-auth.ts` `canAccessPath`: superadmin no longer allowed `/cyberbacker-university`; `/internal/users` covered by `/internal`. Update AGENTS.md University rule.
- Add tests: admin cannot access University, client can; password validation rules; skill rating bounded 1–5.
