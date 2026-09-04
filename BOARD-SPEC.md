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

## Variety
15. A fresh route is generated for every flash. Not a fixed set on rotation.

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

## Verified (400 sampled routes + a live 16s run, 1440x1000)

| # | Rule | Result |
|---|---|---|
| 1 | steady 3s beat | gaps 3000, 3000, 3000, 3000 ms |
| 2 | one trace per flash | 5 launches, one route each |
| 3 | overlap allowed | max 2 on screen |
| 4-5 | 90 degrees, no diagonals | 0 diagonal segments |
| 6 | never off a corner | exits inset to the middle of each edge |
| 7 | never along the frame | 18px halo excluded after the first leg |
| 8 | no U-turns | 0 across 289 routes |
| 9 | 2-4 legs, >=48px each | 0 routes over 4 legs, 0 legs under 48px |
| 10 | ends on a pad | 0 missing |
| 11 | climbs reach the cards | highest climb 704px against a 687px gap |
| 12 | never above the cards | 0 points above |
| 13 | never off the page | 0 points outside; scrollWidth 1440 = viewport |
| 14 | never over content | obstacle set clipped to scroll containers |
| 15 | fresh route each flash | 283 distinct routes out of 289 |
| 16-18 | look | invisible at rest, 160px streak, 200px/s, peak 0.5 |
| 19-21 | scope | 1024px+, prompt-bar pages only, paused when hidden |
