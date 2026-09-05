# Handoff — The Prophet, front end

Static HTML, CSS and vanilla JS. No build step, no npm, no framework. Open any
page in `site/` directly from disk and it works; every asset path is relative.

Everything the server fills in is written as `{{name}}`. That syntax is a
placeholder for your templating language — swap it for whatever you use. The
full list is in the table below and in `TEMPLATE_VARS.md`.

---

## 1. Files

| Path | What it is |
|---|---|
| `CLAUDE.md` | The design spec. Every layout and styling decision is written down here. Read this first. |
| `TEMPLATE_VARS.md` | Variable list, grouped by page. Same data as the table below. |
| `HANDOFF.md` | This file. |
| `robots.txt` | `Disallow: /` for the test deploy. Delete at launch. |
| `index.html` (repo root) | Redirect to `site/index.html`, so the bare GitHub Pages URL is not a 404. Delete once `site/` is the document root. |
| `tools-stamp.py` | Rewrites the `?v=<hash>` on `app.js` and `styles.css` in every page from the file's own content hash. Run it after editing either file. Without it a browser keeps a cached copy after a deploy. Delete it and the query strings once your server sets cache headers. |
| `site/index.html` | Home. Carousel of 12 markets, thesis block, takes, prompt bar. |
| `archive/prophecies.html` (archived, not built) | Prophecies. Open votes and live prophecies, each row expandable to its takes. |
| `site/prophet.html` | $PROPHET. Stat strip, price chart, swap, live trades, wallets. |
| `site/partials/header.html` | **Canonical** header. |
| `site/partials/below-fold.html` | **Canonical** How it Works, Tokenomics, Roadmap. |
| `site/partials/footer.html` | **Canonical** footer. |
| `site/styles.css` | All styles. One file, no preprocessor. |
| `site/app.js` | All scripts. One file, no modules. |
| `site/assets/fonts/` | Orbitron 500 (headings, wordmark) and Space Grotesk (everything else). |
| `site/assets/prophet-logo-transparent.svg` | Logo mark. |
| `site/assets/wordmark_offwhite.svg` | Wordmark. |
| `site/assets/prophet-favicon-16.png`, `-32.png` | Favicons. |
| `site/assets/prophet-og-1200x630.png` | OG card image. See the note in section 6. |
| `site/assets/tradeleague-logo.svg`, `tradeleague-mark.svg` | Partner marks, footer only. |
| `site/assets/jupiter.png`, `pumpfun.png`, `solscan.png` | Third-party logos, rendered grayscale. |

---

## 2. Partials — what must stay in sync

The files in `site/partials/` are the source of truth. Each of the four pages
carries an inline copy wrapped in markers:

```html
<!-- partial:header -->   ... <!-- /partial:header -->
<!-- partial:below-fold --> ... <!-- /partial:below-fold -->
<!-- partial:footer -->   ... <!-- /partial:footer -->
```

Replace everything between each pair with a server include and the duplication
goes away. Until you do, a change to a partial has to be pasted into all four
pages. The markers exist so you can find and replace them mechanically.

**One difference between the copies:** each page marks its own nav link with
`class="active"`. Home does not mark any link. Set this per route.

---

## 3. Repeating rows

Each repeating block has one template-variable copy inside a `<template>`
element, wrapped in comment markers:

```html
<!-- repeat: market -->
<template>
  <div class="carousel__card" ...>{{market.question}}</div>
</template>
<!-- /repeat: market -->
```

Browsers do not render `<template>`, so the file opens cleanly from disk while
still carrying the exact markup your loop should emit. Replace the whole
`<template>` element with your loop.

| Loop | Page | What it repeats |
|---|---|---|
| `market` | Home | Carousel cards |
| `take` | Home, Prophecies | Take rows |
| `contributor` | Home | Contributor rows in the thesis block |
| `vote` | Prophecies | Open-vote rows |
| `thesis` | Prophecies | Live prophecy rows |
| `entry` | Prophecies | History rows |
| `update` | Prophecies | Update steps inside a history row's chain |

| `trade` | $PROPHET | Pills in the live-trades strip |

