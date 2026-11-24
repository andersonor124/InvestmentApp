import type {
  MarketQuote,
  MarketResponse,
  Sector,
  StockContext,
  StockMetrics,
  UniverseEntry,
} from "../../shared/types.js";
import { finnhub, hasKey, HOUR, MINUTE, peekCache } from "./finnhub.js";
import { SNAPSHOT, SNAPSHOT_ETF } from "./snapshot.js";
import { findEntry, INDEX_PROXIES, SECTOR_ETFS, UNIVERSE } from "./universe.js";

const METRIC_TTL = 12 * HOUR;
const QUOTE_TTL = 10 * MINUTE;

interface FinnhubQuote {
  c: number;
  dp: number | null;
}
interface FinnhubMetric {
  metric?: Record<string, number | null | undefined>;
}
interface FinnhubProfile {
  name?: string;
  finnhubIndustry?: string;
  marketCapitalization?: number;
  country?: string;
}

// ---------- Sample-mode simulated prices ----------
// So the practice portfolio still moves without an API key, sample prices take
// a small, deterministic random walk from the snapshot value (one step per day).

function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0..1
}
function hashSymbol(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 100_000;
  return h;
}
const EPOCH = Date.UTC(2025, 0, 1);
export function simulatedPrice(symbol: string, base: number, at = Date.now()): { price: number; changePct: number } {
  const days = Math.max(0, Math.floor((at - EPOCH) / 86_400_000));
  const h = hashSymbol(symbol);
  let level = 0; // log-price offset from base
  let last = 0;
  for (let d = 0; d <= days; d++) {
    const step = (seeded(h + d * 7.31) - 0.5) * 0.035 + 0.0003; // ~±1.75%/day, slight upward drift
    last = step - level * 0.01; // mild mean reversion keeps prices sensible
    level += last;
  }
  return { price: round(base * Math.exp(level), 2), changePct: round(last * 100, 2) };
}

function round(n: number, dp = 2) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

// ---------- Building metrics ----------

