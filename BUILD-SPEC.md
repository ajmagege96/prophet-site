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
   - History: stars, and at the bottom right the result tag
     `{{market.outcome_tag}}`: **right** (green), **wrong** (red), **void**
     (gray), **pending** (purple). No time to close and no volume.
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
  show the result tag bottom right, no time to close and no volume. No midterm
  race appears on the home page, in Calls or History.
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
- Midterms: 74 races under All (§14), each once in its group, nothing
  collapsed; both views work; the pane follows the selection; 390px shows two
  cards across with no overflow and no wrapped long names ("Darline Graham
  Nordone", "Jonathan Kreiss-Tomkins"); no race anywhere shows NO, "Not" or a
  double negative; every map tile matches the pick's party; hit rate hides
  until a race resolves; no money line anywhere.

## 13. Midterms page

`site/midterms.html`, "Midterms" first in the header nav. 74 races (3 Balance of
Power markets, 35 Senate, 36 governors; §14), one locked call each. Its own page:
no deck, no carousel, and no midterm race on the home page. Only Midterms page
calls are scored. Every visible string except the race list is placeholder copy.

**Data.** Two JSON arrays the server fills, inside
`<script type="application/json">` tags:

- `{{midterms.races_json}}`, the race list: event_id (the race), leg_id (the
  listed leg, the leader; Gamma's market id), runner_up_leg_id, group (balance |
  senate | governors), kind (race | control | bop), state code, race name, leg
  (listed leg display name), party, runner_up, runner_up_party, layer (featured
  | contested | safe), featured. Balance of Power display labels live here.
- `{{midterms.calls_json}}`, the calls feed: leg_id, side (yes | no, on the
  listed leg), stars, thesis, settlement_line, volume, price_at_call (Tap
  Confirmed only), live_price, state (live | pending | resolved), pending_reason
  (closed | price | disputed), outcome (right | wrong), outcome_line,
  taps_agree, taps_disagree, user_side.

Joined on **leg_id**. `volume` is the only field beyond the earlier spec. The
page computes every stat; there is no stats endpoint. `midterms-mock.js` holds
the real race list with preview calls until then: it opens with a few races
pending and resolved; `#preview=live` shows every race live, `#preview=all`
every race resolved.

**His pick.** One name, always read as Buy YES (the card shows no "Buy YES"
label, never NO, never "Not"):

| Call stored on the listed leg | Shows |
|---|---|
| YES | The listed leg (the leader) |
| NO | The runner-up |

Multi-candidate races (AK Senate, AK Gov, CA Gov, ID Senate, MI Gov, RI Gov) are
top-two like the rest; every other leg is under 2%. Balance of Power picks one
outcome ("Democrats Sweep" or "R Senate · D House"). The odds are the pick's own
YES price: the runner-up leg's price on a NO (read from a calls-feed item for
`runner_up_leg_id` when sent; otherwise 100 minus the listed leg). A voided race
is removed from the page: there is no Void state, tag or tile on Midterms.

**Layout.**

| Zone | Phone (390px) | Desktop (1400px) |
|---|---|---|
| Title row | "Midterms" left, a Senate / Governors map dropdown right | "Midterms" alone, level with the markets bar |
| Map | One tile map, first | Both maps stacked under the stats |
| Headline stats | One row under the map: Called · Resolved · Right · Hit rate | Left column under the title, sticky |
| Markets bar | Sticky: set dropdown left, cards / list icon toggle right | Right column, sticky, level with the title |
| Markets | Cards two across, or the list | Cards in a grid, or the list |
| Selected market | Tap a card or row: it opens in place as the desktop pane's card, spanning both columns | Always one selected; its full card in a sticky pane beside the markets |

The dropdown (no label) sets what shows: **All** (the default) · Balance of
Power · Senate · Governors. The view toggle is two icons: a 2×2 grid of rounded
filled squares (cards) and three lines (list), remembered per viewer. Every set
is the full list, nothing collapsed. **Order** (final for MVP, no server
ranking): featured, then contested by price closest to 50, then safe, read from
the race list's featured and layer fields. A click anywhere on a card or row
selects it; the selected market has the home's brighter white outline and green
3s flash (0.9s build and release) on the card, the row and the pane card.

**Stats.** Left column only. Called = races with a call. Resolved = resolved
right or wrong. Right = resolved right. Hit rate = right ÷ resolved. Resolved,
Right and Hit rate read a dash until one race resolves. No per-set stats, no
five-star line, no money lines.

**Maps.** One square tile per state. Every called seat is filled with his pick's
party (D blue, R red, I off-white: the one palette exception, on this page); no
neutral or hatched tile for a called race; states with no race stay neutral.
Resolved seats keep the colour and gain a small drawn check (green, right) or X
(red, wrong). A tile opens its race in its group.

