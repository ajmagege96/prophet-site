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

**UI Revisions (Oct 22 spec, built Oct 22).** Votes and takes are gone from the
product; the two verbs are Agree and Disagree.
- **Deck** = live calls only, ordered by you, most interesting first. Two tabs,
  Calls · History, one always on. An empty tab shows one `[COPY]` line.
- **Card face**: label (Buy YES / Buy NO) + conviction in the badge; the live
  price; the meta row reads "{{market.called_pct}} at call · called
  {{market.called_ago}} · volume · ends-in". No take count, no Buy link.
- **Thesis block** (one, under the carousel): label, his number, conviction,
  the thesis. Revised calls add "Revised {{revised_ago}}", show
  `{{revised_number}}` as the number with `{{prophet_probability}} at call`
  in its own field, and — when `{{number_moved}}` is true — "His number has
  moved. The call stands to resolution." The block carries
  `data-signed-in="{{viewer.signed_in}}"`.
- **Agree / Disagree** in the slot the vote control had. `{{user_side}}` marks
  the user's button; tapping the other switches it; `{{market_closed}}` true
  disables both. From three taps the split "{{agree_pct}}% agree ·
  {{tap_count}} taps" shows; below that only the user's side. A signed-out
  tap dispatches `prophet:signin` with `{then: 'agree', slug}` and does
  nothing else — wire sign-in to that. Taps are a client-side mock: post the
  side to your endpoint and return the new split.
- **History** is back: `filter_state` resolved; `{{market.outcome}}` right /
  wrong / void / awaiting drives the badge tag and the outcome line;
  `{{call_state}}` closed reads "Awaiting resolution", void reads the void
  line and sits apart from the count. Thesis shown as last revised.
- **Removed**: the prompt bar and its switch, the typewriter, the takes feed,
  credits, the Vote modal, the Take-sent modal with its limit state, the
  take notices, Hold / not-evaluated cards and `hold_reason`, `window_class`,
  the vote tally and countdown. The circuit board now sits around the thesis
  block instead of the bar; nothing to wire.
- **Not touched, per the founder**: How it Works, onboarding and Tokenomics
  copy still mention votes, takes and credits; he will rewrite them.


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
- Thesis block, shown for **every** selected market: label "Thesis" (prophecy,
  history) or "Draft" (open vote, no thesis); position; The Prophet's number
  `{{prophet_probability}}` as a plain purple percentage, no label, no box; star
  conviction; the full reasoning; contributors — when there are none, nothing
  shows, not even the hairline. **No sources.** For an open vote the purple
  **Vote** button opens the Vote modal; once cast it reads "Voted YES" and is
  disabled — votes are final.
- A market with **no thesis** keeps the box: "Draft", the number if the market
  has been evaluated (nothing if not), and one line from `{{no_edge_line}}`:
  **"Nothing the price is missing yet."** when his number equals the market
  price, or **"The price is missing something, too early to call."** when it
  differs by under 5 or the market has not been evaluated yet (also after a
  rejected vote). No position, badge, vote or credits. The market's price stays
  on every card.
- Take rows show the stance as a bare YES / NO in green / red — no box.

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

**Logic update (Oct 15 spec, built Oct 17).**
- `{{label}}` (buy_yes · buy_no · hold · none) is one component that replaces
  the YES / NO position tag everywhere: the card badge, the thesis block head,
  the Vote modal header. Buy YES green, Buy NO red, Hold gray and quieter, none
  renders nothing. Never inside the thesis text; both numbers always refer to
  the listed outcome.
- Card states: not evaluated (no badge, static line) · Hold no_gap / under_gap
  (gray Hold badge, the number, the hold line from `{{hold_reason}}`) · open
  vote · live call · resolved · void. The market price stays on every face;
  his number lives in the thesis block.
- History is out of the MVP (tab and deck removed); `{{call_state}}` is carried
  for its return, when a void leg will read "Market closed by Polymarket before
  resolution." Ladder markets print `{{listed_leg_date}}` on the card face under
  the question (not in the thesis header); when a leg rolls, the card resets to
  not evaluated with the next date.
- Vote modal: the label in the header; `{{window_class}}` short sends time
  left in hours and minutes.
- Take limits replace the old per-market / cooldown notices: the Take-sent
  modal gains a Limit state driven by `{{take_limit_reason}}` (day / market)
  with the two copy lines; Confirmed gains "{n} takes left today."; the bar
  shows `{{takes_remaining_today}}` beside Send when signed in and turns Send
  off at zero. Limits are config: `{{takes.per_day}}` (5), `{{takes.per_market}}` (2).
- Decided with the founder: no last-run line; empty credits render nothing;
  dates are allowed for a market's own dates (ladder legs).
- Open question for the logic doc: which leg of a ladder the card shows is
  not specified. "Current leg" is the default built here; the leg he has a
  view on may be the better rule.

