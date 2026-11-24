# StockSmart: learn to invest, then invest smarter

A web app with two modes:

- **🎒 Student mode** (high school): plain-English lessons on how stocks work and what to look at in a company, with every term (P/E, EPS, debt-to-equity…) explained like you're 15. Gamified with XP, levels, streaks, badges and challenges.
- **💼 Adult mode**: ranks ~60 large US and Canadian stocks with a transparent 0–100 score (**Consider Buying / Watch / Pass for now**), explains every score, flags risks, and includes a Canadian tax & accounts guide.

> ⚠️ Educational tool, not financial advice. Scores come from a simple published formula applied to public data.

## Features

### Student
| Feature | What it does |
|---|---|
| 10 lessons + quizzes | Stocks, why prices move, company health, valuation (P/E, P/S, PEG), dividends, risk, compounding, index funds, **scams & hype**, **money foundations (Canada)**. Answer streaks multiply XP. |
| Maya's Lemonade Co. | A running case study that grows one chapter per lesson so each term has a concrete example. |
| Glossary (35 terms) | Plain English, an analogy, why it matters, what's "normal", plus **real-company comparisons** (e.g. P/E of KO vs NVDA vs TD). Terms are tooltips everywhere. |
| Playgrounds | Compound-interest calculator ("start at 16 vs 26"), P/E/PEG playground, dollar-cost-averaging simulator. |
| Market Time Machine | Relive the dot-com crash, 2008, COVID and 2022. Choose sell / hold / buy more, then see what happened. |
| Practice portfolio | $10,000 of pretend money, fractional shares, sector mix, you vs the S&P 500, and 7 challenges. |
| Company Checkup | Any ticker's "vital signs" with traffic lights and red flags. |
| Flashcards | Spaced repetition (Leitner boxes) from glossary terms you opened and quiz questions you missed. |
| Ask Penny (AI tutor) | Claude-powered tutor limited to beginner investing education (optional, needs an Anthropic key). |

### Adult
| Feature | What it does |
|---|---|
| Stock picks | Five factors (value, growth, quality, financial health, momentum) as sector-aware percentiles, weighted by your risk profile. Sortable and filterable, with a 🍁 Canadian-only filter. |
| Stock detail | Score breakdown, "why" bullets, metrics vs sector median, red flags (losses, heavy debt, dilution, shrinking margins, extreme valuation, volatility, drawdowns), position sizing, and an ETF alternative (US + Canadian). |
| Wall Street context | Analyst rating trends, next earnings date, insider buying/selling, news (live mode). |
| Investor profile quiz | Sets conservative / balanced / aggressive weights and suggests a stock/bond mix with Canadian all-in-one ETFs. |
| Market dashboard | Index proxies (SPY, QQQ, DIA, EWC), sector heatmap, and where the model sees opportunity. |
| Watchlist | Buy-below / sell-above price alerts and a diversification checker (concentration, sector weight, home bias). |
| Tax & accounts 🍁 | TFSA, RRSP, FHSA, RESP, non-registered; 50% capital gains inclusion, superficial loss rule, dividend tax credit, US withholding tax, T1135, currency costs, and an asset-location cheat sheet. |

## Getting started

```bash
npm install
```

```bash
cp .env.example .env   # optional: add keys (see below)
```

```bash
npm run dev            # API on :3001, app on http://localhost:5173
```

The app runs **without any keys**. It then uses bundled, clearly labelled *sample data*, with simulated daily price moves so the practice portfolio still changes.

| Variable | Enables |
|---|---|
| `FINNHUB_API_KEY` | Live quotes, fundamentals, analyst ratings, earnings dates, insider trades and news. Get a free key at [finnhub.io](https://finnhub.io/register). The free tier allows 60 calls/min, so the server caches responses and warms data in the background (~2 min for the full list). |
| `ANTHROPIC_API_KEY` | The "Ask Penny" AI tutor. |

### Production

```bash
npm run build && npm start   # serves the built app and API on :3001
```

### Tests

```bash
npm test         # scoring, red flags, XP/streaks/flashcards, portfolio math, content integrity
npm run typecheck
```

## Project layout

```
shared/         types + constants used by both sides (score thresholds, profile weights)
server/src/     Express API: Finnhub client (cache + rate limit), sample data, scoring, red flags, AI tutor
client/src/
  content/      glossary, lessons + quizzes, story, crash scenarios, Canadian tax/accounts
  game/         XP, levels, badges, streaks, flashcards, portfolio math, challenges (pure functions)
  student/      student pages
  adult/        adult pages
```

Progress, the practice portfolio, the watchlist and the investor profile are stored in the browser (`localStorage`). There are no accounts.