**Card.** Race name top left; the odds top right ("57% YES", the pick's own
price; settled 100 / 0 once resolved); his pick with party chip; the meta line:
stars · bar-chart icon + volume, and the state tag (Pending · Right · Wrong) at
the right of that line. No "% at call", no time remaining. Live: Agree /
Disagree, the tally under them. Pending and resolved: no volume (stars and the
tag), no buttons, but the live card's spacing: an empty row the buttons' height
holds the tally where it would sit, so the stars line and tally line up with the
card beside it.

- Phone: two compact cards across; a long name steps its size down to stay on
  one line; no arrow on the card (a tap opens it full width, with an arrow to
  fold it).
- Opened (phone) or in the desktop pane, the card adds a thesis box as on the
  home page: THESIS and the thesis, one chevron dropping down RESOLUTION under a
  hairline, closed by default (the settlement line, or his outcome line once
  resolved).

**Row (list).**

- Desktop, one line. Left: the market title (race over his pick with chip), then
  right beside it in each row the stars and the odds. Right edge: the tally
  ("77% · 43 taps"), and beside it Agree / Disagree, or the Pending / Right /
  Wrong tag in their place once closed.
- Phone, three lines, no arrow: race · odds / pick with Agree and Disagree (or
  the tag) on the right / stars · tally · volume (volume on live races).
- Under All the row names the full race ("Georgia Senate").

**States.**

| State | Tag | Taps | Odds | Opened card |
|---|---|---|---|---|
| Live | none | Agree / Disagree | live | thesis, settlement line |
| Pending (closed, 99 / 1 or disputed) | Pending | none, tally only | live | thesis, settlement line |
| Resolved right | Right | none, tally only | settled 100 / 0 | thesis, outcome line |
| Resolved wrong | Wrong | none, tally only | settled 100 / 0 | thesis, outcome line |
| Voided | — | — | — | removed from the page |

Taps as built: one per call, final, the already notice, Tap Confirmed (its
{label} is his pick, {price} the pick's price at the call), sign-in when signed
out. Pending races stay in their group.

## 14. The 74 markets

Every market the Midterms page lists, from "The Prophet — Midterms Race List —
2026-11-01" (leaders re-checked against Gamma on November 1, ~14:10 ET; no
leader changed since October 31). Leaders are refreshed just before the drop
run; if a leader changes, the listed leg and runner-up leg swap for that race.
Parties marked * are set by hand from the candidate; confirm before the drop.
Layer: featured, contested (listed leg below 95 on October 31) or safe (95 or
above); set once and not moved. Price is the listed leg's YES price on November 1.

| Group | Races | Featured | Contested | Safe |
|---|---|---|---|---|
| Balance of Power | 3 | 3 | 0 | 0 |
| Senate | 35 | 4 | 12 | 19 |
| Governors | 36 | 3 | 16 | 17 |
| Total | 74 | 10 | 28 | 36 |

Featured ten: Balance of Power, Senate control, House control, Kansas Senate,
Iowa Senate, Texas Senate, Maine Senate, Texas Governor, Florida Governor,
Georgia Governor.

**Balance of Power (3)**

| # | Race | Event id | Leg id | Listed leg | Party | Runner-up leg id | Runner-up | Party | Price | Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Balance of Power | 32228 | 562828 | Democrats Sweep | D | 562830 | R Senate · D House | — | 70.5 | Featured |
| 2 | Senate control | 32224 | 562793 | Democratic Party | D | 562794 | Republican Party | R | 71.5 | Featured |
| 3 | House control | 32225 | 562802 | Democratic Party | D | 562803 | Republican Party | R | 94.5 | Featured |

**Senate (35)**

