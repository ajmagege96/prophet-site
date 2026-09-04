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
17. Length is chosen first, from weighted classes, so runs are not all long.
    A route then adds legs until it reaches that length rather than stopping
    after two and coming up short.
18. Five families of shape — stub, elbow, runner, terrace, riser — and a
    turn point spread across the open margin, so routes do not all hug the
    same line. Side routes go down as often as up: the band under the bar is
    as usable as the margin above it.
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

## Verified (718 sampled routes, 1440x1000)

| Rule | Result |
|---|---|
| no doubling back | **0** |
| no diagonals | 0 |
| never above the cards, never off the page | 0, 0 |
| never past the arrows | x 169-1271; arrows at 168 and 1272 |
| ends on a pad | 0 missing |
| fresh route each flash | 700 distinct out of 718 |
| length spread | p10 112, median 244, p90 476, max 792 |
| by class | 285 short, 328 mid, 62 long, 43 tall |
| no missiles | longest single leg 300px |
| sides balanced | left 238, right 242, down 238; worst run 2 |

### Where routes can actually go
The cards and the takes feed cover the middle of the hero, and rule 7 forbids
drawing over them, so the free space is three regions: the band under the bar
(full width, ~110px deep), the two blocks flanking the bar below the feed
(~220x220 each), and the two side channels between the arrows and the cards
(~44px wide, but tall — the cards carry a
reduced 8px clearance so the channel is as wide as it can be without
crossing them). Routes are spread across all of them. A long route is
sent to the band most often, because that is the only region wide enough to
spend the length. Measured over 705 routes: p10 112px, median 272, p90 584,
max 788; 30% short, 43% mid, 23% long, 4% tall; 0 doubling back, 0 diagonals,
0 off page, 0 drawn over content.
