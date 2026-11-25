import "./env.js";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RiskProfile, ScreenerResponse, StatusResponse } from "../../shared/types.js";
import { market, quote, stockContext, stockMetrics, universeMetrics, warmedCount, warmUniverse } from "./data.js";
import { hasKey, MINUTE } from "./finnhub.js";
import { PROFILE_WEIGHTS, scoreUniverse } from "./scoring.js";
import { tutorEnabled, tutorHandler } from "./tutor.js";
import { PRACTICE_ETFS, UNIVERSE } from "./universe.js";

const app = express();
app.use(express.json({ limit: "64kb" }));

const asyncRoute =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response) =>
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });

const profileOf = (v: unknown): RiskProfile =>
  v === "conservative" || v === "aggressive" ? v : "balanced";

app.get("/api/status", (_req, res) => {
  const body: StatusResponse = { live: hasKey(), tutor: tutorEnabled(), warmed: warmedCount(), total: UNIVERSE.length };
  res.json(body);
});

app.get("/api/universe", (_req, res) => {
  res.json([...UNIVERSE, ...PRACTICE_ETFS]);
});

app.get("/api/screener", (req, res) => {
  const profile = profileOf(req.query.profile);
  const metrics = universeMetrics();
  const liveCount = metrics.filter((m) => m.live).length;
  const body: ScreenerResponse = {
    stocks: scoreUniverse(metrics, PROFILE_WEIGHTS[profile]),
    weights: PROFILE_WEIGHTS[profile],
    profile,
    source: liveCount === 0 ? "sample" : liveCount === metrics.length ? "live" : "mixed",
    liveCount,
    asOf: new Date().toISOString(),
  };
  res.json(body);
});

app.get(
  "/api/stock/:symbol",
  asyncRoute(async (req, res) => {
    const profile = profileOf(req.query.profile);
    const target = await stockMetrics(String(req.params.symbol));
    if (!target) {
      res.status(404).json({ error: "Ticker not found" });
      return;
    }
    // Score against the universe so percentiles and sector medians mean something.
    const peers = universeMetrics().filter((m) => m.symbol !== target.symbol);
    const scored = scoreUniverse([...peers, target], PROFILE_WEIGHTS[profile]);
    res.json(scored.find((s) => s.symbol === target.symbol));
  }),
);

app.get(
  "/api/stock/:symbol/context",
  asyncRoute(async (req, res) => {
    res.json(await stockContext(String(req.params.symbol)));
  }),
);

app.get(
  "/api/quote/:symbol",
  asyncRoute(async (req, res) => {
    const q = await quote(String(req.params.symbol));
    if (!q) res.status(404).json({ error: "Ticker not found" });
    else res.json(q);
  }),
);

app.get(
  "/api/quotes",
  asyncRoute(async (req, res) => {
    const symbols = String(req.query.symbols ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
    const quotes = await Promise.all(symbols.map((s) => quote(s)));
    res.json(quotes.filter(Boolean));
  }),
);

app.get(
  "/api/market",
  asyncRoute(async (_req, res) => {
    res.json(await market());
  }),
);

app.post("/api/tutor", tutorHandler);

// In production, serve the built client.
if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`StockSmart API on http://localhost:${port}`);
  console.log(hasKey() ? "Live market data: Finnhub" : "No FINNHUB_API_KEY: using sample data");
  console.log(tutorEnabled() ? "AI tutor: enabled" : "AI tutor: disabled (no ANTHROPIC_API_KEY)");
  if (hasKey()) {
    void warmUniverse();
    setInterval(() => void warmUniverse(), 15 * MINUTE); // quotes refresh; metrics stay cached 12h
  }
});
