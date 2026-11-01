# The Prophet — UI Build Spec: changes to theprophet.fun

November 1, 2026 · preview https://ajmagege96.github.io/prophet-site/site/ (matches `main`)

This is the delta between what theprophet.fun serves today and the UI in this
drop. The live page still renders a deck of no-thesis cards with the prompt bar,
the YES | NO stance switch, the Vote and Take-sent modals, take-limit notices,
Hold / not-evaluated cards and credits. All of that is replaced by what follows.
The below-fold copy (How it Works, Tokenomics, Roadmap), the onboarding slides,
the footer and the $PROPHET page are unchanged and are not in this spec.

Full reference in the repo: `HANDOFF.md` (contracts, hooks, variable table),
`TEMPLATE_VARS.md` (every variable), `CLAUDE.md` (design rules),
`PRODUCT-NOTES.md` (the same surface, written for the product side).

---

## 1. The two verbs

The product has two verbs on the surface: **Agree** and **Disagree**. The words
vote, take, credits and holders decide do not appear in the hero. Counts of
agree / disagree actions are **taps**, never trades.

## 2. Remove

| Live today | Status |
|---|---|
| Prompt bar: text field, Send, the YES \| NO stance switch, takes-left count, typewriter placeholder | Removed. No text entry on the site. |
| Takes feed under the thesis block | Removed. |
| Credits / contributors list | Removed. |
| Vote modal, Vote button, tally, countdown, "Voted YES" state | Removed. |
| Take-sent modal (loading, confirmed, limit states) | Removed. |
| Notices: Nothing to send, Pick a side, cooldown, out of takes | Removed. The Logged out notice stays. |
| Hold and not-evaluated cards; `hold_reason`; `no_edge_line`; the Hold badge | Removed. |
| His number (`prophet_probability`) anywhere; last-run line | Removed. |
| "N% at call" on the card face | Removed. `called_pct` stays on the card as data for the Tap Confirmed line. |
| Buy $PROPHET link on cards | Removed. |
| Filter tags No thesis · Open votes · Prophecies | Replaced by two tabs. |
| Prophecies and Record pages | Archived; everything lives on the home carousel. |

Variables that go with them: `market.take_count`, `market.vote_*`, `take.*`,
`take_result.*`, `takes.*`, `takes_remaining_today`, `take_limit_reason`,
`viewer.take_cooldown`, `market.viewer_takes_used`, `contributor.*`,
`market.contributors_json`, `empty_no_takes`, `hold_reason`, `no_edge_line`,
`window_class`, `last_run_at`, `viewer.balance`, `viewer.vote_share`,
`prophet_probability`, `market.thesis_stance`, `market.thesis_stance_upper`,
`market.called_ago`, `revised_ago`, `revised_number`, `trade_count`.

## 3. Header

Logo and wordmark left; **How it Works** right of the logo on desktop and first
in the mobile menu; it opens a four-slide click-through every time (section 10).
Desktop nav: **Midterms** · $PROPHET · Docs · Logout (signed in only, red on
hover), then the contract-address pill. Mobile: logo, address pill, one menu
button; the menu holds How it Works, Midterms, $PROPHET, Docs, Logout.
Midterms is green while you are on that page (section 13).

## 4. Deck and tabs

- Two tabs above the carousel: **Calls** · **History**. One always on (Calls by
  default); the Tab key switches. Gray highlight, no colour.
- **Calls** = every listed market with a call (`filter_state` `called`), in
  the server's order, most interesting first, **twenty at most**.
  **History** = `filter_state` `resolved`: resolved, pending and void calls.
  Both come in the same `<!-- repeat: market -->` loop; the client shows one
  tab at a time.
- Empty tab: one centred line, "No live calls right now. He's reading."
- Three cards across on desktop, one on phones with the next peeking. Fixed
  height, 196px desktop / 184px phone; nothing shifts on tab change.
- Exactly one card is selected: brighter white outline, and it flashes green
  every 3s on the same beat as the thesis block, so the block reads as that
  market's. Click selects; desktop arrows rotate the deck; arrow keys move the
  selection; swipe on phones.

