import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MarketQuote } from "../../../shared/types";
import { Card, DataBanner, PageHeader, Pill } from "../components/ui";
import { ALLOCATIONS, SECTOR_ETF_ALTERNATIVES } from "../content/canada";
import { api } from "../lib/api";
import { changeClass, money, num, pct } from "../lib/format";
import { useStore, type WatchItem } from "../store";
import { LabelPill } from "./common";

type AlertState = "buy" | "sell" | null;

export default function Alerts() {
  const { watchlist, setWatchlist, screener, investor, toast } = useStore();
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const symbols = watchlist.map((w) => w.symbol).join(",");

  useEffect(() => {
    if (!symbols) return;
    const load = () =>
      api
        .quotes(symbols.split(","))
        .then((qs) => setQuotes(Object.fromEntries(qs.map((q) => [q.symbol, q]))))
        .catch(() => undefined);
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [symbols]);

  const info = useMemo(() => Object.fromEntries((screener?.stocks ?? []).map((s) => [s.symbol, s])), [screener]);
  const alertFor = (w: WatchItem): AlertState => {
    const p = quotes[w.symbol]?.price;
    if (p == null) return null;
    if (w.buyBelow !== null && p <= w.buyBelow) return "buy";
    if (w.sellAbove !== null && p >= w.sellAbove) return "sell";
    return null;
  };
  const triggered = watchlist.filter((w) => alertFor(w) !== null);

  // Announce triggered alerts once per page visit.
  const [announced, setAnnounced] = useState(false);
  useEffect(() => {
    if (announced || !triggered.length) return;
    setAnnounced(true);
    toast({ emoji: "🔔", title: `${triggered.length} price alert${triggered.length > 1 ? "s" : ""} triggered`, body: triggered.map((t) => t.symbol).join(", ") });
  }, [triggered, announced, toast]);

  function update(symbol: string, patch: Partial<WatchItem>) {
    setWatchlist((list) => list.map((w) => (w.symbol === symbol ? { ...w, ...patch } : w)));
  }
  const parse = (v: string) => (v.trim() === "" || !(Number(v) >= 0) ? null : Number(v));

  return (
    <div className="space-y-6">
      <PageHeader title="Watchlist & alerts" subtitle="Track stocks you're interested in, set target prices, and check whether your holdings are diversified. Everything is saved in this browser only." />
      <DataBanner />

      {triggered.length > 0 && (
        <div className="rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm" role="status">
          🔔 <strong>{triggered.length} alert{triggered.length > 1 ? "s" : ""} triggered:</strong>{" "}
          {triggered.map((w) => `${w.symbol} (${alertFor(w) === "buy" ? "at or below your buy target" : "at or above your sell target"})`).join(" · ")}
        </div>
      )}

      {watchlist.length === 0 ? (
        <Card className="text-center">
          <div className="text-4xl">☆</div>
          <p className="mt-2 font-semibold">Your watchlist is empty</p>
          <p className="text-sm text-muted">
            Tap the ☆ on any stock in{" "}
            <Link to="/adult/picks" className="font-semibold text-accent">
              Stock Picks
            </Link>{" "}
            to start tracking it.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[54rem] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Stock</th>
                <th className="px-2 text-right">Price</th>
                <th className="px-2 text-right">Since added</th>
                <th className="px-2">Rating</th>
                <th className="px-2">Alert: buy ≤</th>
                <th className="px-2">Alert: sell ≥</th>
                <th className="px-2">Shares I own</th>
                <th />
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {watchlist.map((w) => {
                const q = quotes[w.symbol];
                const s = info[w.symbol];
                const since = q?.price != null && w.addedPrice ? ((q.price - w.addedPrice) / w.addedPrice) * 100 : null;
                const a = alertFor(w);
                return (
                  <tr key={w.symbol} className={`border-b border-line last:border-0 ${a ? "bg-accent-soft" : ""}`}>
                    <td className="px-4 py-2.5">
                      <Link to={`/adult/stock/${w.symbol}`} className="font-bold hover:text-accent">
                        {w.symbol}
                      </Link>
                      {a && <span className="ml-1" title="Alert triggered">🔔</span>}
                      <div className="text-xs text-muted">{s?.name ?? ""}</div>
                    </td>
                    <td className="px-2 text-right">
                      {money(q?.price ?? null)}
                      <div className={`text-xs ${changeClass(q?.changePct)}`}>{pct(q?.changePct, 2, true)}</div>
                    </td>
                    <td className={`px-2 text-right ${changeClass(since)}`}>
                      {pct(since, 1, true)}
                      <div className="text-xs text-muted">{w.addedAt}</div>
                    </td>
                    <td className="px-2">{s && <LabelPill label={s.label} downgraded={s.downgraded} />}</td>
                    <td className="px-2">
                      <input type="number" min="0" step="any" defaultValue={w.buyBelow ?? ""} onBlur={(e) => update(w.symbol, { buyBelow: parse(e.target.value) })} placeholder="—" className="w-24 rounded-lg border border-line bg-surface px-2 py-1" aria-label={`Buy alert price for ${w.symbol}`} />
                    </td>
                    <td className="px-2">
                      <input type="number" min="0" step="any" defaultValue={w.sellAbove ?? ""} onBlur={(e) => update(w.symbol, { sellAbove: parse(e.target.value) })} placeholder="—" className="w-24 rounded-lg border border-line bg-surface px-2 py-1" aria-label={`Sell alert price for ${w.symbol}`} />
                    </td>
                    <td className="px-2">
                      <input type="number" min="0" step="any" defaultValue={w.shares ?? ""} onBlur={(e) => update(w.symbol, { shares: parse(e.target.value) })} placeholder="0" className="w-20 rounded-lg border border-line bg-surface px-2 py-1" aria-label={`Shares of ${w.symbol} you own`} />
                    </td>
                    <td className="pr-3 text-right">
                      <button onClick={() => setWatchlist((l) => l.filter((x) => x.symbol !== w.symbol))} className="text-muted hover:text-loss" aria-label={`Remove ${w.symbol}`}>
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-xs text-muted">Alerts are checked while this page is open (prices refresh every minute). They're reminders to research, not instructions to trade.</p>

      <Diversification quotes={quotes} riskCap={ALLOCATIONS[investor.risk].singleStockCap} />
    </div>
  );
}

function Diversification({ quotes, riskCap }: { quotes: Record<string, MarketQuote>; riskCap: number }) {
  const { watchlist, screener } = useStore();
  const info = Object.fromEntries((screener?.stocks ?? []).map((s) => [s.symbol, s]));
  const positions = watchlist
    .filter((w) => (w.shares ?? 0) > 0 && quotes[w.symbol]?.price != null)
    .map((w) => ({ symbol: w.symbol, sector: info[w.symbol]?.sector ?? "Other", country: info[w.symbol]?.country ?? "US", value: (w.shares ?? 0) * (quotes[w.symbol].price as number) }));
  const total = positions.reduce((s, p) => s + p.value, 0);

  if (!positions.length) {
    return (
      <Card>
        <h2 className="text-lg font-bold">🧺 Diversification checker</h2>
        <p className="mt-1 text-sm text-muted">Enter the number of shares you own for each watchlist stock above, and this checks for concentration risks.</p>
      </Card>
    );
  }

  const bySector: Record<string, number> = {};
  for (const p of positions) bySector[p.sector] = (bySector[p.sector] ?? 0) + p.value;
  const sectors = Object.entries(bySector).sort((a, b) => b[1] - a[1]);
  const caShare = positions.filter((p) => p.country === "CA").reduce((s, p) => s + p.value, 0) / total;

  const warnings: string[] = [];
  for (const p of positions) {
    const w = (p.value / total) * 100;
    if (w > riskCap) warnings.push(`${p.symbol} is ${num(w, 0)}% of these holdings, above the ${riskCap}% single-stock guideline for your profile.`);
  }
  for (const [sector, v] of sectors) {
    const w = (v / total) * 100;
    if (w > 40 && positions.length > 1) {
      const etf = sector in SECTOR_ETF_ALTERNATIVES ? SECTOR_ETF_ALTERNATIVES[sector as keyof typeof SECTOR_ETF_ALTERNATIVES] : null;
      warnings.push(`${sector} makes up ${num(w, 0)}%. A single sector downturn would hit hard.${etf ? ` Consider a broad ETF instead of adding more ${sector.toLowerCase()} names.` : ""}`);
    }
  }
  if (sectors.length < 3) warnings.push(`Only ${sectors.length} sector${sectors.length > 1 ? "s" : ""}. Spreading across 5+ sectors (or using an index ETF) lowers risk.`);
  if (positions.length < 10) warnings.push(`${positions.length} stock${positions.length > 1 ? "s" : ""} is a concentrated portfolio. Many investors hold individual stocks alongside a core index fund.`);
  if (caShare > 0.6) warnings.push(`${num(caShare * 100, 0)}% is in Canadian companies. Canada is ~3% of world markets, so a global ETF can reduce home-country bias.`);

  return (
    <Card>
      <h2 className="text-lg font-bold">🧺 Diversification checker</h2>
      <p className="text-sm text-muted">Based on the shares you entered: {money(total, 0)} USD across {positions.length} stocks.</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          {sectors.map(([sector, v]) => {
            const w = v / total;
            return (
              <div key={sector} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-2 text-sm">
                <span className="truncate">{sector}</span>
                <div className="h-2.5 rounded-full bg-surface-2">
                  <div className={`h-full rounded-full ${w > 0.4 ? "bg-warn" : "bg-series-1"}`} style={{ width: `${w * 100}%` }} />
                </div>
                <span className="text-right tabular-nums">{num(w * 100, 0)}%</span>
              </div>
            );
          })}
        </div>
        <div>
          {warnings.length ? (
            <ul className="space-y-2 text-sm">
              {warnings.map((w) => (
                <li key={w} className="flex gap-2">
                  <Pill tone="warn">⚠</Pill>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gain">✓ No concentration issues found. Nicely balanced!</p>
          )}
        </div>
      </div>
    </Card>
  );
}
