import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MarketResponse } from "../../../shared/types";
import { Button, Card, DataBanner, ErrorBox, Loading, PageHeader } from "../components/ui";
import { SECTOR_ETF_ALTERNATIVES } from "../content/canada";
import { api } from "../lib/api";
import { changeClass, money, pct } from "../lib/format";
import { useStore } from "../store";

/** Diverging tile colour: loss hue ← neutral → gain hue, saturating at ±3%. */
function heat(change: number | null) {
  if (change === null) return "var(--surface-2)";
  const strength = Math.min(Math.abs(change) / 3, 1) * 55;
  const hue = change >= 0 ? "var(--gain)" : "var(--loss)";
  return `color-mix(in oklab, ${hue} ${strength}%, var(--surface-2))`;
}

export default function MarketDashboard() {
  const { screener } = useStore();
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .market()
      .then(setMarket)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const sectorScores = useMemo(() => {
    const by: Record<string, { total: number; n: number; buys: number }> = {};
    for (const s of screener?.stocks ?? []) {
      const e = (by[s.sector] ??= { total: 0, n: 0, buys: 0 });
      e.total += s.score;
      e.n++;
      if (s.label === "Consider Buying") e.buys++;
    }
    return Object.entries(by)
      .map(([sector, v]) => ({ sector, avg: Math.round(v.total / v.n), n: v.n, buys: v.buys }))
      .sort((a, b) => b.avg - a.avg);
  }, [screener]);

  const sortedSectors = [...(market?.sectors ?? [])].sort((a, b) => (b.changePct ?? -99) - (a.changePct ?? -99));

  return (
    <div className="space-y-6">
      <PageHeader title="Market dashboard" subtitle="Where the market is today, which sectors are leading, and where the scoring model sees the most opportunity.">
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </Button>
      </PageHeader>
      <DataBanner />
      {error && <ErrorBox message={error} onRetry={refresh} />}
      {!market && !error && <Loading />}

      {market && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {market.indexes.map((i) => (
              <Card key={i.symbol} className="p-4">
                <div className="text-sm text-muted">{i.name}</div>
                <div className="text-xl font-bold tabular-nums">{money(i.price)}</div>
                <div className={`text-sm font-semibold ${changeClass(i.changePct)}`}>
                  {(i.changePct ?? 0) >= 0 ? "▲" : "▼"} {pct(i.changePct, 2, true)}
                </div>
                <div className="text-xs text-muted">tracked via {i.symbol}</div>
              </Card>
            ))}
          </div>

          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">Sector heatmap (today)</h2>
              <span className="text-xs text-muted">
                Updated {new Date(market.asOf).toLocaleTimeString()} · {market.source === "live" ? "live (≈15-min delayed)" : "sample data"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {sortedSectors.map((s) => (
                <div key={s.symbol} className="rounded-xl p-3" style={{ background: heat(s.changePct) }} title={`${s.name}: ${pct(s.changePct, 2, true)}`}>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-lg font-bold tabular-nums">
                    {(s.changePct ?? 0) >= 0 ? "▲" : "▼"} {pct(s.changePct, 2, true)}
                  </div>
                  <div className="text-xs text-muted">
                    {s.symbol}
                    {s.sector !== "Index ETF" && SECTOR_ETF_ALTERNATIVES[s.sector]?.ca && ` · 🍁 ${SECTOR_ETF_ALTERNATIVES[s.sector].ca}`}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <span>−3%</span>
              <div className="h-2 w-40 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in oklab, var(--loss) 55%, var(--surface-2)), var(--surface-2), color-mix(in oklab, var(--gain) 55%, var(--surface-2)))" }} />
              <span>+3%</span>
            </div>
          </Card>
        </>
      )}

      {sectorScores.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold">Where the model sees opportunity</h2>
          <p className="text-sm text-muted">Average score of the stocks in each sector (your profile's weights).</p>
          <div className="mt-4 space-y-2">
            {sectorScores.map((s) => (
              <div key={s.sector} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr_8rem]">
                <span className="truncate">{s.sector}</span>
                <div className="h-3 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${s.avg}%` }} />
                </div>
                <span className="text-right tabular-nums">
                  <strong>{s.avg}</strong> <span className="text-xs text-muted">{s.buys ? `· ${s.buys} buy` : `· ${s.n} stocks`}</span>
                </span>
              </div>
            ))}
          </div>
          <Link to="/adult/picks" className="mt-4 inline-block text-sm font-semibold text-accent">
            Explore the picks →
          </Link>
        </Card>
      )}
    </div>
  );
}
