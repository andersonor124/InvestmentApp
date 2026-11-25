import type {
  MarketQuote,
  MarketResponse,
  RiskProfile,
  ScoredStock,
  ScreenerResponse,
  StatusResponse,
  StockContext,
  UniverseEntry,
} from "../../../shared/types";

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  status: () => get<StatusResponse>("/api/status"),
  universe: () => get<UniverseEntry[]>("/api/universe"),
  screener: (profile: RiskProfile = "balanced") => get<ScreenerResponse>(`/api/screener?profile=${profile}`),
  stock: (symbol: string, profile: RiskProfile = "balanced") =>
    get<ScoredStock>(`/api/stock/${encodeURIComponent(symbol)}?profile=${profile}`),
  context: (symbol: string) => get<StockContext>(`/api/stock/${encodeURIComponent(symbol)}/context`),
  quote: (symbol: string) => get<MarketQuote>(`/api/quote/${encodeURIComponent(symbol)}`),
  quotes: (symbols: string[]) =>
    symbols.length
      ? get<MarketQuote[]>(`/api/quotes?symbols=${symbols.map(encodeURIComponent).join(",")}`)
      : Promise.resolve([] as MarketQuote[]),
  market: () => get<MarketResponse>("/api/market"),
};
