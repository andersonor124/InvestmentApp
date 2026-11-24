import { useMemo, useState, type ReactNode } from "react";
import { LineChartBox } from "../components/Chart";
import { Card, PageHeader, Pill, TermTip } from "../components/ui";
import { XP } from "../game/xp";
import { money, num } from "../lib/format";
import { useStore } from "../store";

function useTried(id: string) {
  const { progress, updateProgress, toast } = useStore();
  return () => {
    if (progress.playgrounds.includes(id)) return;
    updateProgress((p) => (p.playgrounds.includes(id) ? p : { ...p, xp: p.xp + XP.playground, playgrounds: [...p.playgrounds, id] }));
    toast({ emoji: "🧪", title: `+${XP.playground} XP`, body: "Thanks for experimenting!" });
  };
}

function Slider({ label, value, min, max, step, onChange, format }: { label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold tabular-nums text-accent">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full" />
    </label>
  );
}

export default function Playgrounds() {
  return (
    <div className="space-y-8">
      <PageHeader emoji="🧪" title="Playgrounds" subtitle="Move the sliders and watch what happens. The best way to understand money math is to play with it." />
      <CompoundPlayground />
      <PEPlayground />
      <DCAPlayground />
    </div>
  );
}

// ---------- 1. Compounding: start at 16 vs 26 ----------
function futureValue(monthly: number, ratePct: number, months: number) {
  const r = ratePct / 100 / 12;
  return r === 0 ? monthly * months : monthly * ((Math.pow(1 + r, months) - 1) / r);
}

