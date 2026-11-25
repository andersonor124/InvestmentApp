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
| Tax & accounts 🍁 Canada | TFSA, RRSP, FHSA, RESP, non-registered; 50% capital gains inclusion, superficial loss rule, dividend tax credit, US withholding tax, T1135, currency costs, and an asset-location cheat sheet. |
| Tax & accounts 🇭🇰 Hong Kong | MPF and TVC, brokerage accounts; no capital gains or dividend tax, when frequent trading becomes taxable profits, 30% US dividend withholding, Mainland dividend withholding, stamp duty and trading levies, the HKD–USD peg, and HK-listed / Ireland-domiciled ETF building blocks. Choose your country on the Tax & Accounts page; stock tips and the profile page follow that choice. |

## How to run it

### 1. One-time setup

You need **Node.js 22 or newer** ([nodejs.org](https://nodejs.org)). Check with:

```bash
node -v
```

Download the code and go into the folder:

```bash
git clone https://github.com/andersonor124/InvestmentApp.git StockSmart
```

```bash
cd StockSmart
```

Install the dependencies. Run this in the top folder (the one with `package.json`, `client/` and `server/`); one install covers both. The command is `npm install`, not `npm run install`.

```bash
npm install
```

### 2. Start the app

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. Press `Ctrl+C` in the terminal to stop.

The app works straight away with **sample data** (a yellow banner says so). Prices are illustrative and move a little each day so the practice portfolio still changes.

### 3. Optional: live market data and the AI tutor

Create your settings file in the top folder:

```bash
cp .env.example .env
```

Open it (on a Mac, `open -e .env` opens it in TextEdit) and paste your keys after the `=` signs, with no spaces or quotes:

```
FINNHUB_API_KEY=your_finnhub_key
ANTHROPIC_API_KEY=your_anthropic_key
```

| Variable | Enables | Where to get it |
|---|---|---|
| `FINNHUB_API_KEY` | Live quotes, fundamentals, analyst ratings, earnings dates, insider trades and news | Free at [finnhub.io/register](https://finnhub.io/register) |
| `ANTHROPIC_API_KEY` | The "Ask Penny" AI tutor (paid per question) | [console.anthropic.com](https://console.anthropic.com) |

Save the file, then restart the app (`Ctrl+C`, then `npm run dev`). The terminal should print:

```
Live market data: Finnhub
```

With a live key, the first full load takes about 2 minutes: the free plan allows 60 requests a minute, so the server fills in stocks in the background and caches them. Prices are ~15 minutes delayed, in USD.

`.env` is listed in `.gitignore`, so your keys are never uploaded to GitHub. Treat them like passwords.

### 4. Getting updates

```bash
git pull
```

```bash
npm install
```

Then `npm run dev` again.

### Troubleshooting

| Problem | Fix |
|---|---|
| `Could not read package.json` | You're not in the project's top folder, or your copy is out of date. Run `ls`: you should see `package.json`, `client` and `server`. If not, `cd` into the right folder or run `git pull`. |
| `command not found: npm` | Install Node.js 22+ from [nodejs.org](https://nodejs.org), then open a new terminal. |
| Terminal still says `No FINNHUB_API_KEY` | Check the key is saved: `grep FINNHUB .env` should print it. The file must be named exactly `.env` (not `.env.txt`) and sit in the top folder. Restart `npm run dev` after any change. |
| `EADDRINUSE: address already in use :::3001` | The app is already running in another terminal. Stop that one with `Ctrl+C` (or close it) and try again. |
| Browser shows `Cannot GET /` or a "data server" page | You opened port 3001 (the data server). Open **http://localhost:5173** instead. |
| Pages show "Couldn't load data" | The server part isn't running. Make sure you started with `npm run dev` (not just `vite`). |

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