## 5. The card face

Top to bottom:

1. **Image** (44px) top-left; **market odds** top-right, 26px display face —
   `{{market.yes_pct}}` + "YES" — the live price, or the settled 100% / 0%.
   Pending odds keep updating; never frozen.
2. **Question**, two lines max. A ladder market prints `{{listed_leg_date}}`
   small and gray beside it.
3. **The call, big** (24px display face): `Buy YES` green or `Buy NO` red —
   `{{market.side}}` / `{{market.side_upper}}`.
4. **Meta row**:
   - Calls: five conviction stars (`{{market.conviction}}` filled, in the call's
     green or red, the rest faint in the same colour) · bar icon +
     `{{market.volume}}` · clock icon + `{{market.ends_in}}`.
   - History: stars · volume · and at the bottom right the result tag
     `{{market.outcome_tag}}`: **right** (green), **wrong** (red), **void**
     (gray), **pending** (purple). No time to close.
   - The stars hide only when the carousel root carries
     `data-show-conviction="false"` (`{{show_conviction}}`).

Card attributes the client reads: `data-state`, `data-slug`, `data-label`,
`data-side`, `data-call-kind`, `data-time-line`, `data-called-pct`,
`data-conviction`, `data-call-state`, `data-outcome`, `data-resolved-side`,
`data-resolved-pct`, `data-resolved-ago`, `data-leg-date`,
`data-resolution-text`, `data-outcome-note`, `data-agree-pct`,
`data-tap-count`, `data-user-side`, `data-market-closed`, `data-thesis`.

## 6. The thesis block

One block under the carousel for the selected card, outlined like the selected
card. It reads as a normal thesis box with **one drop-down**.

- **Header**: THESIS, then a small purple marker by `{{market.state}}`:

  | State | Tab | Marker |
  |---|---|---|
  | `called` | Calls | `{{market.time_line}}` — "Called 3d ago" |
  | `revised` | Calls | "Revised 3h ago" (same side, updated) |
  | `changed` | Calls | "Changed 2h ago" (he switched side) |
  | `pending` | History | "Pending", no time |
  | `resolved` | History | "Resolved `{{market.resolved_ago}}`" |
  | void | History | none |

  On a resolved call, "Resolved YES · right" (side and right green / wrong red,
  no time) sits at the right of the header. Nothing there while pending or
  void. A chevron at the far right opens the drop-down.
- **Thesis text**, latest revision (`{{market.thesis}}`), always shown.
- **Drop-down**, under a hairline. Closed by default on both tabs and on every
  card change; the header toggles it. Built so more parts can join it later
  (his calls on this market, chart, taps). In it now, **RESOLUTION**:

  | State | Shows |
  |---|---|
  | Live | `{{market.resolution_text}}` — how the market pays: "Pays YES if Peltola wins the Alaska Senate race on November 3." Never empty. |
  | Pending, trading closed or end date passed | `resolution_text` — "Trading has closed. … Nothing is scored until Polymarket confirms the result." |
  | Pending, price at 99 / 1 | `resolution_text` — "The result is effectively in, but Polymarket has not confirmed it. Nothing is scored until it does." |
  | Disputed | `resolution_text` — "The proposed result has been challenged. Polymarket's resolvers will rule, and nothing is scored until they do." |
  | Resolved | Only `{{market.outcome_note}}`, his resolution copy in his voice. No fact line: the marker and the header already say what happened and when. |
  | Void | `resolution_text` — "Polymarket closed this market without a result. His calls and every tap on them don't count." |

  The plain-fact line renders in gray; his outcome note at full strength.

The block carries `data-signed-in="{{viewer.signed_in}}"`.

## 7. Agree / Disagree

A centred row under the block, Calls only (hidden on History):

- **Agree** and **Disagree**, 40px tall (44px on phones), bright green and red
  until the user taps; no hover change, no outline. Nobody is pre-selected
  unless `{{user_side}}` says so.
