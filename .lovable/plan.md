# Update the Job Description Builder

## 1. Languages — closely match the reference
- Use a dedicated “Add a New Language” area with a language dropdown and an “Add Language” button.
- Display each selected language in its own bordered item, with a delete icon and a “Make Primary” action. Allow exactly one primary language, marked with a star badge.
- Replace the numbered proficiency buttons with an overall proficiency dropdown: 1 — Beginner, 2 — Intermediate, 3 — Advanced, 4 — Proficient, 5 — Native/Fluent.
- Add editable Speaking, Reading, and Writing ratings, each from 1–5, using five-segment controls and visible scores like the reference.
- Match the reference’s spacing, light surfaces, blue accents, and hierarchy using the existing theme; stack controls cleanly on narrow screens.
- Keep existing overall-language matching behavior. Primary language and detailed competency ratings are saved preferences, not new matching constraints.

## 2. Experience tiers
- Update the shared tier labels and ranges everywhere they appear: Beginner **0–2 years**, Intermediate **2–5 years**, Advanced **5+ years**.
- Preserve the inclusive overlap requested: 2 years qualifies for Beginner and Intermediate; 5 years qualifies for Intermediate and Advanced.
- Update tier-based matching boundaries and tests. Preserve the separate explicit minimum-years control and its existing matching behavior.

## 3. Years of experience per skill or tool
- Add an optional nonnegative “Years of experience” field when adding a skill/tool and on every selected must-have or preferred item.
- Save each item’s years alongside its proficiency, and include the entered years in the job preview, copied text, and download.
- As confirmed, these fields are **save-only for now**: they do not filter or rank candidates.

## 4. Desired assessment scores
- Keep the existing assessment scoring-weight control unchanged.
- Add an optional control to specify desired assessment scores, laid out like the reference with editable numeric fields instead of fixed scores.
- Values Assessment: **AES, ECO, IND, POL, ALT, REG, THE**.
- DISC Assessment: separate **Authentic** and **Modified** groups, each containing **D, I, S, C**.
- Accept raw scores from 0–100; leave unspecified scores blank rather than treating them as zero. Do not add report links.
- Save and include entered targets in the preview, copied text, and download. As confirmed, these are **preferences only** and do not affect matching.
- This change concerns desired scores in the builder; applicant profile displays and actual applicant assessment data remain unchanged.

## 5. Role duration
- Remove “Temporary / project-based” from the dropdown.
- Retain the other duration choices. If a previously saved job uses the removed option, clear it and require a supported duration before saving rather than silently assigning a different duration.

## Technical details
- Extend the existing job and language requirement models with optional skill experience, primary/detailed language ratings, and assessment preferences.
- Normalize older saved jobs so they remain editable: preserve overall language ratings, initialize detailed ratings from those values, choose the first language as primary, and leave new skill/assessment fields unset.
- Use the existing browser-only demo storage and static Azure-compatible architecture; no backend or login changes.
- Keep matching independent of the new save-only preferences, while updating shared experience-tier boundaries.

## Verification
- Add focused tests for the three tier ranges and their boundaries, rating/score limits, single-primary-language behavior, supported durations, older-job normalization, and unchanged matching when save-only fields change.
- Verify the full client flow: edit a job, add/rate languages, change primary language, enter skill years and both DISC target groups, save, reopen, and confirm preview/export data survives.
- Compare the language and assessment layouts with both references at desktop and narrow widths, and check preview errors.