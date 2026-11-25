import { useState, type FormEvent } from "react";
import type { ScoredStock } from "../../../shared/types";
import { Button, Card, DataBanner, PageHeader, TermTip } from "../components/ui";
import { api } from "../lib/api";
import { bigMoney, money, num, pct } from "../lib/format";

const POPULAR = ["AAPL", "NKE", "SHOP", "RY", "TSLA", "KO", "NFLX", "LULU"];

type Light = "good" | "ok" | "bad" | "info";
interface Vital {
  term: string;
  label: string;
  value: string;
  light: Light;
  note: string;
}

const lightStyle: Record<Light, { dot: string; label: string }> = {
  good: { dot: "bg-gain", label: "Healthy" },
  ok: { dot: "bg-warn", label: "OK" },
  bad: { dot: "bg-loss", label: "Watch out" },
  info: { dot: "bg-muted", label: "Info" },
};

function vitals(s: ScoredStock): Vital[] {
  const out: Vital[] = [];
  const isBank = s.sector === "Financials";
  if (s.revenueGrowth !== null)
    out.push({
      term: "revenue",
      label: "Sales growth (1 yr)",
      value: pct(s.revenueGrowth, 0, true),
      light: s.revenueGrowth >= 10 ? "good" : s.revenueGrowth >= 0 ? "ok" : "bad",
      note: s.revenueGrowth >= 10 ? "Customers are buying a lot more than last year." : s.revenueGrowth >= 0 ? "Sales are growing slowly or flat." : "Sales are shrinking. Find out why.",
    });
  if (s.netMargin !== null)
    out.push({
      term: "profit-margin",
      label: "Profit margin",
      value: pct(s.netMargin, 0),
      light: s.netMargin >= 15 ? "good" : s.netMargin >= 5 ? "ok" : "bad",
      note: s.netMargin < 0 ? "The company is losing money right now." : `Keeps about ${num(s.netMargin, 0)}¢ of profit from every $1 of sales.`,
    });
  if (s.roe !== null)
    out.push({
      term: "roe",
      label: "Return on equity",
      value: pct(s.roe, 0),
      light: s.roe >= 15 ? "good" : s.roe >= 8 ? "ok" : "bad",
      note: s.roe >= 15 ? "Very good at turning owners' money into profit." : "Average or weak at turning owners' money into profit.",
    });
  if (!isBank && s.debtToEquity !== null)
    out.push({
      term: "debt-to-equity",
      label: "Debt-to-equity",
      value: `${num(s.debtToEquity, 2)}×`,
      light: s.debtToEquity < 1 ? "good" : s.debtToEquity < 2 ? "ok" : "bad",
      note: s.debtToEquity < 1 ? "Comfortable amount of debt." : s.debtToEquity < 2 ? "A fair bit of debt." : "Lots of debt: riskier if business slows.",
    });
  out.push({
    term: "pe",
    label: "P/E ratio",
    value: s.pe === null ? "n/a" : num(s.pe, 1),
    light: "info",
    note: s.pe === null ? "No P/E because there's no profit." : s.pe < 15 ? "Cheaper than the long-run market average (~15–20). Ask why!" : s.pe <= 30 ? "Around or a bit above average." : "Pricey: investors expect lots of growth.",
  });
  if (s.dividendYield !== null)
    out.push({
      term: "dividend-yield",
      label: "Dividend yield",
      value: pct(s.dividendYield),
      light: "info",
      note: s.dividendYield > 0.2 ? `Pays about $${num(s.dividendYield, 2)} a year for every $100 invested.` : "Pays little or no dividend; keeps profits to grow.",
    });
  if (s.beta !== null)
    out.push({
      term: "beta",
      label: "Beta (bumpiness)",
      value: num(s.beta, 2),
      light: s.beta > 1.5 ? "bad" : s.beta < 0.8 ? "good" : "ok",
      note: s.beta > 1.5 ? "Swings much more than the market." : s.beta < 0.8 ? "Calmer than the overall market." : "Moves roughly with the market.",
    });
  return out;
}

export default function CompanyCheckup() {
  const [input, setInput] = useState("");
  const [stock, setStock] = useState<ScoredStock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(sym: string) {
    const symbol = sym.trim().toUpperCase();
    if (!symbol) return;
    setInput(symbol);
    setLoading(true);
    setError(null);
    try {
      setStock(await api.stock(symbol));
    } catch (e) {
      setStock(null);
      setError((e as Error).message === "Ticker not found" ? `Couldn't find “${symbol}”. In sample mode only the app's list of ~60 companies is available.` : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void lookup(input);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader emoji="🩺" title="Company Checkup" subtitle="Type a ticker and read a company's vital signs, like a doctor's check-up. Tap any underlined word to learn what it means." />
      <DataBanner />
      <form onSubmit={submit} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ticker, e.g. AAPL" className="w-full max-w-xs rounded-xl border border-line bg-surface px-4 py-2.5 uppercase" aria-label="Ticker symbol" />
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check up"}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="text-muted">Try:</span>
        {POPULAR.map((p) => (
          <button key={p} onClick={() => void lookup(p)} className="rounded-full bg-surface-2 px-3 py-1 font-medium hover:bg-accent-soft hover:text-accent">
            {p}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-xl bg-loss-soft p-4 text-sm text-loss">{error}</p>}

      {stock && (
        <div className="mt-6 space-y-5">
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-sm text-muted">
                  {stock.sector}
                  {stock.country === "CA" && " · 🍁 Canadian company"}
                </div>
                <h2 className="text-2xl font-bold">
                  {stock.name} <span className="text-muted">({stock.symbol})</span>
                </h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tabular-nums">{money(stock.price)}</div>
                <div className="text-sm text-muted">
                  <TermTip id="market-cap">Market cap</TermTip> {bigMoney(stock.marketCap)}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {vitals(stock).map((v) => (
              <Card key={v.label} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <TermTip id={v.term}>{v.label}</TermTip>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <span className={`h-2.5 w-2.5 rounded-full ${lightStyle[v.light].dot}`} aria-hidden />
                    {lightStyle[v.light].label}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{v.value}</div>
                <p className="text-sm text-muted">{v.note}</p>
              </Card>
            ))}
          </div>

          {stock.flags.length > 0 && (
            <Card className="border-warn/40 bg-warn-soft">
              <h3 className="font-bold">⚠️ Things to investigate</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {stock.flags.map((f) => (
                  <li key={f.id}>
                    <strong>{f.title}:</strong> {f.detail}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="bg-accent-soft">
            <h3 className="font-bold">🧠 Your turn to think</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>Do you understand how {stock.name} makes money? Could you explain it to a friend?</li>
              <li>Would you rather own this one company or a whole index of them? Why?</li>
              <li>Compare it with a competitor in the {stock.sector} sector. Which looks healthier?</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
