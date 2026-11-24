import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { MarketResponse } from "../../../shared/types";
import { Card, DataBanner, ErrorBox, Loading, PageHeader, Pill } from "../components/ui";
import { ALLOCATIONS } from "../content/canada";
import { api } from "../lib/api";
import { changeClass, money, pct } from "../lib/format";
import { useStore } from "../store";
import { DisclaimerGate, LabelPill, ScoreRing } from "./common";

export default function AdultHome() {
  const { screener, screenerError, refreshScreener, investor, watchlist } = useStore();
  const [market, setMarket] = useState<MarketResponse | null>(null);
  useEffect(() => {
    api.market().then(setMarket).catch(() => setMarket(null));
  }, []);

  const buys = screener?.stocks.filter((s) => s.label === "Consider Buying") ?? [];
  const watch = screener?.stocks.filter((s) => s.label === "Watch").slice(0, 6) ?? [];
  const alloc = ALLOCATIONS[investor.risk];

  return (
    <div className="space-y-6">
      <DisclaimerGate />
      <PageHeader title="Market overview" subtitle="Stocks worth a closer look today, ranked by a transparent score. Click any stock to see exactly why it scored the way it did." />
      <DataBanner />

      {market && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {market.indexes.map((i) => (
            <Card key={i.symbol} className="p-4">
              <div className="text-sm text-muted">{i.name}</div>
              <div className="text-xl font-bold tabular-nums">{money(i.price)}</div>
              <div className={`text-sm font-semibold ${changeClass(i.changePct)}`}>{pct(i.changePct, 2, true)}</div>
              <div className="text-xs text-muted">via {i.symbol} ETF</div>
            </Card>
          ))}
        </div>
      )}

      {!investor.completed && (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-accent-soft">
          <div>
            <div className="font-semibold">🎯 Personalize your picks</div>
            <p className="text-sm text-muted">Take the 2-minute investor profile quiz to tune the score weights to your risk tolerance and get a suggested asset mix.</p>
          </div>
          <Link to="/adult/profile" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
            Take the quiz
          </Link>
        </Card>
      )}

      {screenerError && <ErrorBox message={screenerError} onRetry={refreshScreener} />}
      {!screener && !screenerError && <Loading label="Scoring stocks…" />}

      {screener && (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">▲ Consider buying ({buys.length})</h2>
                <Link to="/adult/picks" className="text-sm font-semibold text-accent">
                  All {screener.stocks.length} stocks →
                </Link>
              </div>
              {buys.length === 0 ? (
                <Card className="text-sm text-muted">Nothing clears the bar right now. That's a valid answer: there's no rule that says you must buy something.</Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {buys.map((s) => (
                    <Link key={s.symbol} to={`/adult/stock/${s.symbol}`} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                      <ScoreRing score={s.score} />
                      <div className="min-w-0">
                        <div className="font-bold">
                          {s.symbol} <span className="font-normal text-muted">{s.name}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <LabelPill label={s.label} />
                          {s.flags.length > 0 && <Pill tone="warn">⚠ {s.flags.length} flag</Pill>}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted">{s.reasons[0]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="mb-3 text-lg font-bold">◆ On the watchlist radar</h2>
              <Card className="p-0">
                <ul className="divide-y divide-line">
                  {watch.map((s) => (
                    <li key={s.symbol}>
                      <Link to={`/adult/stock/${s.symbol}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2">
                        <span className="min-w-0 truncate">
                          <strong>{s.symbol}</strong> <span className="text-sm text-muted">{s.name}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className={`text-sm tabular-nums ${changeClass(s.changePct)}`}>{pct(s.changePct, 2, true)}</span>
                          <span className="w-8 text-right font-bold tabular-nums">{s.score}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          </div>
          <aside className="space-y-4">
            <Card>
              <div className="text-sm text-muted">Your profile</div>
              <div className="text-lg font-bold capitalize">{investor.risk}</div>
              <p className="mt-1 text-sm text-muted">
                Suggested mix: {alloc.stocks}% stocks / {alloc.bonds}% bonds / {alloc.cash}% cash, e.g. {alloc.example}. Keep individual stocks to ≤{alloc.singleStockCap}% each.
              </p>
              <Link to="/adult/profile" className="mt-2 inline-block text-sm font-semibold text-accent">
                {investor.completed ? "Retake quiz" : "Set your profile"} →
              </Link>
            </Card>
            <Card>
              <div className="text-sm text-muted">Watchlist</div>
              <div className="text-lg font-bold">{watchlist.length} stocks</div>
              <Link to="/adult/watchlist" className="mt-1 inline-block text-sm font-semibold text-accent">
                Alerts & diversification →
              </Link>
            </Card>
            <Card>
              <div className="text-sm text-muted">🍁 Investing from Canada?</div>
              <p className="mt-1 text-sm">Where you hold a stock (TFSA, RRSP, FHSA or taxable) can matter as much as which stock you pick.</p>
              <Link to="/adult/canada" className="mt-2 inline-block text-sm font-semibold text-accent">
                Tax & accounts guide →
              </Link>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