The hardcoded rows sitting next to each `<template>` are mock data. Delete them
when the loop is live.

---

## 4. The JavaScript

One file, `site/app.js`, nine independent IIFEs. Each one exits immediately if
its element is not on the page, so the same file is safe on all four pages.
Everything is progressive: with JS off, every page still renders and reads.

| Block | What it does | What it needs from you |
|---|---|---|
| Mobile menu toggle | Opens the header panel under 768px. | Nothing. |
| Preview fill | Any element with `data-mock` whose text is still an unfilled `{{variable}}` swaps in the mock value. | **Nothing — this is a dev aid.** Once your variables are filled it does nothing. You can delete it and the `data-mock` attributes at launch. |
| Contract address copy | Shows first 6 … last 6 of the address, copies the full value, flashes "copied". | `{{contract_address}}`. Falls back to a sample address while unfilled. |
| Carousel | Card selection, deck rotation, arrow keys, mobile swipe, filter tags, and the typewriter placeholder. Reads the selected card's `data-thesis`, `data-contributors`, `data-state` and `data-stance` to render the thesis block. | Those four `data-` attributes on each card. Takes are currently a JS object literal (`TAKES`) keyed by slug — **replace this with server-rendered rows or a JSON endpoint.** |
| Roadmap timeline light | The travelling streak on the Roadmap. | Nothing. Pure decoration. |
| List panels | Filter tags, row dropdowns, and vote popups on Prophecies. | Nothing for display. The vote buttons are **UI only** — wire them to your vote endpoint. |
| $PROPHET price chart | Draws the area chart, x-axis and price tag from JSON. Redraws on resize. | `{{token.chart_series}}` (JSON array of prices, oldest first) and `{{token.chart_ticks}}` (JSON array of axis labels). |
| Circuit board | Decorative canvas around the prompt bar only, desktop (1024px+), home page only. Right-angle traces from the bar's frame to small pads; light runs out to a pad, which fills then drains. **Nothing to wire.** It measures the bar and the surrounding content every frame and rebuilds if the layout shifts, so traces never cross text or a card. `window.prophetBoard.pulse()`, `.all()`, `.rest(0.05)` for tuning. 30fps cap, pauses on hidden tabs, static under `prefers-reduced-motion`. | Nothing. Purely decorative; safe to delete with its `<canvas data-board>` element. |
| Price / MCap toggle | Highlights the selected mode. | **Visual only.** Serve the matching series. |

---

## 5. What is deliberately static at launch

These render as fixed markup today and need wiring when the backend is ready.

| Thing | Where | State now | Wire later |
|---|---|---|---|
| Swap panel | $PROPHET | Fields, flip button and Buy button are inert. | Quote, approve and submit. |
| Vote buttons | Home, Prophecies | Toggle the chosen state in the browser only; nothing is sent, nothing persists. | Post the vote, gate on holdings, return the new tally. |
| Prompt bar | Home | Text field and send button. The typewriter runs; the send button does nothing. | Submit the take. |
| Range and Price/MCap tabs | $PROPHET | Highlight only. | Filter server-side. |
| Live trades | $PROPHET | Ten mock pills. | Stream or poll. |
| Empty states | Home, Prophecies | Template variables with approved fallback copy in the markup. | Fill the variables, or leave the fallbacks. |
| Walkthrough | Home | Three cards, first visit only, remembered in `localStorage` under `prophet_walkthrough_done`. Copy is still `[COPY]`. | Write the copy. No other change needed. |
| Signed-out account label | Header | Shows `[COPY]`. | Write the label, or fill `{{username}}` when signed in. |
| How it Works, Tokenomics, Roadmap | Below the fold | **Final copy, intentionally static.** Only `{{buy_url}}` is a variable. | Nothing. Do not template the rest. |
| Stat tiles on $PROPHET | $PROPHET | Six cells with mock values. | Feed from your price source. |

---

## 6. Two things to fix on your side

1. **OG image path.** `<meta property="og:image">` is a relative path so the
   file opens from disk. Social scrapers need an absolute URL. Rewrite it to
   your full domain when you deploy.

