import { describe, expect, it } from "vitest";
import { outcome, SCENARIOS } from "../content/history";
import { ALL_QUESTIONS, LESSONS } from "../content/lessons";
import { GLOSSARY, TERM_BY_ID } from "../content/glossary";
import { buy, emptyPortfolio, recordHistory, sectorMix, sell, START_CASH, totalValue, vsMarket } from "./portfolio";
import { addDays, comboMultiplier, emptyProgress, isDue, levelFor, LEVELS, newlyEarnedBadges, reviewCard, touchStreak, xpForAnswer } from "./xp";

describe("XP & combos", () => {
  it("multiplies XP on answer streaks", () => {
    expect(comboMultiplier(1)).toBe(1);
    expect(comboMultiplier(3)).toBe(1.5);
    expect(comboMultiplier(5)).toBe(2);
    let combo = 0;
    const xp: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = xpForAnswer(true, combo);
      combo = r.combo;
      xp.push(r.xp);
    }
    expect(xp).toEqual([10, 10, 15, 15, 20]);
    expect(xpForAnswer(false, 4)).toEqual({ xp: 0, combo: 0 });
  });

  it("maps XP to levels", () => {
    expect(levelFor(0).name).toBe(LEVELS[0].name);
    expect(levelFor(LEVELS[1].min).index).toBe(1);
    expect(levelFor(1_000_000).next).toBeNull();
    expect(levelFor(75).progress).toBeCloseTo(75 / LEVELS[1].min);
  });
});

describe("streaks", () => {
  it("extends on consecutive days and resets after a gap", () => {
    let s = emptyProgress().streak;
    s = touchStreak(s, "2026-01-01").streak;
    expect(s.count).toBe(1);
    expect(touchStreak(s, "2026-01-01").extended).toBe(false);
    s = touchStreak(s, "2026-01-02").streak;
    expect(s.count).toBe(2);
    s = touchStreak(s, "2026-01-05").streak;
    expect(s).toEqual({ count: 1, best: 2, last: "2026-01-05" });
  });
});

describe("flashcards", () => {
  it("moves cards up a box when remembered and back to box 1 when missed", () => {
    const c1 = reviewCard(undefined, true, "2026-01-01");
    expect(c1).toEqual({ box: 1, due: "2026-01-02" });
    const c2 = reviewCard(c1, true, "2026-01-02");
    expect(c2).toEqual({ box: 2, due: "2026-01-05" });
    expect(reviewCard(c2, false, "2026-01-05")).toEqual({ box: 1, due: "2026-01-05" });
    expect(isDue({ due: "2026-01-05" }, "2026-01-05")).toBe(true);
    expect(isDue({ due: "2026-01-06" }, "2026-01-05")).toBe(false);
  });
  it("adds days across month ends", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });
});

