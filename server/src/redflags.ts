import type { RedFlag, StockMetrics } from "../../shared/types.js";

const fmt = (n: number, dp = 1) => n.toFixed(dp);

/** Warning signs worth checking before buying, independent of the score. */
export function redFlags(s: StockMetrics): RedFlag[] {
  const flags: RedFlag[] = [];
  const noBalanceSheetRatios = s.sector === "Financials"; // bank leverage isn't comparable

  if (s.netMargin !== null && s.netMargin < 0) {
    flags.push({
      id: "negative-earnings",
      severity: "high",
      title: "Losing money",
      detail: `Net margin is ${fmt(s.netMargin)}%: the company spent more than it earned over the last year.`,
    });
  }
  if (!noBalanceSheetRatios && s.debtToEquity !== null && s.debtToEquity > 2) {
    flags.push({
      id: "high-debt",
      severity: s.debtToEquity > 4 ? "high" : "medium",
      title: "Heavy debt",
      detail: `Debt is ${fmt(s.debtToEquity)}× shareholder equity. High debt makes a company fragile if rates rise or sales fall.`,
    });
  }
  if (
    !noBalanceSheetRatios &&
    s.sector !== "Utilities" &&
    s.sector !== "Real Estate" &&
    s.currentRatio !== null &&
    s.currentRatio < 0.6
  ) {
    flags.push({
      id: "low-liquidity",
      severity: "medium",
      title: "Tight short-term cash",
      detail: `Current ratio of ${fmt(s.currentRatio, 2)}: short-term bills exceed short-term assets.`,
    });
  }
  if (s.sharesChange !== null && s.sharesChange > 3) {
    flags.push({
      id: "dilution",
      severity: s.sharesChange > 8 ? "high" : "medium",
      title: "Share dilution",
      detail: `Shares outstanding grew about ${fmt(s.sharesChange)}% in a year, shrinking each existing shareholder's slice.`,
    });
  }
  if (s.netMargin !== null && s.netMargin5Y !== null && s.netMargin5Y > 0 && s.netMargin5Y - s.netMargin > 5) {
    flags.push({
      id: "falling-margins",
      severity: "medium",
      title: "Shrinking margins",
      detail: `Net margin is ${fmt(s.netMargin)}% vs a 5-year average of ${fmt(s.netMargin5Y)}%. The company keeps less of each sale than it used to.`,
    });
  }
  if ((s.pe !== null && s.pe > 60) || (s.ps !== null && s.ps > 20)) {
    const what = s.pe !== null && s.pe > 60 ? `P/E of ${fmt(s.pe, 0)}` : `P/S of ${fmt(s.ps!, 0)}`;
    flags.push({
      id: "extreme-valuation",
      severity: "medium",
      title: "Priced for perfection",
      detail: `${what}. Investors expect a lot of future growth; disappointments can hit the price hard.`,
    });
  }
  if (s.epsGrowth !== null && s.epsGrowth < -40 && !(s.netMargin !== null && s.netMargin < 0)) {
    flags.push({
      id: "earnings-drop",
      severity: "medium",
      title: "Earnings fell sharply",
      detail: `Earnings per share dropped ${fmt(Math.abs(s.epsGrowth), 0)}% over the last year.`,
    });
  }
  if (s.beta !== null && s.beta > 1.8) {
    flags.push({
      id: "high-volatility",
      severity: "medium",
      title: "Very volatile",
      detail: `Beta of ${fmt(s.beta, 2)}: the stock has typically swung about ${fmt(s.beta, 1)}× as much as the overall market.`,
    });
  }
  if (s.price !== null && s.week52High !== null && s.price < s.week52High * 0.6) {
    flags.push({
      id: "big-drawdown",
      severity: "medium",
      title: "Down 40%+ from its high",
      detail: `Trading ${fmt((1 - s.price / s.week52High) * 100, 0)}% below its 52-week high. Find out why before assuming it's a bargain.`,
    });
  }
  return flags;
}