- **A tap is final.** The chosen side stays bright and the other dims (~35%).
  Tapping either button again opens a small notice — "You agreed already." /
  "You disagreed already." (`{{notice.already_agree}}`,
  `{{notice.already_disagree}}`) with OK. No switching, no deselect.
  `{{market_closed}}` true hides both buttons; only the split shows.
- Under the buttons, centred, from three taps: "`{{agree_pct}}`% agree ·
  `{{tap_count}}` taps" (e.g. "71% agree · 38 taps"); below three, only "You
  agree" / "You disagree". The server's figure; never recomputed on a tap.
- On a **changed** call send `user_side` empty: the buttons start unselected and
  the earlier tap stays with the earlier call, unseen.
- Signed out: a tap dispatches `prophet:signin` with `{then: 'agree', slug}` and
  nothing else. After sign-in, `window.prophetTap.land(slug, side)` lands it.

## 8. Tap Confirmed modal

Opens on the user's one tap on a call. Centred dialog
on desktop, bottom sheet on phones; X, backdrop or swipe down close it.

1. Side chip, Agree green / Disagree red.
2. Agree: "You're calling him right. Buy YES at 84. Let's see if you're both
   right." Disagree: "You're calling him wrong. Buy NO at 22, you say that's
   wrong." Label in its colour; right / wrong plain; price is `called_pct`
   without the %.
3. "Scored when the market resolves. Right or wrong, it's on your record and
   you'll earn XP."
4. One button, **Next call** (**Back to top** on the last card).

Lines are config strings on the modal root: `{{tap_modal.confirm_agree}}`,
`{{tap_modal.confirm_disagree}}`, `{{tap_modal.scoring_line}}`, with `{label}`,
`{verdict}`, `{price}` tokens. The copy above is the fallback.

## 9. Layout and motion

- The home hero is as tall as its content; How it Works follows the Agree /
  Disagree row directly.
- Every 3s the thesis block's frame and the selected card swell green over
  ~0.9s and release as slowly. On desktop (1024px+) a circuit trace also leaves
  the block. Decorative; nothing to wire.

## 10. How it Works modal

A four-slide click-through on the onboarding shell (`partials/how-it-works.html`):
What he does · Agree or Disagree · He can change his mind · Election night
keeps score. Lines are `[COPY]` until the founder writes them. Opens from the
How it Works link every time, never on its own. The first-visit onboarding
(`partials/onboarding.html`) opens once per device. Globals:
`window.prophetHowItWorks.open()`, `window.prophetOnboarding.open()`.

## 11. Variables

Added across this drop: `label`, `call_state`, `listed_leg_date`, `agree_pct`,
`tap_count`, `user_side`, `market_closed`, `tap_modal.confirm_agree`,
`tap_modal.confirm_disagree`, `tap_modal.scoring_line`, `notice.already_agree`,
`notice.already_disagree`, `market.side`,
`market.side_upper`, `market.state` (called / revised / changed / pending /
resolved), `market.time_line`, `market.conviction`, `show_conviction`,
`market.outcome_tag`, `market.resolution_text`, `market.outcome_note`,
`midterms.races_json`, `midterms.calls_json`.
`market.outcome` takes `right` / `wrong` / `void` / `pending`;
`market.filter_state` takes `called` / `resolved`.

Not built, by the founder's call: `market.against_market`,
`market.called_date`, `market.called_number`, `market.change_count`,
`market.change_note`.

Descriptions in `TEMPLATE_VARS.md`; the generated table in `HANDOFF.md` §10.

## 12. Check before shipping

- Calls shows at most twenty cards; History holds resolved, pending and void;
  the empty line shows on an empty tab.
- Every card: odds top-right, Buy YES / Buy NO in its colour, stars in that
  colour, no at-call stat, one meta line, no overflow at 390px. History cards
  show the result tag bottom right and no time to close.
- The marker reads Called / Revised / Changed with time on Calls, "Pending" or
  "Resolved {time}" on History, nothing on void.
- Every card opens with the drop-down closed. Opening it shows the pays line on
  a live card, the pending line on a pending card, only his outcome note on a
  resolved card, the void line on a void card.
