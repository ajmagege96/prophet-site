# The Prophet — UI Build Spec: changes to theprophet.fun

October 23, 2026 (evening revisions folded in) · preview https://ajmagege96.github.io/prophet-site/site/

This is the delta between what theprophet.fun serves today and the UI in this
drop. "Live" below is what the live page was found rendering when checked today:
a deck of no-thesis cards with the prompt bar, the YES | NO stance switch, the
Vote and Take-sent modals, the take-limit notices, Hold / not-evaluated cards,
conviction stars and credits. All of that is replaced by what follows. The
below-fold copy (How it Works, Tokenomics, Roadmap), the onboarding slides, the
header, the footer and the $PROPHET page are unchanged and are not in this spec.

The full reference is in the repo: `HANDOFF.md` (contracts, hooks, variable
table), `TEMPLATE_VARS.md` (every variable), `CLAUDE.md` (design rules).

---

## 1. The two verbs

The product has two verbs on the surface: **Agree** and **Disagree**. The words
vote, take, credits and holders decide do not appear in the hero. Counts of
agree / disagree actions are **taps**.

## 2. Remove

| Live today | Status |
|---|---|
| Prompt bar: text field, Send, the YES \| NO stance switch, the takes-left count, the typewriter placeholder | Removed. There is no text entry on the site. |
| Takes feed under the thesis block | Removed. |
| Credits / contributors list in the thesis block | Removed. |
| Vote modal, "Vote" button, tally, countdown, "Voted YES" state | Removed. |
| Take-sent modal (loading, confirmed, limit states), "takes left today" | Removed. |
| Notices: Nothing to send, Pick a side, cooldown, out of takes | Removed. The Logged out notice stays. |
| Hold and not-evaluated cards; `hold_reason`; `no_edge_line`; the Hold badge | Removed. The deck shows live calls only. |
| Conviction (star + N) on cards, in the block, in History | Removed everywhere. He just calls it. |
| His number (`prophet_probability`) on the face or in the block; "N% at call" field in the block; last-run line | Not shown anywhere. `prophet_probability` is still carried on the card for later. |
| Buy $PROPHET link on cards | Removed. |
| The filter tags No thesis · Open votes · Prophecies | Replaced by two tabs, below. |

Variables that go with them: `market.take_count`, `market.vote_*`, `take.*`,
`take_result.*`, `takes.*`, `takes_remaining_today`, `take_limit_reason`,
`viewer.take_cooldown`, `market.viewer_takes_used`, `contributor.*`,
`market.contributors_json`, `empty_no_takes`, `hold_reason`, `no_edge_line`,
`window_class`, `market.conviction`, `last_run_at`, `viewer.balance`,
`viewer.vote_share`, `tap_confirmed`.

## 3. Deck and tabs

- Two tabs above the carousel: **Calls** · **History**. One is always on
  (Calls by default); the Tab key switches. One gray highlight style, no colour.
- **Calls** = every listed market with a call, `filter_state` `called`, in the order the server
  sends (most interesting first). **History** = `filter_state` `resolved`.
  Both decks are sent in the same `<!-- repeat: market -->` loop; the client
  shows one at a time.
- Empty tab: one centred line, `"No live calls right now. He's reading."` —
  the `<p class="deck__empty">` after the track. Not padded.
- Three cards across on desktop, one on phones with the next peeking. Cards are
  a fixed height: 196px desktop, 184px phone. Nothing shifts on tab change.

## 4. The card face

Top to bottom, for every card:

1. **Image** (44px) top-left; **market odds** top-right, big (26px display face)
   — `{{market.yes_pct}}` + "YES" — the live price, or the settled 100% / 0%
   once resolved. In History the outcome tag follows the odds: `right` ·
   `wrong` · `void` · `awaiting`; that tag is `{{market.outcome_tag}}`, empty on
   live calls.
2. **Question**, two lines max. A ladder market prints `{{listed_leg_date}}`
   small and gray on the same line as the question (omit the span when empty).
