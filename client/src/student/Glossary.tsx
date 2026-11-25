import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { StockMetrics } from "../../../shared/types";
import { DataBanner, PageHeader, Pill } from "../components/ui";
import { GLOSSARY, type Term } from "../content/glossary";
import { XP } from "../game/xp";
import { bigMoney, num, pct, todayKey } from "../lib/format";
import { useStore } from "../store";

const CATEGORIES = ["All", ...new Set(GLOSSARY.map((t) => t.category))];

export default function Glossary() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const openId = params.get("term");
  const { progress, updateProgress } = useStore();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter(
      (t) => (category === "All" || t.category === category) && (!q || t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q)),
    );
  }, [query, category]);

  function open(id: string | null) {
    if (id) setParams({ term: id }, { replace: true });
    else setParams({}, { replace: true });
  }

  useEffect(() => {
    if (!openId) return;
    document.getElementById(`term-${openId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!progress.viewedTerms.includes(openId)) {
      updateProgress((p) =>
        p.viewedTerms.includes(openId)
          ? p
          : {
              ...p,
              xp: p.xp + XP.firstTermView,
              viewedTerms: [...p.viewedTerms, openId],
              cards: { ...p.cards, [`term:${openId}`]: p.cards[`term:${openId}`] ?? { box: 0, due: todayKey() } },
            },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  return (
    <div>
      <PageHeader
        emoji="📖"
        title="Glossary"
        subtitle={`Every term explained like you're 15, with an analogy and real company numbers. Opening a term earns +${XP.firstTermView} XP and adds it to your flashcards. You've explored ${progress.viewedTerms.length}/${GLOSSARY.length}.`}
      />
      <DataBanner />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms (e.g. P/E, dividend)…"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 sm:max-w-xs"
          aria-label="Search glossary"
        />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${category === c ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted hover:text-ink"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <TermCard key={t.id} term={t} open={openId === t.id} viewed={progress.viewedTerms.includes(t.id)} onToggle={() => open(openId === t.id ? null : t.id)} />
        ))}
        {filtered.length === 0 && <p className="text-muted">No terms match “{query}”.</p>}
      </div>
    </div>
  );
}

function TermCard({ term, open, viewed, onToggle }: { term: Term; open: boolean; viewed: boolean; onToggle: () => void }) {
  return (
    <div id={`term-${term.id}`} className={`rounded-2xl border bg-surface transition ${open ? "border-accent shadow-md" : "border-line"}`}>
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 p-4 text-left" aria-expanded={open}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{term.term}</span>
            <Pill>{term.category}</Pill>
            {viewed && <span className="text-xs text-gain">✓ explored</span>}
          </div>
          <p className="mt-0.5 text-sm text-muted">{term.short}</p>
        </div>
        <span className={`text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="animate-pop space-y-4 border-t border-line p-4 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold">🧒 In plain English</h3>
            <p className="mt-1">{term.plain}</p>
          </div>
          <div className="rounded-xl bg-warn-soft p-3">
            <h3 className="font-semibold">🍋 Think of it like…</h3>
            <p className="mt-1">{term.analogy}</p>
          </div>
          <div>
            <h3 className="font-semibold">💡 Why it matters</h3>
            <p className="mt-1">{term.why}</p>
          </div>
          {term.normal && (
            <div>
              <h3 className="font-semibold">📏 What's normal?</h3>
              <p className="mt-1">{term.normal}</p>
            </div>
          )}
          {term.compare && <RealCompare compare={term.compare} />}
        </div>
      )}
    </div>
  );
}

function RealCompare({ compare }: { compare: NonNullable<Term["compare"]> }) {
  const { screener } = useStore();
  const rows = compare.symbols
    .map((s) => screener?.stocks.find((x) => x.symbol === s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  if (!rows.length) return null;

  const fmt = (v: number | null) =>
    compare.unit === "%" ? pct(v) : compare.unit === "cap" ? bigMoney(v) : compare.unit === "$" ? `$${num(v, 2)}` : v === null ? "n/a" : `${num(v, 1)}×`;
  const values = rows.map((r) => r[compare.metric as keyof StockMetrics] as number | null);
  const max = Math.max(...values.map((v) => Math.abs(v ?? 0)), 1e-9);

  return (
    <div className="rounded-xl border border-line p-3">
      <h3 className="font-semibold">🏢 Real companies, real numbers</h3>
      <div className="mt-3 space-y-2">
        {rows.map((r, i) => {
          const v = values[i];
          return (
            <div key={r.symbol} className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-2 sm:grid-cols-[10rem_1fr_5rem]">
              <span className="truncate text-sm">
                <strong>{r.symbol}</strong> <span className="text-muted">{r.name}</span>
              </span>
              <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                <div className={`h-full rounded-full ${v !== null && v < 0 ? "bg-loss" : "bg-accent"}`} style={{ width: `${(Math.abs(v ?? 0) / max) * 100}%` }} />
              </div>
              <span className="text-right text-sm font-semibold tabular-nums">{v === null && compare.metric === "pe" ? "no profit" : fmt(v)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-muted">{compare.takeaway}</p>
    </div>
  );
}