| # | State | Event id | Leg id | Listed leg | Party | Runner-up leg id | Runner-up | Party | Price | Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Alabama | 57637 | 630628 | Barry Moore | R | 630627 | Everett Wess | D | 98.5 | Safe |
| 2 | Alaska | 59233 | 634976 | Mary Peltola | D* | 634974 | Dan Sullivan | R* | 74.5 | Contested |
| 3 | Arkansas | 57639 | 630654 | Tom Cotton | R | 630653 | Hallie Shoffner | D | 96.8 | Safe |
| 4 | Colorado | 57640 | 630666 | John Hickenlooper | D | 630667 | Mark Baisley | R | 99.6 | Safe |
| 5 | Delaware | 57641 | 630679 | Democrat | D | 630680 | Republican | R | 98.9 | Safe |
| 6 | Florida | 57681 | 631045 | Ashley Moody | R | 631044 | Angie Nixon | D | 90.5 | Contested |
| 7 | Georgia | 57642 | 630692 | Jon Ossoff | D | 630693 | Mike Collins | R | 97.8 | Safe |
| 8 | Idaho | 57643 | 630706 | Jim Risch | R | 630707 | Todd Achilles | I | 96.7 | Safe |
| 9 | Illinois | 57646 | 630720 | Juliana Stratton | D | 630721 | Don Tracy | R | 99.3 | Safe |
| 10 | Iowa | 57647 | 630734 | Ashley Hinson | R | 630733 | Josh Turek | D | 57.5 | Featured |
| 11 | Kansas | 57648 | 630746 | Adam Hamilton | D | 630747 | Roger Marshall | R | 52.5 | Featured |
| 12 | Kentucky | 57649 | 630760 | Andy Barr | R | 630759 | Charles Booker | D | 97.8 | Safe |
| 13 | Louisiana | 59203 | 634879 | Julia Letlow | R | 634878 | Jamie Davis | D | 91.5 | Contested |
| 14 | Maine | 57650 | 630772 | Troy Jackson | D | 630773 | Susan Collins | R | 69.5 | Featured |
| 15 | Massachusetts | 57655 | 630790 | Ed Markey | D | 630791 | John Deaton | R | 99.5 | Safe |
| 16 | Michigan | 57658 | 630805 | Abdul El-Sayed | D | 630806 | Mike Rogers | R | 72.5 | Contested |
| 17 | Minnesota | 57659 | 630818 | Peggy Flanagan | D | 630819 | Michele Tafoya | R | 93.5 | Contested |
| 18 | Mississippi | 57678 | 631018 | Cindy Hyde-Smith | R | 631017 | Scott Colom | D | 88.5 | Contested |
| 19 | Montana | 57660 | 630832 | Kurt Alme | R | 630833 | Independent | I | 90.5 | Contested |
| 20 | Nebraska | 59204 | 634892 | Pete Ricketts | R | 634893 | Independent | I | 74.5 | Contested |
| 21 | New Hampshire | 57661 | 630844 | Chris Pappas | D | 630845 | John E. Sununu | R | 94.5 | Contested |
| 22 | New Jersey | 57662 | 630857 | Cory Booker | D | 630858 | Justin Murphy | R | 99.3 | Safe |
| 23 | New Mexico | 57663 | 630870 | Ben Ray Luján | D | 630871 | Larry Marker | R | 99.5 | Safe |
| 24 | North Carolina | 57664 | 630883 | Roy Cooper | D | 630884 | Michael Whatley | R | 97.7 | Safe |
| 25 | Ohio | 57682 | 631057 | Sherrod Brown | D | 631058 | Jon Husted | R | 73.5 | Contested |
| 26 | Oklahoma | 57679 | 631031 | Kevin Hern | R | 631030 | Jasmine Thomas | D | 99.4 | Safe |
| 27 | Oregon | 57667 | 630898 | Jeff Merkley | D | 630899 | David Brock Smith | R | 98.9 | Safe |
| 28 | Rhode Island | 57668 | 630911 | Jack Reed | D | 630912 | Raymond McKay | R | 99.1 | Safe |
| 29 | South Carolina | 57669 | 630925 | Darline Graham Nordone | R | 630924 | Annie Andrews | D | 74.5 | Contested |
| 30 | South Dakota | 57670 | 630938 | Mike Rounds | R | 630939 | Brian Bengs | I | 94.5 | Contested |
| 31 | Tennessee | 57671 | 630951 | Bill Hagerty | R | 630950 | Marquita Bradshaw | D | 98.3 | Safe |
| 32 | Texas | 57672 | 630963 | James Talarico | D | 630964 | Ken Paxton | R | 71.5 | Featured |
| 33 | Virginia | 57673 | 630976 | Mark Warner | D | 630977 | Bert Mizusawa | R | 99.1 | Safe |
| 34 | West Virginia | 57674 | 630990 | Shelley Moore Capito | R | 630989 | Rachel Fetty Anderson | D | 98.5 | Safe |
| 35 | Wyoming | 57675 | 631003 | Harriet Hageman | R | 631002 | James W. Byrd | D | 99.1 | Safe |

**Governors (36)**

