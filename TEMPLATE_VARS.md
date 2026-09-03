# Template Variables

| Variable | Description |
|---|---|
| `{{docs_url}}` | External link to documentation site |
| `{{x_url}}` | Link to the project's X (Twitter) account |
| `{{tg_url}}` | Link to the project's Telegram channel |
| `{{linkedin_url}}` | Link to the project's LinkedIn page |
| `{{tradeleague_url}}` | Link for the "Automated by TradeLeague" footer lockup |
| `{{jupiter_url}}` | $PROPHET on Jupiter (footer token link) |
| `{{pumpfun_url}}` | $PROPHET on pump.fun (footer token link) |
| `{{solscan_url}}` | $PROPHET on Solscan (footer token link) |
| `{{tl_x_url}}` | TradeLeague on X (footer) |
| `{{tl_tg_url}}` | TradeLeague on Telegram (footer) |
| `{{tl_linkedin_url}}` | TradeLeague on LinkedIn (footer) |
| `{{contract_address}}` | $PROPHET contract address; the header pill shows first 6 … last 6 and copies the full value |
| `{{username}}` | Signed-in user's display name; replaced with a [COPY] label when signed out |
| `{{polymarket_as_of}}` | Relative timestamp of last Polymarket status check (shown on hover in home panel) |
| `{{polymarket_status}}` | Polymarket feed status: `up` (green pulsing dot, also the default if the class is unset) or `down` (red dot) |
| `{{market.slug}}` | URL-safe identifier for the market (used in `<!-- repeat: market -->`) |
| `{{market.image_url}}` | Market image, imported from Polymarket (44px square on the card) |
| `{{market.question}}` | Market question text |
| `{{market.yes_pct}}` | Current YES percentage (e.g. "72%") |
| `{{market.volume}}` | Polymarket volume, short form (e.g. "$4.1M"), shown after a bar-chart icon |
| `{{market.ends_in}}` | Relative time until the market ends (e.g. "12d", "3mo"), shown after a clock icon |
| `{{market.take_count}}` | Number of takes on this market |
| `{{market.state}}` | State badge, top-right of the card, rendered only for vote/called: `vote open · <span class="tally tally--yes">62% YES</span>` or `called <span class="tally tally--no">NO</span> <span class="conviction">[star icon]N</span>` (no dot); tally colors green/red by side; empty for open markets with no thesis |
| `{{market.contributors_json}}` | JSON array of `{user, claim, xp}` set as `data-contributors` on the card; listed under the thesis as Contributors |
| `{{contributor.username}}` | Contributor's username (used in `<!-- repeat: contributor -->` inside the Thesis block) |
| `{{contributor.claim}}` | The contribution that fed the thesis, one line |
| `{{contributor.xp}}` | XP earned for that contribution |
| `{{market.thesis_stance}}` | `yes` or `no`: which way the thesis (or draft) calls it; shown bold beside the Thesis label |
| `{{market.thesis}}` | Full thesis text (called) or draft thesis (vote open), set as `data-thesis` on the card; shown in the Thesis block above the takes when the card is selected; empty otherwise |
| `{{market.vote_count}}` | Votes cast so far on an open vote (shown after a vote icon in the badge) |
| `{{market.filter_state}}` | `none` (no thesis yet), `vote` (vote open), or `called`; drives the filter tags above the carousel |
| `{{take.username}}` | Username of the person who posted the take (used in `<!-- repeat: take -->`) |
| `{{take.stance}}` | Take stance: YES or NO (used in `<!-- repeat: take -->`) |
| `{{take.xp}}` | XP earned by the take, rendered as "+N XP" under the timestamp |
| `{{take.claim}}` | One-line claim text |
| `{{take.ago}}` | Relative timestamp (e.g. "2h ago") |
| `{{buy_url}}` | Buy $PROPHET link (pump.fun) |
| `{{empty_no_takes}}` | Line shown in the take slot when the selected market has no takes (generated later; mock: "Nobody's taken this one yet. The first contributor earns the most credit. What do you think?") |

### Prophecies page
| Variable | Description |
|---|---|
| `{{vote.slug}}`, `{{vote.image_url}}`, `{{vote.question}}` | Open-vote row identity (`<!-- repeat: vote -->`) |
| `{{vote.stance}}` / `{{vote.stance_upper}}` | Draft stance: `yes`/`no` and `YES`/`NO` |
| `{{vote.thesis}}` | Draft thesis text |
| `{{vote.tally_pct}}`, `{{vote.tally_side}}` / `{{vote.tally_side_upper}}` | Live tally in weight, e.g. `62%` + `yes` / `YES` |
| `{{vote.vote_count}}` | Votes cast so far (vote icon + count in the badge) |
| `{{vote.take_count}}` | Takes on the market (person icon + count under the badge) |
| `{{vote.time_left}}` | Relative time left, e.g. `2d`, `14h` |
| `{{vote.button_label}}` | `Vote`, or `Voted <span class="tally tally--yes">YES</span>` / `…tally--no">NO</span>` once the viewer has voted (side colored green/red) |
| `{{vote.my_yes_class}}` / `{{vote.my_no_class}}` | `vote-btn--chosen` on the popup button the viewer picked, empty otherwise |
| `{{thesis.slug}}`, `{{thesis.image_url}}`, `{{thesis.question}}` | Live-thesis row identity (`<!-- repeat: thesis -->`) |
| `{{thesis.stance}}` / `{{thesis.stance_upper}}`, `{{thesis.conviction}}` | Called side and conviction 1–5 |
| `{{thesis.text}}` | Thesis text |
| `{{thesis.take_count}}`, `{{thesis.called_ago}}` | Takes and relative time since the call |
| `{{history.slug}}`, `{{history.image_url}}`, `{{history.question}}` | History row identity (`<!-- repeat: history -->`) |
| `{{history.stance}}` / `{{history.stance_upper}}`, `{{history.conviction}}` | What was called |
| `{{history.called_pct}}` | Market YES % at the moment of the call (shown as "61% at call") |
| `{{history.volume}}`, `{{history.take_count}}` | Final volume and take count |
| `{{history.outcome}}` | `won` or `lost` (rendered as a green/red tag) |
| `{{history.resolved_ago}}` | Relative time since resolution, shown bare (e.g. "2w ago") |
| `{{empty_open_votes}}`, `{{empty_prophecies}}`, `{{empty_history}}` | Empty-state line for each group, set on the section; shown when its list has no rows (fallbacks: "No open votes right now.", "No prophecies yet.", "Nothing resolved yet.") |
| `take.*` inside any row's dropdown | Same take variables as the home panel (`<!-- repeat: take -->` inside each row's Contributions dropdown) |
