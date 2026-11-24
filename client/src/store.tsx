import confetti from "canvas-confetti";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { RiskProfile, ScreenerResponse, StatusResponse } from "../../shared/types";
import { LESSONS } from "./content/lessons";
import { SCENARIOS } from "./content/history";
import { emptyPortfolio, type Portfolio } from "./game/portfolio";
import { BADGES, emptyProgress, levelFor, newlyEarnedBadges, touchStreak, XP, type Progress } from "./game/xp";
import { api } from "./lib/api";
import { todayKey } from "./lib/format";
import { load, save } from "./lib/storage";

export interface Toast {
  id: number;
  emoji: string;
  title: string;
  body?: string;
}

export interface WatchItem {
  symbol: string;
  addedPrice: number | null;
  addedAt: string;
  buyBelow: number | null;
  sellAbove: number | null;
  shares: number | null; // optional real position size, for the diversification checker
}

export interface InvestorProfile {
  risk: RiskProfile;
  answers: Record<string, number>;
  completed: boolean;
}

interface Store {
  progress: Progress;
  portfolio: Portfolio;
  watchlist: WatchItem[];
  investor: InvestorProfile;
  status: StatusResponse | null;
  toasts: Toast[];
  screener: ScreenerResponse | null;
  screenerError: string | null;
  refreshScreener: () => void;
  addXp: (amount: number, reason: string, emoji?: string) => void;
  updateProgress: (fn: (p: Progress) => Progress) => void;
  setPortfolio: (fn: (p: Portfolio) => Portfolio) => void;
  setWatchlist: (fn: (w: WatchItem[]) => WatchItem[]) => void;
  setInvestor: (p: InvestorProfile) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  celebrate: () => void;
  resetStudent: () => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

const defaultInvestor: InvestorProfile = { risk: "balanced", answers: {}, completed: false };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => load("progress", emptyProgress()));
  const [portfolio, setPortfolioState] = useState<Portfolio>(() => load("portfolio", emptyPortfolio()));
  const [watchlist, setWatchlistState] = useState<WatchItem[]>(() => load<{ items: WatchItem[] }>("watchlist", { items: [] }).items);
  const [investor, setInvestorState] = useState<InvestorProfile>(() => load("investor", defaultInvestor));
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [screener, setScreener] = useState<ScreenerResponse | null>(null);
  const [screenerError, setScreenerError] = useState<string | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    save("progress", progress);
  }, [progress]);
  useEffect(() => {
    save("portfolio", portfolio);
  }, [portfolio]);
  useEffect(() => {
    save("watchlist", { items: watchlist });
  }, [watchlist]);
  useEffect(() => {
    save("investor", investor);
  }, [investor]);

  useEffect(() => {
    api.status().then(setStatus).catch(() => setStatus(null));
  }, []);

  const refreshScreener = useCallback(() => {
    setScreenerError(null);
    api
      .screener(investor.risk)
      .then(setScreener)
      .catch((e: Error) => setScreenerError(e.message));
  }, [investor.risk]);
  useEffect(() => {
    refreshScreener();
  }, [refreshScreener]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4500);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), []);

  const celebrate = useCallback(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
  }, []);

  /** Apply a progress change, then handle streaks, level-ups and badges in one place. */
  const updateProgress = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress((prev) => {
        let next = fn(prev);
        const { streak, extended } = touchStreak(next.streak, todayKey());
        if (extended) {
          next = { ...next, streak, xp: next.xp + XP.dailyStreak };
          if (streak.count > 1) queueMicrotask(() => toast({ emoji: "🔥", title: `${streak.count}-day streak!`, body: `+${XP.dailyStreak} XP for showing up` }));
        }
        const badges = newlyEarnedBadges({ progress: next, portfolio: portfolioRef.current, totalLessons: LESSONS.length, totalScenarios: SCENARIOS.length });
        if (badges.length) {
          next = { ...next, badges: [...next.badges, ...badges.map((b) => b.id)] };
          queueMicrotask(() => {
            badges.forEach((b) => toast({ emoji: b.emoji, title: `Badge unlocked: ${b.name}`, body: b.description }));
            celebrate();
          });
        }
        const before = levelFor(prev.xp);
        const after = levelFor(next.xp);
        if (after.index > before.index) {
          queueMicrotask(() => {
            toast({ emoji: after.emoji, title: `Level up! You're now: ${after.name}`, body: "Keep going!" });
            celebrate();
          });
        }
        return next;
      });
    },
    [toast, celebrate],
  );

  const addXp = useCallback(
    (amount: number, reason: string, emoji = "⭐") => {
      if (amount <= 0) return;
      updateProgress((p) => ({ ...p, xp: p.xp + amount }));
      toast({ emoji, title: `+${amount} XP`, body: reason });
    },
    [updateProgress, toast],
  );

  const portfolioRef = useRef(portfolio);
  portfolioRef.current = portfolio;
  const setPortfolio = useCallback(
    (fn: (p: Portfolio) => Portfolio) => {
      setPortfolioState((prev) => {
        const next = fn(prev);
        portfolioRef.current = next;
        return next;
      });
      // Re-check portfolio-based badges after the trade lands.
      setTimeout(() => updateProgress((p) => p), 0);
    },
    [updateProgress],
  );

  const setWatchlist = useCallback((fn: (w: WatchItem[]) => WatchItem[]) => setWatchlistState(fn), []);
  const setInvestor = useCallback((p: InvestorProfile) => setInvestorState(p), []);

  const resetStudent = useCallback(() => {
    setProgress(emptyProgress());
    setPortfolioState(emptyPortfolio());
  }, []);

  const value = useMemo<Store>(
    () => ({
      progress,
      portfolio,
      watchlist,
      investor,
      status,
      toasts,
      screener,
      screenerError,
      refreshScreener,
      addXp,
      updateProgress,
      setPortfolio,
      setWatchlist,
      setInvestor,
      toast,
      dismissToast,
      celebrate,
      resetStudent,
    }),
    [progress, portfolio, watchlist, investor, status, toasts, screener, screenerError, refreshScreener, addXp, updateProgress, setPortfolio, setWatchlist, setInvestor, toast, dismissToast, celebrate, resetStudent],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { BADGES };
