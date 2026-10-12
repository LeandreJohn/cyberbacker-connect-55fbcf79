# Applicant assessment and language score updates

## Goal
Make light mode the default and present applicant assessments and language ability as clear raw scores, matching the attached reference without report links.

## Changes
- Default new visitors to the light theme while preserving a returning visitor’s saved light/dark choice and the existing theme controls.
- Replace the current progress-bar assessment overview with two responsive assessment panels:
  - **Values Assessment:** raw scores for AES, ECO, IND, POL, ALT, REG, and THE.
  - **DISC Assessment:** raw D, I, S, and C scores.
- Do not include “View report” links or percentage/progress-bar treatment in either assessment panel.
- Give every marketplace applicant candidate-specific values and DISC raw scores rather than the current descriptive assessment labels.
- Show each language separately with its 1–5 proficiency rating in Personal Information, instead of a comma-separated language list.
- Add language proficiency ratings for every language listed on every applicant profile, keeping existing first-name-only and privacy behavior unchanged.

## Technical details
- Tighten the shared `TalentProfile` data shape so values scores, DISC scores, and language ratings use explicit typed fields.
- Update all nine mock applicant profiles to satisfy the new shape and render through the existing shared profile component used by the marketplace and My Cyberbackers.
- Use the current semantic colors, spacing, and responsive layout rather than embedding the reference screenshot.

## Verification
- Add focused data-shape tests confirming every applicant has all seven Values scores, D/I/S/C scores, and a 1–5 rating for every listed language.
- Verify the first visit opens in light mode, a saved dark preference still restores, and theme switching still works.
- Open every applicant profile and confirm the assessment cards and language ratings render without report links, progress bars, missing values, or mobile overflow.
- Run the focused tests and confirm the preview build is healthy.
