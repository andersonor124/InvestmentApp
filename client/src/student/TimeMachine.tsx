import { useState } from "react";
import { LineChartBox } from "../components/Chart";
import { Button, Card, PageHeader, Pill } from "../components/ui";
import { outcome, SCENARIOS, type Choice, type Scenario } from "../content/history";
import { XP } from "../game/xp";
import { money } from "../lib/format";
import { useStore } from "../store";

const CHOICES: { id: Choice; label: string; emoji: string; text: string }[] = [
  { id: "sell", label: "Sell everything", emoji: "🏃", text: "Get out before it gets worse." },
  { id: "hold", label: "Hold", emoji: "🧘", text: "Stay invested and wait." },
  { id: "buy", label: "Buy more ($500)", emoji: "🛒", text: "Stocks are on sale!" },
];

export default function TimeMachine() {
  const [active, setActive] = useState<Scenario | null>(null);
  const { progress } = useStore();

  if (active) return <ScenarioPlayer scenario={active} onBack={() => setActive(null)} />;

  return (
    <div>
      <PageHeader
        emoji="⏳"
        title="Market Time Machine"
        subtitle="Travel back to real market crashes. You'll see what investors saw, feel the scary headline, and decide: sell, hold or buy more? Then find out what happened."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {SCENARIOS.map((s) => {
          const choice = progress.timeMachine[s.id];
          return (
            <button key={s.id} onClick={() => setActive(s)} className="rounded-2xl border border-line bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{s.emoji}</span>
                {choice ? <Pill tone="gain">✓ You chose: {choice}</Pill> : <Pill tone="accent">+{XP.timeMachine} XP</Pill>}
              </div>
              <div className="mt-2 text-lg font-bold">{s.title}</div>
              <div className="text-sm text-muted">{s.years}</div>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted">Prices are rounded, approximate S&amp;P 500 levels for teaching. Past results don't guarantee future results, and individual stocks can behave very differently from the whole market.</p>
    </div>
  );
}

function ScenarioPlayer({ scenario, onBack }: { scenario: Scenario; onBack: () => void }) {
  const { progress, updateProgress, toast, celebrate } = useStore();
  const [choice, setChoice] = useState<Choice | null>(null);
  const revealed = choice !== null;
  const shown = revealed ? scenario.points : scenario.points.slice(0, scenario.decisionIndex + 1);
  const start = scenario.points[0].price;
  const data = shown.map((p) => ({ date: p.date, value: Math.round((1000 * p.price) / start) }));
  const decisionDate = scenario.points[scenario.decisionIndex].date;

  function decide(c: Choice) {
    setChoice(c);
    const first = !progress.timeMachine[scenario.id];
    updateProgress((p) => ({ ...p, xp: p.xp + (first ? XP.timeMachine : 0), timeMachine: { ...p.timeMachine, [scenario.id]: c } }));
    if (first) toast({ emoji: "⏳", title: `+${XP.timeMachine} XP`, body: `Survived: ${scenario.title}` });
    if (c !== "sell") celebrate();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="text-sm font-semibold text-accent">
        ← All scenarios
      </button>
      <div className="mt-3">
        <PageHeader emoji={scenario.emoji} title={scenario.title} subtitle={scenario.intro} />
      </div>
      <Card>
        <div className="mb-2 text-sm font-semibold text-muted">Value of your $1,000</div>
        <LineChartBox
          data={data}
          xKey="date"
          series={[{ key: "value", label: "Your $1,000 in the S&P 500", color: "var(--series-1)" }]}
          yFormat={(v) => `$${v.toLocaleString()}`}
          referenceX={revealed ? decisionDate : undefined}
          referenceLabel="You decided here"
        />
      </Card>

      {!revealed ? (
        <Card className="mt-5 border-loss/40">
          <div className="text-xs font-bold uppercase tracking-wide text-loss">📰 Breaking news</div>
          <p className="mt-2 text-lg font-semibold">{scenario.headline}</p>
          <p className="mt-2 text-sm text-muted">
            Your $1,000 is now worth <strong className="text-loss">{money(data[data.length - 1].value, 0)}</strong>. What do you do?
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {CHOICES.map((c) => (
              <button key={c.id} onClick={() => decide(c.id)} className="rounded-xl border-2 border-line bg-surface p-4 text-left transition hover:border-accent">
                <div className="text-2xl">{c.emoji}</div>
                <div className="mt-1 font-semibold">{c.label}</div>
                <div className="text-xs text-muted">{c.text}</div>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="mt-5 space-y-5">
          <Card>
            <h2 className="text-lg font-bold">What happened next</h2>
            <p className="mt-2">{scenario.whatHappened}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {CHOICES.map((c) => {
                const o = outcome(scenario, c.id);
                const gain = o.final - o.invested;
                return (
                  <div key={c.id} className={`rounded-xl border-2 p-4 ${c.id === choice ? "border-accent bg-accent-soft" : "border-line"}`}>
                    <div className="text-sm font-semibold">
                      {c.emoji} {c.label} {c.id === choice && <span className="text-accent">(you)</span>}
                    </div>
                    <div className="mt-1 text-2xl font-bold tabular-nums">{money(o.final, 0)}</div>
                    <div className={`text-xs font-semibold ${gain >= 0 ? "text-gain" : "text-loss"}`}>
                      {gain >= 0 ? "+" : ""}
                      {money(gain, 0)} on {money(o.invested, 0)} invested
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="bg-accent-soft">
            <h2 className="font-bold">💡 The lesson</h2>
            <p className="mt-1 text-sm">{scenario.lesson}</p>
            {choice === "sell" && <p className="mt-2 text-sm">Selling felt safe, but it turned a temporary drop into a permanent loss. That's one of the most common and costly investing mistakes.</p>}
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setChoice(null)}>
              Try again
            </Button>
            <Button onClick={onBack}>Next scenario</Button>
          </div>
        </div>
      )}
    </div>
  );
}
