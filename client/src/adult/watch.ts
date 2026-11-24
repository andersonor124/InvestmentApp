import { useCallback } from "react";
import type { ScoredStock } from "../../../shared/types";
import { todayKey } from "../lib/format";
import { useStore } from "../store";

export function useWatchToggle() {
  const { watchlist, setWatchlist, toast } = useStore();
  const isWatched = useCallback((symbol: string) => watchlist.some((w) => w.symbol === symbol), [watchlist]);
  const toggle = useCallback(
    (s: Pick<ScoredStock, "symbol" | "price">) => {
      if (watchlist.some((w) => w.symbol === s.symbol)) {
        setWatchlist((w) => w.filter((x) => x.symbol !== s.symbol));
        toast({ emoji: "☆", title: `Removed ${s.symbol} from watchlist` });
      } else {
        setWatchlist((w) => [...w, { symbol: s.symbol, addedPrice: s.price, addedAt: todayKey(), buyBelow: null, sellAbove: null, shares: null }]);
        toast({ emoji: "★", title: `Added ${s.symbol} to watchlist`, body: "Set price alerts on the Watchlist page." });
      }
    },
    [watchlist, setWatchlist, toast],
  );
  return { isWatched, toggle };
}
