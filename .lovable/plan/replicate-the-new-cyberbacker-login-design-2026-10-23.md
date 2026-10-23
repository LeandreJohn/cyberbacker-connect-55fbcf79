# Replicate the new Cyberbacker login design

## What changes
- Replace the current split login page with the supplied design: the high-resolution office photo fills the whole screen, with the "Welcome back" sign-in card on the right.
- The background image already includes the logo, the "Welcome to Your Cyberbacker Client Portal" headline, the tagline, and the copyright line, so those are not drawn again on top.
- The sign-in card matches the reference: "Welcome back" title, "Sign in to your Cyberbacker Client Portal." subtitle, Email and Password fields, a navy "Log in" button, an "or" divider, and a "Sign in with Google" button with the Google logo.
- The email, password, Log in, and Google buttons are shown for looks only for now. Clicking them shows a short "not available in the demo yet" notice.
- Two small buttons sit under the Google button: **Continue as Client** (Jordan Avery, opens the dashboard) and **Continue as Superadmin** (Leandre John Sabado, opens the internal area), labeled "Demo access".
- A "Forgot password?" link stays available next to the Password label.
- On phones and narrow screens the photo stays as the background (centered on the person) and the card sits centered over it, so it stays readable.

## Offline
- The background photo is copied into the project's assets folder as a bundled image, the same way the logos are, so it loads without internet.

## Technical details
- Copy `/mnt/user-uploads/Cyberbacker_Client_Portal.png` to `src/assets/cyberbacker-login-bg.png` (direct import, not a CDN pointer, per offline rule).
- Rewrite `src/routes/index.tsx`: full-bleed `<img>`/background with `object-cover object-left`, card `absolute right` on lg, `max-w-[440px] rounded-2xl bg-card/95 shadow`. Keep `selectDemoRole` + `DEMO_ACCOUNTS[role].home` navigation and existing head() metadata.
- Card colors use existing semantic tokens (primary navy, card, border, muted-foreground); Google "G" as inline SVG.
- Verify in the preview at desktop and mobile widths that both demo buttons reach their dashboards.
