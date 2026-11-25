import { useState } from "react";
import { Link } from "react-router-dom";
import { PROFILE_WEIGHTS } from "../../../shared/constants";
import type { FactorKey, RiskProfile } from "../../../shared/types";
import { Button, Card, PageHeader } from "../components/ui";
import { ALLOCATIONS, CORE_CANADIAN_ETFS } from "../content/canada";
import { useStore } from "../store";
import { FACTOR_INFO } from "./common";

const QUESTIONS: { id: string; q: string; options: string[] }[] = [
  { id: "horizon", q: "When will you need most of this money?", options: ["Within 3 years", "3–7 years", "7–15 years", "15+ years"] },
  { id: "drop", q: "Your portfolio falls 30% in a month. What do you do?", options: ["Sell everything", "Sell some to limit losses", "Hold and wait", "Buy more while prices are low"] },
  { id: "goal", q: "What's your main goal?", options: ["Protect what I have", "Steady income (dividends/interest)", "Balanced growth", "Maximum long-term growth"] },
  { id: "experience", q: "How much investing experience do you have?", options: ["None", "A little (a few years, mostly funds)", "Moderate (stocks & funds)", "Lots (through several downturns)"] },
  { id: "safety", q: "Do you have an emergency fund and stable income?", options: ["No", "Some savings, income varies", "Mostly", "Yes, 3–6 months saved and steady income"] },
  { id: "range", q: "Which yearly range of outcomes could you live with?", options: ["Best +6%, worst −3%", "Best +15%, worst −10%", "Best +25%, worst −20%", "Best +35%, worst −35%"] },
];


export function riskFromAnswers(answers: Record<string, number>): RiskProfile {
  if (answers.horizon === 0) return "conservative"; // money needed soon shouldn't be in stocks
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  if (total <= 7) return "conservative";
  if (total <= 12) return "balanced";
  return "aggressive";
}

export default function Profile() {
  const { investor, setInvestor, toast } = useStore();
  const [answers, setAnswers] = useState<Record<string, number>>(investor.answers);
  const [editing, setEditing] = useState(!investor.completed);
  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  function save() {
    const risk = riskFromAnswers(answers);
    setInvestor({ risk, answers, completed: true });
    setEditing(false);
    toast({ emoji: "🎯", title: `Profile saved: ${risk}`, body: "Your stock scores now use these weights." });
  }

  const risk = editing ? null : investor.risk;
  const alloc = risk ? ALLOCATIONS[risk] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Investor profile" subtitle="Six quick questions tune the score weights to how much risk you can take, and suggest an overall asset mix." />

      {editing ? (
        <Card>
          <ol className="space-y-6">
            {QUESTIONS.map((q, i) => (
              <li key={q.id}>
                <fieldset>
                  <legend className="font-semibold">
                    {i + 1}. {q.q}
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oi) => (
                      <label key={opt} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${answers[q.id] === oi ? "border-accent bg-accent-soft" : "border-line hover:border-accent"}`}>
                        <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} className="sr-only" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          <Button className="mt-6 w-full" disabled={!allAnswered} onClick={save}>
            {allAnswered ? "See my profile" : `Answer all ${QUESTIONS.length} questions`}
          </Button>
        </Card>
      ) : (
        risk &&
        alloc && (
          <>
            <Card className="bg-accent-soft">
              <div className="text-sm text-muted">Your risk profile</div>
              <div className="text-3xl font-bold capitalize">{risk}</div>
              <p className="mt-1 text-sm">{alloc.note}</p>
              {investor.answers.horizon === 0 && (
                <p className="mt-2 rounded-lg bg-warn-soft p-2 text-sm text-warn">You need this money within 3 years. Money with a short horizon generally belongs in savings, GICs or short-term bonds rather than stocks.</p>
              )}
              <Button variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
                Retake quiz
              </Button>
            </Card>

            <Card>
              <h2 className="text-lg font-bold">Suggested overall mix</h2>
              <div className="mt-3 flex h-6 gap-0.5 overflow-hidden rounded-full">
                <div className="bg-series-1" style={{ width: `${alloc.stocks}%` }} title={`Stocks ${alloc.stocks}%`} />
                <div className="bg-series-2" style={{ width: `${alloc.bonds}%` }} title={`Bonds ${alloc.bonds}%`} />
                {alloc.cash > 0 && <div className="bg-series-3" style={{ width: `${alloc.cash}%` }} title={`Cash ${alloc.cash}%`} />}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-series-1" />Stocks {alloc.stocks}%</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-series-2" />Bonds {alloc.bonds}%</span>
                {alloc.cash > 0 && <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-series-3" />Cash {alloc.cash}%</span>}
              </div>
              <p className="mt-3 text-sm">
                🍁 One-ticket Canadian example: <strong>{alloc.example}</strong>. Individual stocks from the picks list are best kept to a slice of the stock portion, with no single stock above <strong>{alloc.singleStockCap}%</strong> of your total portfolio.
              </p>
            </Card>

            <Card>
              <h2 className="text-lg font-bold">How your score weights changed</h2>
              <div className="mt-3 space-y-2">
                {(Object.keys(FACTOR_INFO) as FactorKey[]).map((f) => (
                  <div key={f} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
                    <span>{FACTOR_INFO[f].label}</span>
                    <div className="h-2.5 rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${PROFILE_WEIGHTS[risk][f] * 250}%` }} />
                    </div>
                    <span className="text-right tabular-nums">{Math.round(PROFILE_WEIGHTS[risk][f] * 100)}%</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">Conservative profiles lean on value and balance-sheet strength; aggressive ones lean on growth and momentum.</p>
              <Link to="/adult/picks" className="mt-3 inline-block text-sm font-semibold text-accent">
                See your re-ranked picks →
              </Link>
            </Card>

            <Card>
              <h2 className="text-lg font-bold">Core building blocks (Canada)</h2>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {CORE_CANADIAN_ETFS.map((e) => (
                    <tr key={e.symbol} className="border-t border-line first:border-0">
                      <td className="py-2 pr-3 font-semibold">{e.symbol}</td>
                      <td className="py-2">{e.name}</td>
                      <td className="py-2 text-right text-muted">MER {e.mer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted">MERs are approximate. Check the fund provider's site for current figures. Listed for education, not as a recommendation.</p>
            </Card>
          </>
        )
      )}
    </div>
  );
}
