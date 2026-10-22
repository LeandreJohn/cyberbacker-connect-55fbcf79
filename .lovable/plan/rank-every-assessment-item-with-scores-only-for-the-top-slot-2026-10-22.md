# Rank every assessment item, with scores only for the top slots

## What changes
- **Values:** all 7 values (AES, ECO, IND, POL, ALT, REG, THE) sit in one left-to-right row, ordered from most to least important. Only the first 4 positions have an editable desired-score box. Positions 5–7 show the item's rank but no score.
- **DISC Natural and Modified:** each row holds all 4 traits (D, I, S, C). Only the first 2 positions have editable scores.
- Reorder with drag or the left/right arrows. When you move an item out of the scored slots, its score is cleared. An item moved into a scored slot starts empty.
- The "Add" chips and remove buttons go away, because every item is always ranked.
- A visual divider labels the scored area ("Desired score") and the rest ("Ranked only").
- Instructions: "Arrange all values from most important (left) to least important (right). Set desired scores for the top 4." For DISC, the same text with "top 2".
- New and older jobs start in the default order (AES…THE / D I S C), with any items they already have moved to the front in their saved order.
- The JD preview lists the full order and adds scores for the top slots.

## Technical details
- Store the full order in each score object (all keys present). A null value means no score. `normalizeRanked(scores, allKeys, limit)` fills in missing keys at the end and clears scores past the limit. Use it in `migratePreferences` and after every move.
- On narrow widths, the 7-value row wraps to a 4+3 grid while keeping the reading order.
- Update the tests: full order is preserved, moving an item past the limit clears its score, and legacy jobs normalize to full order.
- Check with Playwright: reorder, the top-slot-only inputs, and the layout.