function CompoundPlayground() {
  const [monthly, setMonthly] = useState(100);
  const [rate, setRate] = useState(7);
  const [early, setEarly] = useState(16);
  const [late, setLate] = useState(26);
  const tried = useTried("compound");
  const END = 65;

  const data = useMemo(() => {
    const rows: { age: number; early: number; late: number | null }[] = [];
    for (let age = Math.min(early, late); age <= END; age++) {
      rows.push({
        age,
        early: Math.round(futureValue(monthly, rate, Math.max(0, age - early) * 12)),
        late: age >= late ? Math.round(futureValue(monthly, rate, (age - late) * 12)) : 0,
      });
    }
    return rows;
  }, [monthly, rate, early, late]);

  const finalEarly = futureValue(monthly, rate, (END - early) * 12);
  const finalLate = futureValue(monthly, rate, (END - late) * 12);
  const putInEarly = monthly * 12 * (END - early);
  const putInLate = monthly * 12 * (END - late);
  const set = (fn: (v: number) => void) => (v: number) => {
    fn(v);
    tried();
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">❄️ The compounding snowball</h2>
        <Pill tone="accent">
          <TermTip id="compound-interest">What's compounding?</TermTip>
        </Pill>
      </div>
      <p className="mt-1 text-sm text-muted">Two friends invest the same amount each month until age 65. One starts earlier. How much difference can 10 years make?</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <Slider label="Invest each month" value={monthly} min={10} max={500} step={10} onChange={set(setMonthly)} format={(v) => money(v, 0)} />
          <Slider label="Yearly return" value={rate} min={1} max={10} step={0.5} onChange={set(setRate)} format={(v) => `${v}%`} />
          <Slider label="Friend A starts at age" value={early} min={14} max={40} step={1} onChange={set(setEarly)} format={(v) => String(v)} />
          <Slider label="Friend B starts at age" value={late} min={14} max={50} step={1} onChange={set(setLate)} format={(v) => String(v)} />
          <p className="text-xs text-muted">The long-run average of the stock market has been around 7–10% a year before inflation, but some years are big losses. This shows a smooth average.</p>
        </div>
        <div>
          <LineChartBox
            data={data}
            xKey="age"
            series={[
              { key: "early", label: `Friend A (starts at ${early})`, color: "var(--series-1)" },
              { key: "late", label: `Friend B (starts at ${late})`, color: "var(--series-2)" },
            ]}
            yFormat={(v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${Math.round(v / 1000)}k`)}
            xFormat={(v) => `Age ${v}`}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="text-sm text-muted">Friend A at 65</div>
              <div className="text-2xl font-bold tabular-nums">{money(finalEarly, 0)}</div>
              <div className="text-xs text-muted">put in {money(putInEarly, 0)}</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="text-sm text-muted">Friend B at 65</div>
              <div className="text-2xl font-bold tabular-nums">{money(finalLate, 0)}</div>
              <div className="text-xs text-muted">put in {money(putInLate, 0)}</div>
            </div>
          </div>
          {early < late && (
            <p className="mt-3 rounded-xl bg-accent-soft p-3 text-sm">
              💡 Friend A invested only <strong>{money(putInEarly - putInLate, 0)}</strong> more but ends with <strong>{money(finalEarly - finalLate, 0)}</strong> more. That's the power of extra years of compounding.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ---------- 2. P/E playground ----------
function PEPlayground() {
  const [price, setPrice] = useState(60);
  const [eps, setEps] = useState(3);
  const [growth, setGrowth] = useState(15);
  const tried = useTried("pe");
  const pe = eps > 0 ? price / eps : null;
  const peg = pe !== null && growth > 0 ? pe / growth : null;
  const earningsYield = eps > 0 ? (eps / price) * 100 : null;
  const set = (fn: (v: number) => void) => (v: number) => {
    fn(v);
    tried();
  };

  let verdict = "";
  if (pe === null) verdict = "No profit means no meaningful P/E. Investors would look at sales (P/S) instead.";
  else if (pe < 10) verdict = "Looks cheap. But ask: is the market expecting profits to fall?";
  else if (pe <= 20) verdict = "Around the long-run market average.";
  else if (pe <= 35) verdict = "Pricier: investors expect above-average growth.";
  else verdict = "Very high expectations. Any disappointment could hurt the price.";

  const marker = pe === null ? 0 : Math.min(pe, 60) / 60;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">🏷️ P/E playground</h2>
        <Pill tone="accent">
          <TermTip id="pe">What's P/E?</TermTip>
        </Pill>
      </div>
      <p className="mt-1 text-sm text-muted">Change the share price and the company's earnings per share. See how the P/E and PEG respond.</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <Slider label="Share price" value={price} min={5} max={300} step={1} onChange={set(setPrice)} format={(v) => money(v, 0)} />
          <Slider label={<TermTip id="eps">Earnings per share</TermTip>} value={eps} min={-2} max={15} step={0.25} onChange={set(setEps)} format={(v) => money(v)} />
          <Slider label="Expected yearly earnings growth" value={growth} min={-10} max={60} step={1} onChange={set(setGrowth)} format={(v) => `${v}%`} />
        </div>
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-2 p-4">
              <div className="text-sm text-muted">P/E ratio</div>
              <div className="text-3xl font-bold tabular-nums">{pe === null ? "n/a" : num(pe, 1)}</div>
              <div className="text-xs text-muted">{pe === null ? "company is losing money" : `you pay ${money(pe)} per $1 of profit`}</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-4">
              <div className="text-sm text-muted">
                <TermTip id="peg">PEG ratio</TermTip>
              </div>
              <div className="text-3xl font-bold tabular-nums">{peg === null ? "n/a" : num(peg, 2)}</div>
              <div className="text-xs text-muted">{peg === null ? "needs profit & growth" : peg <= 1 ? "≈ fair or cheap for its growth" : peg <= 2 ? "a bit pricey for its growth" : "expensive for its growth"}</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-4">
              <div className="text-sm text-muted">Years to 'earn back' the price</div>
              <div className="text-3xl font-bold tabular-nums">{pe === null ? "∞" : num(pe, 0)}</div>
              <div className="text-xs text-muted">{earningsYield === null ? "" : `earnings yield ${num(earningsYield, 1)}%`}</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="relative h-3 rounded-full" style={{ background: "linear-gradient(90deg, var(--series-3), var(--surface-2) 45%, var(--series-2))" }}>
              {pe !== null && <div className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded bg-ink" style={{ left: `${marker * 100}%` }} aria-hidden />}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>0 (cheap)</span>
              <span>15–20 market avg</span>
              <span>60+ (expensive)</span>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm">💡 {verdict}</p>
        </div>
      </div>
    </Card>
  );
}

// ---------- 3. Dollar-cost averaging ----------
const PATHS: Record<string, { label: string; prices: number[] }> = {
  crash: { label: "Crash & recovery", prices: [50, 46, 40, 32, 28, 25, 27, 31, 36, 40, 45, 50] },
  rise: { label: "Steady climb", prices: [50, 51, 53, 54, 56, 58, 59, 61, 63, 64, 66, 68] },
  choppy: { label: "Choppy", prices: [50, 42, 55, 44, 58, 47, 52, 41, 54, 46, 53, 50] },
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DCAPlayground() {
  const [pathKey, setPathKey] = useState("crash");
  const [monthly, setMonthly] = useState(100);
  const tried = useTried("dca");
  const prices = PATHS[pathKey].prices;

  let shares = 0;
  let spent = 0;
  const rows = prices.map((p, i) => {
    const bought = monthly / p;
    shares += bought;
    spent += monthly;
    return { month: MONTHS[i], price: p, avgCost: Math.round((spent / shares) * 100) / 100, bought };
  });
  const finalPrice = prices[prices.length - 1];
  const dcaValue = shares * finalPrice;
  const lumpShares = (monthly * 12) / prices[0];
  const lumpValue = lumpShares * finalPrice;
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">📅 Dollar-cost averaging simulator</h2>
        <Pill tone="accent">
          <TermTip id="dca">What's DCA?</TermTip>
        </Pill>
      </div>
      <p className="mt-1 text-sm text-muted">Invest the same amount every month for a year. When prices dip, your money buys more shares.</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">Market scenario</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(PATHS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => {
                    setPathKey(k);
                    tried();
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${pathKey === k ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Invest each month"
            value={monthly}
            min={25}
            max={500}
            step={25}
            onChange={(v) => {
              setMonthly(v);
              tried();
            }}
            format={(v) => money(v, 0)}
          />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Total invested</span><strong>{money(spent, 0)}</strong></div>
            <div className="flex justify-between"><span className="text-muted">Shares owned</span><strong>{num(shares, 2)}</strong></div>
            <div className="flex justify-between"><span className="text-muted">Average price over the year</span><strong>{money(avgPrice)}</strong></div>
            <div className="flex justify-between"><span className="text-muted">Your average cost per share</span><strong className="text-gain">{money(spent / shares)}</strong></div>
          </div>
        </div>
        <div>
          <LineChartBox
            data={rows}
            xKey="month"
            series={[
              { key: "price", label: "Share price", color: "var(--series-1)" },
              { key: "avgCost", label: "Your average cost", color: "var(--series-2)", dashed: true },
            ]}
            yFormat={(v) => `$${v.toFixed(0)}`}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="text-sm text-muted">Monthly investing (DCA): end value</div>
              <div className="text-2xl font-bold tabular-nums">{money(dcaValue, 0)}</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="text-sm text-muted">All at once in January: end value</div>
              <div className="text-2xl font-bold tabular-nums">{money(lumpValue, 0)}</div>
            </div>
          </div>
          <p className="mt-3 rounded-xl bg-accent-soft p-3 text-sm">
            💡 Your average cost ({money(spent / shares)}) is {spent / shares < avgPrice ? "lower than" : "about equal to"} the average price ({money(avgPrice)}) because you automatically bought more shares when they were cheap.
            {lumpValue > dcaValue
              ? " In a rising market, investing everything up front usually wins, but DCA protects you from terrible timing and is how most people invest from each paycheque."
              : " Here DCA beat investing everything at once, because prices dipped after January."}
          </p>
        </div>
      </div>
    </Card>
  );
}
