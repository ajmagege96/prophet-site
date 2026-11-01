# The Prophet — UI as built, for the product / logic side

November 1, 2026 · preview https://ajmagege96.github.io/prophet-site/site/
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
- Two buttons under the box, bright green / bright red until the user taps.
  Nobody pre-selected unless the server says the user already tapped.
- A tap is final: one side per user per call. After it, the chosen button
  stays bright and the other dims. Tapping either again opens a small notice:
  "You agreed already." / "You disagreed already." (config strings
  notice.already_agree / notice.already_disagree) with OK. No switching, no
  deselect. A changed call is a new call: user_side comes empty and the user
  can tap again.
- Under the buttons: "71% agree · 38 taps" from three taps; below three, only
  "You agree" / "You disagree". The server's figures; never changed
  client-side on a tap.
- Market closed (pending, resolved, void): no buttons at all, only the split.
- Signed out: a tap fires a sign-in event; after sign-in the server lands it.
- The tap opens Tap Confirmed: side chip; "You're calling
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
scoring_line; notice.already_agree, notice.already_disagree (the copy above
is the fallback).

## Midterms page (midterms.html, "Midterms" in the header)
- 74 races: 3 Balance of Power markets (Balance of Power, Senate control, House
  control), 35 Senate seats, 36 governors. One locked call each. No deck, no
  carousel; the home tabs carry no midterm race.
- The page reads two feeds and computes every stat itself (no stats endpoint):
  race list per race: event_id, leg_id, market_id, group (balance | senate |
    governors), kind (race | control | bop), state code, race name, called leg,
    party (D | R | I), runner-up, runner-up party, layer (featured | contested |
    safe), featured flag;
  calls (live + History endpoints, listed set): market_id, leg_id, side,
    stars, thesis, settlement_line, volume, price_at_call and live_price (the called
    leg's YES price; the page flips it for a NO), state (live | pending |
    resolved | void), pending_reason (closed | price | disputed; all read "Pending"), outcome
    (right | wrong), outcome_line, taps_agree, taps_disagree, user_side.
  Joined on market_id + leg_id.
- Stats (headline only, left column; no per-set stats): Called = races with a call; Resolved =
  resolved right or wrong; Right = resolved right; Hit rate = right ÷ resolved,
  void excluded, a dash until one resolves. No five-star line. No money
  lines anywhere.
- Markets area: a sticky bar with a dropdown (All, the default · Balance of
  Power · Senate · Governors) and a cards / list icon toggle (remembered per
  viewer); a dropdown at every width. Under it the full set. Nothing
  collapsed; no safe-seats section.
- Order: the top markets lead every list (All, Balance of Power, Senate,
  Governors). The MVP order is final and needs no server ranking: featured,
  then contested by price closest to 50, then safe, read from the race list's
  featured and layer fields.
- Balance of Power labels live in the race list: the called leg and runner-up
  as display text (e.g. "Democrats Sweep" / "R Senate · D House").
- The only server addition beyond the build spec: volume on the calls feed.
- One word for a correct call: Right, on the tag and the stat.
- Desktop: one market is always selected and its full card (thesis included)
  stands in a pane beside the markets. Phone (below 1024px): every card and row
  has a drop-down; opened, it shows the desktop pane's card in place (thesis
  box with its Resolution drop-down included), in cards or list view. Phone
  rows: race · odds / pick · stars / tally left, Agree and Disagree right.
  Phone cards view: two compact cards across, like the desktop card.
- Maps: a seat takes the party of his pick (a NO takes the runner-up's);
  seats not up stay neutral; void dashed; resolved seats get a green check / red X.
- His pick, never a double negative: YES → the called candidate or party; NO
  two-candidate → the runner-up; NO multi-candidate (AK, CA, ID, MI, RI) →
  "Not" + the called candidate; NO on Balance of Power → the runner-up
  outcome ("R Senate · D House"); NO on Senate / House control → the other party.
- Card: race and group; market odds top right, "57% YES" for the pick the card
  names (settled 100 / 0 once resolved); pick with party chip; stars · volume ·
  state tag, one row (no "% at call"); closed races drop the volume (stars ·
  tag). No time remaining. Agree /
  Disagree with the tally. Opened, it adds a thesis box like the home's: the
  thesis, and a chevron dropping down Resolution: the settlement line,
  the outcome line once resolved, the void line when void. Volume comes from the
  calls feed (the one added field).
- Row: race · pick · stars · market odds · Agree / Disagree (live) or the
  state tag in that same column (closed) · tally. A
  click anywhere on a card or row selects it; the selected one has the home's
  white outline and green flash.
- Tags: Pending · Right · Wrong · Void (no disputed tag). Taps: one per call,
  final, the already notice, Tap Confirmed; no buttons from pending on (pending, resolved and void show only the tally). Pending
  races stay in their group.
- Every visible string on the page is placeholder copy for Awetu.

## Not built (founder's call)
"Against the market" tag; "Changed his mind on {date}" note; History "called
{date} · odds · his number" line; "His call" caption; change-count tag; the
resolved fact line in the drop-down.

## Gone and staying gone
Vote modal, Take-sent modal, take limits, prompt bar and stance switch,
typewriter, credits, contributors, hold_reason, his number on the face.
