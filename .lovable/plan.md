# Add complete mock profiles for all marketplace candidates

## Goal
Populate every candidate profile with realistic, candidate-specific mock information so each profile feels complete across all existing tabs and sections.

## Changes
- Add unique structured profile data for every marketplace candidate, matching each person’s role, experience level, location, industries, and existing summary.
- Fill the existing profile sections for:
  - personal information and languages
  - education and preferred roles
  - assessment breakdowns
  - work history
  - categorized skills with proficiency
  - software and tools with proficiency
  - certifications and portfolio samples
  - equipment and internet work setup
- Preserve the current privacy rules: display first names only and include no phone numbers or compliance information.
- Keep candidate cards, search, filtering, ranking, comparison, and job-description matching behavior unchanged.

## Technical details
- Extend the typed mock candidate records through the existing `TalentProfile` model in the mock data layer.
- Reuse the current shared candidate profile display; only adjust it if a populated field does not render correctly.
- Keep all content local and compatible with the static Azure deployment architecture.

## Verification
- Open every candidate from the marketplace and confirm all profile tabs contain unique data without empty sections.
- Check first-name-only presentation and confirm phone/compliance details never appear.
- Run type checks, existing candidate-matching tests, and a desktop/mobile marketplace profile flow.