describe("practice portfolio", () => {
  const base = { name: "Test", sector: "Technology" as const, date: "2026-01-01" };

  it("buys with cash and tracks cost basis", () => {
    const r = buy(emptyPortfolio(), { ...base, symbol: "AAA", price: 100, shares: 10, spy: 500 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.portfolio.cash).toBe(START_CASH - 1000);
    expect(r.portfolio.holdings.AAA).toMatchObject({ shares: 10, cost: 1000 });
    expect(r.portfolio.start).toBe("2026-01-01");
    expect(r.portfolio.startSpy).toBe(500);
  });

  it("rejects buys over available cash", () => {
    const r = buy(emptyPortfolio(), { ...base, symbol: "AAA", price: 100, shares: 101 });
    expect(r.ok).toBe(false);
  });

  it("supports fractional shares and average-cost selling", () => {
    let p = emptyPortfolio();
    let r = buy(p, { ...base, symbol: "AAA", price: 100, shares: 2.5 });
    if (!r.ok) throw new Error();
    r = buy(r.portfolio, { ...base, symbol: "AAA", price: 200, shares: 2.5 });
    if (!r.ok) throw new Error();
    p = r.portfolio;
    expect(p.holdings.AAA.cost).toBe(750);
    const s = sell(p, { symbol: "AAA", price: 300, shares: 2.5, date: "2026-01-02" });
    if (!s.ok) throw new Error();
    expect(s.portfolio.holdings.AAA).toMatchObject({ shares: 2.5, cost: 375 });
    expect(s.portfolio.cash).toBe(START_CASH - 750 + 750);
    const all = sell(s.portfolio, { symbol: "AAA", price: 300, shares: 2.5, date: "2026-01-02" });
    if (!all.ok) throw new Error();
    expect(all.portfolio.holdings.AAA).toBeUndefined();
  });

  it("rejects selling more than owned", () => {
    const r = buy(emptyPortfolio(), { ...base, symbol: "AAA", price: 10, shares: 1 });
    if (!r.ok) throw new Error();
    expect(sell(r.portfolio, { symbol: "AAA", price: 10, shares: 2, date: "x" }).ok).toBe(false);
    expect(sell(r.portfolio, { symbol: "BBB", price: 10, shares: 1, date: "x" }).ok).toBe(false);
  });

  it("values holdings, sector mix and return vs market", () => {
    const r = buy(emptyPortfolio(), { ...base, symbol: "AAA", price: 100, shares: 10, spy: 500 });
    if (!r.ok) throw new Error();
    const value = totalValue(r.portfolio, { AAA: 110 });
    expect(value).toBe(START_CASH + 100);
    expect(sectorMix(r.portfolio, { AAA: 110 })).toEqual({ Technology: 1100 });
    const { mine, market } = vsMarket(r.portfolio, value, 550);
    expect(mine).toBeCloseTo(1);
    expect(market).toBeCloseTo(10);
  });

  it("keeps one history point per day", () => {
    let p = recordHistory(emptyPortfolio(), "2026-01-01", 10000, 500);
    p = recordHistory(p, "2026-01-01", 10100, 505);
    p = recordHistory(p, "2026-01-02", 10200, 510);
    expect(p.history).toHaveLength(2);
    expect(p.history[0].value).toBe(10100);
  });
});

describe("badges", () => {
  it("awards first-trade and diversification badges from portfolio state", () => {
    let p = emptyPortfolio();
    for (const [symbol, sector] of [["A", "Technology"], ["B", "Energy"], ["C", "Financials"]] as const) {
      const r = buy(p, { symbol, name: symbol, sector, price: 10, shares: 1, date: "2026-01-01" });
      if (!r.ok) throw new Error();
      p = r.portfolio;
    }
    const ids = newlyEarnedBadges({ progress: emptyProgress(), portfolio: p, totalLessons: LESSONS.length, totalScenarios: SCENARIOS.length }).map((b) => b.id);
    expect(ids).toContain("first-trade");
    expect(ids).toContain("diversified");
    expect(ids).not.toContain("all-lessons");
  });
});

describe("content integrity", () => {
  it("every quiz answer index is valid and question ids are unique", () => {
    const ids = new Set<string>();
    for (const q of ALL_QUESTIONS) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
    }
  });
  it("every [[term]] link in lessons points at a glossary entry", () => {
    for (const l of LESSONS) {
      for (const s of l.sections) {
        for (const m of s.body.matchAll(/\[\[([^|\]]+)/g)) expect(TERM_BY_ID[m[1]], `${l.id}: ${m[1]}`).toBeDefined();
      }
    }
    expect(new Set(GLOSSARY.map((t) => t.id)).size).toBe(GLOSSARY.length);
  });
});

describe("time machine outcomes", () => {
  it("holding through every crash beat selling at the decision point", () => {
    for (const s of SCENARIOS) {
      expect(outcome(s, "hold").final).toBeGreaterThan(outcome(s, "sell").final);
      expect(outcome(s, "buy").invested).toBe(1500);
    }
  });
});
