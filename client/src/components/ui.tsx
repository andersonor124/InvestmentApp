import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TERM_BY_ID } from "../content/glossary";
import { useStore } from "../store";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, emoji, children }: { title: string; subtitle?: ReactNode; emoji?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

type Tone = "neutral" | "accent" | "gain" | "loss" | "warn";
const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent",
  gain: "bg-gain-soft text-gain",
  loss: "bg-loss-soft text-loss",
  warn: "bg-warn-soft text-warn",
};

export function Pill({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass[tone]} ${className}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary: "bg-accent text-accent-ink hover:opacity-90",
    secondary: "border border-line bg-surface hover:bg-surface-2",
    ghost: "hover:bg-surface-2",
    danger: "border border-line text-loss hover:bg-loss-soft",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums ${tone ?? ""}`}>{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-loss/30 bg-loss-soft p-4 text-sm text-loss">
      <p className="font-semibold">Couldn't load data</p>
      <p className="mt-1">{message}. Is the server running (npm run dev)?</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}

/** Tells people whether they're looking at live or sample data. */
export function DataBanner() {
  const { status, screener } = useStore();
  if (!status) return null;
  if (!status.live) {
    return (
      <div className="mb-5 rounded-xl border border-warn/30 bg-warn-soft px-4 py-2.5 text-sm text-warn">
        <strong>Sample data:</strong> prices and ratios are illustrative and simulated, not live. Add a free <code>FINNHUB_API_KEY</code> to the server's <code>.env</code> for real market data.
      </div>
    );
  }
  if (screener && screener.source === "mixed") {
    return (
      <div className="mb-5 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-muted">
        Loading live data: {screener.liveCount}/{screener.stocks.length} stocks updated so far (the free data plan limits requests per minute). Refresh in a minute for more.
      </div>
    );
  }
  return null;
}

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`text-muted ${compact ? "text-xs" : "text-sm"}`}>
      <strong>Educational tool, not personalized financial advice.</strong> Scores come from a simple, published formula applied to public data, which can be delayed or wrong. Do your own research, consider your full situation, and consult a licensed advisor before investing. Past performance doesn't guarantee future results.
    </p>
  );
}

/** A glossary term with a hover/tap tooltip and a link to its full entry. */
export function TermTip({ id, children }: { id: string; children?: ReactNode }) {
  const term = TERM_BY_ID[id];
  const [open, setOpen] = useState(false);
  if (!term) return <>{children}</>;
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b-2 border-dotted border-accent font-semibold text-accent"
        aria-describedby={`tip-${id}`}
      >
        {children ?? term.term}
      </button>
      {open && (
        <span
          id={`tip-${id}`}
          role="tooltip"
          className="animate-pop absolute bottom-full left-1/2 z-30 mb-2 block w-64 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-left text-sm font-normal text-ink shadow-xl"
        >
          <span className="block font-semibold">{term.term}</span>
          <span className="mt-1 block text-muted">{term.short}</span>
          <Link to={`/student/glossary?term=${id}`} className="mt-2 block text-xs font-semibold text-accent" onMouseDown={(e) => e.preventDefault()}>
            Full explanation →
          </Link>
        </span>
      )}
    </span>
  );
}

/** Renders text where [[term-id]] / [[term-id|label]] become glossary tooltips. */
export function TermText({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
        if (!m) return <span key={i}>{part}</span>;
        return (
          <TermTip key={i} id={m[1]}>
            {m[2] ?? TERM_BY_ID[m[1]]?.term ?? m[1]}
          </TermTip>
        );
      })}
    </>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}
