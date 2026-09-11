# Handoff — The Prophet, front end

Static HTML, CSS and vanilla JS. No build step, no npm, no framework. Open any
page in `site/` from disk and it works; every asset path is relative. Everything
the server fills in is written as `{{name}}` — swap that syntax for your
templating language. The live deploy is
https://ajmagege96.github.io/prophet-site/site/ and matches `main`.

Read this top to bottom once. Section 1 is what changed since the last drop;
sections 5–7 are the contracts your side has to honour.

---

## 1. What changed since the last drop

**Scope.** The MVP is two pages: **home** and **$PROPHET**. Prophecies and Record
are archived in `archive/` (out of the nav, out of the build); the full site with
both is on the `v2` branch and the `v2-record-page` tag. Everything they showed
now lives on the home carousel.

**Home carousel.**
- Order is the server's: open-vote markets first, then live theses (most recently
  called first, at most twelve), then markets with no thesis.
- Four tags: No thesis · Open votes · Prophecies · **History**. History is a
  separate deck of the last ten to twelve resolved markets, newest first, sent in
  the same list with `filter_state` = `resolved`; the JS shows them only under
  that tag. Tab / Shift+Tab cycle the tags.
- Card faces: an open-vote card carries a small **Buy $PROPHET** link
  (bottom-right, `{{buy_url}}`); a called card's meta row starts with
  `{{market.called_pct}} at call`; a resolved card shows a WON / LOST tag and the
  settled YES % (100% or 0%).
- Thesis block: position, `{{market.estimate_pct}}` as "78% est.", star
  conviction, the full reasoning, contributors. **No sources.** For an open vote
  the purple **Vote** button opens the Vote modal; once cast it reads "Voted YES"
  and is disabled — votes are final.

**Prompt bar.**
- A joint **YES | NO switch** on the left: the stance attached to what the viewer
  types, remembered per market, tap again to clear. It is **not** the vote.
- **Send** (or Enter) opens the Take-sent modal. Before sending, four checks in
  this order, each a small notice: nothing typed → "Nothing to send"; no side →
  "Pick a side"; viewer in cooldown → "Out of takes / one take every
  {{takes.interval}}"; per-market allowance used → "Out of takes /
  {{takes.per_market}} takes per market". The typed text stays in the field.

**Modals (all new).** Onboarding (three slides, first visit + How it Works),
Vote, Take sent, four prompt-bar notices, Logged out. Contracts in section 6.

**Header.** How it Works (desktop, and first in the phone menu) opens the
onboarding modal. **Logout** sits right of Docs (desktop) and under Docs in the
phone menu; gray, red on hover; render it only when the viewer is signed in.

**Phones.** Header paints a navy strip above itself so nothing shows behind it in
Telegram's browser; the menu's link groups are always two rows with one
separator; 16px between the takes and the bar.

**Meta.** Every page has description, absolute `og:*` and `twitter:*` tags, and a
180px apple-touch icon. `robots.txt` still disallows search crawlers but allows
link-preview bots (Twitterbot, TelegramBot, facebookexternalhit, Discordbot,
Slackbot). The `og:url` / `og:image` base is the GitHub Pages URL — **repoint it
to the real domain.**

---

## 2. Files

