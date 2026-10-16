# Redesign the Job Description Builder Requirements section

## Layout changes
- Reorganize the entire Requirements card into clearly separated areas: add a skill/tool, suggestions, Must-have, Preferred, experience and credentials, functional expertise, education, and languages.
- Give the skill/tool name its own full-width row.
- Put labeled **Skill proficiency** and **Years of experience (optional)** fields together on a separate row, stacking them when space is limited.
- Place **Add to Must-have** and **Add to Preferred** buttons on their own action row below those fields.
- Replace the side-by-side Must-have and Preferred groups with two full-width sections, one above the other, with clear headings and item counts.
- Display each selected requirement as a spacious, aligned row: skill/tool name, labeled proficiency selector, labeled years input, and remove icon. Stack controls below the name on narrow screens instead of squeezing or awkwardly wrapping them.
- Use spacing and subtle dividers rather than additional nested cards. Preserve the existing powder-blue theme and language controls.

## Suggestions
- Use two independently expandable lists: **Suggested skills** and **Suggested software & tools**.
- Start both collapsed to reduce clutter; keep every existing suggestion available when expanded.
- Preserve the current suggestion behavior: selecting a suggestion adds it to Preferred using the chosen proficiency and optional years.

## Behavior preserved
- Keep adding, removing, editing, saving, reopening, previewing, copying, downloading, and candidate matching unchanged.
- Per-skill/tool years remain optional, nonnegative, save-only preferences; this redesign does not change ranking or matching rules.
- Do not change other Job Description Builder sections or the language rating design.

## Technical details
- Limit feature changes to the Requirements presentation in `src/components/jobs/JobDescriptionBuilder.tsx`, using existing design-system controls and semantic color tokens.
- Use width-aware layouts so item controls remain readable both in the narrower builder column beside the preview and in the single-column layout.
- Preserve the existing job model, update handlers, normalization, and matching logic.

## Verification
- Check the redesigned section at the current 1122×727 preview size, a wide desktop size with the preview alongside the form, and a narrow mobile size.
- Expand both suggestion lists; add a custom Must-have and a Preferred tool; edit proficiency and years; remove an item; save and reopen a complete job to confirm the values remain intact.
- Confirm there is no clipped text, overlapping controls, or horizontal overflow, then run the existing focused requirements and matching tests and check preview error signals.