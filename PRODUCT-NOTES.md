# The Prophet — UI as built, for the product / logic side

Front end with the Oct 26 logic changes (Oct 25 2026). Preview: https://ajmagege96.github.io/prophet-site/site/
This is what the surface shows and what the product side has to supply. Full
variable table in HANDOFF.md §10; design rules in CLAUDE.md; delta spec in BUILD-SPEC.md.

## Surface
- One home page. Two tabs: **Calls** (every listed market with a call, server-ordered,
  most interesting first) and **History** (resolved, void, closed-but-unresolved calls).
- No votes, no takes, no credits, no Hold, no "not evaluated", no prompt bar.
  The two verbs are **Agree** and **Disagree**. The count word is **taps**.
- Prophecies and Record pages are gone; everything lives on the home carousel.

## Card (one per market with a call)
- Market image; question (two lines max; a ladder market prints the leg's date beside
  the question); market odds top-right as "91% YES" (live price, or the settled
  100% / 0% once resolved).
- Big call: **Buy YES** (green) or **Buy NO** (red). He just calls it.
- Meta row: five conviction stars first (1–5 filled, in the call's colour), then
  volume, then time to close. The odds at the call are NOT shown on the card.
- His number is not shown anywhere.
- The selected card has a brighter outline and flashes green every 3s together with
  the thesis block.

## Thesis block (for the selected card)
- Label "Thesis", then a purple marker driven by state:
  Calls: called / revised / changed → "Called 2h ago" / "Revised 3h ago" /
  "Changed 2h ago";
  History: pending → "Pending" (no time); resolved → "Resolved 2h ago";
  void → nothing.
  On changed (he switched side) the Agree / Disagree buttons start unselected
  (the earlier tap stays with the earlier call and is not shown).
- The box is sectioned (collapsible, Polymarket-style), built for more sections
  later. Two now:
  THESIS: the thesis text, latest revision.
  RESOLUTION: resolution_text, plain fact the server builds for every state —
    live: how the market pays ("Pays YES if Peltola wins the Alaska Senate race
    on November 3."), never empty;
    pending, trading closed / end date passed: "Trading has closed. ... Nothing
    is scored until Polymarket confirms the result.";
    pending, price at 99 / 1: "The result is effectively in, but Polymarket has
    not confirmed it. Nothing is scored until it does.";
    disputed: "The proposed result has been challenged. Polymarket's resolvers
    will rule, and nothing is scored until they do.";
    resolved: "Resolved NO on October 25. His call: wrong." then outcome_note
    (his voice) under it;
    void: "Polymarket closed this market without a result. His calls and every
    tap on them don't count."
- Calls cards: Thesis open, Resolution closed. History cards: Resolution open,
  Thesis closed.
- History: "Resolved YES · right" sits at the right of the Thesis header on a
  resolved call; nothing there while pending or void.
- History cards: result tag at the bottom right — right (green), wrong (red),
  void (gray), pending (purple). Conviction stars show on History cards too;
  no time to close on History cards.
- Pending = market closed, end date passed, or price at 99 / 1. The card moves
  to History with the pending tag; its odds keep updating.
- Calls tab: twenty cards at most.
- Times are relative everywhere; a market's own dates (ladder leg, question text)
  print as dates.

## Agree / Disagree (live calls only, signed in only)
- Two buttons under the block, bright green / bright red from the start. Nobody is
  pre-selected unless the server says the user already tapped.
- Tap sets a side; tap the other to switch; tap the chosen one to deselect.
- Under the buttons, centred: "71% agree · 38 taps" once a market has 3+ taps;
  below that only "You agree" / "You disagree". The percentage and count are the
  server's figures and never change client-side on a tap.
- Market closed: both buttons disabled, line "Taps closed. Resolution next."
- Signed out: a tap fires a sign-in event; after sign-in the server lands the tap
  and the confirmation shows.
- Every tap that sets a side opens the **Tap Confirmed** modal: side chip; line
  "You're calling him right. Buy YES at 84. Let's see if you're both right." (Agree)
  / "You're calling him wrong. Buy NO at 22, you say that's wrong." (Disagree) — the
  price is the odds at the call; scoring line "Scored when the market resolves.
  Right or wrong, it's on your record and you'll earn XP."; one button "Next call"
  ("Back to top" on the last card). No crowd line, no XP figure, no share.

## How it Works / onboarding
- Onboarding (3 slides) opens once per device on first visit, never again.
- "How it Works" (beside the logo on desktop, first in the mobile menu) opens a
  separate 4-slide click-through every time: What he does · Agree or Disagree ·
  He can change his mind · Election night keeps score. Copy is [COPY] for now.

## Data the server sends per market
slug, question, image_url, yes_pct (live or settled), filter_state (called | resolved),
side (yes | no), state (called | revised | changed | pending | resolved), time_line
("called 2h ago" / "revised 3h ago" / "changed 2h ago", live only), outcome_note (resolved only),
conviction (1–5), called_pct (odds at the call,
for the modal line only), volume, ends_in, listed_leg_date (ladders), thesis (latest
revision), resolution_text (every state), call_state (live | resolved | void | closed), outcome (right | wrong | void
| pending), resolved_side, resolved_pct, resolved_ago, agree_pct, tap_count,
user_side (agree | disagree | empty), market_closed (true | false).
Deck-level: show_conviction ("false" hides the stars; anything else shows them).
Viewer: signed_in. Modal copy: tap_modal.confirm_agree, confirm_disagree,
scoring_line (the approved copy above is the fallback).

## Not built (dropped from the Oct 23 spec)
"Against the market" tag; "Changed his mind on {date}. He had called {side}." note;
History "called {date} · odds · his number" line; "His call" caption; change count tag;
outlined chosen state.

## Dropped earlier and still gone
Vote modal, Take-sent modal, take limits, prompt bar and stance switch, typewriter,
credits, contributors, hold_reason, the prophet number on the face.