| Path | What it is |
|---|---|
| `CLAUDE.md` | The design spec. Every layout and styling decision is written down. Read it first. |
| `TEMPLATE_VARS.md` | Variable list with descriptions. Section 10 below is the same data, generated from the files. |
| `HANDOFF.md` | This file. |
| `BOARD-SPEC.md` | Rules for the decorative circuit board behind the prompt bar. Nothing to wire. |
| `robots.txt` | Search crawlers disallowed, preview bots allowed. Rewrite at launch. |
| `index.html` (repo root) | Redirect to `site/index.html` so the bare Pages URL is not a 404. Delete once `site/` is the document root. |
| `tools-stamp.py` | Rewrites the `?v=<hash>` on `app.js` / `styles.css` in every page from the file's content. Run after editing either. Delete it and the query strings once your server sets cache headers. |
| `site/index.html` | Home: carousel, thesis block, takes, prompt bar, all modals. |
| `site/prophet.html` | $PROPHET: stat strip, chart, swap, live trades, wallets. |
| `site/partials/header.html` | **Canonical** header. |
| `site/partials/onboarding.html` | **Canonical** onboarding modal. |
| `site/partials/below-fold.html` | **Canonical** How it Works, Tokenomics, Roadmap. |
| `site/partials/footer.html` | **Canonical** footer. |
| `site/styles.css`, `site/app.js` | All styles, all scripts. One file each. |
| `site/assets/` | Fonts, logo, wordmark, favicons + `prophet-apple-touch-180.png`, OG card, partner marks, third-party logos, `onboarding-N-placeholder.png` frames. |
| `archive/` | `prophecies.html`, `record.html`, README. Not built, not linked. |

---

## 3. Partials — what must stay in sync

`site/partials/` is the source of truth. Both pages carry inline copies between
markers; replace each block with a server include:

```html
<!-- partial:header -->     … <!-- /partial:header -->
<!-- partial:onboarding --> … <!-- /partial:onboarding -->
<!-- partial:below-fold --> … <!-- /partial:below-fold -->
<!-- partial:footer -->     … <!-- /partial:footer -->
```

Per-route differences inside the header copy: the current page's nav link
carries `class="active"` (home marks none); the Logout link is rendered only
when `{{viewer.signed_in}}` is true.

---

## 4. Repeating rows

Each repeating block has one template-variable copy inside a `<template>`,
between `<!-- repeat: x -->` markers. Browsers don't render `<template>`, so the
page previews from disk; replace the whole element with your loop and delete
the mock rows beside it.

| Loop | Page | Repeats |
|---|---|---|
| `market` | Home | Carousel cards — all four states, incl. the History deck |
| `contributor` | Home | Contributor rows in the thesis block |
| `take` | Home | Take rows in the feed |
| `trade` | $PROPHET | Pills in the live-trades strip |

Takes are also a JS object literal (`TAKES`, keyed by slug) so the preview can
switch feeds when a card is selected. **Replace that with server-rendered rows
or an endpoint** — the `take` loop is the markup to emit.

---

## 5. Data contracts — where the variables land

The JS reads state from `data-*` attributes rather than from markup, so a card
or modal root is the whole contract.

**Each carousel card** (`<!-- repeat: market -->`):

| Attribute | Variable | Notes |
|---|---|---|
| `data-state` | `market.filter_state` | `none` · `vote` · `called` · `resolved` |
| `data-slug` | `market.slug` | row key |
| `data-stance`, `data-estimate`, `data-conviction` | `market.thesis_stance`, `market.estimate_pct`, `market.conviction` | thesis head |
| `data-thesis`, `data-contributors` | `market.thesis`, `market.contributors_json` | reasoning and `[{user, claim, xp}]` |
| `data-vote-yes-pct`, `data-vote-yes-weight`, `data-vote-no-weight`, `data-vote-count`, `data-vote-left` | `market.vote_*` | open votes only; weights formatted (`94,200`) |
| `data-outcome`, `data-resolved-side`, `data-resolved-pct`, `data-resolved-ago` | `market.outcome`, `market.resolved_*` | resolved only |
| `data-takes-used` | `market.viewer_takes_used` | takes this viewer has given here; drives the per-market notice |

**Vote modal root** (`[data-vote-modal]`): `data-signed-in`, `data-balance`,
`data-share`, `data-username` ← `viewer.signed_in`, `viewer.balance`,
`viewer.vote_share`, `viewer.username`.

**Take-sent modal root** (`[data-take-modal]`): `data-summary`, `data-stance`,
`data-evidence`, `data-ago`, `data-xp` ← `take_result.*`. These are what your
endpoint returns for a take; the confirmed state renders from them.

