# Template Variables

| Variable | Description |
|---|---|
| `{{docs_url}}` | External link to documentation site |
| `{{x_url}}` | Link to the project's X (Twitter) account |
| `{{tg_url}}` | Link to the project's Telegram channel |
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
| `{{market.filter_state}}` | `none` (no thesis yet), `vote` (vote open), or `called`; drives the filter tags above the carousel |
| `{{take.username}}` | Username of the person who posted the take (used in `<!-- repeat: take -->`) |
| `{{take.stance}}` | Take stance: YES or NO (used in `<!-- repeat: take -->`) |
| `{{take.xp}}` | XP earned by the take, rendered as "+N XP" under the timestamp |
| `{{take.claim}}` | One-line claim text |
| `{{take.ago}}` | Relative timestamp (e.g. "2h ago") |
