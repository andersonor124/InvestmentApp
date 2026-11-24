import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PROFILE_WEIGHTS } from "../../../shared/constants";
import type { ScoredStock, StockContext, StockMetrics } from "../../../shared/types";
import { Button, Card, DataBanner, ErrorBox, Loading, Pill } from "../components/ui";
import { ALLOCATIONS, SECTOR_ETF_ALTERNATIVES } from "../content/canada";
import { api } from "../lib/api";
import { bigMoney, changeClass, money, num, pct } from "../lib/format";
import { useStore } from "../store";
import { DisclaimerGate, FactorBars, LabelPill, ScoreRing } from "./common";
import { useWatchToggle } from "./watch";

type Fmt = "x" | "%" | "$";
const METRICS: { key: keyof StockMetrics; label: string; fmt: Fmt; better: "low" | "high" | null }[] = [
  { key: "pe", label: "P/E ratio", fmt: "x", better: "low" },
  { key: "ps", label: "P/S ratio", fmt: "x", better: "low" },
  { key: "epsGrowth", label: "EPS growth (1 yr)", fmt: "%", better: "high" },
  { key: "revenueGrowth", label: "Revenue growth (1 yr)", fmt: "%", better: "high" },
  { key: "netMargin", label: "Net margin", fmt: "%", better: "high" },
  { key: "roe", label: "Return on equity", fmt: "%", better: "high" },
  { key: "debtToEquity", label: "Debt / equity", fmt: "x", better: "low" },
  { key: "currentRatio", label: "Current ratio", fmt: "x", better: "high" },
  { key: "dividendYield", label: "Dividend yield", fmt: "%", better: null },
  { key: "beta", label: "Beta", fmt: "x", better: null },
  { key: "week52Return", label: "1-year return", fmt: "%", better: "high" },
];

const fmtVal = (v: number | null, f: Fmt) => (v === null ? "—" : f === "%" ? pct(v, 1) : f === "$" ? money(v) : num(v, 2));

