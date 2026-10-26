# The Prophet — UI Build Spec: changes to theprophet.fun

October 26, 2026 · preview https://ajmagege96.github.io/prophet-site/site/ (matches `main`)

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
Desktop nav: $PROPHET · Docs · Logout (signed in only, red on hover), then the
contract-address pill. Mobile: logo, address pill, one menu button.

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
  from the start; hover and chosen look the same, no outline. Nobody is
  pre-selected unless `{{user_side}}` says so.
- Tap marks the side; tap the other to switch; tap the chosen one to deselect.
  `{{market_closed}}` true disables both and shows "Taps closed. Resolution
  next." under them.
- Under the buttons, centred, from three taps: "`{{agree_pct}}`% agree ·
  `{{tap_count}}` taps" (e.g. "71% agree · 38 taps"); below three, only "You
  agree" / "You disagree". The server's figure; never recomputed on a tap.
- On a **changed** call send `user_side` empty: the buttons start unselected and
  the earlier tap stays with the earlier call, unseen.
- Signed out: a tap dispatches `prophet:signin` with `{then: 'agree', slug}` and
  nothing else. After sign-in, `window.prophetTap.land(slug, side)` lands it.

## 8. Tap Confirmed modal

Opens on every tap that sets a side (a deselect shows nothing). Centred dialog
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
`tap_modal.confirm_disagree`, `tap_modal.scoring_line`, `market.side`,
`market.side_upper`, `market.state` (called / revised / changed / pending /
resolved), `market.time_line`, `market.conviction`, `show_conviction`,
`market.outcome_tag`, `market.resolution_text`, `market.outcome_note`.
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
- Agree / Disagree: bright from the start, deselect works, closed markets
  disable with "Taps closed. Resolution next.", the split never moves on a tap,
  the word is taps.
- Signed out: a tap fires `prophet:signin` only; `prophetTap.land` shows the
  modal. The modal opens on every side-setting tap; Next call advances; Back to
  top on the last card; swipe down closes it on a phone.
- How it Works opens from the header and the menu every time; onboarding only on
  a first visit.
- No "vote", "take", "credits" or "trades" anywhere in the hero.