3. **The call, big** (24px display face), where a figure would be:
   `Buy YES` in green or `Buy NO` in red — `{{market.side}}` /
   `{{market.side_upper}}`.
4. **Meta row**: five conviction stars first (bottom-left), the first
   `{{market.conviction}}` filled in the call's colour (green under Buy YES, red
   under Buy NO; they hide only when the carousel root carries
   `data-show-conviction="false"`, `{{show_conviction}}`) · bar icon +
   `{{market.volume}}` · clock icon + `{{market.ends_in}}`. Three items, one
   line. The odds at the call are not printed; `{{market.called_pct}}` stays on
   the card as data for the Tap Confirmed line.

Card attributes the client reads: `data-state`, `data-slug`, `data-label`,
`data-side`, `data-call-kind`, `data-time-line`, `data-called-pct`,
`data-change-note`, `data-conviction`, `data-call-state`,
`data-outcome`, `data-resolved-side`, `data-resolved-pct`, `data-resolved-ago`,
`data-leg-date`, `data-agree-pct`, `data-tap-count`, `data-user-side`,
`data-market-closed`, `data-thesis`.

## 5. The thesis block

One block under the carousel for the selected card, outlined like the selected
card. Contents, and nothing else:

- Label **THESIS**, and beside it the small purple time marker
  `{{market.time_line}}` — "Called 3d ago" / "Revised 3h ago" / "Changed 2h
  ago" by `{{market.state}}` (the client capitalises the first letter). No tap
  behaviour.
- When `{{market.state}}` is `changed`: one purple line above the text,
  `{{market.change_note}}` — "Changed his mind on Oct 23. He had called NO."
- The thesis text, the latest revision (`{{market.thesis}}`).
- History only: one line under the text — `Resolved YES · right · 2w ago`
  (right green / wrong red), or `"Market closed by Polymarket before
  resolution."` for `call_state` void, or `"Awaiting resolution"` for
  `call_state` closed.

The block carries `data-signed-in="{{viewer.signed_in}}"`.

## 6. Agree / Disagree

A centred row under the block, live calls only (hidden on History):

- Two buttons, **Agree** and **Disagree**, 40px tall (44px on phones). Bright
  green and bright red from the start; hover and chosen look the same, no
  outline (`.ad__btn--on` is kept on the chosen one for your own styling).
  Nobody is pre-selected unless `{{user_side}}` says so.
- A tap marks the side. Tapping the other switches it. Tapping the chosen one
  again deselects it. `{{market_closed}}` `true` disables both and shows
  `"Taps closed. Resolution next."` under them.
- Under the buttons, centred, from three taps: **`{{agree_pct}}% agree ·
  {{tap_count}} taps`** (e.g. "71% agree · 38 taps"). Below three taps and
  with a side chosen: "You agree" / "You disagree". The figure is the server's;
  the client never recomputes it on a tap — re-render it from the endpoint.
  The word is **taps** everywhere; "trades" is gone.
- Signed out (`viewer.signed_in` false): a tap dispatches `prophet:signin` on
  `document` with `{then: 'agree', slug}` and does nothing else. After
  sign-in, call `window.prophetTap.land(slug, 'agree' | 'disagree')` — the tap
  lands and the confirmation shows.

## 7. Tap Confirmed modal

Opens on **every** tap that sets a side (a deselect shows nothing). Centred
dialog on desktop; bottom sheet on phones. Closes on the X, the backdrop, or a
swipe down. Top to bottom:

1. Side chip — Agree (green) or Disagree (red) in the button's style.
2. Confirmation line. Agree: `You're calling him right. Buy YES at 84. Let's
   see if you're both right.` Disagree: `You're calling him wrong. Buy NO at
   22, you say that's wrong.` The label is in its colour; right / wrong are
   plain. The price is `called_pct` without the % sign.
3. Scoring line: `Scored when the market resolves. Right or wrong, it's on
   your record and you'll earn XP.`