2. **`robots.txt` placement.** It sits at the repo root. If you serve the site
   from a subpath, crawlers will not read it there — they only read
   `/robots.txt` at the domain root. Each page also carries
   `<meta name="robots" content="noindex, nofollow">`, which does work at any
   path. **Remove that meta tag from all four pages at launch.**

---

## 7. Conventions worth keeping

- **No calendar dates anywhere.** Every time is relative: "3d ago", "2w left".
  The only exception is the $PROPHET chart's x-axis, which shows clock times on
  short ranges and dates on long ones.
- **Never show a wallet address.** Wallets are links labelled "Public wallet".
  The token contract in the header is the one address on the site.
- **Losses sit next to wins.** The History group shows both, always.
- **Four colours only:** navy `#151B26`, deep purple `#5F3A8B` (logo and hero
  glow), readable purple `#B08CF5` (vote states), green `#10F05F`, off-white
  `#F2F0E6`. Red `#e53935` is used for NO, losses and burns.
- **Green is the only action accent.** Purple marks vote states, and the Vote
  button is the one purple control.
- `[COPY]` marks copy in the character's voice that has not been written. Do
  not invent it.

---

## 8. Variable reference

126 variables. "Mock now" is what renders today with nothing filled in.

| Variable | Page | Holds | Mock now |
|---|---|---|---|
| `{{buy_url}}` | $PROPHET; Home; Prophecies; Record; below-fold | Buy $PROPHET link (Tokenomics section) | — (not rendered until filled) |
| `{{contract_address}}` | $PROPHET; Home; Prophecies; Record; header | Token contract address; the pill shows first 6 … last 6 and copies the full value | — (not rendered until filled) |
| `{{contributor.claim}}` | Home | Their contribution, one line | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{contributor.username}}` | Home | Contributor name in the thesis block | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{contributor.xp}}` | Home | XP earned | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{docs_url}}` | $PROPHET; Home; Prophecies; Record; header | External docs link (header) | — (not rendered until filled) |
| `{{empty_no_takes}}` | Home | Line shown when the selected market has no takes | — (not rendered until filled) |
| `{{empty_open_votes}}` | Prophecies | Line shown when there are no open votes | — (not rendered until filled) |
| `{{empty_prophecies}}` | Prophecies | Line shown when there are no live prophecies | — (not rendered until filled) |
| `{{empty_record}}` | Record | Line shown when the Record has no entries | — (not rendered until filled) |
| `{{entry.call_text}}` | Record | Chain: the call | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.called_ago}}` | Record | Relative time of the call | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.called_pct}}` | Record | Market % at the call | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.conviction}}` | Record | Conviction 1–5 | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.image_url}}` | Record | Market image | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.lesson}}` | Record | Chain: the lesson | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.outcome}}` | Record | `won` or `lost` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.question}}` | Record | Market question | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.resolved_ago}}` | Record | Relative time since resolution | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.resolved_pct}}` | Record | Closing market % | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.resolved_side}}` | Record | `yes` or `no` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.resolved_side_upper}}` | Record | `YES` or `NO` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.slug}}` | Record | Row key | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.stance}}` | Record | `yes` or `no` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.stance_upper}}` | Record | `YES` or `NO` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.take_count}}` | Record | Takes | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{entry.volume}}` | Record | Volume | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{explainer_open_votes}}` | Prophecies | Explainer under the Open votes title | `Draft theses waiting on holders. Vote YES or NO. Your voting weight is what you hold.` |
| `{{explainer_prophecies}}` | Prophecies | Explainer under the Prophecies title | `Calls that passed the vote, live until the market resolves.` |
| `{{explainer_record}}` | Record | Explainer under the History title | `Every call he's made, with the odds at the time and how it ended.` |
| `{{jupiter_url}}` | $PROPHET; Home; Prophecies; Record; footer | $PROPHET on Jupiter | — (not rendered until filled) |
| `{{linkedin_url}}` | $PROPHET; Home; Prophecies; Record; footer | The Prophet on LinkedIn | — (not rendered until filled) |
| `{{market.contributors_json}}` | Home | JSON array of {user, claim, xp} for the contributors list | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.ends_in}}` | Home | Market ends-in, after the clock icon | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.filter_state}}` | Home | `none`, `vote` or `called`; drives the filter tags | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.image_url}}` | Home | Polymarket market image, 44px square | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.question}}` | Home | Market question, clamped to two lines | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.slug}}` | Home | Market id, used as the row key | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.state}}` | Home | State badge markup; empty unless vote-open or called | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.take_count}}` | Home | Takes, after the person icon | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.thesis}}` | Home | Full thesis (called) or draft (vote open), set as data-thesis | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.thesis_stance}}` | Home | `yes` or `no`; the stance shown beside the Thesis label | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.volume}}` | Home | Volume, after the bar icon | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.vote_count}}` | Home | Votes cast, after the vote icon | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.vote_time_left}}` | Home | Vote time left, after the purple clock | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{market.yes_pct}}` | Home | Live YES %, the big number | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{polymarket_as_of}}` | Home | Relative time of the last feed check, shown on hover | — (not rendered until filled) |
| `{{polymarket_status}}` | Home | `up` or `down`; `down` turns the dot red and stops the pulse | — (not rendered until filled) |
| `{{pool_last_week}}` | $PROPHET | Last week's reward pool | `$12,400` |
| `{{pumpfun_url}}` | $PROPHET; Home; Prophecies; Record; footer | $PROPHET on pump.fun | — (not rendered until filled) |
| `{{record.calls}}` | Record | Total calls | `4` |
| `{{record.edge}}` | Record | Edge as a signed number; "pts" is static | `+9.4` |
| `{{record.edge_class}}` | Record | `stats__num--win` or `stats__num--loss` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{record.edge_range}}` | Record | Selected range: `1w`, `1m`, `3m`, `1y`, `all` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{record.losses}}` | Record | Losses | `2` |
| `{{record.win_rate}}` | Record | Win rate | `50%` |
| `{{record.wins}}` | Record | Wins | `2` |
| `{{solscan_url}}` | $PROPHET; Home; Prophecies; Record; footer | $PROPHET on Solscan | — (not rendered until filled) |
| `{{swap_impact}}` | $PROPHET | Price impact | `0.81%` |
| `{{swap_slippage}}` | $PROPHET | Slippage | `1.5%` |
| `{{swap_sol_balance}}` | $PROPHET | Viewer's SOL balance | `2.41 SOL` |
| `{{take.ago}}` | Home; Prophecies | Relative time | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{take.claim}}` | Home; Prophecies | The take, one line | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{take.stance}}` | Home; Prophecies | `yes` or `no` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{take.username}}` | Home; Prophecies | Who posted the take | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{take.xp}}` | Home; Prophecies | XP earned, rendered as "+N XP" | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{tg_url}}` | $PROPHET; Home; Prophecies; Record; footer | The Prophet on Telegram | — (not rendered until filled) |
| `{{thesis.called_pct}}` | Prophecies | Market % at the call | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.conviction}}` | Prophecies | Conviction 1–5, after the star | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.ends_in}}` | Prophecies | Market ends-in | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.image_url}}` | Prophecies | Market image | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.live_pct}}` | Prophecies | Live market YES % | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.question}}` | Prophecies | Market question | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.slug}}` | Prophecies | Row key | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.stance}}` | Prophecies | `yes` or `no` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.stance_upper}}` | Prophecies | `YES` or `NO` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{thesis.text}}` | Prophecies | Thesis text | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{tl_linkedin_url}}` | $PROPHET; Home; Prophecies; Record; footer | TradeLeague on LinkedIn | — (not rendered until filled) |
| `{{tl_tg_url}}` | $PROPHET; Home; Prophecies; Record; footer | TradeLeague on Telegram | — (not rendered until filled) |
| `{{tl_x_url}}` | $PROPHET; Home; Prophecies; Record; footer | TradeLeague on X | — (not rendered until filled) |
| `{{token.chart_series}}` | $PROPHET | JSON array of prices, oldest first | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{token.chart_ticks}}` | $PROPHET | JSON array of x-axis labels for the range | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{token.fees_earned}}` | $PROPHET | Fees earned, in dollars, green | `$74.44K` |
| `{{token.holders}}` | $PROPHET | Holder count | `4,319` |
| `{{token.holders_change}}` | $PROPHET | 24h change in holders | `+64` |
| `{{token.liquidity}}` | $PROPHET | Liquidity | `$107.7K` |
| `{{token.market_cap}}` | $PROPHET | Market cap | `$1.15M` |
| `{{token.market_cap_change}}` | $PROPHET | 24h change | `-22.34%` |
| `{{token.price}}` | $PROPHET | Live price | `$0.00117` |
| `{{token.price_change}}` | $PROPHET | 24h change | `-17.67%` |
| `{{token.volume_24h}}` | $PROPHET | 24h volume | `$960.56K` |
| `{{token.volume_change}}` | $PROPHET | 24h change | `+18.2%` |
| `{{trade.amount}}` | $PROPHET | Trade size | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{trade.side}}` | $PROPHET | `buy` or `sell` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{tradeleague_url}}` | $PROPHET; Home; Prophecies; Record; footer | "Automated by TradeLeague" lockup link | — (not rendered until filled) |
| `{{update.ago}}` | Record | Relative time of that update | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{update.text}}` | Record | Chain: one update | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{username}}` | $PROPHET; Home; Prophecies; Record; header | Signed-in display name; signed out shows a [COPY] label | `[COPY]` |
| `{{vote.button_label}}` | Prophecies | `Vote`, or `Voted <span class="tally tally--yes">YES</span>` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.ends_in}}` | Prophecies | Market ends-in | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.image_url}}` | Prophecies | Market image | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.live_pct}}` | Prophecies | Live market YES % | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.my_no_class}}` | Prophecies | `vote-btn--chosen` if the viewer voted no | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.my_yes_class}}` | Prophecies | `vote-btn--chosen` if the viewer voted yes | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.question}}` | Prophecies | Market question | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.slug}}` | Prophecies | Row key | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.stance}}` | Prophecies | `yes` or `no` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.stance_upper}}` | Prophecies | `YES` or `NO` | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.tally_pct}}` | Prophecies | Live tally % | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.tally_side}}` | Prophecies | `Yes` or `No`, capitalized not all-caps | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.thesis}}` | Prophecies | Draft thesis text | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.time_left}}` | Prophecies | Vote time left | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{vote.vote_count}}` | Prophecies | Votes cast | — (inside a `<template>`; the sample rows beside it are the mock) |
| `{{wallet_burn_url}}` | $PROPHET | Explorer link | — (not rendered until filled) |
| `{{wallet_burn_value}}` | $PROPHET | Tokens burned, red | `8.4M` |
| `{{wallet_pools_url}}` | $PROPHET | Explorer link | — (not rendered until filled) |
| `{{wallet_pools_value}}` | $PROPHET | Live balance | `$9,750` |
| `{{wallet_rewards_url}}` | $PROPHET | Explorer link | — (not rendered until filled) |
| `{{wallet_rewards_value}}` | $PROPHET | Live balance this week | `$12,400` |
| `{{wallet_war_chest_url}}` | $PROPHET | Explorer link | — (not rendered until filled) |
| `{{wallet_war_chest_value}}` | $PROPHET | Live balance | `$48,200` |
| `{{x_url}}` | $PROPHET; Home; Prophecies; Record; footer | The Prophet on X | — (not rendered until filled) |

## MVP scope

Two pages ship: home and $PROPHET. Prophecies and Record are **archived in
`archive/`**, out of the nav and the build, so they can come back without a
rebuild. Everything they showed is on the home carousel.

Carousel order is the server's job: open-vote markets first, then markets
with a live thesis (most recently called first, capped at twelve), then
markets with no thesis. The four tags above the carousel filter that list. History (`filter_state`
`resolved`) is the last ten to twelve resolved markets, newest first; those
cards sit in the same list but the JS shows them only under the History tab.

The bottom row of a card depends on its state — see the comment on the card
`<template>` in `site/index.html`. The YES | NO switch at the left of the prompt bar (shown only for an open vote) and the
thesis block's popup share one vote; the JS keeps them in step.

The Edge-chart JS is still in `app.js`, inert without the Record page.
