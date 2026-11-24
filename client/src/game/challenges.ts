import { daysBetween, todayKey } from "../lib/format";
import { sectorMix, totalValue, vsMarket, type Portfolio } from "./portfolio";

export interface ChallengeContext {
  portfolio: Portfolio;
  prices: Record<string, number | undefined>;
  spyNow: number | null;
  dividendYields: Record<string, number | null>;
}

export interface Challenge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  lesson: string; // what it teaches
  xp: number;
  done: (c: ChallengeContext) => boolean;
}

const heldSymbols = (p: Portfolio) => Object.keys(p.holdings);
const INDEX_ETFS = ["SPY", "QQQ", "VTI", "EWC"];

export const CHALLENGES: Challenge[] = [
  {
    id: "first-buy",
    title: "Make your first trade",
    emoji: "🛒",
    description: "Buy any stock or ETF.",
    lesson: "Buying a share makes you a part-owner of a real company.",
    xp: 50,
    done: (c) => c.portfolio.trades.some((t) => t.side === "buy"),
  },
  {
    id: "three-sectors",
    title: "Spread it out",
    emoji: "🧺",
    description: "Own stocks from 3 different sectors at once.",
    lesson: "Different industries rise and fall at different times. Mixing them smooths the ride.",
    xp: 100,
    done: (c) => Object.keys(sectorMix(c.portfolio, c.prices)).filter((s) => s !== "Index ETF").length >= 3,
  },
  {
    id: "index-owner",
    title: "Own the whole market",
    emoji: "🌎",
    description: "Buy an index ETF (SPY, QQQ, VTI or EWC).",
    lesson: "One ETF share can hold hundreds of companies: instant diversification.",
    xp: 75,
    done: (c) => heldSymbols(c.portfolio).some((s) => INDEX_ETFS.includes(s)),
  },
  {
    id: "dividend-hunter",
    title: "Get paid to wait",
    emoji: "💵",
    description: "Own a stock with a dividend yield of 3% or more.",
    lesson: "Dividends are cash a company shares with its owners, usually every quarter.",
    xp: 75,
    done: (c) => heldSymbols(c.portfolio).some((s) => (c.dividendYields[s] ?? 0) >= 3),
  },
  {
    id: "balanced",
    title: "No eggs in one basket",
    emoji: "⚖️",
    description: "Hold 4+ positions with none bigger than 30% of your portfolio.",
    lesson: "If one company stumbles, a balanced portfolio barely notices.",
    xp: 100,
    done: (c) => {
      const holdings = Object.values(c.portfolio.holdings);
      if (holdings.length < 4) return false;
      const total = totalValue(c.portfolio, c.prices);
      return holdings.every((h) => (h.shares * (c.prices[h.symbol] ?? h.cost / h.shares)) / total <= 0.3);
    },
  },
  {
    id: "patience",
    title: "Patience pays",
    emoji: "💎",
    description: "Keep any position for 7 days without selling it.",
    lesson: "Investors who trade less often usually do better than those who chase every move.",
    xp: 100,
    done: (c) => Object.values(c.portfolio.holdings).some((h) => daysBetween(h.firstBought, todayKey()) >= 7),
  },
  {
    id: "beat-market",
    title: "Beat the market",
    emoji: "🏆",
    description: "After at least 7 days, have a higher return than the S&P 500 since your first trade.",
    lesson: "This is hard! Most professional fund managers fail to beat the index over time.",
    xp: 200,
    done: (c) => {
      if (!c.portfolio.start || daysBetween(c.portfolio.start, todayKey()) < 7) return false;
      const { mine, market } = vsMarket(c.portfolio, totalValue(c.portfolio, c.prices), c.spyNow);
      return market !== null && mine > market;
    },
  },
];
