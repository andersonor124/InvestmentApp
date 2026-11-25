import type {
  FactorKey,
  PickLabel,
  ScoredStock,
  StockMetrics,
  Weights,
} from "../../shared/types.js";
import { LABEL_THRESHOLDS, PROFILE_WEIGHTS } from "../../shared/constants.js";
import { redFlags } from "./redflags.js";


export { LABEL_THRESHOLDS, PROFILE_WEIGHTS };

type Getter = (s: StockMetrics) => number | null;
interface MetricDef {
  key: string;
  label: string;
  get: Getter;
  higherIsBetter: boolean;
  sectorRelative: boolean;
}

const distanceFromHigh: Getter = (s) =>
  s.price !== null && s.week52High ? s.price / s.week52High : null;

export const FACTORS: Record<FactorKey, MetricDef[]> = {
  value: [
    { key: "pe", label: "P/E ratio", get: (s) => s.pe, higherIsBetter: false, sectorRelative: true },
    { key: "ps", label: "P/S ratio", get: (s) => s.ps, higherIsBetter: false, sectorRelative: true },
  ],
  growth: [
    { key: "epsGrowth", label: "EPS growth", get: (s) => s.epsGrowth, higherIsBetter: true, sectorRelative: true },
    { key: "revenueGrowth", label: "Revenue growth", get: (s) => s.revenueGrowth, higherIsBetter: true, sectorRelative: true },
  ],
  quality: [
    { key: "roe", label: "Return on equity", get: (s) => s.roe, higherIsBetter: true, sectorRelative: true },
    { key: "netMargin", label: "Net margin", get: (s) => s.netMargin, higherIsBetter: true, sectorRelative: true },
  ],
  health: [
    { key: "debtToEquity", label: "Debt/equity", get: (s) => s.debtToEquity, higherIsBetter: false, sectorRelative: true },
    { key: "currentRatio", label: "Current ratio", get: (s) => s.currentRatio, higherIsBetter: true, sectorRelative: true },
  ],
  momentum: [
    { key: "week52Return", label: "1-year return", get: (s) => s.week52Return, higherIsBetter: true, sectorRelative: false },
    { key: "nearHigh", label: "Distance from 52-week high", get: distanceFromHigh, higherIsBetter: true, sectorRelative: false },
  ],
};

/** Fraction (0..1) of `values` that `v` beats. Ties count half. */
export function percentile(v: number, values: number[], higherIsBetter = true): number {
  if (values.length <= 1) return 0.5;
  let below = 0;
  let equal = 0;
  for (const x of values) {
    if (x < v) below++;
    else if (x === v) equal++;
  }
  const rank = (below + 0.5 * (equal - 1)) / (values.length - 1);
  return higherIsBetter ? rank : 1 - rank;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function labelFor(score: number): PickLabel {
  if (score >= LABEL_THRESHOLDS.considerBuying) return "Consider Buying";
  if (score >= LABEL_THRESHOLDS.watch) return "Watch";
  return "Pass for now";
}

const present = (vals: (number | null)[]) => vals.filter((v): v is number => v !== null);

export function sectorMedians(stocks: StockMetrics[]) {
  const out: Record<string, Record<string, number | null>> = {};
  for (const sector of new Set(stocks.map((s) => s.sector))) {
    const peers = stocks.filter((s) => s.sector === sector);
    out[sector] = {};
    for (const defs of Object.values(FACTORS)) {
      for (const d of defs) out[sector][d.key] = median(present(peers.map(d.get)));
    }
  }
  return out;
}

/** Score every stock 0-100 on five factors, then combine with the profile's weights. */
export function scoreUniverse(stocks: StockMetrics[], weights: Weights): ScoredStock[] {
  const medians = sectorMedians(stocks);
  const scored = stocks.map((s): ScoredStock => {
    const missing: string[] = [];
    const factors = {} as Record<FactorKey, number>;
    for (const [factor, defs] of Object.entries(FACTORS) as [FactorKey, MetricDef[]][]) {
      const pcts = defs.map((d) => {
        const v = d.get(s);
        if (v === null) {
          // No earnings means no P/E: that's a real negative, not missing data.
          if (d.key === "pe" && s.netMargin !== null && s.netMargin < 0) return 0;
          // Banks don't report comparable debt/current ratios; stay neutral without flagging.
          if (factor === "health" && s.sector === "Financials") return 0.5;
          missing.push(d.label);
          return 0.5;
        }
        const all = present(stocks.map(d.get));
        const universePct = percentile(v, all, d.higherIsBetter);
        if (!d.sectorRelative) return universePct;
        const peers = present(stocks.filter((p) => p.sector === s.sector).map(d.get));
        if (peers.length < 3) return universePct;
        return 0.5 * percentile(v, peers, d.higherIsBetter) + 0.5 * universePct;
      });
      factors[factor] = Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100);
    }
    const score = Math.round(
      (Object.keys(weights) as FactorKey[]).reduce((sum, f) => sum + weights[f] * factors[f], 0),
    );
    const flags = redFlags(s);
    let label = labelFor(score);
    let downgraded = false;
    if (label === "Consider Buying" && (flags.some((f) => f.severity === "high") || flags.length >= 2)) {
      label = "Watch";
      downgraded = true;
    }
    return {
      ...s,
      score,
      factors,
      label,
      downgraded,
      flags,
      missing,
      reasons: reasonsFor(s, medians[s.sector] ?? {}),
    };
  });
  return scored.sort((a, b) => b.score - a.score);
}

