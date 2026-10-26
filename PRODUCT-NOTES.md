# The Prophet — UI as built, for the product / logic side

October 26, 2026 · preview https://ajmagege96.github.io/prophet-site/site/
What the surface shows and what the server has to send. Builds on the Oct 26
and Oct 26 PM logic, with the founder's UI calls on top.

## Surface
- One home page. Two tabs: **Calls** (every listed market with a call,
  server-ordered, most interesting first, twenty at most) and **History**
  (resolved, pending and void calls).
- No votes, takes, credits, Hold, "not evaluated" or prompt bar. The two verbs
  are **Agree** and **Disagree**. The count word is **taps**.
- His number is not shown anywhere.

## Card
- Market image; question (two lines max; a ladder market prints its leg's date
  beside it); market odds top-right, big, "91% YES" (live price, or the
  settled 100% / 0%). Pending odds keep updating; never frozen.
- The call, big: **Buy YES** (green) or **Buy NO** (red).
- Meta row on Calls: five conviction stars (1–5 filled, in the call's green or
  red), volume, time to close. The odds at the call are not shown.
- Meta row on History: stars, volume, and at the bottom right the result tag:
  right (green), wrong (red), void (gray), pending (purple). No time to close.
- The selected card has a brighter outline and flashes green every 3s with the
  thesis block.

## States
| State | Tab | Purple marker beside "Thesis" |
|---|---|---|
| called | Calls | "Called 3d ago" (first call) |
| revised | Calls | "Revised 3h ago" (same side, updated) |
| changed | Calls | "Changed 2h ago" (a new call that switched side) |
| pending | History | "Pending" (no time) |
| resolved | History | "Resolved 2h ago" |
| void | History | nothing |

- Pending = trading closed, end date passed, or price at 99 / 1 (or disputed).
  The card moves to History with the pending tag.
- On a changed call, Agree / Disagree start unselected; the user's earlier tap
  stays with the earlier call and is not shown. Send user_side empty.

## Thesis box
- Reads as a normal thesis box: the header (THESIS, the marker, and on a
  resolved call "Resolved YES · right" at the right, no time) and the thesis
  text, latest revision.
- One chevron in the header drops down the rest. Closed by default on both
  tabs and on every card change. Built so more parts can join it later (his
  calls on this market, chart, taps).
- In the drop-down now, RESOLUTION:
  - live: resolution_text, how the market pays, e.g. "Pays YES if Peltola wins
    the Alaska Senate race on November 3." Never empty.
  - pending, trading closed / end date passed: resolution_text, "Trading has
    closed. ... Nothing is scored until Polymarket confirms the result."
  - pending, price at 99 / 1: resolution_text, "The result is effectively in,
    but Polymarket has not confirmed it. Nothing is scored until it does."
  - disputed: resolution_text, "The proposed result has been challenged.
    Polymarket's resolvers will rule, and nothing is scored until they do."
  - resolved: only outcome_note, his resolution copy in his voice. No fact
    line ("Resolved NO on …"): the marker and the header already carry the
    result and the time. resolution_text is ignored on resolved cards.
  - void: resolution_text, "Polymarket closed this market without a result.
    His calls and every tap on them don't count."

## Agree / Disagree (Calls only, signed in only)
- Two buttons under the box, bright green / bright red from the start. Nobody
  pre-selected unless the server says the user already tapped.
- Tap sets a side; tap the other to switch; tap the chosen one to deselect.
- Under the buttons: "71% agree · 38 taps" from three taps; below three, only
  "You agree" / "You disagree". The server's figures; never changed
  client-side on a tap.
- Market closed: both disabled, "Taps closed. Resolution next." under them.
- Signed out: a tap fires a sign-in event; after sign-in the server lands it.
- Every tap that sets a side opens Tap Confirmed: side chip; "You're calling
  him right. Buy YES at 84. Let's see if you're both right." (Agree) / "You're
  calling him wrong. Buy NO at 22, you say that's wrong." (Disagree), price =
  odds at the call; "Scored when the market resolves. Right or wrong, it's on
  your record and you'll earn XP."; one button, Next call (Back to top on the
  last card).

## How it Works / onboarding
- Onboarding (3 slides) opens once per device on a first visit.
- "How it Works" (beside the logo on desktop, first in the mobile menu) opens a
  4-slide click-through every time: What he does · Agree or Disagree · He can
  change his mind · Election night keeps score. Copy is [COPY] for now.

## Data the server sends per market
slug, question, image_url, yes_pct (live or settled, never frozen),
filter_state (called | resolved), side (yes | no), state (called | revised |
changed | pending | resolved), time_line ("called 3d ago" / "revised 3h ago" /
"changed 2h ago", live only), conviction (1–5), called_pct (odds at the call,
modal line only), volume, ends_in, listed_leg_date (ladders), thesis (latest
revision), resolution_text (every state except resolved), outcome_note
(resolved only), call_state (live | resolved | void | closed), outcome (right |
wrong | void | pending), resolved_side, resolved_pct, resolved_ago, agree_pct,
tap_count, user_side (agree | disagree | empty; empty on a changed call),
market_closed (true | false).
Deck: show_conviction ("false" hides the stars), at most twenty Calls cards.
Viewer: signed_in. Modal copy: tap_modal.confirm_agree, confirm_disagree,
scoring_line (the copy above is the fallback).

## Not built (founder's call)
"Against the market" tag; "Changed his mind on {date}" note; History "called
{date} · odds · his number" line; "His call" caption; change-count tag; the
resolved fact line in the drop-down.

## Gone and staying gone
Vote modal, Take-sent modal, take limits, prompt bar and stance switch,
typewriter, credits, contributors, hold_reason, his number on the face.
