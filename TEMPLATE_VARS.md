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
| `{{polymarket_as_of}}` | Relative timestamp of last Polymarket status check (shown on hover in home panel) |
| `{{polymarket_status}}` | Polymarket feed status: `up` (green pulsing dot, also the default if the class is unset) or `down` (red dot) |
| `{{market.slug}}` | URL-safe identifier for the market (used in `<!-- repeat: market -->`) |
| `{{market.image_url}}` | Market image, imported from Polymarket (44px square on the card) |
| `{{market.question}}` | Market question text |
| `{{market.yes_pct}}` | Current YES percentage (e.g. "72%"); once resolved, the settled 100% / 0% |
| `{{market.state}}` | After the odds, top-right: empty for a live call; in History the tag `<span class="prow__outcome prow__outcome--right">right</span>` (right · wrong · void · awaiting) |
| `{{market.volume}}` | Polymarket volume, short form (e.g. "$4.1M"), shown after a bar-chart icon |
| `{{market.ends_in}}` | Relative time until the market ends (e.g. "12d", "3mo"), shown after a clock icon |
| `{{prophet_probability}}` | The Prophet's number for the market, a whole integer with `%` (e.g. `78%`). Set as `data-estimate` on the card; carried as `data-estimate`; not shown anywhere for now |
| `{{label}}` | `buy_yes` / `buy_no`, carried on the card as `data-label`; the card prints it as the big Buy YES / Buy NO. Never inside the thesis text |
| `{{market.called_ago}}` | Relative time of the call, in the meta row as "called 3d ago" |
| `{{revised_ago}}`, `{{revised_number}}` | A call re-run after it was made: the block shows "Revised {ago}" and the latest thesis; `revised_number` is carried on the card, not shown. Empty when not revised |
| `{{agree_pct}}`, `{{trade_count}}`, `{{user_side}}`, `{{market_closed}}` | Agree / Disagree under the thesis: the user's side (`agree` / `disagree` / empty) is marked; from three taps the split reads "58% agree with him · 14 taps" — the server's figure, unchanged by the user's own tap — below that only the user's side; `market_closed` `true` disables both buttons. Signed-in only: a signed-out tap fires `prophet:signin` with `{then: 'agree', slug}` |
| `{{market.outcome}}` | History: `right` / `wrong` / `void` / `awaiting` — the tag in the badge and the outcome line |
| `{{call_state}}` | `live` / `resolved` / `void` / `closed`. Void shows "Market closed by Polymarket before resolution."; closed shows "Awaiting resolution" |
| `{{listed_leg_date}}` | Ladder markets only: the leg's date (e.g. `Oct 20`), small and gray beside the question on the card face. Empty otherwise. When a leg rolls, the card returns to not evaluated with the next date and the old leg goes to History as resolved |
| `{{market.outcome}}` | `won` / `lost` — resolved markets only, drives the tag in the badge |
| `{{market.resolved_side}}` | `yes` / `no` — the side the market settled on |
| `{{market.resolved_pct}}` | Closing YES % at settlement, e.g. `97%` |
| `{{market.resolved_ago}}` | Relative time since resolution, e.g. `2w ago` |
| `{{market.called_pct}}` | Odds when the thesis was called, e.g. `84%`; rendered on called cards only |
| `{{market.thesis_stance}}`, `{{market.thesis_stance_upper}}` | `yes` / `no` and `YES` / `NO`: the call, printed big on the card as "Buy YES" (green) or "Buy NO" (red) |
| `{{market.thesis}}` | Full thesis text (called) or draft thesis (vote open), set as `data-thesis` on the card; shown in the Thesis block above the takes when the card is selected; empty otherwise |
| `{{market.filter_state}}` | `called` (the Calls deck) or `resolved` (History); the two tabs |
| `{{buy_url}}` | Buy $PROPHET link (pump.fun) |

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

### History group (archived with the Prophecies page)

The Record page is deferred to v2; its Edge-chart variables below are unused by the
MVP and kept only so they come back with the page. `{{explainer_record}}`,
`{{empty_record}}` and the `{{entry.*}}` row variables are live on Prophecies now.
| Variable | Description |
|---|---|
| `{{bar.outcome}}`, `{{bar.points_abs}}`, `{{bar.points_signed}}`, `{{bar.question}}` | P&L bars (`<!-- repeat: bar -->`, oldest left): `won`/`lost`, absolute points for height, signed points label, question on hover |
| `{{record.calls}}`, `{{record.wins}}`, `{{record.losses}}`, `{{record.win_rate}}` | Stats row under the chart |
| `{{record.edge}}`, `{{record.edge_class}}` | Edge as a signed number (e.g. `+9.4`; "pts" is static) and `win` / `loss` to color it green / red |
| `{{bar.resolved_ago}}` | Relative time, shown in each bar's hover title |
| `{{record.edge_first_date}}`, `{{record.edge_last_date}}` | Dates at the two ends of the chart's x-axis (oldest left, newest right), e.g. `Jun 12` / `Aug 21` |
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
| `{{wallet_war_chest_url}}`, `{{wallet_rewards_url}}`, `{{wallet_burn_url}}` | Explorer links for the three public wallets (Trading Wallet, Rewards Pool, Buy-and-Burn); shown as labels, never as addresses |
| `{{wallet_war_chest_value}}`, `{{wallet_rewards_value}}` | Live balances, green |
| `{{wallet_burn_value}}` | Tokens burned, red (e.g. "8.4M"); the "$PROPHET" ticker after it stays gray, then a red flame icon |
| `{{pool_last_week}}` | Last week's reward pool; the line reads "paid to the community" |

### Viewer (signed-in account)

| Variable | Meaning |
|---|---|
| `{{viewer.signed_in}}` | `true` / `false`, on the thesis block. When false an Agree / Disagree tap fires `prophet:signin` instead |



| `{{logout_url}}` | The Logout link in the header and menu; render the link only when `{{viewer.signed_in}}` is true. While unfilled, the click fires a `prophet:logout` event and shows the Logged out notice |

### Tap Confirmed modal

| Variable | Meaning |
|---|---|
| `{{tap_modal.confirm_agree}}`, `{{tap_modal.confirm_disagree}}` | The confirmation line; `{label}` (Buy YES green / Buy NO red), `{verdict}` (right green / wrong red) and `{price}` are filled from the card and the side. Approved copy while unfilled: "You're calling him {verdict}. {label} at {price}. Let's see if you're both right." / "You're calling him {verdict}. {label} at {price}, you say that's {verdict}." |
| `{{tap_modal.scoring_line}}` | Approved copy while unfilled: "Scored when the market resolves. Right or wrong, it's on your record and you'll earn XP." |
| `{{tap_modal.first_in_line}}` | The crowd line under three taps. Approved copy while unfilled: "First tap on this one. You set the tone." |