- A pending card sits in History with the purple pending tag and a price that
  matches Polymarket.
- A changed card reads "Changed" and its buttons start unselected.
- Agree / Disagree: bright until the first tap; after it the chosen side stays
  bright, the other dims, and tapping either opens "You agreed already." /
  "You disagreed already."; a changed call starts fresh; closed markets show no
  buttons, only the split; the split never moves on a tap; the
  word is taps.
- Signed out: a tap fires `prophet:signin` only; `prophetTap.land` shows the
  modal. Tap Confirmed opens on the first tap; Next call advances; Back to
  top on the last card; swipe down closes it on a phone.
- How it Works opens from the header and the menu every time; onboarding only on
  a first visit.
- No "vote", "take", "credits" or "trades" anywhere in the hero.
- Midterms: 74 races under All, each race once in its group, no collapsed section; both
  views work, rows carry Agree / Disagree, the pane follows the selection; every race and
  page state renders at 390px and 1400px with no overflow; no double negatives;
  the map colours match the picks (a NO shows the runner-up's party); hit rate
  excludes void and hides until a race resolves; no money line anywhere.

## 13. Midterms page

`site/midterms.html`: 74 races (3 Balance of Power markets, 35 Senate seats, 36
governors), one locked call each. Its own rules: no deck, no carousel; the home
Calls and History tabs carry no midterm race. Every visible string is
placeholder copy.

**Data.** Two JSON arrays the server fills, inside
`<script type="application/json">` tags: `{{midterms.races_json}}` (event id,
leg id, market id, group, kind, state code, race name, called leg, party,
runner-up, runner-up party, layer, featured) and `{{midterms.calls_json}}` (market
id, leg id, side, stars, thesis, settlement line, volume, price at call, live
price, state, pending reason, outcome, outcome line, tap counts, the viewer's
side). `volume` is the one field added beyond the earlier spec.
Joined on market id + leg id. The page computes every stat; there is no stats
endpoint. `midterms-mock.js` stands in until then: it opens with a few races
pending and resolved so the stats read with numbers; `#preview=live` shows every
race live and `#preview=all` every race resolved.

**Layout.**

| Zone | Phone (390px) | Desktop (1400px) |
|---|---|---|
| Title row | "Midterms" left, a Senate / Governors map dropdown right | "Midterms" alone, level with the markets bar |
| Map | One tile map, first | Both maps stacked under the stats |
| Headline stats | One row under the map: Called · Resolved · Right · Hit rate | Left column under the title, sticky |
| Markets bar | Sticky: set dropdown left, cards / list icon toggle right | Right column, sticky, level with the title |
| Markets | Cards two across (compact: race top left, odds top right, no arrow (a tap opens it), pick, stars · volume · tag, buttons, tally; the stars line, buttons and tally line up across a row; an opened card spans both columns), or rows (three lines: race · odds · chevron / pick · stars / tally left, buttons or tag right) | Cards in a grid, or rows (one line) |
| Selected market | A drop-down chevron on every card and row; opened (or tapped), the market shows as the desktop pane's card in place, in cards or list | Always one selected; its full card in a sticky pane beside the markets |

The dropdown (no label) sets what shows: **All** (the default) · Balance of
Power · Senate · Governors. The view toggle is two icons, a 2×2 grid of rounded
filled squares (cards) and three lines (list), no words, remembered per viewer. Every set is the full list,
nothing collapsed. The top markets lead each set in the MVP order, read from
the race list's featured and layer fields: featured, then contested by price
closest to 50, then safe. No server ranking. A click anywhere on a card or row selects it. The selected market reads
like the home's: brighter white outline, flashing green every 3s (0.9s build
and release) on the card, the row and the pane card.

**Stats.** Called = races with a call. Resolved = resolved right or wrong.
Right = resolved right. Hit rate = right ÷ resolved, void excluded.
Resolved, Right and Hit rate read a dash until one race resolves. These four
are the only stats on the page (no per-set stats). No five-star line. No money lines
anywhere.

