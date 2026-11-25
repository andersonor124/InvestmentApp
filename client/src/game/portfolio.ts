// Pure practice-portfolio math (no React, easy to unit test).
import type { Sector } from "../../../shared/types";

export const START_CASH = 10_000;

export interface Holding {
  symbol: string;
  name: string;
  sector: Sector;
  shares: number;
  cost: number; // total cost basis in $
  firstBought: string; // YYYY-MM-DD
}

export interface Trade {
  date: string;
  symbol: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
}

export interface Portfolio {
  cash: number;
  start: string | null;
  startSpy: number | null;
  holdings: Record<string, Holding>;
  trades: Trade[];
  history: { date: string; value: number; spy: number | null }[];
}

export const emptyPortfolio = (): Portfolio => ({
  cash: START_CASH,
  start: null,
  startSpy: null,
  holdings: {},
  trades: [],
  history: [],
});

const roundShares = (n: number) => Math.round(n * 10_000) / 10_000;
const cents = (n: number) => Math.round(n * 100) / 100;

export type TradeResult = { ok: true; portfolio: Portfolio } | { ok: false; error: string };

export function buy(
  p: Portfolio,
  order: { symbol: string; name: string; sector: Sector; price: number; shares: number; date: string; spy?: number | null },
): TradeResult {
  const shares = roundShares(order.shares);
  if (!(shares > 0)) return { ok: false, error: "Enter how many shares to buy." };
  if (!(order.price > 0)) return { ok: false, error: "No price available for this stock right now." };
  const total = cents(shares * order.price);
  if (total > p.cash + 0.005) return { ok: false, error: `Not enough cash: that costs ${total.toFixed(2)} but you have ${p.cash.toFixed(2)}.` };

  const existing = p.holdings[order.symbol];
  const holding: Holding = existing
    ? { ...existing, shares: roundShares(existing.shares + shares), cost: cents(existing.cost + total) }
    : { symbol: order.symbol, name: order.name, sector: order.sector, shares, cost: total, firstBought: order.date };

  return {
    ok: true,
    portfolio: {
      ...p,
      cash: cents(p.cash - total),
      start: p.start ?? order.date,
      startSpy: p.startSpy ?? order.spy ?? null,
      holdings: { ...p.holdings, [order.symbol]: holding },
      trades: [...p.trades, { date: order.date, symbol: order.symbol, side: "buy", shares, price: order.price }],
    },
  };
}

export function sell(p: Portfolio, order: { symbol: string; price: number; shares: number; date: string }): TradeResult {
  const holding = p.holdings[order.symbol];
  const shares = roundShares(order.shares);
  if (!holding) return { ok: false, error: "You don't own this stock." };
  if (!(shares > 0)) return { ok: false, error: "Enter how many shares to sell." };
  if (shares > holding.shares + 1e-9) return { ok: false, error: `You only own ${holding.shares} shares.` };
  if (!(order.price > 0)) return { ok: false, error: "No price available for this stock right now." };

  const proceeds = cents(shares * order.price);
  const remaining = roundShares(holding.shares - shares);
  const holdings = { ...p.holdings };
  if (remaining <= 0) delete holdings[order.symbol];
  else {
    // Average-cost method: cost basis shrinks in proportion to shares sold.
    holdings[order.symbol] = { ...holding, shares: remaining, cost: cents(holding.cost * (remaining / holding.shares)) };
  }
  return {
    ok: true,
    portfolio: {
      ...p,
      cash: cents(p.cash + proceeds),
      holdings,
      trades: [...p.trades, { date: order.date, symbol: order.symbol, side: "sell", shares, price: order.price }],
    },
  };
}

export function holdingsValue(p: Portfolio, prices: Record<string, number | undefined>): number {
  return Object.values(p.holdings).reduce((sum, h) => {
    const price = prices[h.symbol];
    return sum + (price !== undefined ? h.shares * price : h.cost); // fall back to cost if no price yet
  }, 0);
}

export function totalValue(p: Portfolio, prices: Record<string, number | undefined>): number {
  return cents(p.cash + holdingsValue(p, prices));
}

export function sectorMix(p: Portfolio, prices: Record<string, number | undefined>): Record<string, number> {
  const mix: Record<string, number> = {};
  for (const h of Object.values(p.holdings)) {
    const v = h.shares * (prices[h.symbol] ?? h.cost / h.shares);
    mix[h.sector] = (mix[h.sector] ?? 0) + v;
  }
  return mix;
}

/** Keep one history point per day (the latest), capped to a year. */
export function recordHistory(p: Portfolio, date: string, value: number, spy: number | null): Portfolio {
  const history = p.history.filter((h) => h.date !== date);
  history.push({ date, value, spy });
  history.sort((a, b) => a.date.localeCompare(b.date));
  return { ...p, history: history.slice(-366) };
}

/** Portfolio return vs the S&P 500 (SPY) since the first trade, in %. */
export function vsMarket(p: Portfolio, value: number, spyNow: number | null) {
  const mine = ((value - START_CASH) / START_CASH) * 100;
  const market = p.startSpy && spyNow ? ((spyNow - p.startSpy) / p.startSpy) * 100 : null;
  return { mine, market };
}
