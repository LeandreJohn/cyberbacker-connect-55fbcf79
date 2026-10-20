# Job builder: paste/upload JD, reordered sections, ranked assessments, split weights

## 1. Paste or upload an existing job description
- "Paste existing job description" on the New job screen becomes clickable (no more "Coming soon") and opens its own page.
- That page offers a large paste box and a file upload accepting PDF, DOC and DOCX (drag-and-drop or browse).
- Uploaded files are read in the browser and their text shown in the box so the user can review/edit it.
- "Create draft" opens the builder pre-filled with what can be detected: job title, tasks/responsibilities (bullet lines), and known skills/tools from the suggestion lists (e.g. Dialpad, HubSpot CRM). Everything else stays at defaults for the user to finish.
- Old .DOC files can't always be read in the browser; when that fails, the user sees a message asking to save as DOCX/PDF or paste the text.

## 2. Section 1 reorder and rename
- Rename "1. Role basics" to "1. Role overview".
- Order inside it: Languages (moved from Requirements to the top), job title, department, a new Industry dropdown, area of support, role duration, experience tier.
- Directly under the experience tier: Type, Hours per week, Shift, and Start (moved out of section 4).
- Section 4 becomes "Work style & communication" with availability notes, time zone, communication, check-ins, work style.

## 3. Values assessment — max 4 ranked scores
- The user can fill at most 4 of the 7 values (AES…THE); once 4 are filled, the rest are disabled until one is cleared.
- Each filled box shows a rank badge (1st–4th) based on the order entered; clearing one moves the later ones up.

## 4. DISC — Natural and Modified, top 2 each
- "Authentic" renamed "Natural" (also in previews/exports; older saved jobs carry over).
- Each of Natural and Modified allows at most 2 scores, with 1st/2nd badges by entry order.

## 5. Scoring weights
- Remove "Assessment"; add "Values Assessment" and "DISC Assessment", each 5% by default.
- New defaults: Skills 40, Experience 25, Responsibilities 20, Values 5, DISC 5, Education 5 = 100%. The 100% cap stays.
- Older saved jobs: their old assessment weight is split evenly between the two new ones.

## Technical details
- New route `/job-builder/import` (`_app.job-builder_.import.tsx`); hand-off to the builder via a sessionStorage draft. Client-side extraction with `pdfjs-dist` (PDF) and `mammoth` (DOCX); DOC attempted via mammoth then a friendly error. Detection lives in `src/lib/jobs/import.ts` (pure, tested).
- `AssessmentPreferences` gains `order` arrays per group (values, natural, modified); `normalizeJob` migrates `authentic`→`natural` and assessment weight→values/disc. Assessment targets stay save-only (no matching change).
- Matching uses `values` and `disc` weights from the candidate's assessment score.
- Tests: 4-value / 2-DISC limits and rank reordering, weight defaults total 100, legacy migration, import detection of title/bullets/tools.
- Update `AGENTS.md`/memory for the import page and new rules; verify with Playwright (paste flow, upload PDF/DOCX, limits, layout).