function sampleMetrics(entry: UniverseEntry): StockMetrics | null {
  const row = SNAPSHOT[entry.symbol];
  if (!row) return null;
  const [price, , marketCap, pe, ps, epsGrowth, revenueGrowth, roe, netMargin, netMargin5Y, debtToEquity, currentRatio, dividendYield, week52High, week52Low, week52Return, beta, sharesChange] = row;
  const sim = simulatedPrice(entry.symbol, price);
  const ratio = sim.price / price;
  return {
    ...entry,
    price: sim.price,
    changePct: sim.changePct,
    marketCap: round(marketCap * ratio, 0),
    pe: pe === null ? null : round(pe * ratio, 1),
    ps: ps === null ? null : round(ps * ratio, 1),
    epsGrowth,
    revenueGrowth,
    roe,
    netMargin,
    netMargin5Y,
    debtToEquity,
    currentRatio,
    dividendYield: dividendYield === null ? null : round(dividendYield / ratio, 2),
    week52High: Math.max(week52High, sim.price),
    week52Low: Math.min(week52Low, sim.price),
    week52Return,
    beta,
    sharesChange,
    live: false,
  };
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function fromLive(entry: UniverseEntry, quote: FinnhubQuote, m: Record<string, number | null | undefined>, profile?: FinnhubProfile): StockMetrics {
  const price = quote.c ? quote.c : null;
  const sample = SNAPSHOT[entry.symbol];
  return {
    ...entry,
    price,
    changePct: num(quote.dp),
    marketCap: num(m.marketCapitalization) ?? num(profile?.marketCapitalization),
    pe: positiveOrNull(num(m.peTTM) ?? num(m.peBasicExclExtraTTM)),
    ps: positiveOrNull(num(m.psTTM)),
    epsGrowth: num(m.epsGrowthTTMYoy),
    revenueGrowth: num(m.revenueGrowthTTMYoy),
    roe: num(m.roeTTM),
    netMargin: num(m.netProfitMarginTTM),
    netMargin5Y: num(m.netProfitMargin5Y),
    debtToEquity: num(m["totalDebt/totalEquityQuarterly"]),
    currentRatio: num(m.currentRatioQuarterly),
    dividendYield: num(m.currentDividendYieldTTM) ?? num(m.dividendYieldIndicatedAnnual),
    week52High: num(m["52WeekHigh"]),
    week52Low: num(m["52WeekLow"]),
    week52Return: num(m["52WeekPriceReturnDaily"]),
    beta: num(m.beta),
    // Finnhub's free tier has no clean share-count history; reuse the sample estimate when we have one.
    sharesChange: sample ? sample[17] : null,
    live: true,
  };
}
const positiveOrNull = (v: number | null) => (v !== null && v > 0 ? v : null);

async function liveMetrics(entry: UniverseEntry): Promise<StockMetrics> {
  const [quote, metric] = await Promise.all([
    finnhub<FinnhubQuote>("/quote", { symbol: entry.symbol }, QUOTE_TTL),
    finnhub<FinnhubMetric>("/stock/metric", { symbol: entry.symbol, metric: "all" }, METRIC_TTL),
  ]);
  return fromLive(entry, quote, metric.metric ?? {});
}

/** Metrics for one stock without waiting on the rate limiter: live if cached, otherwise sample. */
function cachedOrSample(entry: UniverseEntry): StockMetrics | null {
  if (hasKey()) {
    const q = peekCache<FinnhubQuote>("/quote", { symbol: entry.symbol });
    const m = peekCache<FinnhubMetric>("/stock/metric", { symbol: entry.symbol, metric: "all" });
    if (q && m && q.c) return fromLive(entry, q, m.metric ?? {});
  }
  return sampleMetrics(entry);
}

// ---------- Background warmer (live mode) ----------
// A full live screen needs ~2 calls per stock. Rather than make the first
// visitor wait ~2 minutes, we serve sample data immediately and fill in live
// data in the background, refreshing it periodically.

let warming = false;
export async function warmUniverse(): Promise<void> {
  if (!hasKey() || warming) return;
  warming = true;
  try {
    for (const entry of UNIVERSE) {
      try {
        await liveMetrics(entry);
      } catch (err) {
        console.warn(`[warm] ${entry.symbol}: ${(err as Error).message}`);
      }
    }
  } finally {
    warming = false;
  }
}

export function warmedCount(): number {
  if (!hasKey()) return 0;
  return UNIVERSE.filter(
    (e) => peekCache("/quote", { symbol: e.symbol }) && peekCache("/stock/metric", { symbol: e.symbol, metric: "all" }),
  ).length;
}

export function universeMetrics(): StockMetrics[] {
  return UNIVERSE.map(cachedOrSample).filter((m): m is StockMetrics => m !== null);
}

// ---------- Single stock (any ticker, for Company Checkup / detail) ----------

const INDUSTRY_TO_SECTOR: [RegExp, Sector][] = [
  [/bank|insurance|financial|capital markets/i, "Financials"],
  [/pharma|biotech|health|medical|life sciences/i, "Health Care"],
  [/oil|gas|energy|coal/i, "Energy"],
  [/utilit/i, "Utilities"],
  [/real estate|reit/i, "Real Estate"],
  [/media|telecom|communication|entertainment/i, "Communication"],
  [/semiconductor|software|technology|it services|electronic/i, "Technology"],
  [/retail|auto|hotel|restaurant|leisure|textile|apparel/i, "Consumer Discretionary"],
  [/beverage|food|tobacco|household|consumer products/i, "Consumer Staples"],
  [/chemical|metal|mining|material|paper|packag/i, "Materials"],
];

export async function stockMetrics(symbolRaw: string): Promise<StockMetrics | null> {
  const symbol = symbolRaw.toUpperCase();
  if (!/^[A-Z.]{1,6}$/.test(symbol)) return null;
  const entry = findEntry(symbol);
  if (!hasKey()) return entry ? sampleMetrics(entry) : null;
  try {
    if (entry && !entry.etf) return await liveMetrics(entry);
    const [quote, metric, profile] = await Promise.all([
      finnhub<FinnhubQuote>("/quote", { symbol }, QUOTE_TTL),
      finnhub<FinnhubMetric>("/stock/metric", { symbol, metric: "all" }, METRIC_TTL),
      finnhub<FinnhubProfile>("/stock/profile2", { symbol }, 24 * HOUR),
    ]);
    if (!quote.c) return null;
    const sector = entry?.sector ?? INDUSTRY_TO_SECTOR.find(([re]) => re.test(profile.finnhubIndustry ?? ""))?.[1] ?? "Industrials";
    const base: UniverseEntry = entry ?? {
      symbol,
      name: profile.name || symbol,
      sector,
      country: profile.country === "CA" ? "CA" : "US",
    };
    return fromLive(base, quote, metric.metric ?? {}, profile);
  } catch (err) {
    console.warn(`[stock] ${symbol}: ${(err as Error).message}`);
    return entry ? sampleMetrics(entry) : null;
  }
}

// ---------- Quotes ----------

export async function quote(symbolRaw: string): Promise<MarketQuote | null> {
  const symbol = symbolRaw.toUpperCase();
  if (!/^[A-Z.]{1,6}$/.test(symbol)) return null;
  const name = findEntry(symbol)?.name ?? INDEX_PROXIES.find((i) => i.symbol === symbol)?.name ?? symbol;
  if (hasKey()) {
    try {
      const q = await finnhub<FinnhubQuote>("/quote", { symbol }, QUOTE_TTL);
      if (q.c) return { symbol, name, price: q.c, changePct: num(q.dp) };
    } catch (err) {
      console.warn(`[quote] ${symbol}: ${(err as Error).message}`);
    }
  }
  const row = SNAPSHOT[symbol];
  const etf = SNAPSHOT_ETF[symbol];
  const base = row ? row[0] : etf ? etf[0] : null;
  if (base === null) return null;
  const sim = simulatedPrice(symbol, base);
  return { symbol, name, price: sim.price, changePct: sim.changePct };
}

export async function market(): Promise<MarketResponse> {
  const indexes = await Promise.all(
    INDEX_PROXIES.map(async (i) => ({ ...(await quote(i.symbol))!, name: i.name })),
  );
  const sectors = await Promise.all(
    SECTOR_ETFS.map(async (s) => ({ ...(await quote(s.symbol))!, name: s.name, sector: s.sector })),
  );
  return { indexes, sectors, source: hasKey() ? "live" : "sample", asOf: new Date().toISOString() };
}

// ---------- Wall Street context (live only) ----------

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function stockContext(symbolRaw: string): Promise<StockContext> {
  const symbol = symbolRaw.toUpperCase();
  const empty: StockContext = { available: false, recommendations: [], earnings: [], insiders: [], news: [] };
  if (!hasKey()) {
    return { ...empty, message: "Analyst ratings, earnings dates, insider trades and news need a Finnhub API key." };
  }
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);
  const in90 = new Date(now.getTime() + 90 * 86_400_000);
  const ttl = 6 * HOUR;
  const settle = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

  const [recs, earnings, insiders, news] = await Promise.all([
    settle(finnhub<StockContext["recommendations"]>("/stock/recommendation", { symbol }, ttl), []),
    settle(
      finnhub<{ earningsCalendar?: { date: string; epsEstimate: number | null; quarter: number; year: number }[] }>(
        "/calendar/earnings",
        { symbol, from: isoDay(now), to: isoDay(in90) },
        ttl,
      ),
      {},
    ),
    settle(
      finnhub<{ data?: { name: string; change: number; transactionDate: string; transactionPrice: number | null }[] }>(
        "/stock/insider-transactions",
        { symbol, from: isoDay(new Date(now.getTime() - 180 * 86_400_000)) },
        ttl,
      ),
      {},
    ),
    settle(
      finnhub<StockContext["news"]>("/company-news", { symbol, from: isoDay(monthAgo), to: isoDay(now) }, ttl),
      [],
    ),
  ]);

  return {
    available: true,
    recommendations: (Array.isArray(recs) ? recs : []).slice(0, 4),
    earnings: (earnings.earningsCalendar ?? [])
      .map((e) => ({ date: e.date, epsEstimate: e.epsEstimate, quarter: e.quarter, year: e.year }))
      .slice(0, 2),
    insiders: (insiders.data ?? [])
      .map((t) => ({ name: t.name, change: t.change, transactionDate: t.transactionDate, transactionPrice: t.transactionPrice }))
      .slice(0, 10),
    news: (Array.isArray(news) ? news : [])
      .map((n) => ({ headline: n.headline, source: n.source, url: n.url, datetime: n.datetime, summary: n.summary }))
      .slice(0, 6),
  };
}