**Maps.** One square tile per state. A seat in play is filled with the party of
his pick (D blue, R red, I off-white: the one palette exception, on this page);
a NO takes the runner-up's party. Seats not up stay neutral. Void is a dashed
outline. Resolved seats keep the colour and gain a small drawn check (green) or X (red). A tile opens
its race in its group.

**His pick, never a double negative.**

| Call | Shows |
|---|---|
| YES | The called candidate or party |
| NO, two-candidate race | The runner-up |
| NO, multi-candidate race (AK, CA, ID, MI, RI) | "Not" + the called candidate |
| NO on Balance of Power | The runner-up outcome ("R Senate · D House") |
| NO on Senate or House control | The other party |

**Card**: race and group top left; the market odds top right as on the home
cards, "57% YES" for the pick the card names (settled 100 / 0 once resolved);
his pick with party chip; the meta line: stars · bar-chart icon + volume (as the
home cards), the state tag at the right of the same line (in the pane too). No
"% at call", no time remaining, no chevron on a desktop card. Agree / Disagree
and the tally under it on a live race.

Pending, resolved and void cards drop the volume (stars and the tag on one line)
and the buttons, but keep the live card's spacing: an empty row the buttons'
height holds the tally where it would sit, so the stars line and the tally line
up with the card beside it.

Opened on a phone, or in the desktop pane, the card adds a thesis box as on the
home page: THESIS and the thesis, one chevron dropping down RESOLUTION under a
hairline, closed by default (the settlement line; the outcome line once
resolved; the void line when void).

**Row**: race over his pick with chip · stars · market odds "57% YES" · Agree /
Disagree on a live race, or the state tag (Pending / Right / Wrong / Void) in
that same column once closed · tally; one line on desktop. On a phone, three lines with
room between them: race · odds · drop-down chevron / pick · stars / tally on
the left, Agree and Disagree (or the tag) on the right. A click anywhere on it
selects it (desktop: the pane); below 1024px it opens the pane's card in place.

**States.**

| State | Tag | Taps | Price | Opened card |
|---|---|---|---|---|
| Live | none | open | live | thesis, settlement line |
| Pending, closed | Pending | no buttons | live | thesis, settlement line |
| Pending, price at 99 / 1 | Pending | no buttons | live | thesis, settlement line |
| Pending, disputed | Pending (no disputed tag) | no buttons | live | thesis, settlement line |
| Resolved right | Right | no buttons | settled 100 / 0 | thesis, outcome line |
| Resolved wrong | Wrong | no buttons | settled 100 / 0 | thesis, outcome line |
| Void | Void | no buttons | last price | thesis, void line; out of every count |

Pending races stay in their group. Taps as built: one per call, final, the
already notice, Tap Confirmed (its {label} is his pick), sign-in when signed
out. Pending, resolved and void races show no buttons, only the tally.

## 14. The 74 markets

Every market the Midterms page lists, as the race list sends it. Names in the
called-leg and runner-up columns are the preview's: real leaders where known
(Maine Senate Troy Jackson, Michigan Senate Abdul El-Sayed, Ohio Senate Sherrod
Brown, Nebraska Senate Pete Ricketts); the rest are stand-ins for layout and
come from the real race list. "His call" is the preview's call (side and
stars); the live calls come from the calls feed. Layer: featured, contested or
safe, which sets the order inside every list.

**Balance of Power (3)**

| # | Race | Called leg | Party | Runner-up | Party | Layer | His call |
|---|---|---|---|---|---|---|---|
| 1 | Balance of Power | Democrats Sweep | D | R Senate · D House | R | featured | NO, 3★ |
| 2 | Senate control | Republicans | R | Democrats | D | featured | YES, 5★ |
| 3 | House control | Republicans | R | Democrats | D | featured | NO, 4★ |

**Senate (35)**

