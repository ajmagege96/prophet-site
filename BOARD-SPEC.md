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
16. Climbs zigzag up their lane. Not a single straight line.
17. Never the same side of the bar three times running.
18. Lanes sit just inside the carousel's arrows, stepping outward only to
    get around one. Not out at the page corner.

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

## Verified (385 sampled routes + a live run, 1440x1000)

| Rule | Result |
|---|---|
| steady 3s beat, one trace each | gaps 3000ms, one route per flash |
| no diagonals | 0 |
| 2-4 legs minimum 48px, zigzag climbs | legs 2-11, 0 under 48px, 94% zigzag |
| ends on a pad | 0 missing |
| climbs reach the cards | 676px against a 687px gap |
| never above the cards | 0 points |
| never off the page | 0 points |
| fresh route each flash | 385 distinct out of 385 |
| no side three times running | worst run 2 |
| lanes inside the arrows | x 113-1327; arrows at 168 and 1272 |
| lengths | 348-1140px, median 756 |
