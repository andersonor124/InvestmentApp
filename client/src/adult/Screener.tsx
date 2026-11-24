import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LABEL_THRESHOLDS } from "../../../shared/constants";
import type { PickLabel, ScoredStock } from "../../../shared/types";
import { Card, DataBanner, ErrorBox, Loading, PageHeader, Pill } from "../components/ui";
import { changeClass, num, pct } from "../lib/format";
import { useStore } from "../store";
import { DisclaimerGate, FACTOR_INFO, LabelPill } from "./common";
import { useWatchToggle } from "./watch";

type SortKey = "score" | "pe" | "epsGrowth" | "dividendYield" | "week52Return" | "symbol";
const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "symbol", label: "Stock", numeric: false },
  { key: "score", label: "Score", numeric: true },
  { key: "pe", label: "P/E", numeric: true },
  { key: "epsGrowth", label: "EPS growth", numeric: true },
  { key: "dividendYield", label: "Yield", numeric: true },
  { key: "week52Return", label: "1-yr return", numeric: true },
];

export default function Screener() {
  const { screener, screenerError, refreshScreener, investor } = useStore();
  const [label, setLabel] = useState<PickLabel | "All">("All");
  const [sector, setSector] = useState("All");
  const [canadaOnly, setCanadaOnly] = useState(false);
  const [hideFlagged, setHideFlagged] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });
  const navigate = useNavigate();
  const { isWatched, toggle } = useWatchToggle();

  const sectors = useMemo(() => ["All", ...new Set(screener?.stocks.map((s) => s.sector) ?? [])], [screener]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (screener?.stocks ?? []).filter(
      (s) =>
        (label === "All" || s.label === label) &&
        (sector === "All" || s.sector === sector) &&
        (!canadaOnly || s.country === "CA") &&
        (!hideFlagged || s.flags.length === 0) &&
        (!q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
    );
    const val = (s: ScoredStock) => s[sort.key];
    return [...list].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va === null) return 1;
      if (vb === null) return -1;
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
    });
  }, [screener, label, sector, canadaOnly, hideFlagged, search, sort]);

  function sortBy(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "symbol" || key === "pe" ? 1 : -1 }));
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of screener?.stocks ?? []) c[s.label] = (c[s.label] ?? 0) + 1;
    return c;
  }, [screener]);

  return (
    <div>
      <DisclaimerGate />
      <PageHeader title="Stock picks" subtitle={`${screener?.stocks.length ?? "~60"} large US and Canadian companies, scored 0–100 using your ${investor.risk} profile weights. Prices in USD.`} />
      <DataBanner />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["All", "Consider Buying", "Watch", "Pass for now"] as const).map((l) => (
          <button key={l} onClick={() => setLabel(l)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${label === l ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted hover:text-ink"}`}>
            {l}
            {l !== "All" && counts[l] !== undefined && <span className="ml-1 opacity-75">{counts[l]}</span>}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-40 rounded-xl border border-line bg-surface px-3 py-1.5" aria-label="Search stocks" />
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-xl border border-line bg-surface px-3 py-1.5" aria-label="Sector">
          {sectors.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={canadaOnly} onChange={(e) => setCanadaOnly(e.target.checked)} /> 🍁 Canadian only
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={hideFlagged} onChange={(e) => setHideFlagged(e.target.checked)} /> Hide red-flagged
        </label>
      </div>

      {screenerError && <ErrorBox message={screenerError} onRetry={refreshScreener} />}
      {!screener && !screenerError && <Loading label="Scoring stocks…" />}

      {screener && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase text-muted">
              <tr>
                <th className="w-10" />
                {COLUMNS.map((c) => (
                  <th key={c.key} className={`px-3 py-3 ${c.numeric ? "text-right" : ""}`} aria-sort={sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                    <button onClick={() => sortBy(c.key)} className="font-semibold uppercase hover:text-ink">
                      {c.label} {sort.key === c.key ? (sort.dir === 1 ? "↑" : "↓") : ""}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3">Rating</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.map((s) => (
                <tr key={s.symbol} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2" onClick={() => navigate(`/adult/stock/${s.symbol}`)}>
                  <td className="pl-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(s);
                      }}
                      className={`text-lg ${isWatched(s.symbol) ? "text-warn" : "text-muted hover:text-warn"}`}
                      aria-label={isWatched(s.symbol) ? `Remove ${s.symbol} from watchlist` : `Add ${s.symbol} to watchlist`}
                      title="Watchlist"
                    >
                      {isWatched(s.symbol) ? "★" : "☆"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link to={`/adult/stock/${s.symbol}`} className="font-bold" onClick={(e) => e.stopPropagation()}>
                      {s.symbol}
                    </Link>
                    {s.country === "CA" && <span title="Canadian company"> 🍁</span>}
                    <div className="max-w-[12rem] truncate text-xs text-muted">
                      {s.name} · {s.sector}
                    </div>
                  </td>
                  <td className="px-3 text-right text-base font-bold">{s.score}</td>
                  <td className="px-3 text-right">{s.pe === null ? <span className="text-muted">n/a</span> : num(s.pe, 1)}</td>
                  <td className={`px-3 text-right ${changeClass(s.epsGrowth)}`}>{pct(s.epsGrowth, 0, true)}</td>
                  <td className="px-3 text-right">{pct(s.dividendYield, 1)}</td>
                  <td className={`px-3 text-right ${changeClass(s.week52Return)}`}>{pct(s.week52Return, 0, true)}</td>
                  <td className="px-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <LabelPill label={s.label} downgraded={s.downgraded} />
                      {s.flags.length > 0 && <Pill tone="warn">⚠ {s.flags.length}</Pill>}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted">
                    No stocks match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {screener && (
        <details className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <summary className="cursor-pointer font-semibold">How the score works (methodology)</summary>
          <div className="mt-3 space-y-3 text-sm">
            <p>Each stock gets five factor scores from 0 to 100, based on how it ranks against the other stocks here (percentiles). For value, growth, quality and health, half the score compares it with its own sector and half with the whole list, so a bank isn't judged against a software company.</p>
            <ul className="space-y-1">
              {(Object.keys(FACTOR_INFO) as (keyof typeof FACTOR_INFO)[]).map((f) => (
                <li key={f}>
                  <strong>
                    {FACTOR_INFO[f].label} ({Math.round(screener.weights[f] * 100)}%):
                  </strong>{" "}
                  {FACTOR_INFO[f].text}
                </li>
              ))}
            </ul>
            <p>
              The overall score is the weighted average, using your <strong>{investor.risk}</strong> profile's weights. <strong>Consider Buying</strong> ≥ {LABEL_THRESHOLDS.considerBuying}, <strong>Watch</strong> {LABEL_THRESHOLDS.watch}–{LABEL_THRESHOLDS.considerBuying - 1}, <strong>Pass for now</strong> below {LABEL_THRESHOLDS.watch}.
              A Consider Buying stock with a high-severity red flag or 2+ flags is lowered to Watch (marked ⚑).
            </p>
            <p className="text-muted">
              Missing data gets a neutral 50 and is listed on the stock's page. Companies with losses score 0 on P/E. The model is deliberately simple and backward-looking: it ignores news, competition, management, and macro risk.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