**Copy, pre-launch (Sept 13).** How it Works: "credited by wallet", "If
rejected, he goes back to the drawing board.", "Every call lives on the record."
Onboarding slide 2: "credited by wallet". Tokenomics: three streams — Trading
Wallet 30%, Rewards Pool 50%, Buy-and-Burn 20% — the TradeLeague Pools row is
gone; launch line: "1B supply, no presale, vested team allocation. The token never migrates." Token page: the TradeLeague Pools wallet card is removed along with
its two variables (`wallet_pools_url`, `wallet_pools_value`); three cards in
one row, each just the name with a gray external-link icon (no "Public wallet"
label). Roadmap and header untouched.

**Post-token (once the contract exists):** `{{contract_address}}`, the Jupiter
link, the DexScreener chart source, the three wallet links, the ClawPump
(`{{buy_url}}`) and Solscan links.

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
| `site/prophet.html` | $PROPHET: stat strip, chart, swap, live trades, three wallets in one row. |
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
| `market` | Home | Carousel cards — the Calls deck and the History deck |
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
| `data-state` | `market.filter_state` | `none` · `vote` · `called` (`resolved` returns with History) |
| `data-slug` | `market.slug` | row key |
| `data-label` | `label` | buy_yes · buy_no · hold · none; drives the badge, the thesis head and the Vote modal header |
| `data-stance`, `data-estimate`, `data-conviction` | `market.thesis_stance`, `prophet_probability`, `market.conviction` | thesis head; `data-estimate` is The Prophet's number, a whole integer with `%`, shown in purple. Leave it empty on a market not yet evaluated |
| `data-thesis`, `data-contributors` | `market.thesis`, `market.contributors_json` | reasoning and `[{user, claim, xp}]`; an empty array shows nothing |
| `data-hold-reason` | `hold_reason` | Hold markets: no_gap / under_gap selects the hold line |
| `data-call-state` | `call_state` | live / resolved / void |
| `data-leg-date` | `listed_leg_date` | ladder markets: the leg's date; also printed on the face |
| `data-window` | `window_class` | standard / short; short votes send time left as "1h 40m" |
| `data-vote-yes-pct`, `data-vote-yes-weight`, `data-vote-no-weight`, `data-vote-count`, `data-vote-left` | `market.vote_*` | open votes only; weights formatted (`94,200`) |
| `data-outcome`, `data-resolved-side`, `data-resolved-pct`, `data-resolved-ago` | `market.outcome`, `market.resolved_*` | resolved only |
| `data-takes-used` | `market.viewer_takes_used` | takes this viewer has given here; drives the per-market notice |

**Vote modal root** (`[data-vote-modal]`): `data-signed-in`, `data-balance`,
`data-share`, `data-username` ← `viewer.signed_in`, `viewer.balance`,
`viewer.vote_share`, `viewer.username`.

**Take-sent modal root** (`[data-take-modal]`): `data-summary`, `data-stance`,
`data-evidence`, `data-ago`, `data-xp` ← `take_result.*`. These are what your
endpoint returns for a take; the confirmed state renders from them.

**Take limits** (on the Take-sent modal root): `data-takes-left`,
`data-limit-reason`, `data-day-limit`, `data-market-limit` ←
`takes_remaining_today`, `take_limit_reason`, `takes.per_day`, `takes.per_market`.

While a variable is unfilled (`{{…}}` still literal) the JS falls back to mock
values so the page previews. Once filled, the mocks are never used.

---

## 6. Modal behaviour and hooks

| Modal | Opens | What your side does |
|---|---|---|
| **Onboarding** | First visit (flag `prophet.onboarded` in `localStorage`) and every How it Works click. | Drop the real recordings in as `assets/onboarding-N.mp4` and add each `<source>` inside its slide's `<video>`; the placeholder PNG stays as the poster. Copy is final. |
| **Vote** | Thesis block's Vote button on an open vote. If `viewer.signed_in` is `false` it instead dispatches `prophet:signin` on `document` (detail `{then:'vote', slug}`) and stops. | Wire sign-in to that event, then call `window.prophetVote.open(slug)` to resume. Casting is a client-side mock: hook the "Vote YES / NO" button to your endpoint and re-render with the server's tally. Votes are final — the button disables after one cast. |
| **Take sent** | Send / Enter, after the four checks pass. A take is counted as spent the moment it is sent. The 1.2s spinner stands in for your round trip. | Fill `take_result.*` from the response. The summary is prepended to the feed; **the raw text is never rendered anywhere.** |
| **Notices** | Nothing to send, Pick a side, Logged out. `window.prophetNotices.open('no-text' \| 'no-stance' \| 'logged-out')` previews them. | Nothing. |
| **Take limit** | Inside Take sent: when `take_limit_reason` is day or market the modal opens straight to its Limit state. The preview counts for itself (5 a day, 2 per market). | Return `take_limit_reason` on a rejected take; keep `takes_remaining_today` current. |
| **Logged out** | While `{{logout_url}}` is unfilled, clicking Logout dispatches `prophet:logout` and shows the notice. | Point the link at the real URL; show the notice on the way back. |

