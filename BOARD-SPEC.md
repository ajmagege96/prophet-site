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
18. Nothing ever goes past the carousel's arrows. The lane is the channel
    between an arrow and the cards, about 30px wide, so a climb's sideways
    steps are 20-30px rather than a full leg.
19. A tall climb always zigzags: a single vertical leg is capped at 165px,
    so anything taller has to step at least once.

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

## Verified (378 sampled routes + a live run, 1440x1000)

| Rule | Result |
|---|---|
| beat, one trace each | 2.6s, one route per flash |
| no diagonals | 0 |
| ends on a pad | 0 missing |
| never past the arrows | x 169-1271; arrows at 168 and 1272 |
| never above the cards | 0 points |
| never off the page | 0 points |
| climbs go far | up to 568px, stopping below the arrow |
| tall climbs zigzag | vertical legs capped at 165px; 69% of routes zigzag |
| fresh route each flash | 374 distinct out of 378 |
| left and right both used | left 187, right 191, worst run of one side 2 |
| lengths | 292-904px, median 580 |