function median(values: number[]) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default function StockDetail() {
  const { symbol = "" } = useParams();
  const { investor, screener } = useStore();
  const [stock, setStock] = useState<ScoredStock | null>(null);
  const [ctx, setCtx] = useState<StockContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isWatched, toggle } = useWatchToggle();

  useEffect(() => {
    setStock(null);
    setCtx(null);
    setError(null);
    api.stock(symbol, investor.risk).then(setStock).catch((e: Error) => setError(e.message));
    api.context(symbol).then(setCtx).catch(() => setCtx(null));
  }, [symbol, investor.risk]);

  const peers = useMemo(() => screener?.stocks.filter((s) => stock && s.sector === stock.sector && s.symbol !== stock.symbol) ?? [], [screener, stock]);

  if (error) return <ErrorBox message={error} />;
  if (!stock) return <Loading label={`Loading ${symbol.toUpperCase()}…`} />;

  const weights = PROFILE_WEIGHTS[investor.risk];
  const etf = stock.sector !== "Index ETF" ? SECTOR_ETF_ALTERNATIVES[stock.sector] : undefined;
  const cap = ALLOCATIONS[investor.risk].singleStockCap;
  const range = stock.week52High && stock.week52Low && stock.price ? (stock.price - stock.week52Low) / (stock.week52High - stock.week52Low) : null;

  return (
    <div className="space-y-6">
      <DisclaimerGate />
      <Link to="/adult/picks" className="text-sm font-semibold text-accent">
        ← All picks
      </Link>
      <DataBanner />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted">
              {stock.sector}
              {stock.country === "CA" && " · 🍁 Canadian company (US listing shown)"}
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {stock.name} <span className="text-muted">{stock.symbol}</span>
            </h1>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-bold tabular-nums">{money(stock.price)}</span>
              <span className={`font-semibold ${changeClass(stock.changePct)}`}>{pct(stock.changePct, 2, true)} today</span>
              <span className="text-xs text-muted">USD</span>
            </div>
            <div className="mt-1 text-sm text-muted">Market cap {bigMoney(stock.marketCap)}</div>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing score={stock.score} size={84} />
            <div className="space-y-2">
              <LabelPill label={stock.label} downgraded={stock.downgraded} />
              <Button variant="secondary" onClick={() => toggle(stock)}>
                {isWatched(stock.symbol) ? "★ Watching" : "☆ Add to watchlist"}
              </Button>
            </div>
          </div>
        </div>
        {range !== null && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted">
              <span>52-wk low {money(stock.week52Low)}</span>
              <span>52-wk high {money(stock.week52High)}</span>
            </div>
            <div className="relative mt-1 h-2 rounded-full bg-surface-2">
              <div className="absolute -top-1 h-4 w-1.5 -translate-x-1/2 rounded bg-accent" style={{ left: `${Math.max(0, Math.min(1, range)) * 100}%` }} aria-label="Current price within the 52-week range" />
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Score breakdown</h2>
          <p className="mb-4 text-sm text-muted">Each factor is a 0–100 rank against the other stocks (and sector peers). Weights follow your {investor.risk} profile.</p>
          <FactorBars stock={stock} weights={weights} />
          {stock.missing.length > 0 && <p className="mt-4 text-xs text-muted">Missing data (scored neutral): {stock.missing.join(", ")}.</p>}
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Why it scored this way</h2>
          {stock.reasons.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {stock.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span aria-hidden>•</span>
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nothing stands out strongly either way. The numbers are close to its peers.</p>
          )}
          {stock.flags.length > 0 && (
            <div className="mt-5 rounded-xl border border-warn/40 bg-warn-soft p-4">
              <h3 className="font-semibold text-warn">⚠ Red flags to check</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {stock.flags.map((f) => (
                  <li key={f.id}>
                    <Pill tone={f.severity === "high" ? "loss" : "warn"}>{f.severity === "high" ? "High" : "Medium"}</Pill> <strong>{f.title}</strong>: {f.detail}
                  </li>
                ))}
              </ul>
              {stock.downgraded && <p className="mt-2 text-xs">Because of these flags, the rating was lowered from Consider Buying to Watch.</p>}
            </div>
          )}
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <h2 className="text-lg font-bold">Key numbers vs {stock.sector} peers</h2>
        <table className="mt-3 w-full min-w-[30rem] text-sm">
          <thead className="text-left text-xs uppercase text-muted">
            <tr>
              <th className="py-2">Metric</th>
              <th className="text-right">{stock.symbol}</th>
              <th className="text-right">Sector median</th>
              <th className="text-right">Comparison</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {METRICS.map((m) => {
              const v = stock[m.key] as number | null;
              const med = median(peers.map((p) => p[m.key] as number | null).filter((x): x is number => x !== null));
              let cmp: { text: string; cls: string } = { text: "", cls: "text-muted" };
              if (v !== null && med !== null && m.better) {
                const better = m.better === "low" ? v < med : v > med;
                cmp = { text: better ? "Better" : "Worse", cls: better ? "text-gain" : "text-loss" };
              }
              return (
                <tr key={m.key} className="border-t border-line">
                  <td className="py-2">{m.label}</td>
                  <td className="text-right font-semibold">{fmtVal(v, m.fmt)}</td>
                  <td className="text-right text-muted">{fmtVal(med, m.fmt)}</td>
                  <td className={`text-right text-xs font-semibold ${cmp.cls}`}>{cmp.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">Sector median uses the {peers.length} other {stock.sector} stocks in this app's list.</p>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <WallStreet ctx={ctx} />
        <div className="space-y-6">
          {etf && (
            <Card>
              <h2 className="text-lg font-bold">🧺 Lower-risk alternative</h2>
              <p className="mt-1 text-sm text-muted">Like the {stock.sector.toLowerCase()} sector but don't want single-company risk? A sector ETF spreads your money across many companies.</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <strong>{etf.us}</strong>: {etf.usName} (US-listed, USD)
                </li>
                {etf.ca && (
                  <li>
                    <strong>{etf.ca}</strong>: {etf.caName} (TSX-listed, CAD) 🍁
                  </li>
                )}
                <li className="text-muted">Or skip sector bets entirely: an all-in-one ETF such as XEQT / VEQT owns thousands of companies worldwide.</li>
              </ul>
            </Card>
          )}
          <Card>
            <h2 className="text-lg font-bold">📏 Position sizing</h2>
            <p className="mt-1 text-sm">
              With a <strong>{investor.risk}</strong> profile, a common guideline is to keep any single stock under <strong>{cap}%</strong> of your portfolio. On a $20,000 portfolio that's at most{" "}
              {money((20000 * cap) / 100, 0)}
              {stock.price ? ` (≈ ${Math.floor((20000 * cap) / 100 / stock.price)} shares)` : ""}.
            </p>
            {stock.country === "US" && stock.dividendYield !== null && stock.dividendYield > 1 && (
              <p className="mt-2 text-sm text-muted">🍁 Tip: US dividends lose 15% to US withholding tax in a TFSA but not in an RRSP.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function WallStreet({ ctx }: { ctx: StockContext | null }) {
  if (!ctx) return <Card><Loading label="Loading analyst & insider data…" /></Card>;
  if (!ctx.available)
    return (
      <Card>
        <h2 className="text-lg font-bold">🏛️ Wall Street context</h2>
        <p className="mt-2 text-sm text-muted">{ctx.message}</p>
      </Card>
    );
  const rec = ctx.recommendations[0];
  const total = rec ? rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell : 0;
  const insiderNet = ctx.insiders.reduce((s, t) => s + t.change, 0);
  const segs = rec
    ? [
        { label: "Strong buy", n: rec.strongBuy, color: "var(--gain)" },
        { label: "Buy", n: rec.buy, color: "var(--series-3)" },
        { label: "Hold", n: rec.hold, color: "var(--muted)" },
        { label: "Sell", n: rec.sell, color: "var(--series-2)" },
        { label: "Strong sell", n: rec.strongSell, color: "var(--loss)" },
      ]
    : [];

  return (
    <Card>
      <h2 className="text-lg font-bold">🏛️ Wall Street context</h2>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Analyst ratings {rec && <span className="font-normal text-muted">({rec.period})</span>}</h3>
        {rec && total > 0 ? (
          <>
            <div className="mt-2 flex h-3 gap-0.5 overflow-hidden rounded-full">
              {segs.filter((s) => s.n > 0).map((s) => (
                <div key={s.label} style={{ width: `${(s.n / total) * 100}%`, background: s.color }} title={`${s.label}: ${s.n}`} />
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted">
              {segs.map((s) => (
                <span key={s.label}>
                  {s.label} <strong className="text-ink">{s.n}</strong>
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">Analysts are often overly optimistic. Treat this as one input, not a verdict. Price targets need a premium data plan.</p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">No analyst coverage found.</p>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold">Next earnings report</h3>
        {ctx.earnings[0] ? (
          <p className="mt-1 text-sm">
            {ctx.earnings[0].date} (Q{ctx.earnings[0].quarter} {ctx.earnings[0].year})
            {ctx.earnings[0].epsEstimate !== null && <> · EPS estimate {money(ctx.earnings[0].epsEstimate)}</>}
            <span className="block text-xs text-muted">Prices often move sharply around earnings.</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">None scheduled in the next 90 days.</p>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold">Insider trading (last 6 months)</h3>
        {ctx.insiders.length ? (
          <p className="mt-1 text-sm">
            Net {insiderNet >= 0 ? <span className="text-gain">buying</span> : <span className="text-loss">selling</span>} of {Math.abs(insiderNet).toLocaleString()} shares across {ctx.insiders.length} filings.
            <span className="block text-xs text-muted">Insiders sell for many reasons (taxes, diversifying); clustered buying is the more meaningful signal.</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">No recent insider filings.</p>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold">Recent news</h3>
        {ctx.news.length ? (
          <ul className="mt-1 space-y-2">
            {ctx.news.map((n) => (
              <li key={n.url} className="text-sm">
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent hover:underline">
                  {n.headline}
                </a>
                <span className="block text-xs text-muted">
                  {n.source} · {new Date(n.datetime * 1000).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">No news in the last 30 days.</p>
        )}
      </div>
    </Card>
  );
}
