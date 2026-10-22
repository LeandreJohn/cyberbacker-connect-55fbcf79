# Assessment scores: rank by left-to-right order

## What changes
- In the Job Description Builder's desired assessment scores, importance comes from where an item sits, left to right, instead of from the order scores were typed.
- **Values Assessment:** a row of up to 4 ranked slots. The leftmost slot is the most important. Unused values (AES, ECO, IND, POL, ALT, REG, THE) appear below as "Add" chips. Once 4 are chosen, the remaining chips are disabled until one is removed.
- **DISC Natural and Modified:** each gets its own row of up to 2 slots, using the same left-to-right layout and D/I/S/C chips.
- Each chosen item is a card with its desired score box and a remove (x) button. You reorder cards by dragging them, or with left/right arrow buttons (these also work on touch screens and with the keyboard).
- Remove the 1st/2nd/3rd/4th badges. A small "Most important → Least important" guide runs above each row instead.
- New instructions:
  - Values: "Add up to 4 values and arrange them left to right, with the most important on the left. Drag cards or use the arrows to reorder."
  - DISC: "For Natural and Modified, add your top 2 traits each and place the most important on the left."
- Saved jobs keep their current order, so existing rankings stay the same. Previews and exports list items in their left-to-right order. Matching is not affected, because these preferences only get saved.

## Technical details
- Order stays as the key insertion order of the existing score objects. Add the pure helpers `addRanked(scores, key, limit)` (adds the item with an empty score at the end), `moveRanked(scores, key, toIndex)` and `removeRanked`. Keep `setRankedScore` for editing a score in place without changing order.
- An added item with no score yet stays in its slot. `limitScores`/`preferenceText` keep these items and show "—" in place of a score.
- Use native HTML5 drag-and-drop with arrow-button fallbacks, so no new dependency is needed. Layout follows the builder card's container width.
- Tests: the add-limit applies (4 values, 2 DISC per group), move reorders correctly, removing an item shifts the later ones left, and editing a score keeps its position.
- Check with Playwright: add, reorder (drag and arrows), the limit, and the layout in both split and single-column views.
