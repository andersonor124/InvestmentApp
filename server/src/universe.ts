import type { Sector, UniverseEntry } from "../../shared/types.js";

// The stocks the screener ranks. Canadian companies are screened through their
// US listing because the free data tier covers US exchanges.
export const UNIVERSE: UniverseEntry[] = [
  // Technology
  { symbol: "AAPL", name: "Apple", sector: "Technology", country: "US" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", country: "US" },
  { symbol: "NVDA", name: "Nvidia", sector: "Technology", country: "US" },
  { symbol: "AVGO", name: "Broadcom", sector: "Technology", country: "US" },
  { symbol: "ADBE", name: "Adobe", sector: "Technology", country: "US" },
  { symbol: "CRM", name: "Salesforce", sector: "Technology", country: "US" },
  { symbol: "INTC", name: "Intel", sector: "Technology", country: "US" },
  { symbol: "SHOP", name: "Shopify", sector: "Technology", country: "CA" },
  // Communication
  { symbol: "GOOGL", name: "Alphabet (Google)", sector: "Communication", country: "US" },
  { symbol: "META", name: "Meta Platforms", sector: "Communication", country: "US" },
  { symbol: "NFLX", name: "Netflix", sector: "Communication", country: "US" },
  { symbol: "DIS", name: "Walt Disney", sector: "Communication", country: "US" },
  { symbol: "VZ", name: "Verizon", sector: "Communication", country: "US" },
  { symbol: "BCE", name: "BCE (Bell Canada)", sector: "Communication", country: "CA" },
  // Consumer Discretionary
  { symbol: "AMZN", name: "Amazon", sector: "Consumer Discretionary", country: "US" },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer Discretionary", country: "US" },
  { symbol: "MCD", name: "McDonald's", sector: "Consumer Discretionary", country: "US" },
  { symbol: "NKE", name: "Nike", sector: "Consumer Discretionary", country: "US" },
  { symbol: "SBUX", name: "Starbucks", sector: "Consumer Discretionary", country: "US" },
  { symbol: "LULU", name: "Lululemon", sector: "Consumer Discretionary", country: "US" },
  // Consumer Staples
  { symbol: "KO", name: "Coca-Cola", sector: "Consumer Staples", country: "US" },
  { symbol: "PEP", name: "PepsiCo", sector: "Consumer Staples", country: "US" },
  { symbol: "COST", name: "Costco", sector: "Consumer Staples", country: "US" },
  { symbol: "WMT", name: "Walmart", sector: "Consumer Staples", country: "US" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples", country: "US" },
  // Financials
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials", country: "US" },
  { symbol: "V", name: "Visa", sector: "Financials", country: "US" },
  { symbol: "MA", name: "Mastercard", sector: "Financials", country: "US" },
  { symbol: "BAC", name: "Bank of America", sector: "Financials", country: "US" },
  { symbol: "RY", name: "Royal Bank of Canada", sector: "Financials", country: "CA" },
  { symbol: "TD", name: "TD Bank", sector: "Financials", country: "CA" },
  { symbol: "BMO", name: "Bank of Montreal", sector: "Financials", country: "CA" },
  { symbol: "BN", name: "Brookfield Corp", sector: "Financials", country: "CA" },
  // Health Care
  { symbol: "LLY", name: "Eli Lilly", sector: "Health Care", country: "US" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Health Care", country: "US" },
  { symbol: "UNH", name: "UnitedHealth", sector: "Health Care", country: "US" },
  { symbol: "PFE", name: "Pfizer", sector: "Health Care", country: "US" },
  { symbol: "MRK", name: "Merck", sector: "Health Care", country: "US" },
  { symbol: "ABBV", name: "AbbVie", sector: "Health Care", country: "US" },
  // Energy
  { symbol: "XOM", name: "ExxonMobil", sector: "Energy", country: "US" },
  { symbol: "CVX", name: "Chevron", sector: "Energy", country: "US" },
  { symbol: "ENB", name: "Enbridge", sector: "Energy", country: "CA" },
  { symbol: "CNQ", name: "Canadian Natural Resources", sector: "Energy", country: "CA" },
  { symbol: "SU", name: "Suncor Energy", sector: "Energy", country: "CA" },
  // Industrials
  { symbol: "CAT", name: "Caterpillar", sector: "Industrials", country: "US" },
  { symbol: "BA", name: "Boeing", sector: "Industrials", country: "US" },
  { symbol: "UNP", name: "Union Pacific", sector: "Industrials", country: "US" },
  { symbol: "CP", name: "Canadian Pacific Kansas City", sector: "Industrials", country: "CA" },
  { symbol: "CNI", name: "Canadian National Railway", sector: "Industrials", country: "CA" },
  { symbol: "WCN", name: "Waste Connections", sector: "Industrials", country: "CA" },
  // Materials
  { symbol: "LIN", name: "Linde", sector: "Materials", country: "US" },
  { symbol: "NTR", name: "Nutrien", sector: "Materials", country: "CA" },
  { symbol: "FNV", name: "Franco-Nevada", sector: "Materials", country: "CA" },
  // Utilities
  { symbol: "NEE", name: "NextEra Energy", sector: "Utilities", country: "US" },
  { symbol: "DUK", name: "Duke Energy", sector: "Utilities", country: "US" },
  { symbol: "FTS", name: "Fortis", sector: "Utilities", country: "CA" },
  // Real Estate
  { symbol: "PLD", name: "Prologis", sector: "Real Estate", country: "US" },
  { symbol: "O", name: "Realty Income", sector: "Real Estate", country: "US" },
];

/** Index ETFs students can buy in the practice portfolio (not scored). */
export const PRACTICE_ETFS: UniverseEntry[] = [
  { symbol: "SPY", name: "S&P 500 Index ETF", sector: "Index ETF", country: "US", etf: true },
  { symbol: "QQQ", name: "Nasdaq-100 Index ETF", sector: "Index ETF", country: "US", etf: true },
  { symbol: "VTI", name: "Total US Stock Market ETF", sector: "Index ETF", country: "US", etf: true },
  { symbol: "EWC", name: "Canada (MSCI) Index ETF", sector: "Index ETF", country: "US", etf: true },
];

export const INDEX_PROXIES = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq-100" },
  { symbol: "DIA", name: "Dow Jones" },
  { symbol: "EWC", name: "Canada (MSCI)" },
];

export const SECTOR_ETFS: { symbol: string; name: string; sector: Sector }[] = [
  { symbol: "XLK", name: "Technology", sector: "Technology" },
  { symbol: "XLC", name: "Communication", sector: "Communication" },
  { symbol: "XLY", name: "Consumer Discretionary", sector: "Consumer Discretionary" },
  { symbol: "XLP", name: "Consumer Staples", sector: "Consumer Staples" },
  { symbol: "XLF", name: "Financials", sector: "Financials" },
  { symbol: "XLV", name: "Health Care", sector: "Health Care" },
  { symbol: "XLE", name: "Energy", sector: "Energy" },
  { symbol: "XLI", name: "Industrials", sector: "Industrials" },
  { symbol: "XLB", name: "Materials", sector: "Materials" },
  { symbol: "XLU", name: "Utilities", sector: "Utilities" },
  { symbol: "XLRE", name: "Real Estate", sector: "Real Estate" },
];

const ALL = [...UNIVERSE, ...PRACTICE_ETFS];
export function findEntry(symbol: string): UniverseEntry | undefined {
  return ALL.find((e) => e.symbol === symbol.toUpperCase());
}