const f0 = (n: number) => n.toFixed(0);
const f1 = (n: number) => n.toFixed(1);

/** Plain-English "why" bullets: positives first, then concerns. */
export function reasonsFor(s: StockMetrics, med: Record<string, number | null>): string[] {
  const good: string[] = [];
  const bad: string[] = [];
  const mPe = med.pe;
  if (s.pe !== null && mPe) {
    if (s.pe < mPe * 0.85) good.push(`P/E of ${f0(s.pe)} vs sector median ${f0(mPe)}: cheaper than peers for each $1 of profit.`);
    else if (s.pe > mPe * 1.3) bad.push(`P/E of ${f0(s.pe)} vs sector median ${f0(mPe)}: investors are paying up for future growth.`);
  }
  if (s.epsGrowth !== null) {
    if (s.epsGrowth >= 15) good.push(`Earnings per share grew ${f0(s.epsGrowth)}% over the last year.`);
    else if (s.epsGrowth < 0) bad.push(`Earnings per share fell ${f0(Math.abs(s.epsGrowth))}% over the last year.`);
  }
  if (s.revenueGrowth !== null) {
    if (s.revenueGrowth >= 10) good.push(`Sales grew ${f0(s.revenueGrowth)}%: customers are buying more.`);
    else if (s.revenueGrowth < 0) bad.push(`Sales shrank ${f0(Math.abs(s.revenueGrowth))}%.`);
  }
  const mMargin = med.netMargin;
  if (s.netMargin !== null && mMargin !== null && mMargin !== undefined) {
    if (s.netMargin > mMargin * 1.25 && s.netMargin > 0) good.push(`Keeps ${f0(s.netMargin)}¢ of profit per $1 of sales (sector median ${f0(mMargin)}¢).`);
  }
  if (s.roe !== null && s.roe >= 20) good.push(`Return on equity of ${f0(s.roe)}%: management turns shareholder money into profit efficiently.`);
  if (s.sector !== "Financials" && s.debtToEquity !== null && s.debtToEquity < 0.5) good.push(`Low debt (debt/equity ${f1(s.debtToEquity)}).`);
  if (s.week52Return !== null) {
    if (s.week52Return >= 20) good.push(`Up ${f0(s.week52Return)}% over the past year (strong momentum).`);
    else if (s.week52Return <= -20) bad.push(`Down ${f0(Math.abs(s.week52Return))}% over the past year.`);
  }
  if (s.dividendYield !== null && s.dividendYield >= 3) good.push(`Pays a ${f1(s.dividendYield)}% dividend yield.`);
  return [...good.slice(0, 4), ...bad.slice(0, 3)];
}