All modals: close on X, Escape or the backdrop; scroll locked behind; 44px
buttons on phones. Keyboard shortcuts on the page (Tab cycles tags, arrows move
the selection) are suspended while any modal is open.

Other globals: `window.prophetOnboarding.open()`, `window.prophetBoard.set({beat, speed})` (decorative board).

---

## 7. Rules the front end assumes of the server

- Carousel order and caps as in section 1; History is `resolved` in the same list.
- A take needs a side. `take_result.stance` is `yes` or `no` — there is no "unsure".
- `prophet_probability` is a whole integer with `%`. It is present on open votes, prophecies, history and evaluated no-thesis markets, and empty on a market that has not been evaluated.
- `hold_reason` on a Hold card is `no_gap` ("Nothing the price is missing yet.") or `under_gap` ("The price is missing something, too early to call."). Not evaluated (label `none`, also after a rejected vote) shows the static not-evaluated line. A gap of 5 or more is a draft, not a Hold.
- Allowance: `takes.per_day` a day, `takes.per_market` per market per day, enforced
  server-side and reported as `take_limit_reason`. Check order on Send is text →
  side → limit. A take is spent when it is sent.
- Votes can't be changed. Weight is the viewer's `viewer.balance`.
- Never show a wallet address. The viewer is `viewer.username`; the token
  contract in the header is the one address on the site.
- Relative times only, except a market's own dates: the chart axis and a ladder leg's `listed_leg_date`.
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

66 variables actually present in the files right now, with where each appears.