| # | Race | Called leg | Party | Runner-up | Party | Layer | His call |
|---|---|---|---|---|---|---|---|
| 1 | Alabama Senate | Steve Marshall | R | Democratic nominee | D | safe | YES, 4★ |
| 2 | Alaska Senate | Dan Sullivan | R | Mary Peltola | D | contested | NO, 3★ |
| 3 | Arkansas Senate | Tom Cotton | R | Democratic nominee | D | safe | YES, 5★ |
| 4 | Colorado Senate | John Hickenlooper | D | Republican nominee | R | safe | YES, 4★ |
| 5 | Delaware Senate | Chris Coons | D | Republican nominee | R | safe | YES, 5★ |
| 6 | Florida Senate | Ashley Moody | R | Josh Weil | D | contested | YES, 4★ |
| 7 | Georgia Senate | Jon Ossoff | D | Mike Collins | R | featured | YES, 3★ |
| 8 | Idaho Senate | Jim Risch | R | Democratic nominee | D | safe | YES, 5★ |
| 9 | Illinois Senate | Juliana Stratton | D | Don Tracy | R | safe | YES, 4★ |
| 10 | Iowa Senate | Ashley Hinson | R | Josh Turek | D | contested | YES, 3★ |
| 11 | Kansas Senate | Roger Marshall | R | Democratic nominee | D | safe | YES, 4★ |
| 12 | Kentucky Senate | Andy Barr | R | Amy McGrath | D | safe | YES, 4★ |
| 13 | Louisiana Senate | Bill Cassidy | R | Democratic nominee | D | safe | YES, 4★ |
| 14 | Maine Senate | Troy Jackson | D | Susan Collins | R | featured | YES, 3★ |
| 15 | Massachusetts Senate | Ed Markey | D | Republican nominee | R | safe | YES, 4★ |
| 16 | Michigan Senate | Abdul El-Sayed | D | Mike Rogers | R | featured | YES, 2★ |
| 17 | Minnesota Senate | Peggy Flanagan | D | Royce White | R | contested | YES, 3★ |
| 18 | Mississippi Senate | Cindy Hyde-Smith | R | Democratic nominee | D | safe | YES, 4★ |
| 19 | Montana Senate | Steve Daines | R | Democratic nominee | D | safe | YES, 4★ |
| 20 | Nebraska Senate | Pete Ricketts | R | Dan Osborn | I | contested | NO, 2★ |
| 21 | New Hampshire Senate | Chris Pappas | D | John E. Sununu | R | contested | YES, 3★ |
| 22 | New Jersey Senate | Cory Booker | D | Republican nominee | R | safe | YES, 5★ |
| 23 | New Mexico Senate | Ben Ray Luján | D | Republican nominee | R | safe | YES, 4★ |
| 24 | North Carolina Senate | Roy Cooper | D | Michael Whatley | R | featured | YES, 4★ |
| 25 | Ohio Senate | Sherrod Brown | D | Jon Husted | R | featured | NO, 3★ |
| 26 | Oklahoma Senate | Markwayne Mullin | R | Democratic nominee | D | safe | YES, 4★ |
| 27 | Oregon Senate | Jeff Merkley | D | Republican nominee | R | safe | YES, 4★ |
| 28 | Rhode Island Senate | Jack Reed | D | Republican nominee | R | safe | YES, 4★ |
| 29 | South Carolina Senate | Lindsey Graham | R | Democratic nominee | D | safe | YES, 4★ |
| 30 | South Dakota Senate | Mike Rounds | R | Democratic nominee | D | safe | YES, 4★ |
| 31 | Tennessee Senate | Bill Hagerty | R | Democratic nominee | D | safe | YES, 4★ |
| 32 | Texas Senate | Ken Paxton | R | James Talarico | D | contested | YES, 2★ |
| 33 | Virginia Senate | Mark Warner | D | Republican nominee | R | safe | YES, 4★ |
| 34 | West Virginia Senate | Shelley Moore Capito | R | Democratic nominee | D | safe | YES, 5★ |
| 35 | Wyoming Senate | Harriet Hageman | R | Democratic nominee | D | safe | YES, 4★ |

**Governors (36)**

