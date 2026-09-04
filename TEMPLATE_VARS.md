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
| `{{market.vote_time_left}}` | Time left on the vote, relative (purple clock in the badge) |
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
| `{{vote.tally_pct}}`, `{{vote.tally_side}}` | Live tally in weight, e.g. `62%` + `yes` (lowercase) |
| `{{vote.vote_count}}` | Votes cast so far (vote icon + count in the badge) |
| `{{vote.time_left}}` | Time left on the vote, e.g. `2d`, `14h`; shown as a purple clock + "2d left" in the badge |
| `{{vote.live_pct}}` | Live market YES %, the green number beside the badge column |
| `{{vote.ends_in}}` | Market ends-in, relative, after a clock icon (the market's own clock; the vote's is in the badge) |
| `{{vote.button_label}}` | `Vote`, or `Voted <span class="tally tally--yes">YES</span>` / `…tally--no">NO</span>` once the viewer has voted (side colored green/red) |
| `{{vote.my_yes_class}}` / `{{vote.my_no_class}}` | `vote-btn--chosen` on the popup button the viewer picked, empty otherwise |
| `{{thesis.slug}}`, `{{thesis.image_url}}`, `{{thesis.question}}` | Live-thesis row identity (`<!-- repeat: thesis -->`) |
| `{{thesis.stance}}` / `{{thesis.stance_upper}}`, `{{thesis.conviction}}` | Called side and conviction 1–5 |
| `{{thesis.text}}` | Thesis text |
| `{{thesis.live_pct}}` | Live market YES %, the green number beside the badge column |
| `{{thesis.called_pct}}`, `{{thesis.ends_in}}` | "61% at call" and clock + ends-in on the meta line |
| `{{explainer_open_votes}}`, `{{explainer_prophecies}}` | One explainer line under each group title on the Prophecies page (approved: "Draft theses waiting on holders. Vote YES or NO. Your voting weight is what you hold." / "Calls that passed the vote, live until the market resolves.") |
| `{{empty_open_votes}}`, `{{empty_prophecies}}` | Empty-state line for each group, set on the section; shown when its list has no rows (fallbacks: "No open votes right now.", "No prophecies yet.") |
| `take.*` inside any row's dropdown | Same take variables as the home panel (`<!-- repeat: take -->` inside each row's Contributions dropdown) |

### Record page
| Variable | Description |
|---|---|
| `{{bar.outcome}}`, `{{bar.points_abs}}`, `{{bar.points_signed}}`, `{{bar.question}}` | P&L bars (`<!-- repeat: bar -->`, oldest left): `won`/`lost`, absolute points for height, signed points label, question on hover |
| `{{record.calls}}`, `{{record.wins}}`, `{{record.losses}}`, `{{record.win_rate}}` | Stats row under the chart |
| `{{record.edge}}`, `{{record.edge_class}}` | Edge as a signed number (e.g. `+9.4`; "pts" is static) and `win` / `loss` to color it green / red |
| `{{bar.resolved_ago}}` | Relative time, shown in each bar's hover title |
| `{{record.edge_range}}` | Selected time range for the Edge chart: `1w`, `1m`, `3m`, `1y`, `all`; the server marks that tab `range__tab--on` and filters the bars |
| `{{explainer_record}}` | Explainer line under the History title (approved: "Every call he's made, with the odds at the time and how it ended.") |
| `{{empty_record}}` | Empty-state line when there are no entries (fallback: "No calls on the Record yet.") |
| `{{entry.slug}}`, `{{entry.image_url}}`, `{{entry.question}}` | Entry row identity (`<!-- repeat: entry -->`, newest first) |
| `{{entry.stance}}` / `{{entry.stance_upper}}`, `{{entry.conviction}}` | What was called and conviction 1–5 |
| `{{entry.volume}}`, `{{entry.take_count}}`, `{{entry.called_pct}}` | Row meta: volume, takes, market YES % at the call |
| `{{entry.outcome}}`, `{{entry.resolved_ago}}` | `won` / `lost` tag and bare relative time |
| `{{entry.call_text}}`, `{{entry.called_ago}}` | Chain: the call |
| `{{update.text}}`, `{{update.ago}}` | Chain: each update (`<!-- repeat: update -->`) |
| `{{entry.resolved_side}}` / `{{entry.resolved_side_upper}}`, `{{entry.resolved_pct}}` | Chain: how the market resolved and its closing % |
| `{{entry.lesson}}` | Chain: the lesson |

### $PROPHET page
| Variable | Description |
|---|---|
| `{{token.price}}`, `{{token.price_change}}` | Live price and 24h change (change colors green up / red down) |
| `{{token.market_cap}}`, `{{token.market_cap_change}}` | Market cap and its 24h change |
| `{{token.volume_24h}}`, `{{token.volume_change}}` | Volume and its 24h change |
| `{{token.liquidity}}` | Liquidity |
| `{{token.holders}}`, `{{token.holders_change}}` | Holders and the 24h change in holders |
| `{{token.fees_earned}}` | Fees earned, in dollars, shown green |
| `{{token.chart_ticks}}` | JSON array of x-axis labels for the selected range: clock times on 5M–1D, dates on 1W and longer |
| `{{token.chart_series}}` | JSON array of prices, oldest first; app.js draws the green area chart, an x-axis of relative times, and the live price tagged beside the last point |
| `{{swap_slippage}}`, `{{swap_impact}}` | Swap meta line, left: slip and price impact |
| `{{swap_sol_balance}}` | The viewer's SOL balance, right of the swap meta line (e.g. "2.41 SOL") |
| `{{trade.side}}`, `{{trade.amount}}` | Live-trades strip (`<!-- repeat: trade -->`): `buy` / `sell` and the amount |
| `{{wallet_war_chest_url}}`, `{{wallet_rewards_url}}`, `{{wallet_burn_url}}`, `{{wallet_pools_url}}` | Explorer links for the four public wallets; shown as labels, never as addresses |
| `{{wallet_war_chest_value}}`, `{{wallet_rewards_value}}`, `{{wallet_pools_value}}` | Live balances, green |
| `{{wallet_burn_value}}` | Tokens burned, red (e.g. "8.4M"); the "$PROPHET" ticker after it stays gray, then a red flame icon |
| `{{pool_last_week}}` | Last week's reward pool; the line reads "paid to the community" |