4. One button, **Next call** — closes and selects the next live call. On the
   last card it reads **Back to top** and returns to the first.

No second button, no token, no share, no XP figure. Every line is a config
string on the modal root — `{{tap_modal.confirm_agree}}`,
`{{tap_modal.confirm_disagree}}`, `{{tap_modal.scoring_line}}` — with `{label}`, `{verdict}` and `{price}` as
tokens filled from the card and the side. The approved copy above is the
fallback while a string is unfilled.

## 8. History

The History tab shows resolved calls as cards in the same structure: odds
(settled 100% / 0%) with the outcome tag, the big Buy YES / Buy NO, the meta
row with the odds at the call. Selecting one shows the thesis as last revised
and the outcome line (section 5). Void calls carry the void tag and line and sit
apart from any count. Closed-but-unresolved calls read Awaiting resolution.
Nothing about the user's taps appears in History.

## 9. Layout

- The home hero is as tall as its content; How it Works follows the Agree /
  Disagree row directly. The $PROPHET panel is unchanged.
- The selected card keeps its brighter outline and also flashes green on
  the same 3s beat as the thesis block, at every width, so the thesis reads as
  that market's. Decorative.
- The decorative circuit board now runs around the thesis block (it used to run
  around the prompt bar). Desktop only. Nothing to wire; safe to delete with
  its `<canvas data-board>`.

## 10. Header: How it works

A **How it Works** link sits beside the logo on desktop (as before) and first
in the mobile menu. It opens a click-through
modal on the onboarding shell — `partials/how-it-works.html`, four slides with
placeholder titles (What he does · Agree or Disagree · He can change his mind ·
Election night keeps score) and `[COPY]` lines — every time it is clicked. The
first-visit onboarding (`partials/onboarding.html`) is unchanged and opens on
its own only once per device. Globals: `window.prophetHowItWorks.open()`,
`window.prophetOnboarding.open()`.

## 11. Variables added in this drop

Oct 23 evening: `market.side`, `market.side_upper`, `market.time_line`,
`market.state` (called / revised / changed), `market.conviction`,
`show_conviction`, `market.change_note`, `tap_count`. Not built, by the
founder's call: `market.against_market`, `market.called_date`,
`market.called_number`, `market.change_count`. The History tag after the odds is now `market.outcome_tag` (it was
`market.state`). Retired: `market.thesis_stance`, `market.thesis_stance_upper`,
`market.called_ago`, `revised_ago`, `revised_number`, `trade_count`,
`prophet_probability` (nothing rendered it).

Oct 22: `label`, `call_state`, `listed_leg_date`, `agree_pct`, `user_side`,
`market_closed`, `tap_modal.confirm_agree`, `tap_modal.confirm_disagree`,
`tap_modal.scoring_line`. `market.outcome` takes `right` / `wrong` / `void` /
`awaiting`; `market.filter_state` takes `called` / `resolved`.
Descriptions in `TEMPLATE_VARS.md`; the generated table in `HANDOFF.md` §10.

## 12. Check before shipping

- All shows every listed market with a call; History shows resolved; the empty
  line appears on an empty tab.
- Every card: odds top-right, the big Buy YES / Buy NO in the right colour, the
  stars bottom-left in that colour (faint on the unfilled ones), no at-call stat, three meta items on one
  line, no overflow at 390px.
- The purple marker beside Thesis reads Called / Revised / Changed by state; a
  changed call also shows the change note.
- Agree / Disagree: bright from the start, no hover change, no outline, deselect
  works, closed markets disable with "Taps closed. Resolution next.", the split
  under the buttons never moves on a tap, the word is taps.
- How it works opens from the header and the menu every time; onboarding only
  on a first visit.
- Signed out: a tap fires `prophet:signin` and nothing else; `prophetTap.land`
  shows the modal.
- The modal opens on every side-setting tap; Next call advances; Back to top on
  the last card; swipe down closes it on a phone.
- No "vote", "take", "credits" or conviction anywhere in the hero.
