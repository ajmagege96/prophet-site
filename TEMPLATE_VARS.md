# Template Variables

| Variable | Description |
|---|---|
| `{{docs_url}}` | External link to documentation site |
| `{{x_url}}` | Link to the project's X (Twitter) account |
| `{{tg_url}}` | Link to the project's Telegram channel |
| `{{username}}` | Signed-in user's display name; replaced with a [COPY] label when signed out |
| `{{polymarket_as_of}}` | Relative timestamp of last Polymarket status check (shown on hover in home panel) |
| `{{polymarket_status}}` | Polymarket feed status: `up` (green pulsing dot) or `down` (red dot) |
| `{{market.slug}}` | URL-safe identifier for the market (used in `<!-- repeat: market -->`) |
| `{{market.question}}` | Market question text |
| `{{market.yes_pct}}` | Current YES percentage (e.g. "72%") |
| `{{market.as_of}}` | Relative time since last update (e.g. "4m ago") |
| `{{market.take_count}}` | Number of takes on this market |
| `{{market.state}}` | Display state: open, no edge yet, vote open · tally, called YES · conviction N |
| `{{market.thesis_line}}` | One-line thesis if present; empty otherwise |
| `{{market.pinned}}` | Whether the card is pinned (controls pinned tag visibility) |
| `{{take.stance}}` | Take stance: YES or NO (used in `<!-- repeat: take -->`) |
| `{{take.claim}}` | One-line claim text |
| `{{take.ago}}` | Relative timestamp (e.g. "2h ago") |