**Notices**: `[data-notice="out-of-takes"]` carries `takes.per_market`;
`[data-notice="cooldown"]` carries `viewer.take_cooldown`, `takes.interval`,
`takes.next_in`.

While a variable is unfilled (`{{…}}` still literal) the JS falls back to mock
values so the page previews. Once filled, the mocks are never used.

---

## 6. Modal behaviour and hooks

| Modal | Opens | What your side does |
|---|---|---|
| **Onboarding** | First visit (flag `prophet.onboarded` in `localStorage`) and every How it Works click. | Drop the real recordings in as `assets/onboarding-N.mp4` and add each `<source>` inside its slide's `<video>`; the placeholder PNG stays as the poster. Copy is final. |
| **Vote** | Thesis block's Vote button on an open vote. If `viewer.signed_in` is `false` it instead dispatches `prophet:signin` on `document` (detail `{then:'vote', slug}`) and stops. | Wire sign-in to that event, then call `window.prophetVote.open(slug)` to resume. Casting is a client-side mock: hook the "Vote YES / NO" button to your endpoint and re-render with the server's tally. Votes are final — the button disables after one cast. |
| **Take sent** | Send / Enter, after the four checks pass. A take is counted as spent the moment it is sent. The 1.2s spinner stands in for your round trip. | Fill `take_result.*` from the response. The summary is prepended to the feed; **the raw text is never rendered anywhere.** |
| **Notices** | See section 1. `window.prophetNotices.open('no-text' \| 'no-stance' \| 'cooldown' \| 'out-of-takes' \| 'logged-out')` previews any of them. | Set `viewer.take_cooldown`, `takes.*`, and `market.viewer_takes_used`. |
| **Logged out** | While `{{logout_url}}` is unfilled, clicking Logout dispatches `prophet:logout` and shows the notice. | Point the link at the real URL; show the notice on the way back. |

All modals: close on X, Escape or the backdrop; scroll locked behind; 44px
buttons on phones. Keyboard shortcuts on the page (Tab cycles tags, arrows move
the selection) are suspended while any modal is open.

Other globals: `window.prophetOnboarding.open()`, `window.prophetBoard.set({beat, speed})` (decorative board).

---

## 7. Rules the front end assumes of the server

- Carousel order and caps as in section 1; History is `resolved` in the same list.
- A take needs a side. `take_result.stance` is `yes` or `no` — there is no "unsure".
- Allowance: `takes.per_market` per market, one every `takes.interval`. Check
  order on Send is text → side → cooldown → per-market.
- Votes can't be changed. Weight is the viewer's `viewer.balance`.
- Never show a wallet address. The viewer is `viewer.username`; the token
  contract in the header is the one address on the site.
- Relative times only. No calendar dates anywhere except the $PROPHET chart axis.
- `[COPY]` marks lines in the character's voice that have not been written. The
  notice, modal and onboarding copy in the files is final unless you're told
  otherwise; `empty_no_takes` and the take `summary` are yours to generate.

---

## 8. What is deliberately static or mocked

| Thing | State now | Wire later |
|---|---|---|
| Swap panel ($PROPHET) | Inert fields and buttons. | Quote, approve, submit. |
| Vote cast | In-browser only. | Section 6. |
| Take send | In-browser only; 1.2s fake round trip; mock summary. | Section 6. |
| Sign-in | None. | `prophet:signin` hook. |
| Takes feed | `TAKES` literal in `app.js` + mock rows. | Server rows / endpoint. |
| Range and Price/MCap tabs | Highlight only. | Serve the matching series. |
| Live trades | Ten mock pills. | Stream or poll. |
| Stat tiles, wallets, pool | Mock values via `data-mock`. | Fill the variables. |
| Onboarding videos | Placeholder frames. | Real loops. |
| Circuit board | Decorative. | Nothing. Safe to delete with its `<canvas data-board>`. |

