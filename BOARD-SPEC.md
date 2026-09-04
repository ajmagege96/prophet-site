# Prompt-bar circuit board — the rules

Every one of these must be true before shipping. Verified in the checklist
at the bottom.

## Rhythm
1. The bar flashes on a perfectly steady 3s beat. No drift, no skips.
2. Exactly ONE trace leaves the bar per flash. Never two at once.
3. A long run may still be travelling when the next flash fires. Overlap is
   fine. What must never vary is the beat.

## Shape
4. Traces leave the bar's frame at 90 degrees only.
5. Straight runs, right-angle turns, no diagonals, no curves.
6. Never leaves from a corner of the bar.
7. Nothing runs along the bar's own frame.
8. No U-turns: a trace never doubles back toward the bar.
9. Two to four legs. Each leg at least 48px. Corners, never a snake.
10. Every run ends on a small square pad.

## Reach
11. Runs go far. The ones climbing the margins reach the top of the cards.
12. Never above the top of the carousel.
13. Never off the page: bounded by the hero on all four sides.
14. Never drawn over text or a card.

## Variety — owned by the route planner
The planner is a self-contained block in app.js. It decides shape and length
and nothing else; the rest of the board just asks it for a route and draws it.

15. A fresh route is generated for every flash.
16. **No doubling back.** A route picks one horizontal and one vertical
    direction and can only move those two ways. Reversing is impossible by
    construction, not by a check afterwards.
17. Length is chosen first, from weighted classes, so runs are not all long:
    roughly 45% short, 35% mid, 14% long, 6% tall.
18. Five families of shape — stub, elbow, runner, terrace, riser — so routes
    are not all the same gesture.
19. Never the same side of the bar three times running; left, right and down
    are equally weighted.
20. No single straight leg longer than 300px, so a long route is several
    legs rather than one missile.
21. Nothing ever goes past the carousel's arrows.

## Look
16. Invisible at rest. A trace exists only while light is on it.
17. Roadmap language: 160px green streak at 200px/s, soft glow, square pads
    that fill as the light lands and drain behind it.
18. Dimmer than the roadmap: peak 0.5 against its 0.9.

## Scope
19. Desktop only, 1024px and up. Nothing at all below that.
20. Home page only. No board on any page without a prompt bar.
21. Paused when the tab is hidden. Nothing under prefers-reduced-motion.

---

## Verified (773 sampled routes, 1440x1000)

| Rule | Result |
|---|---|
| no doubling back | **0** across 773 routes |
| no diagonals | 0 |
| never above the cards | 0 |
| never off the page | 0 |
| never past the arrows | x 169-1271; arrows at 168 and 1272 |
| ends on a pad | 0 missing |
| fresh route each flash | 733 distinct out of 773 |
| length spread | p10 112, median 212, p90 544, max 788 |
| by class | 340 short, 275 mid, 107 long, 51 tall |
| no missiles | longest single leg 300px |
| sides balanced | left 283, right 271, down 219; worst run 2 |
| climbs go far | up to 568px |
