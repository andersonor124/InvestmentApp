import { useCallback, useEffect, useMemo, useState } from "react";
import type { UniverseEntry } from "../../../shared/types";
import { LineChartBox } from "../components/Chart";
import { Button, Card, DataBanner, ErrorBox, PageHeader, Pill, Stat, TermTip } from "../components/ui";
import { CHALLENGES } from "../game/challenges";
import { buy, emptyPortfolio, recordHistory, sectorMix, sell, START_CASH, totalValue, vsMarket } from "../game/portfolio";
import { api } from "../lib/api";
import { changeClass, money, num, pct, todayKey } from "../lib/format";
import { useStore } from "../store";

export default function PortfolioPage() {
  const { portfolio, setPortfolio, screener, progress, updateProgress, toast, celebrate } = useStore();
  const [universe, setUniverse] = useState<UniverseEntry[]>([]);
  const [prices, setPrices] = useState<Record<string, number | undefined>>({});
  const [changes, setChanges] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("SPY");
  const [mode, setMode] = useState<"shares" | "dollars">("dollars");
  const [amount, setAmount] = useState("1000");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.universe().then(setUniverse).catch((e: Error) => setError(e.message));
  }, []);

  const watched = useMemo(() => [...new Set(["SPY", selected, ...Object.keys(portfolio.holdings)])], [selected, portfolio.holdings]);
  const refreshPrices = useCallback(() => {
    api
      .quotes(watched)
      .then((qs) => {
        setPrices((p) => ({ ...p, ...Object.fromEntries(qs.map((q) => [q.symbol, q.price ?? undefined])) }));
        setChanges((c) => ({ ...c, ...Object.fromEntries(qs.map((q) => [q.symbol, q.changePct])) }));
      })
      .catch((e: Error) => setError(e.message));
  }, [watched]);
  useEffect(() => {
    refreshPrices();
    const t = setInterval(refreshPrices, 60_000);
    return () => clearInterval(t);
  }, [refreshPrices]);

  const value = totalValue(portfolio, prices);
  const spy = prices.SPY ?? null;
  const { mine, market } = vsMarket(portfolio, value, spy);
  const mix = sectorMix(portfolio, prices);
  const holdingsList = Object.values(portfolio.holdings);
  const pricesReady = holdingsList.every((h) => prices[h.symbol] !== undefined);

  // Record one history point per day once prices are in.
  useEffect(() => {
    if (!portfolio.start || !pricesReady || spy === null) return;
    const last = portfolio.history[portfolio.history.length - 1];
    if (last && last.date === todayKey() && Math.abs(last.value - value) < 0.01) return;
    setPortfolio((p) => recordHistory(p, todayKey(), value, spy));
  }, [portfolio.start, pricesReady, spy, value, portfolio.history, setPortfolio]);

  // Award challenges as they're completed.
  const dividendYields = useMemo(() => Object.fromEntries((screener?.stocks ?? []).map((s) => [s.symbol, s.dividendYield])), [screener]);
  useEffect(() => {
    if (!pricesReady) return;
    const ctx = { portfolio, prices, spyNow: spy, dividendYields };
    const newlyDone = CHALLENGES.filter((c) => !progress.challenges.includes(c.id) && c.done(ctx));
    if (!newlyDone.length) return;
    const xp = newlyDone.reduce((s, c) => s + c.xp, 0);
    updateProgress((p) => ({ ...p, xp: p.xp + xp, challenges: [...new Set([...p.challenges, ...newlyDone.map((c) => c.id)])] }));
    newlyDone.forEach((c) => toast({ emoji: c.emoji, title: `Challenge complete! +${c.xp} XP`, body: c.title }));
    celebrate();
  }, [portfolio, prices, spy, dividendYields, pricesReady, progress.challenges, updateProgress, toast, celebrate]);

  const entry = universe.find((u) => u.symbol === selected);
  const price = prices[selected];
  const facts = screener?.stocks.find((s) => s.symbol === selected);
  const amt = Number(amount);
  const shares = price ? (mode === "shares" ? amt : amt / price) : 0;
  const owned = portfolio.holdings[selected];

  function trade(side: "buy" | "sell") {
    if (!entry || !price) return;
    const date = todayKey();
    const res =
      side === "buy"
        ? buy(portfolio, { symbol: entry.symbol, name: entry.name, sector: entry.sector, price, shares, date, spy })
        : sell(portfolio, { symbol: entry.symbol, price, shares: Math.min(shares, owned?.shares ?? 0) || shares, date });
    if (!res.ok) {
      setMessage({ ok: false, text: res.error });
      return;
    }
    setPortfolio(() => res.portfolio);
    setMessage({ ok: true, text: `${side === "buy" ? "Bought" : "Sold"} ${num(shares, 4)} ${entry.symbol} at ${money(price)} = ${money(shares * price)}` });
  }

  const chartData = portfolio.history.map((h) => ({
    date: h.date,
    you: h.value,
    market: portfolio.startSpy && h.spy ? Math.round((START_CASH * h.spy) / portfolio.startSpy) : null,
  }));

  const grouped = useMemo(() => {
    const g: Record<string, UniverseEntry[]> = {};
    for (const u of universe) (g[u.sector] ??= []).push(u);
    return g;
  }, [universe]);

  return (
    <div className="space-y-6">
      <PageHeader emoji="💼" title="Practice Portfolio" subtitle="You have $10,000 of pretend money. Build a portfolio, complete challenges, and see if you can beat the S&P 500. No real money is involved." />
      <DataBanner />
      {error && <ErrorBox message={error} onRetry={refreshPrices} />}

      <Card>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <Stat label="Total value" value={money(value)} sub={`started with ${money(START_CASH, 0)}`} />
          <Stat label="Your return" value={pct(mine, 2, true)} tone={changeClass(mine)} sub={money(value - START_CASH)} />
          <Stat label="S&P 500 since your start" value={market === null ? "—" : pct(market, 2, true)} tone={changeClass(market)} sub={market === null ? "make a trade to start the race" : Math.abs(mine - market) < 0.005 ? "neck and neck" : mine > market ? "🏆 you're ahead" : "the index is ahead"} />
          <Stat label="Cash" value={money(portfolio.cash)} sub={`${num((portfolio.cash / Math.max(value, 1)) * 100, 0)}% of portfolio`} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card>
          <h2 className="text-lg font-bold">Trade</h2>
          <label className="mt-3 block text-sm font-medium" htmlFor="pick">
            Stock or ETF
          </label>
          <select id="pick" value={selected} onChange={(e) => { setSelected(e.target.value); setMessage(null); }} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2">
            {Object.entries(grouped).map(([sector, list]) => (
              <optgroup key={sector} label={sector}>
                {list.map((u) => (
                  <option key={u.symbol} value={u.symbol}>
                    {u.symbol} · {u.name}
                    {u.country === "CA" ? " 🍁" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-bold tabular-nums">{money(price ?? null)}</div>
            <div className={`text-sm font-semibold ${changeClass(changes[selected])}`}>{pct(changes[selected], 2, true)} today</div>
          </div>
          {facts && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <Pill>
                <TermTip id="pe">P/E</TermTip> {facts.pe === null ? "n/a" : num(facts.pe, 1)}
              </Pill>
              <Pill>
                <TermTip id="dividend-yield">Yield</TermTip> {pct(facts.dividendYield)}
              </Pill>
              <Pill>
                <TermTip id="beta">Beta</TermTip> {num(facts.beta, 2)}
              </Pill>
            </div>
          )}
          {entry?.etf && <p className="mt-2 text-xs text-muted">📦 This is an index ETF: one purchase = hundreds of companies.</p>}

          <div className="mt-4 flex rounded-xl border border-line p-0.5 text-sm font-semibold">
            {(["dollars", "shares"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg py-1.5 ${mode === m ? "bg-accent text-accent-ink" : "text-muted"}`}>
                {m === "dollars" ? "$ amount" : "# shares"}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 tabular-nums"
            aria-label={mode === "dollars" ? "Dollar amount" : "Number of shares"}
          />
          <p className="mt-1 text-xs text-muted">
            {price ? (mode === "dollars" ? `≈ ${num(shares, 4)} shares (fractional shares allowed)` : `≈ ${money(shares * price)}`) : "Waiting for price…"}
            {owned && ` · you own ${num(owned.shares, 4)}`}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={() => trade("buy")} disabled={!price || !(shares > 0)}>
              Buy
            </Button>
            <Button variant="secondary" onClick={() => trade("sell")} disabled={!price || !owned}>
              Sell
            </Button>
          </div>
          {message && <p className={`mt-3 rounded-lg p-2 text-sm ${message.ok ? "bg-gain-soft text-gain" : "bg-loss-soft text-loss"}`}>{message.text}</p>}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold">Holdings</h2>
            {holdingsList.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No investments yet. Tip: many investors start with a broad index ETF like SPY, then add a few companies they understand.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-sm">
                  <thead className="text-left text-xs uppercase text-muted">
                    <tr>
                      <th className="py-2">Stock</th>
                      <th className="text-right">Shares</th>
                      <th className="text-right">Avg cost</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Value</th>
                      <th className="text-right">Gain/loss</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {holdingsList.map((h) => {
                      const p = prices[h.symbol];
                      const v = p !== undefined ? h.shares * p : h.cost;
                      const g = v - h.cost;
                      return (
                        <tr key={h.symbol} className="border-t border-line">
                          <td className="py-2">
                            <button className="font-semibold text-accent" onClick={() => setSelected(h.symbol)}>
                              {h.symbol}
                            </button>
                            <div className="text-xs text-muted">{h.sector}</div>
                          </td>
                          <td className="text-right">{num(h.shares, 4)}</td>
                          <td className="text-right">{money(h.cost / h.shares)}</td>
                          <td className="text-right">{money(p ?? null)}</td>
                          <td className="text-right">{money(v)}</td>
                          <td className={`text-right font-semibold ${changeClass(g)}`}>
                            {money(g)}
                            <div className="text-xs">{pct((g / h.cost) * 100, 1, true)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {holdingsList.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase text-muted">
                  Sector mix (<TermTip id="diversification">diversification</TermTip>)
                </div>
                <div className="mt-2 space-y-1.5">
                  {Object.entries(mix)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sector, v]) => {
                      const share = v / Math.max(value - portfolio.cash, 1);
                      return (
                        <div key={sector} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-2 text-sm">
                          <span className="truncate">{sector}</span>
                          <div className="h-2.5 rounded-full bg-surface-2">
                            <div className="h-full rounded-full bg-series-1" style={{ width: `${share * 100}%` }} />
                          </div>
                          <span className="text-right tabular-nums">{num(share * 100, 0)}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold">You vs the market</h2>
            {chartData.length >= 2 ? (
              <LineChartBox
                data={chartData}
                xKey="date"
                series={[
                  { key: "you", label: "Your portfolio", color: "var(--series-1)" },
                  { key: "market", label: "$10,000 in the S&P 500", color: "var(--series-2)", dashed: true },
                ]}
                yFormat={(v) => `$${Math.round(v).toLocaleString()}`}
              />
            ) : (
              <p className="mt-2 text-sm text-muted">Your chart appears after your portfolio has at least two days of history. Come back tomorrow to see how you're doing!</p>
            )}
          </Card>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">🎯 Challenges</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {CHALLENGES.map((c) => {
            const done = progress.challenges.includes(c.id);
            return (
              <div key={c.id} className={`flex gap-3 rounded-2xl border p-4 ${done ? "border-gain/40 bg-gain-soft" : "border-line bg-surface"}`}>
                <div className="text-3xl">{done ? "✅" : c.emoji}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.title}</span>
                    <Pill tone={done ? "gain" : "accent"}>+{c.xp} XP</Pill>
                  </div>
                  <p className="text-sm">{c.description}</p>
                  <p className="mt-1 text-xs text-muted">💡 {c.lesson}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {portfolio.trades.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold">Trade history</h2>
          <ul className="mt-2 divide-y divide-line text-sm">
            {[...portfolio.trades].reverse().slice(0, 20).map((t, i) => (
              <li key={i} className="flex justify-between py-1.5 tabular-nums">
                <span>
                  {t.date} · <strong className={t.side === "buy" ? "text-gain" : "text-loss"}>{t.side.toUpperCase()}</strong> {num(t.shares, 4)} {t.symbol}
                </span>
                <span>{money(t.shares * t.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Reset your practice portfolio to $10,000 cash? Your challenges and XP stay.")) setPortfolio(() => emptyPortfolio());
              }}
            >
              Reset portfolio
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
