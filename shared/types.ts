// Types shared by the client and the server.

export type Sector =
  | "Technology"
  | "Communication"
  | "Consumer Discretionary"
  | "Consumer Staples"
  | "Financials"
  | "Health Care"
  | "Energy"
  | "Industrials"
  | "Materials"
  | "Utilities"
  | "Real Estate"
  | "Index ETF";

export interface UniverseEntry {
  symbol: string;
  name: string;
  sector: Sector;
  /** "CA" for Canadian companies (screened through their US listing). */
  country: "US" | "CA";
  etf?: boolean;
}

/** Raw fundamentals for one stock. Percentages are whole numbers (12.5 = 12.5%). */
export interface StockMetrics extends UniverseEntry {
  price: number | null;
  changePct: number | null;
  marketCap: number | null; // USD millions
  pe: number | null;
  ps: number | null;
  epsGrowth: number | null; // TTM YoY %
  revenueGrowth: number | null; // TTM YoY %
  roe: number | null; // %
  netMargin: number | null; // TTM %
  netMargin5Y: number | null; // 5-year average %
  debtToEquity: number | null; // ratio
  currentRatio: number | null;
  dividendYield: number | null; // %
  week52High: number | null;
  week52Low: number | null;
  week52Return: number | null; // %
  beta: number | null;
  sharesChange: number | null; // YoY % change in shares outstanding (dilution), when known
  live: boolean; // true when fetched from the live API, false for sample data
}

export type FactorKey = "value" | "growth" | "quality" | "health" | "momentum";
export type Weights = Record<FactorKey, number>;
export type RiskProfile = "conservative" | "balanced" | "aggressive";
export type PickLabel = "Consider Buying" | "Watch" | "Pass for now";

export interface RedFlag {
  id: string;
  severity: "high" | "medium";
  title: string;
  detail: string;
}

export interface ScoredStock extends StockMetrics {
  score: number; // 0-100
  factors: Record<FactorKey, number>; // 0-100 each
  label: PickLabel;
  reasons: string[]; // "why" bullets
  flags: RedFlag[];
  missing: string[]; // metrics filled with the sector median
  downgraded: boolean; // true when red flags lowered the label
}

export interface ScreenerResponse {
  stocks: ScoredStock[];
  weights: Weights;
  profile: RiskProfile;
  source: "live" | "sample" | "mixed";
  liveCount: number;
  asOf: string;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number | null;
  changePct: number | null;
}

export interface MarketResponse {
  indexes: MarketQuote[];
  sectors: (MarketQuote & { sector: Sector })[];
  source: "live" | "sample";
  asOf: string;
}

export interface StatusResponse {
  live: boolean;
  tutor: boolean;
  warmed: number;
  total: number;
}

export interface StockContext {
  available: boolean;
  message?: string;
  recommendations: {
    period: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  }[];
  earnings: { date: string; epsEstimate: number | null; quarter: number; year: number }[];
  insiders: { name: string; change: number; transactionDate: string; transactionPrice: number | null }[];
  news: { headline: string; source: string; url: string; datetime: number; summary: string }[];
}