| # | Race | Called leg | Party | Runner-up | Party | Layer | His call |
|---|---|---|---|---|---|---|---|
| 1 | Alabama Governor | Tommy Tuberville | R | Democratic nominee | D | safe | YES, 4★ |
| 2 | Alaska Governor | Nancy Dahlstrom | R | Democratic nominee | D | safe | YES, 3★ |
| 3 | Arizona Governor | Katie Hobbs | D | Andy Biggs | R | featured | YES, 3★ |
| 4 | Arkansas Governor | Sarah Huckabee Sanders | R | Democratic nominee | D | safe | YES, 4★ |
| 5 | California Governor | Katie Porter | D | Chad Bianco | R | contested | YES, 2★ |
| 6 | Colorado Governor | Michael Bennet | D | Republican nominee | R | safe | YES, 4★ |
| 7 | Connecticut Governor | Ned Lamont | D | Republican nominee | R | safe | YES, 4★ |
| 8 | Florida Governor | Byron Donalds | R | David Jolly | D | safe | YES, 4★ |
| 9 | Georgia Governor | Burt Jones | R | Keisha Lance Bottoms | D | featured | YES, 3★ |
| 10 | Hawaii Governor | Josh Green | D | Republican nominee | R | safe | YES, 4★ |
| 11 | Idaho Governor | Brad Little | R | Democratic nominee | D | safe | YES, 4★ |
| 12 | Illinois Governor | JB Pritzker | D | Republican nominee | R | safe | YES, 4★ |
| 13 | Iowa Governor | Rob Sand | D | Randy Feenstra | R | contested | NO, 2★ |
| 14 | Kansas Governor | Ty Masterson | R | Democratic nominee | D | contested | YES, 3★ |
| 15 | Maine Governor | Troy Jackson | D | Bobby Charles | R | contested | YES, 2★ |
| 16 | Maryland Governor | Wes Moore | D | Republican nominee | R | safe | YES, 5★ |
| 17 | Massachusetts Governor | Maura Healey | D | Republican nominee | R | safe | YES, 4★ |
| 18 | Michigan Governor | Jocelyn Benson | D | John James | R | contested | NO, 2★ |
| 19 | Minnesota Governor | Tim Walz | D | Lisa Demuth | R | contested | YES, 3★ |
| 20 | Nebraska Governor | Jim Pillen | R | Democratic nominee | D | safe | YES, 4★ |
| 21 | Nevada Governor | Joe Lombardo | R | Aaron Ford | D | contested | YES, 3★ |
| 22 | New Hampshire Governor | Kelly Ayotte | R | Democratic nominee | D | safe | YES, 4★ |
| 23 | New Mexico Governor | Deb Haaland | D | Republican nominee | R | safe | YES, 4★ |
| 24 | New York Governor | Kathy Hochul | D | Bruce Blakeman | R | safe | YES, 4★ |
| 25 | Ohio Governor | Vivek Ramaswamy | R | Amy Acton | D | contested | YES, 3★ |
| 26 | Oklahoma Governor | Gentner Drummond | R | Democratic nominee | D | safe | YES, 4★ |
| 27 | Oregon Governor | Tina Kotek | D | Christine Drazan | R | contested | YES, 2★ |
| 28 | Pennsylvania Governor | Josh Shapiro | D | Stacy Garrity | R | safe | YES, 5★ |
| 29 | Rhode Island Governor | Dan McKee | D | Republican nominee | R | contested | YES, 2★ |
| 30 | South Carolina Governor | Pamela Evette | R | Democratic nominee | D | safe | YES, 4★ |
| 31 | South Dakota Governor | Larry Rhoden | R | Democratic nominee | D | safe | YES, 4★ |
| 32 | Tennessee Governor | Marsha Blackburn | R | Democratic nominee | D | safe | YES, 4★ |
| 33 | Texas Governor | Greg Abbott | R | Democratic nominee | D | safe | YES, 4★ |
| 34 | Vermont Governor | Phil Scott | R | Democratic nominee | D | safe | YES, 4★ |
| 35 | Wisconsin Governor | Tom Tiffany | R | Sara Rodriguez | D | contested | YES, 2★ |
| 36 | Wyoming Governor | Chuck Gray | R | Democratic nominee | D | safe | YES, 4★ |