| Variable | Where | Holds |
|---|---|---|
| `{{agree_pct}}` | Home | Agree / Disagree under the thesis: the user's side (`agree` / `disagree` / empty) is marked; from three taps the split reads "62% agree · 14 taps", below that only the user's side; `market_closed` `true` disables both buttons. Signed-in only: a signed-out tap fires `prophet:signin` with `{then: 'agree', slug}` |
| `{{buy_url}}` | $PROPHET; Home; below-fold | Buy $PROPHET link (pump.fun) |
| `{{call_state}}` | Home | `live` / `resolved` / `void` / `closed`. Void shows "Market closed by Polymarket before resolution."; closed shows "Awaiting resolution" |
| `{{contract_address}}` | $PROPHET; Home; header | $PROPHET contract address; the header pill shows first 6 … last 6 and copies the full value |
| `{{docs_url}}` | $PROPHET; Home; header | External link to documentation site |
| `{{jupiter_url}}` | $PROPHET; Home; footer; header | $PROPHET on Jupiter (footer token link) |
| `{{label}}` | Home | `buy_yes` / `buy_no`. The call's label, in the card badge and the thesis block head; Buy YES green, Buy NO red. Never inside the thesis text |
| `{{linkedin_url}}` | $PROPHET; Home; footer; header | Link to the project's LinkedIn page |
| `{{listed_leg_date}}` | Home | Ladder markets only: the leg's date (e.g. `Oct 20`), under the question on the face and in the thesis header. Empty otherwise. When a leg rolls, the card returns to not evaluated with the next date and the old leg goes to History as resolved |
| `{{logout_url}}` | $PROPHET; Home; header | The Logout link in the header and menu; render the link only when `{{viewer.signed_in}}` is true. While unfilled, the click fires a `prophet:logout` event and shows the Logged out notice |
| `{{market.called_ago}}` | Home | Relative time of the call, in the meta row as "called 3d ago" |
| `{{market.called_pct}}` | Home | Odds when the thesis was called, e.g. `84%`; rendered on called cards only |
| `{{market.conviction}}` | Home | Star conviction, 1–5; shown in the thesis block head and the called badge |
| `{{market.ends_in}}` | Home | Relative time until the market ends (e.g. "12d", "3mo"), shown after a clock icon |
| `{{market.filter_state}}` | Home | `called` (the Calls deck) or `resolved` (History); the two tabs |
| `{{market.image_url}}` | Home | Market image, imported from Polymarket (44px square on the card) |
| `{{market.outcome}}` | Home | History: `right` / `wrong` / `void` / `awaiting` — the tag in the badge and the outcome line |
| `{{market.question}}` | Home | Market question text |
| `{{market.resolved_ago}}` | Home | Relative time since resolution, e.g. `2w ago` |
| `{{market.resolved_pct}}` | Home | Closing YES % at settlement, e.g. `97%` |
| `{{market.resolved_side}}` | Home | `yes` / `no` — the side the market settled on |
| `{{market.slug}}` | Home | URL-safe identifier for the market (used in `<!-- repeat: market -->`) |
| `{{market.state}}` | Home | — |
| `{{market.thesis}}` | Home | Full thesis text (called) or draft thesis (vote open), set as `data-thesis` on the card; shown in the Thesis block above the takes when the card is selected; empty otherwise |
| `{{market.thesis_stance}}` | Home | `yes` or `no`: which way the thesis (or draft) calls it; shown bold beside the Thesis label |
| `{{market.volume}}` | Home | Polymarket volume, short form (e.g. "$4.1M"), shown after a bar-chart icon |
| `{{market.yes_pct}}` | Home | Current YES percentage (e.g. "72%") |
| `{{market_closed}}` | Home | Agree / Disagree under the thesis: the user's side (`agree` / `disagree` / empty) is marked; from three taps the split reads "62% agree · 14 taps", below that only the user's side; `market_closed` `true` disables both buttons. Signed-in only: a signed-out tap fires `prophet:signin` with `{then: 'agree', slug}` |
| `{{number_moved}}` | Home | A call re-run after it was made: the block shows "Revised {ago}", the latest number beside the label with "{estimate} at call" in its own field, and when `number_moved` is `true` the line "His number has moved. The call stands to resolution." The thesis text is the latest. Empty when not revised |
| `{{pool_last_week}}` | $PROPHET | Last week's reward pool; the line reads "paid to the community" |
| `{{prophet_probability}}` | Home | The Prophet's number for the market, a whole integer with `%` (e.g. `78%`). Set as `data-estimate` on the card; shown as a plain purple percentage in the thesis block head for open votes, prophecies, history and Hold markets; empty when not evaluated. Always refers to the listed outcome; nothing flips on Buy NO |
| `{{pumpfun_url}}` | $PROPHET; Home; footer; header | $PROPHET on pump.fun (footer token link) |
| `{{revised_ago}}` | Home | A call re-run after it was made: the block shows "Revised {ago}", the latest number beside the label with "{estimate} at call" in its own field, and when `number_moved` is `true` the line "His number has moved. The call stands to resolution." The thesis text is the latest. Empty when not revised |
| `{{revised_number}}` | Home | A call re-run after it was made: the block shows "Revised {ago}", the latest number beside the label with "{estimate} at call" in its own field, and when `number_moved` is `true` the line "His number has moved. The call stands to resolution." The thesis text is the latest. Empty when not revised |
| `{{solscan_url}}` | $PROPHET; Home; footer; header | $PROPHET on Solscan (footer token link) |
| `{{swap_impact}}` | $PROPHET | Swap meta line, left: slip and price impact |
| `{{swap_slippage}}` | $PROPHET | Swap meta line, left: slip and price impact |
| `{{swap_sol_balance}}` | $PROPHET | The viewer's SOL balance, right of the swap meta line (e.g. "2.41 SOL") |
| `{{tap_count}}` | Home | Agree / Disagree under the thesis: the user's side (`agree` / `disagree` / empty) is marked; from three taps the split reads "62% agree · 14 taps", below that only the user's side; `market_closed` `true` disables both buttons. Signed-in only: a signed-out tap fires `prophet:signin` with `{then: 'agree', slug}` |
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
| `{{user_side}}` | Home | Agree / Disagree under the thesis: the user's side (`agree` / `disagree` / empty) is marked; from three taps the split reads "62% agree · 14 taps", below that only the user's side; `market_closed` `true` disables both buttons. Signed-in only: a signed-out tap fires `prophet:signin` with `{then: 'agree', slug}` |
| `{{viewer.signed_in}}` | $PROPHET; Home; header | `true` / `false`, on the thesis block. When false an Agree / Disagree tap fires `prophet:signin` instead |
| `{{wallet_burn_url}}` | $PROPHET | Explorer links for the three public wallets (Trading Wallet, Rewards Pool, Buy-and-Burn); shown as labels, never as addresses |
| `{{wallet_burn_value}}` | $PROPHET | Tokens burned, red (e.g. "8.4M"); the "$PROPHET" ticker after it stays gray, then a red flame icon |
| `{{wallet_rewards_url}}` | $PROPHET | Explorer links for the three public wallets (Trading Wallet, Rewards Pool, Buy-and-Burn); shown as labels, never as addresses |
| `{{wallet_rewards_value}}` | $PROPHET | Live balances, green |
| `{{wallet_war_chest_url}}` | $PROPHET | Explorer links for the three public wallets (Trading Wallet, Rewards Pool, Buy-and-Burn); shown as labels, never as addresses |
| `{{wallet_war_chest_value}}` | $PROPHET | Live balances, green |
| `{{x_url}}` | $PROPHET; Home; footer; header | Link to the project's X (Twitter) account |