| # | State | Event id | Leg id | Listed leg | Party | Runner-up leg id | Runner-up | Party | Price | Layer |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Alabama | 57154 | 629271 | Tommy Tuberville | R | 629270 | Doug Jones | D | 94.9 | Contested |
| 2 | Alaska | 59234 | 635016 | Jonathan Kreiss-Tomkins | D* | 635012 | Bernadette Wilson | R* | 88.5 | Contested |
| 3 | Arizona | 57141 | 629183 | Katie Hobbs | D | 629184 | Andy Biggs | R | 92.5 | Contested |
| 4 | Arkansas | 57155 | 629284 | Sarah Huckabee Sanders | R | 629283 | Fredrick Love | D | 97.2 | Safe |
| 5 | California | 57096 | 628941 | Xavier Becerra | D* | 628940 | Steve Hilton | R* | 98.9 | Safe |
| 6 | Colorado | 57156 | 629296 | Phil Weiser | D | 629297 | Victor Marx | R | 97 | Safe |
| 7 | Connecticut | 57159 | 629311 | Ned Lamont | D | 629312 | Ryan Fazio | R | 97.7 | Safe |
| 8 | Florida | 57160 | 629325 | Byron Donalds | R | 629324 | David Jolly | D | 64.5 | Featured |
| 9 | Georgia | 57161 | 629337 | Keisha Lance Bottoms | D | 629338 | Rick Jackson | R | 70.5 | Featured |
| 10 | Hawaii | 57162 | 629350 | Josh Green | D | 629351 | Gary Cordery | R | 99.3 | Safe |
| 11 | Idaho | 57163 | 629364 | Brad Little | R | 629363 | Terri Pickens | D | 99.3 | Safe |
| 12 | Illinois | 57164 | 629376 | JB Pritzker | D | 629377 | Darren Bailey | R | 98.9 | Safe |
| 13 | Iowa | 57169 | 629397 | Rob Sand | D | 629398 | Zach Lahn | R | 86 | Contested |
| 14 | Kansas | 57172 | 629413 | Ty Masterson | R | 629412 | Cindy Holscher | D | 74 | Contested |
| 15 | Maine | 57173 | 629425 | Hannah Pingree | D | 629426 | Robert Charles | R | 96.8 | Safe |
| 16 | Maryland | 57174 | 629438 | Wes Moore | D | 629439 | Dan Cox | R | 99.4 | Safe |
| 17 | Massachusetts | 57175 | 629451 | Maura Healey | D | 629452 | Michael Minogue | R | 98.7 | Safe |
| 18 | Michigan | 57176 | 629464 | Jocelyn Benson | D | 629465 | John James | R | 93.7 | Contested |
| 19 | Minnesota | 57177 | 629477 | Amy Klobuchar | D | 629478 | Lisa Demuth | R | 98.2 | Safe |
| 20 | Nebraska | 57178 | 629491 | Jim Pillen | R | 629490 | Lynne Walz | D | 91.5 | Contested |
| 21 | Nevada | 57181 | 629505 | Aaron Ford | D | 629506 | Joe Lombardo | R | 78.5 | Contested |
| 22 | New Hampshire | 57182 | 629519 | Kelly Ayotte | R | 629518 | Cinde Warmington | D | 92 | Contested |
| 23 | New Mexico | 57183 | 629531 | Deb Haaland | D | 629532 | Gregg Hull | R | 95.9 | Safe |
| 24 | New York | 57184 | 629544 | Kathy Hochul | D | 629545 | Bruce Blakeman | R | 97.8 | Safe |
| 25 | Ohio | 57185 | 629557 | Amy Acton | D | 629558 | Vivek Ramaswamy | R | 80.5 | Contested |
| 26 | Oklahoma | 57186 | 629571 | Mike Mazzei | R | 629570 | Cyndi Munson | D | 92 | Contested |
| 27 | Oregon | 57187 | 629583 | Tina Kotek | D | 629584 | Christine Drazan | R | 85 | Contested |
| 28 | Pennsylvania | 57206 | 629614 | Josh Shapiro | D | 629615 | Stacy Garrity | R | 98.4 | Safe |
| 29 | Rhode Island | 57207 | 629627 | Helena Foulkes | D | 629629 | Independent | I | 97 | Safe |
| 30 | South Carolina | 57208 | 629641 | Alan Wilson | R | 629640 | Jermaine Johnson | D | 94.9 | Contested |
| 31 | South Dakota | 57209 | 629654 | Larry Rhoden | R | 629653 | Dan Ahlers | D | 97.2 | Safe |
| 32 | Tennessee | 57210 | 629667 | Marsha Blackburn | R | 629666 | Jerri Green | D | 93.6 | Contested |
| 33 | Texas | 57222 | 629691 | Greg Abbott | R | 629690 | Gina Hinojosa | D | 67 | Featured |
| 34 | Vermont | 57225 | 629708 | Phil Scott | R | 629707 | Amanda Janoo | D | 77.5 | Contested |
| 35 | Wisconsin | 57226 | 629720 | David Crowley | D | 629721 | Tom Tiffany | R | 85.5 | Contested |
| 36 | Wyoming | 57227 | 629734 | Eric Barlow | R | 629733 | Kenneth Casner | D | 99.2 | Safe |

Out of scope: lieutenant governor races, Guam, county markets, margins, turnout, seat counts, combos, House districts.
