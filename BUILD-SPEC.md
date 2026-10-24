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

- Two tabs above the carousel: **All** · **History**. One is always on
  (All by default); the Tab key switches. One gray highlight style, no colour.
- **All** = every listed market with a call, `filter_state` `called`, in the order the server
  sends (most interesting first). **History** = `filter_state` `resolved`.
  Both decks are sent in the same `<!-- repeat: market -->` loop; the client
  shows one at a time.
- Empty tab: one centred line, `"No live calls right now. He's reading."` —
  the `<p class="deck__empty">` after the track. Not padded.
- Three cards across on desktop, one on phones with the next peeking. Cards are
  a fixed height: 220px desktop, 214px phone. Nothing shifts on tab change.

## 4. The card face

Top to bottom, for every card:

1. **Image** (44px) top-left; **market odds** top-right, big (22px display face)
   — `{{market.yes_pct}}` + "YES" — the live price, or the settled 100% / 0%
   once resolved. In History the outcome tag follows the odds: `right` ·
   `wrong` · `void` · `awaiting`; that tag is `{{market.outcome_tag}}`, empty on
   live calls.
2. **Question**, two lines max. A ladder market prints `{{listed_leg_date}}`
   small and gray on the same line as the question (omit the span when empty).
3. **His call, big** (24px display face): a small gray caption `His call`, then
   `YES` in green or `NO` in red — `{{market.side}}` / `{{market.side_upper}}`.
4. **Under the call**, one row of tags, empty on most cards: an outlined
   `Against the market` when `{{market.against_market}}` is `true`; on History,
   `changed 1 time` / `changed n times` when `{{market.change_count}}` > 0; and
   five stars (`{{market.conviction}}` filled, green) only when the carousel root
   carries `data-show-conviction="true"` (`{{show_conviction}}`, off at launch).
5. **Meta row**, live: `{{market.time_line}}` (`called 2d ago` / `revised 2h ago`
   / `changed 2h ago`, by `{{market.state}}`) · bar icon + `{{market.volume}}` ·
   clock icon + `{{market.ends_in}}`. History: `called {{market.called_date}} ·
   odds {{market.called_pct}} · his number {{market.called_number}}`. The odds
   at the call are not printed on a live face; they stay on the card as data for
   the Tap Confirmed line. The template carries every span; the client shows the
   right ones per card.

Card attributes the client reads: `data-state`, `data-slug`, `data-label`,
`data-side`, `data-call-kind`, `data-time-line`, `data-called-pct`,
`data-called-date`, `data-called-number`, `data-change-count`,
`data-change-note`, `data-against-market`, `data-conviction`, `data-call-state`,
`data-outcome`, `data-resolved-side`, `data-resolved-pct`, `data-resolved-ago`,
`data-leg-date`, `data-agree-pct`, `data-tap-count`, `data-user-side`,
`data-market-closed`, `data-thesis`.

## 5. The thesis block

One block under the carousel for the selected card, outlined like the selected
card. Contents, and nothing else:

- Label **THESIS**.
- When `{{market.state}}` is `changed`: one purple line above the text,
  `{{market.change_note}}` — "Changed his mind on Oct 23. He had called NO."
  There is no Revised marker any more; the time line on the card carries
  revised / changed.
- The thesis text, the latest revision (`{{market.thesis}}`).
- History only: one line under the text — `Resolved YES · right · 2w ago`
  (right green / wrong red), or `"Market closed by Polymarket before
  resolution."` for `call_state` void, or `"Awaiting resolution"` for
  `call_state` closed.

The block carries `data-signed-in="{{viewer.signed_in}}"`.

## 6. Agree / Disagree

A centred row under the block, live calls only (hidden on History):

- Two buttons, **Agree** and **Disagree**, 40px tall (44px on phones). Bright
  green and bright red from the start; no hover change, no soft resting state.
  The chosen one carries a thin outline (`.ad__btn--on`). Nobody is pre-selected
  unless `{{user_side}}` says so.
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
(settled 100% / 0%) with the outcome tag, His call YES / NO, the `changed n
times` tag when he changed his mind, and the meta row `called {date} · odds
{called_pct} · his number {called_number}`. Selecting one shows the thesis as last revised
and the outcome line (section 5). Void calls carry the void tag and line and sit
apart from any count. Closed-but-unresolved calls read Awaiting resolution.
Nothing about the user's taps appears in History.

## 9. Layout

- The home hero is as tall as its content; How it Works follows the Agree /
  Disagree row directly. The $PROPHET panel is unchanged.
- The decorative circuit board now runs around the thesis block (it used to run
  around the prompt bar). Desktop only. Nothing to wire; safe to delete with
  its `<canvas data-board>`.

## 10. Header: How it works

A **How it works** link sits in the desktop nav next to Docs ($PROPHET · Docs ·
How it works · Logout) and first in the mobile menu. It opens a click-through
modal on the onboarding shell — `partials/how-it-works.html`, four slides with
placeholder titles (What he does · Agree or Disagree · He can change his mind ·
Election night keeps score) and `[COPY]` lines — every time it is clicked. The
first-visit onboarding (`partials/onboarding.html`) is unchanged and opens on
its own only once per device. Globals: `window.prophetHowItWorks.open()`,
`window.prophetOnboarding.open()`.

## 11. Variables added in this drop

Oct 23 evening: `market.side`, `market.side_upper`, `market.time_line`,
`market.state` (called / revised / changed), `market.against_market`,
`market.conviction`, `show_conviction`, `market.change_note`,
`market.called_date`, `market.called_number`, `market.change_count`,
`tap_count`. The History tag after the odds is now `market.outcome_tag` (it was
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
- Every card: odds top-right, "His call" then YES / NO in the right colour, the
  time line reads called / revised / changed by state, no at-call price on a
  live face, no overflow at 390px.
- "Against the market" shows only when `against_market` is true; the star row
  only when `show_conviction` is true.
- A changed call shows the change note in the block; nothing says Revised.
- History faces read called date · odds · his number, plus the changed tag.
- Agree / Disagree: bright at rest, no hover change, the chosen one outlined,
  deselect works, closed markets disable with "Taps closed. Resolution next.",
  the split sits under the buttons and never moves on a tap, the word is taps.
- How it works opens from the header and the menu every time; onboarding only
  on a first visit.
- Signed out: a tap fires `prophet:signin` and nothing else; `prophetTap.land`
  shows the modal.
- The modal opens on every side-setting tap; Next call advances; Back to top on
  the last card; swipe down closes it on a phone.
- No "vote", "take", "credits" or conviction anywhere in the hero.
