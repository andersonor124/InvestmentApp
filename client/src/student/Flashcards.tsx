import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, PageHeader, Pill, ProgressBar } from "../components/ui";
import { GLOSSARY, TERM_BY_ID } from "../content/glossary";
import { ALL_QUESTIONS } from "../content/lessons";
import { BOX_INTERVAL_DAYS, isDue, reviewCard, XP } from "../game/xp";
import { todayKey } from "../lib/format";
import { useStore } from "../store";

interface Flashcard {
  key: string;
  kind: "term" | "question";
  front: string;
  back: { title: string; lines: string[] };
}

const QUESTION_BY_ID = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]));

function buildCard(key: string): Flashcard | null {
  const [kind, id] = key.split(/:(.+)/);
  if (kind === "term") {
    const t = TERM_BY_ID[id];
    return t ? { key, kind: "term", front: t.term, back: { title: t.short, lines: [t.analogy] } } : null;
  }
  const q = QUESTION_BY_ID[id];
  return q ? { key, kind: "question", front: q.q, back: { title: q.options[q.answer], lines: [q.explain] } } : null;
}

export default function Flashcards() {
  const { progress, updateProgress, toast } = useStore();
  const today = todayKey();
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionRight, setSessionRight] = useState(0);

  // The deck is built once per visit so cards don't jump around while you review.
  const [deck, setDeck] = useState<string[]>(() =>
    Object.entries(progress.cards)
      .filter(([, c]) => isDue(c, today))
      .map(([k]) => k)
      .sort(() => Math.random() - 0.5),
  );
  const card = useMemo(() => (deck.length ? buildCard(deck[0]) : null), [deck]);
  const total = Object.keys(progress.cards).length;

  function answer(gotIt: boolean) {
    if (!card) return;
    updateProgress((p) => ({
      ...p,
      xp: p.xp + (gotIt ? XP.flashcardCorrect : 0),
      reviewed: p.reviewed + 1,
      cards: { ...p.cards, [card.key]: reviewCard(p.cards[card.key], gotIt, today) },
      missed: gotIt && card.kind === "question" && (p.cards[card.key]?.box ?? 0) >= 3 ? p.missed.filter((m) => `q:${m}` !== card.key) : p.missed,
    }));
    setSessionDone((n) => n + 1);
    if (gotIt) setSessionRight((n) => n + 1);
    setFlipped(false);
    // "Still learning" cards come back at the end of this session.
    setDeck((d) => (gotIt ? d.slice(1) : [...d.slice(1), d[0]]));
    if (deck.length === 1 && gotIt) toast({ emoji: "🧠", title: "Review complete!", body: `+${(sessionRight + 1) * XP.flashcardCorrect} XP this session` });
  }

  function addAllTerms() {
    updateProgress((p) => {
      const cards = { ...p.cards };
      for (const t of GLOSSARY) cards[`term:${t.id}`] ??= { box: 0, due: today };
      return { ...p, cards };
    });
    setDeck((d) => [...new Set([...d, ...GLOSSARY.map((t) => `term:${t.id}`).filter((k) => isDue(progress.cards[k], today))])]);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        emoji="🧠"
        title="Flashcards"
        subtitle="Spaced repetition: cards you know come back less often (1 → 3 → 7 → 14 → 30 days); cards you miss come back soon. Terms you open in the glossary and quiz questions you miss land here automatically."
      />

      {card ? (
        <>
          <div className="mb-3 flex items-center justify-between text-sm text-muted">
            <span>{deck.length} card{deck.length === 1 ? "" : "s"} left today</span>
            <span>
              {sessionRight}/{sessionDone} remembered
            </span>
          </div>
          <ProgressBar value={sessionDone / (sessionDone + deck.length)} />
          <button
            onClick={() => setFlipped((f) => !f)}
            className="mt-4 flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-line bg-surface p-8 text-center shadow-sm transition hover:border-accent"
            aria-label={flipped ? "Hide answer" : "Show answer"}
          >
            <Pill tone="accent">{card.kind === "term" ? "What does this mean?" : "Quiz question you missed"}</Pill>
            <div className="mt-4 text-2xl font-bold">{card.front}</div>
            {flipped ? (
              <div className="animate-pop mt-5 border-t border-line pt-5">
                <div className="text-lg font-semibold text-accent">{card.back.title}</div>
                {card.back.lines.map((l) => (
                  <p key={l} className="mt-2 text-sm text-muted">
                    {l}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-sm text-muted">Think of your answer, then tap to flip</div>
            )}
          </button>
          {flipped && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => answer(false)}>
                😅 Still learning
              </Button>
              <Button onClick={() => answer(true)}>😎 Got it (+{XP.flashcardCorrect} XP)</Button>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted">Box {progress.cards[card.key]?.box ?? 0} of {BOX_INTERVAL_DAYS.length - 1}</p>
        </>
      ) : (
        <Card className="text-center">
          <div className="text-5xl">{total ? "🎉" : "📭"}</div>
          <h2 className="mt-2 text-xl font-bold">{total ? "All caught up for today!" : "No flashcards yet"}</h2>
          <p className="mt-1 text-sm text-muted">
            {total
              ? `You have ${total} cards in your collection. Come back tomorrow to keep your streak going.`
              : "Open terms in the glossary or take a quiz, and cards will appear here."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button onClick={addAllTerms}>Add all {GLOSSARY.length} glossary terms</Button>
            <Link to="/student/glossary">
              <Button variant="secondary">Explore the glossary</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
