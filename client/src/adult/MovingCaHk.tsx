import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, PageHeader, Pill, ProgressBar } from "../components/ui";
import { CROSSBORDER_LAST_REVIEWED, LINKS, MONEY_MOVES, MOVE_PHASES, TREATY, WATCH_OUTS } from "../content/crossborder";
import { load, save } from "../lib/storage";

const TOTAL_STEPS = MOVE_PHASES.reduce((n, p) => n + p.steps.length, 0);
const stepKey = (phase: string, i: number) => `${phase}:${i}`;

export default function MovingCaHk() {
  const [done, setDone] = useState<Record<string, boolean>>(() => load("move-checklist", {} as Record<string, boolean>));
  useEffect(() => {
    save("move-checklist", done);
  }, [done]);
  const completed = Object.values(done).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="🍁 ➜ 🇭🇰 Moving from Canada to Hong Kong"
        subtitle={`Residency, tax filing in both places, the Canada–Hong Kong tax treaty, and moving your money. General information only, last reviewed ${CROSSBORDER_LAST_REVIEWED}. Rules change, and personal situations differ, so confirm with the CRA and IRD or a cross-border tax professional.`}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-2xl">🧭</div>
          <div className="mt-1 font-semibold">Residency is about ties, not passports</div>
          <p className="text-sm text-muted">Canada taxes residents on worldwide income. Leaving properly means cutting significant ties (home, spouse, dependants).</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl">🧾</div>
          <div className="mt-1 font-semibold">Leaving Canada has a tax bill of its own</div>
          <p className="text-sm text-muted">Your final return may include "departure tax" on unsold investment gains. Registered accounts and Canadian real estate are excluded.</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl">🇭🇰</div>
          <div className="mt-1 font-semibold">Hong Kong taxes where income is earned</div>
          <p className="text-sm text-muted">Salaries tax on Hong Kong work; no tax on capital gains, dividends or most interest. The treaty caps Canadian tax on income you still receive from Canada.</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold">🤝 The Canada–Hong Kong tax treaty</h2>
        <p className="mt-2 text-sm">{TREATY.summary}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr>
                <th className="py-2 pr-3">Income from Canada, received while living in HK</th>
                <th className="pr-3">Canada's usual tax for non-residents</th>
                <th className="pr-3">With the treaty</th>
                <th>Good to know</th>
              </tr>
            </thead>
            <tbody>
              {TREATY.rows.map((r) => (
                <tr key={r.item} className="border-t border-line align-top">
                  <td className="py-2.5 pr-3 font-semibold">{r.item}</td>
                  <td className="py-2.5 pr-3">{r.withoutTreaty}</td>
                  <td className="py-2.5 pr-3 font-semibold text-accent">{r.withTreaty}</td>
                  <td className="py-2.5 text-muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 rounded-xl bg-surface-2 p-4">
          <h3 className="font-semibold">What if both places say you're their resident? The tie-breaker</h3>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
            {TREATY.tieBreaker.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
        <a href={TREATY.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-accent">
          Hong Kong IRD (double taxation agreements) ↗
        </a>
      </Card>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">✅ Your moving checklist</h2>
            <p className="text-sm text-muted">Tick steps off as you go. Your progress is saved in this browser.</p>
          </div>
          <div className="w-56">
            <div className="text-right text-sm font-semibold tabular-nums">
              {completed}/{TOTAL_STEPS} done
            </div>
            <ProgressBar value={completed / TOTAL_STEPS} className="mt-1" />
          </div>
        </div>
        <ol className="space-y-4">
          {MOVE_PHASES.map((phase, pi) => (
            <li key={phase.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">{pi + 1}</span>
                  <h3 className="text-lg font-bold">
                    {phase.emoji} {phase.title}
                  </h3>
                  <Pill>{phase.when}</Pill>
                </div>
                <ul className="mt-4 space-y-3">
                  {phase.steps.map((s, i) => {
                    const key = stepKey(phase.id, i);
                    return (
                      <li key={key}>
                        <label className="flex cursor-pointer gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(done[key])}
                            onChange={(e) => setDone((d) => ({ ...d, [key]: e.target.checked }))}
                            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                          />
                          <span>
                            <span className={`font-semibold ${done[key] ? "text-muted line-through" : ""}`}>{s.title}</span>
                            <span className="mt-0.5 block text-sm text-muted">{s.detail}</span>
                            {s.forms && <span className="mt-1 block text-xs font-medium text-accent">📝 {s.forms}</span>}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <a href={phase.link.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-accent">
                  {phase.link.label} ↗
                </a>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">💸 Moving money between Canada and Hong Kong</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MONEY_MOVES.map((m) => (
            <Card key={m.title}>
              <h3 className="font-bold">{m.title}</h3>
              <p className="mt-1 text-sm">{m.detail}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Official info:{" "}
          <a href={LINKS.cbsa} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
            CBSA (Canada border) ↗
          </a>{" "}
          ·{" "}
          <a href={LINKS.hkCustoms} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
            Hong Kong Customs ↗
          </a>
        </p>
      </section>

      <Card className="border-warn/40 bg-warn-soft">
        <h2 className="text-xl font-bold">⚠️ Things people often get wrong</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {WATCH_OUTS.map((w) => (
            <li key={w} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-sm text-muted">
        See also:{" "}
        <Link to="/adult/canada" className="font-semibold text-accent">
          Canadian and Hong Kong accounts & tax →
        </Link>
      </p>
    </div>
  );
}
