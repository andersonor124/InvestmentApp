import { describe, expect, it } from "vitest";
import type { StockMetrics } from "../../shared/types.js";
import { redFlags } from "./redflags.js";
import { labelFor, LABEL_THRESHOLDS, median, percentile, PROFILE_WEIGHTS, scoreUniverse } from "./scoring.js";

function stock(symbol: string, over: Partial<StockMetrics> = {}): StockMetrics {
  return {
    symbol,
    name: symbol,
    sector: "Technology",
    country: "US",
    price: 100,
    changePct: 0,
    marketCap: 100_000,
    pe: 20,
    ps: 5,
    epsGrowth: 10,
    revenueGrowth: 8,
    roe: 15,
    netMargin: 15,
    netMargin5Y: 15,
    debtToEquity: 0.8,
    currentRatio: 1.5,
    dividendYield: 1,
    week52High: 110,
    week52Low: 80,
    week52Return: 10,
    beta: 1,
    sharesChange: 0,
    live: false,
    ...over,
  };
}

describe("percentile", () => {
  it("ranks within the list, with ties counting half", () => {
    expect(percentile(1, [1, 2, 3])).toBe(0);
    expect(percentile(3, [1, 2, 3])).toBe(1);
    expect(percentile(2, [1, 2, 3])).toBe(0.5);
    expect(percentile(2, [2, 2, 2])).toBe(0.5);
  });
  it("inverts when lower is better", () => {
    expect(percentile(1, [1, 2, 3], false)).toBe(1);
  });
  it("is neutral with a single value", () => {
    expect(percentile(5, [5])).toBe(0.5);
  });
});

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});

describe("weights", () => {
  it("each profile's weights sum to 1", () => {
    for (const w of Object.values(PROFILE_WEIGHTS)) {
      expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    }
  });
});

describe("labelFor", () => {
  it("uses the shared thresholds", () => {
    expect(labelFor(LABEL_THRESHOLDS.considerBuying)).toBe("Consider Buying");
    expect(labelFor(LABEL_THRESHOLDS.considerBuying - 1)).toBe("Watch");
    expect(labelFor(LABEL_THRESHOLDS.watch)).toBe("Watch");
    expect(labelFor(LABEL_THRESHOLDS.watch - 1)).toBe("Pass for now");
  });
});

describe("scoreUniverse", () => {
  const universe = [
    stock("BEST", { pe: 10, ps: 2, epsGrowth: 40, revenueGrowth: 30, roe: 40, netMargin: 35, debtToEquity: 0.1, currentRatio: 3, week52Return: 50, price: 109 }),
    stock("MID"),
    stock("MID2", { pe: 22 }),
    stock("WORST", { pe: 80, ps: 20, epsGrowth: -30, revenueGrowth: -10, roe: 2, netMargin: 1, debtToEquity: 3, currentRatio: 0.7, week52Return: -40, price: 60 }),
  ];
  const scored = scoreUniverse(universe, PROFILE_WEIGHTS.balanced);

  it("sorts by score, best first, scores in 0..100", () => {
    expect(scored[0].symbol).toBe("BEST");
    expect(scored[scored.length - 1].symbol).toBe("WORST");
    for (const s of scored) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
  });

  it("gives the dominant stock top factor scores and a buy label", () => {
    const best = scored[0];
    expect(best.factors.growth).toBe(100);
    expect(best.label).toBe("Consider Buying");
    expect(best.reasons.length).toBeGreaterThan(0);
  });

  it("fills missing data with a neutral value and reports it", () => {
    const withGap = scoreUniverse([...universe, stock("GAP", { roe: null })], PROFILE_WEIGHTS.balanced);
    expect(withGap.find((s) => s.symbol === "GAP")!.missing).toContain("Return on equity");
  });

  it("treats a loss-maker's missing P/E as worst value, not missing", () => {
    const loser = scoreUniverse([...universe, stock("LOSS", { pe: null, ps: 20, netMargin: -10 })], PROFILE_WEIGHTS.balanced).find((s) => s.symbol === "LOSS")!;
    expect(loser.missing).not.toContain("P/E ratio");
    expect(loser.factors.value).toBeLessThan(25);
  });

  it("downgrades Consider Buying to Watch when there are serious red flags", () => {
    const flagged = scoreUniverse(
      [...universe.filter((s) => s.symbol !== "BEST"), stock("RISKY", { pe: 10, ps: 2, epsGrowth: 40, revenueGrowth: 30, roe: 40, netMargin: 35, debtToEquity: 0.1, currentRatio: 3, week52Return: 50, price: 109, sharesChange: 12 })],
      PROFILE_WEIGHTS.balanced,
    ).find((s) => s.symbol === "RISKY")!;
    expect(flagged.score).toBeGreaterThanOrEqual(LABEL_THRESHOLDS.considerBuying);
    expect(flagged.label).toBe("Watch");
    expect(flagged.downgraded).toBe(true);
  });

  it("weights change rankings between profiles", () => {
    const growthy = stock("GROW", { pe: 60, ps: 15, epsGrowth: 60, revenueGrowth: 40, week52Return: 60, debtToEquity: 1.5, currentRatio: 1 });
    const steady = stock("STEADY", { pe: 12, ps: 2, epsGrowth: 3, revenueGrowth: 2, week52Return: 0, debtToEquity: 0.2, currentRatio: 2.5 });
    const list = [growthy, steady, stock("A"), stock("B")];
    const rank = (p: keyof typeof PROFILE_WEIGHTS) => scoreUniverse(list, PROFILE_WEIGHTS[p]).map((s) => s.symbol);
    expect(rank("aggressive").indexOf("GROW")).toBeLessThan(rank("aggressive").indexOf("STEADY"));
    expect(rank("conservative").indexOf("STEADY")).toBeLessThan(rank("conservative").indexOf("GROW"));
  });
});

describe("redFlags", () => {
  const ids = (s: StockMetrics) => redFlags(s).map((f) => f.id);
  it("flags losses, debt, dilution and drawdowns", () => {
    expect(ids(stock("X", { netMargin: -5 }))).toContain("negative-earnings");
    expect(ids(stock("X", { debtToEquity: 3 }))).toContain("high-debt");
    expect(ids(stock("X", { sharesChange: 5 }))).toContain("dilution");
    expect(ids(stock("X", { price: 50, week52High: 100 }))).toContain("big-drawdown");
    expect(ids(stock("X", { netMargin: 5, netMargin5Y: 15 }))).toContain("falling-margins");
  });
  it("doesn't apply balance-sheet flags to banks", () => {
    expect(ids(stock("BANK", { sector: "Financials", debtToEquity: 9, currentRatio: 0.2 }))).toEqual([]);
  });
  it("finds nothing wrong with a healthy company", () => {
    expect(ids(stock("OK"))).toEqual([]);
  });
});
