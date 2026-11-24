import { useState } from "react";
import type { FactorKey, PickLabel, ScoredStock, Weights } from "../../../shared/types";
import { Button, Disclaimer, Pill } from "../components/ui";
import { load, save } from "../lib/storage";

export const FACTOR_INFO: Record<FactorKey, { label: string; text: string }> = {
  value: { label: "Value", text: "P/E and P/S vs sector peers and the whole list (cheaper scores higher)." },
  growth: { label: "Growth", text: "Last-year growth in earnings per share and revenue." },
  quality: { label: "Quality", text: "Return on equity and net profit margin." },
  health: { label: "Financial health", text: "Debt-to-equity (lower is better) and current ratio. Banks score neutral." },
  momentum: { label: "Momentum", text: "1-year price return and how close the price is to its 52-week high." },
};

export function LabelPill({ label, downgraded }: { label: PickLabel; downgraded?: boolean }) {
  const tone = label === "Consider Buying" ? "gain" : label === "Watch" ? "warn" : "neutral";
  const icon = label === "Consider Buying" ? "▲" : label === "Watch" ? "◆" : "–";
  return (
    <Pill tone={tone}>
      <span aria-hidden>{icon}</span> {label}
      {downgraded && <span title="Lowered from Consider Buying because of red flags"> ⚑</span>}
    </Pill>
  );
}

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size / 3.2} fontWeight={700} fill="var(--text)">
        {score}
      </text>
    </svg>
  );
}

export function FactorBars({ stock, weights }: { stock: ScoredStock; weights: Weights }) {
  return (
    <div className="space-y-2.5">
      {(Object.keys(FACTOR_INFO) as FactorKey[]).map((f) => (
        <div key={f} title={FACTOR_INFO[f].text}>
          <div className="flex justify-between text-sm">
            <span>
              {FACTOR_INFO[f].label} <span className="text-xs text-muted">({Math.round(weights[f] * 100)}% weight)</span>
            </span>
            <span className="font-semibold tabular-nums">{stock.factors[f]}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent" style={{ width: `${stock.factors[f]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shown once per browser before adults see any picks. */
export function DisclaimerGate() {
  const [accepted, setAccepted] = useState(() => load("disclaimer", { accepted: false }).accepted);
  if (accepted) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className="animate-pop max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl">
        <h2 id="disclaimer-title" className="text-xl font-bold">
          Before you look at picks
        </h2>
        <div className="mt-3 space-y-3 text-sm">
          <p>StockSmart ranks stocks with a simple, transparent formula. "Consider Buying" means the numbers look favourable <em>relative to the other stocks on this list</em>, not that a stock will go up.</p>
          <ul className="list-inside list-disc space-y-1 text-muted">
            <li>It doesn't know your finances, goals, taxes or time horizon.</li>
            <li>Data can be delayed, incomplete or wrong, and the formula ignores news, competition and management.</li>
            <li>Diversified, low-cost index funds remain a strong default for most people.</li>
          </ul>
          <Disclaimer />
        </div>
        <Button
          className="mt-5 w-full"
          onClick={() => {
            save("disclaimer", { accepted: true });
            setAccepted(true);
          }}
        >
          I understand
        </Button>
      </div>
    </div>
  );
}
