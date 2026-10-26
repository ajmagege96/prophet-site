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
  called / revised → "Called 2h ago" / "Revised 3h ago";
  pending → "Pending resolution" (no time);
  resolved → "Resolved 2h ago"; void → nothing.
  A change of side is a new call: it reads "Called {new time}" and the
  Agree / Disagree buttons start unselected (the earlier tap stays with the
  earlier call and is not shown).
- The thesis text, latest revision. Nothing else for a live call.
- History: the result line at the top right of the block — "Resolved YES ·
  right · 2w ago", or "Taps closed. Resolution next." while pending. Under the
  thesis, a hairline and a RESOLUTION section: the outcome note (one line in his
  voice on what happened) on a resolved call, "Market closed by Polymarket
  before resolution." on a void call, nothing while pending.
- History cards: result tag at the bottom right — right (green), wrong (red),
  void (gray), pending (purple). Conviction stars show on History cards too.
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
side (yes | no), state (called | revised | pending | resolved), time_line
("called 2h ago" / "revised 3h ago", live only), outcome_note (resolved only),
conviction (1–5), called_pct (odds at the call,
for the modal line only), volume, ends_in, listed_leg_date (ladders), thesis (latest
revision), call_state (live | resolved | void | closed), outcome (right | wrong | void
| pending), resolved_side, resolved_pct, resolved_ago, agree_pct, tap_count,
user_side (agree | disagree | empty), market_closed (true | false).
Deck-level: show_conviction ("false" hides the stars; anything else shows them).
Viewer: signed_in. Modal copy: tap_modal.confirm_agree, confirm_disagree,
scoring_line (the approved copy above is the fallback).

## Retired
The "changed" state value (Oct 26).

## Not built (dropped from the Oct 23 spec)
"Against the market" tag; "Changed his mind on {date}. He had called {side}." note;
History "called {date} · odds · his number" line; "His call" caption; change count tag;
outlined chosen state.

## Dropped earlier and still gone
Vote modal, Take-sent modal, take limits, prompt bar and stance switch, typewriter,
credits, contributors, hold_reason, the prophet number on the face.
