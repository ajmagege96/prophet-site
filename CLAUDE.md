# The Prophet — site
Front end of theprophet.fun. Static HTML + CSS, mobile first, handed to the CTO who drops it into Rust server templates. No React, no framework, no build step, no npm. Vanilla JS only for four things: carousel swipe, menu button, first-visit walkthrough (remembered on device, "?" reopens), typewriter placeholder. Everything the server fills in is a clearly marked template variable, written as {{name}} until the CTO's syntax is confirmed; list every variable used in TEMPLATE_VARS.md.

## Files
site/index.html (home) · prophecies.html · record.html · prophet.html · partials/header.html, footer.html, below-fold.html · styles.css · app.js · assets/. Mock data inline: 12 sample markets, a few sample theses, one sample Record entry. Partials are canonical in site/partials/. Each page carries a copy wrapped in <!-- partial:header --> ... <!-- /partial:header --> markers so the CTO replaces them with server includes. All asset paths are relative so pages open directly from disk; the CTO may rewrite to absolute on his server.

## Brand
Colors, max four: navy #151B26 (canvas), deep purple, glow green, off-white. Orbitron 500, all caps, letterspaced for wordmark and headings. Space Grotesk for body and UI. Logo flat with no glow. No orb or crystal ball anywhere. Flat, thick outlines, esports-badge feel. Wordmark and logo come from assets/, never typed as text.

## Layout
Header: logo left, links home. Desktop nav: Prophecies · Record · $PROPHET · Docs (Docs links out) + X and Telegram icons. Mobile: logo + one menu button top right with the four routes, Docs, and account (signed out: [COPY] label; signed in: {{username}}). No other button in the header.
Hero: fixed height, one slot, four panels by route. Record and Prophecies scroll inside the hero. Bar pinned at the hero's bottom on mobile.
Below every panel: How it Works (5 steps) → Tokenomics (launch facts, four doors table, Buy $PROPHET) → Roadmap (Phase 1 Rewards · Seeker App · TradeLeague Pools; Phase 2 War Chest · Proposals · The Temple; Phase 3 Summon · Your Positions · Counsel; each "word — one line", no dates) → footer (X, Telegram, Docs).
Home: horizontal carousel of 12 cards, pinned first; card = question, YES %, "as of" relative time, take count, state line (open / no edge yet / vote open / called YES · conviction 3), thesis line if any. The bar is the hero of the panel: the selected market's question is typed into the empty field as placeholder with a typewriter animation, retyped when the carousel moves; the field clears the moment the user types. Bar = text field + send only. Under the bar: your takes as one-line summaries with relative timestamps, then status dot "Polymarket ●" green/red, "as of" on hover.
Prophecies: open votes first (draft, live tally in weight, time left, YES/NO buttons; a voted state shows your choice with the other button still live), then live theses, then history. Buy $PROPHET.
Record: stats line (Calls · Wins · Losses · Win rate · Edge); entries newest first, expandable to the chain (call → updates → resolution → lesson). Empty state.
$PROPHET: chart embed placeholder, pump.fun link, four doors table, wallet links as labels, last week's pool line, custody line, Buy $PROPHET.
Footer: 'Automated by TradeLeague' badge (outlined pill, TradeLeague wordmark placeholder {{tl_wordmark}}) left; X, Telegram, Docs right.
Prophecies and Record panels use outlined table rows, one layout, no view toggle.

## Style
Reference: orbmarkets.io on our palette. Canvas #151B26. Every panel, row, card, and input has a 1px outline in off-white at ~15% opacity; no fills, no gradients, no shadows, no rounded corners beyond 4px. A faint grid pattern on the canvas at ~4% opacity. Green is the only accent: status dot, active nav, YES tallies, links, send button. Purple only in the logo and for draft/vote states. Numbers in tabular figures. Orbitron 500 caps letterspaced for the wordmark and section headings; Space Grotesk for everything else. Dense, sleek, wireframe; it should feel like an agent's terminal, not a marketing page.

## Hard rules
Zero crypto-speak. Never show a wallet address; people have usernames. No calendar dates anywhere; times are relative. Losses shown next to wins. Where copy needs the character's voice (empty states, walkthrough cards, signed-out label), write [COPY] placeholders; never invent copy. Never add features, sections, or mechanics not in this file; if something seems missing, stop and ask. Small diffs, one step per prompt, explain each change in one line.
