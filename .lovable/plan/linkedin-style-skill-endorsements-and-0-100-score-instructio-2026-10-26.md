# LinkedIn-style skill endorsements and 0–100 score instructions

## What changes
**My Cyberbackers profile: client endorsements**
- The profile's own skills and tools stay as they are, read-only, with no stars next to them.
- A new separate "Client endorsements" section, styled like LinkedIn's skill endorsements:
  - Each endorsed skill shows its name, an endorsement count ("Endorsed by you" plus a thumbs-up badge), and an "Endorse" / "Endorsed" toggle button.
  - Any of the member's existing skills can be endorsed from a "Endorse a skill" list of chips.
  - "Add a skill" lets the client endorse a new skill that isn't on the profile. It shows a "Client-added" tag.
  - Removing an endorsement clears it. Client-added skills with no endorsement disappear.
- The star ratings are replaced by endorsements. Previously saved ratings or added skills carry over as endorsements.
- Hiring Marketplace profiles stay read-only, with no endorsement section.

**Job Description Builder: assessment scores**
- The Values and DISC instructions add: "Rate each scored item from 0 to 100." The score boxes keep the 0–100 limit.

## Technical details
- `member-skills.ts` changes to `{ endorsed: string[]; added: AddedSkill[] }`, with `toggleEndorsement` and `addEndorsedSkill`. Old `ratings` keys are migrated into `endorsed` when the data is read. It stays in browser storage.
- `TalentProfileContent`: remove `ratingFor`/`StarRating`, and add an `EndorsementsSection` rendered only when `editableMemberId` is set.
- Update the tests for toggling, duplicate prevention and legacy migration. Check the flow with Playwright.