---

## 9. Launch checklist

1. Remove `<meta name="robots" content="noindex, nofollow">` from both pages and rewrite `robots.txt`.
2. Repoint the `og:url` / `og:image` base from the Pages URL to the real domain.
3. Replace `<template>` loops, delete the mock rows and the `TAKES` literal.
4. Fill every variable in section 10; delete the `data-mock` attributes and the "Preview fill" block in `app.js` once nothing is unfilled.
5. Drop the real onboarding recordings in.
6. Serve `site/` as the document root; delete the root `index.html` redirect and `tools-stamp.py` once your cache headers are in place.
7. Render Logout only when signed in; wire `prophet:signin` and `prophet:logout`.

---

## 10. Variable reference

88 variables actually present in the files right now, with where each appears.

| Variable | Where | Holds |
|---|---|---|
| `{{buy_url}}` | $PROPHET; Home; below-fold | Buy $PROPHET link (pump.fun) |
| `{{contract_address}}` | $PROPHET; Home; header | $PROPHET contract address; the header pill shows first 6 … last 6 and copies the full value |
| `{{contributor.claim}}` | Home | The contribution that fed the thesis, one line |
| `{{contributor.username}}` | Home | Contributor's username (used in `<!-- repeat: contributor -->` inside the Thesis block) |
| `{{contributor.xp}}` | Home | XP earned for that contribution |
| `{{docs_url}}` | $PROPHET; Home; header | External link to documentation site |
| `{{empty_no_takes}}` | Home | Line shown in the take slot when the selected market has no takes (generated later; mock: "Nobody's taken this one yet. The first contributor earns the most credit. What do you think?") |
| `{{jupiter_url}}` | $PROPHET; Home; footer; header | $PROPHET on Jupiter (footer token link) |
| `{{linkedin_url}}` | $PROPHET; Home; footer; header | Link to the project's LinkedIn page |
| `{{logout_url}}` | $PROPHET; Home; header | The Logout link in the header and menu; render the link only when `{{viewer.signed_in}}` is true. While unfilled, the click fires a `prophet:logout` event and shows the Logged out notice |
| `{{market.called_pct}}` | Home | Odds when the thesis was called, e.g. `84%`; rendered on called cards only |
| `{{market.contributors_json}}` | Home | JSON array of `{user, claim, xp}` set as `data-contributors` on the card; listed under the thesis as Contributors |
| `{{market.conviction}}` | Home | Star conviction, 1–5; shown in the thesis block head and the called badge |
| `{{market.ends_in}}` | Home | Relative time until the market ends (e.g. "12d", "3mo"), shown after a clock icon |
| `{{market.estimate_pct}}` | Home | The Prophet's estimated probability for his position, e.g. `78%`; shown in the thesis block head as "78% est." |
| `{{market.filter_state}}` | Home | `none` (no thesis yet), `vote` (vote open), `called`, or `resolved` (History deck); drives the filter tags above the carousel |
| `{{market.image_url}}` | Home | Market image, imported from Polymarket (44px square on the card) |
| `{{market.outcome}}` | Home | `won` / `lost` — resolved markets only, drives the tag in the badge |
| `{{market.question}}` | Home | Market question text |
| `{{market.resolved_ago}}` | Home | Relative time since resolution, e.g. `2w ago` |
| `{{market.resolved_pct}}` | Home | Closing YES % at settlement, e.g. `97%` |
| `{{market.resolved_side}}` | Home | `yes` / `no` — the side the market settled on |
| `{{market.slug}}` | Home | URL-safe identifier for the market (used in `<!-- repeat: market -->`) |
| `{{market.state}}` | Home | State badge, top-right of the card, rendered only for vote/called: `vote open · <span class="tally tally--yes">62% YES</span>` or `called <span class="tally tally--no">NO</span> <span class="conviction">[star icon]N</span>` (no dot); tally colors green/red by side; empty for open markets with no thesis |
| `{{market.take_count}}` | Home | Number of takes on this market |
| `{{market.thesis}}` | Home | Full thesis text (called) or draft thesis (vote open), set as `data-thesis` on the card; shown in the Thesis block above the takes when the card is selected; empty otherwise |
| `{{market.thesis_stance}}` | Home | `yes` or `no`: which way the thesis (or draft) calls it; shown bold beside the Thesis label |
| `{{market.viewer_takes_used}}` | Home | On each card: takes the viewer has already given on that market; the out-of-takes notice fires when it reaches the allowance |
| `{{market.volume}}` | Home | Polymarket volume, short form (e.g. "$4.1M"), shown after a bar-chart icon |
| `{{market.vote_count}}` | Home | Open-vote tally for the Vote modal: YES share, weight cast on each side (e.g. `94,200`), number of votes, time left (e.g. `2d`) |
| `{{market.vote_no_weight}}` | Home | Open-vote tally for the Vote modal: YES share, weight cast on each side (e.g. `94,200`), number of votes, time left (e.g. `2d`) |
| `{{market.vote_time_left}}` | Home | Open-vote tally for the Vote modal: YES share, weight cast on each side (e.g. `94,200`), number of votes, time left (e.g. `2d`) |
| `{{market.vote_yes_pct}}` | Home | Open-vote tally for the Vote modal: YES share, weight cast on each side (e.g. `94,200`), number of votes, time left (e.g. `2d`) |
| `{{market.vote_yes_weight}}` | Home | Open-vote tally for the Vote modal: YES share, weight cast on each side (e.g. `94,200`), number of votes, time left (e.g. `2d`) |
| `{{market.yes_pct}}` | Home | Current YES percentage (e.g. "72%") |
| `{{polymarket_as_of}}` | Home | Relative timestamp of last Polymarket status check (shown on hover in home panel) |
| `{{polymarket_status}}` | Home | Polymarket feed status: `up` (green pulsing dot, also the default if the class is unset) or `down` (red dot) |
| `{{pool_last_week}}` | $PROPHET | Last week's reward pool; the line reads "paid to the community" |
| `{{pumpfun_url}}` | $PROPHET; Home; footer; header | $PROPHET on pump.fun (footer token link) |
| `{{solscan_url}}` | $PROPHET; Home; footer; header | $PROPHET on Solscan (footer token link) |
| `{{swap_impact}}` | $PROPHET | Swap meta line, left: slip and price impact |
| `{{swap_slippage}}` | $PROPHET | Swap meta line, left: slip and price impact |
| `{{swap_sol_balance}}` | $PROPHET | The viewer's SOL balance, right of the swap meta line (e.g. "2.41 SOL") |
| `{{take.ago}}` | Home | Relative timestamp (e.g. "2h ago") |
| `{{take.claim}}` | Home | One-line claim text |
| `{{take.stance}}` | Home | Take stance: YES or NO (used in `<!-- repeat: take -->`) |
| `{{take.username}}` | Home | Username of the person who posted the take (used in `<!-- repeat: take -->`) |
| `{{take.xp}}` | Home | XP earned by the take, rendered as "+N XP" under the timestamp |
| `{{take_result.ago}}` | Home | Relative timestamp (e.g. `just now`) |
| `{{take_result.evidence}}` | Home | `true` when a source was named; shows the "evidence noted" mark |
| `{{take_result.stance}}` | Home | `yes` / `no` |
| `{{take_result.summary}}` | Home | One-line summary of the claim. Raw text is never shown. Preview mock: "Your claim, condensed to one line" |
| `{{take_result.xp}}` | Home | XP earned (e.g. `1`) |
| `{{takes.interval}}` | Home | How often a new take is granted, as words (e.g. `15 minutes`) |
| `{{takes.next_in}}` | Home | Relative time until the viewer's next take (e.g. `9m`) |
| `{{takes.per_market}}` | Home | Takes a viewer gets per market (e.g. `3`) |
| `{{tg_url}}` | $PROPHET; Home; footer; header | Link to the project's Telegram channel |
| `{{tl_linkedin_url}}` | $PROPHET; Home; footer; header | TradeLeague on LinkedIn (footer) |
| `{{tl_tg_url}}` | $PROPHET; Home; footer; header | TradeLeague on Telegram (footer) |
| `{{tl_x_url}}` | $PROPHET; Home; footer; header | TradeLeague on X (footer) |
| `{{token.chart_series}}` | $PROPHET | JSON array of prices, oldest first; app.js draws the green area chart, an x-axis of relative times, and the live price tagged beside the last point |
| `{{token.chart_ticks}}` | $PROPHET | JSON array of x-axis labels for the selected range: clock times on 5M–1D, dates on 1W and longer |
| `{{token.fees_earned}}` | $PROPHET | Fees earned, in dollars, shown green |
| `{{token.holders}}` | $PROPHET | Holders and the 24h change in holders |
| `{{token.holders_change}}` | $PROPHET | Holders and the 24h change in holders |
| `{{token.liquidity}}` | $PROPHET | Liquidity |
| `{{token.market_cap}}` | $PROPHET | Market cap and its 24h change |
| `{{token.market_cap_change}}` | $PROPHET | Market cap and its 24h change |
| `{{token.price}}` | $PROPHET | Live price and 24h change (change colors green up / red down) |
| `{{token.price_change}}` | $PROPHET | Live price and 24h change (change colors green up / red down) |
| `{{token.volume_change}}` | $PROPHET | Volume and its 24h change |
| `{{trade.amount}}` | $PROPHET | Live-trades strip (`<!-- repeat: trade -->`): `buy` / `sell` and the amount |
| `{{trade.side}}` | $PROPHET | Live-trades strip (`<!-- repeat: trade -->`): `buy` / `sell` and the amount |
| `{{tradeleague_url}}` | $PROPHET; Home; footer | Link for the "Automated by TradeLeague" footer lockup |
| `{{viewer.balance}}` | Home | $PROPHET balance, formatted (e.g. `12,400`); also the voting weight |
| `{{viewer.signed_in}}` | $PROPHET; Home; header | `true` / `false`. When false the Vote button fires a `prophet:signin` event on `document` instead of opening the modal |
| `{{viewer.take_cooldown}}` | Home | `true` while the viewer must wait for their next take; Send then shows the cooldown notice. Console: `prophetNotices.open('cooldown')` to preview it |
| `{{viewer.username}}` | Home | Shown on the viewer's own take card and feed row. Never an address |
| `{{viewer.vote_share}}` | Home | The viewer's share of the weight cast so far on the selected market (e.g. `8%`) |
| `{{wallet_burn_url}}` | $PROPHET | Explorer links for the four public wallets; shown as labels, never as addresses |
| `{{wallet_burn_value}}` | $PROPHET | Tokens burned, red (e.g. "8.4M"); the "$PROPHET" ticker after it stays gray, then a red flame icon |
| `{{wallet_pools_url}}` | $PROPHET | Explorer links for the four public wallets; shown as labels, never as addresses |
| `{{wallet_pools_value}}` | $PROPHET | Live balances, green |
| `{{wallet_rewards_url}}` | $PROPHET | Explorer links for the four public wallets; shown as labels, never as addresses |
| `{{wallet_rewards_value}}` | $PROPHET | Live balances, green |
| `{{wallet_war_chest_url}}` | $PROPHET | Explorer links for the four public wallets; shown as labels, never as addresses |
| `{{wallet_war_chest_value}}` | $PROPHET | Live balances, green |
| `{{x_url}}` | $PROPHET; Home; footer; header | Link to the project's X (Twitter) account |
