import { useState } from "react";
import { Button, Card, Pill, ProgressBar } from "../components/ui";
import type { Lesson } from "../content/lessons";
import { comboMultiplier, xpForAnswer, XP } from "../game/xp";
import { todayKey } from "../lib/format";
import { useStore } from "../store";

export function Quiz({ lesson, onFinish }: { lesson: Lesson; onFinish?: () => void }) {
  const { progress, updateProgress, toast, celebrate } = useStore();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [earned, setEarned] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<{ xp: number; lines: string[] } | null>(null);

  const previous = progress.lessons[lesson.id];
  const question = lesson.quiz[index];
  const answered = picked !== null;
  const isRight = picked === question?.answer;

  function choose(i: number) {
    if (answered) return;
    setPicked(i);
    const res = xpForAnswer(i === question.answer, combo);
    setCombo(res.combo);
    if (i === question.answer) {
      setEarned((e) => e + res.xp);
      setCorrect((c) => c + 1);
    } else {
      setWrongIds((w) => [...w, question.id]);
    }
  }

  function next() {
    if (index + 1 < lesson.quiz.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    finish();
  }

  function finish() {
    const total = lesson.quiz.length;
    const perfect = correct === total;
    const firstTime = !previous;
    const firstPerfect = perfect && !previous?.perfect;
    let xp = 0;
    const lines: string[] = [];
    if (firstTime) {
      xp += earned;
      lines.push(`+${earned} XP from answers (combos included)`);
      xp += XP.lessonComplete;
      lines.push(`+${XP.lessonComplete} XP lesson complete`);
    }
    if (firstPerfect) {
      xp += XP.perfectQuiz;
      lines.push(`+${XP.perfectQuiz} XP perfect score bonus`);
    }
    if (!firstTime && !firstPerfect) lines.push("Practice round: XP is only awarded on your first completion and first perfect score.");

    const today = todayKey();
    updateProgress((p) => {
      const cards = { ...p.cards };
      for (const id of wrongIds) cards[`q:${id}`] = { box: 1, due: today };
      return {
        ...p,
        xp: p.xp + xp,
        lessons: {
          ...p.lessons,
          [lesson.id]: { best: Math.max(correct, p.lessons[lesson.id]?.best ?? 0), total, perfect: perfect || Boolean(p.lessons[lesson.id]?.perfect) },
        },
        missed: [...new Set([...p.missed, ...wrongIds])],
      };
    });
    if (xp > 0) toast({ emoji: perfect ? "💯" : "✅", title: `Lesson complete! +${xp} XP`, body: lesson.title });
    if (perfect) celebrate();
    setSummary({ xp, lines });
    setFinished(true);
    onFinish?.();
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setCombo(0);
    setEarned(0);
    setCorrect(0);
    setWrongIds([]);
    setFinished(false);
    setSummary(null);
  }

  if (finished && summary) {
    const total = lesson.quiz.length;
    return (
      <Card className="text-center">
        <div className="text-5xl">{correct === total ? "🏆" : correct >= total - 1 ? "🎉" : "👍"}</div>
        <h3 className="mt-2 text-2xl font-bold">
          {correct}/{total} correct
        </h3>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {summary.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {wrongIds.length > 0 && <p className="mt-3 text-sm">The questions you missed were added to your <strong>flashcards</strong> so you can review them later.</p>}
        <div className="mt-5 flex justify-center gap-3">
          <Button variant="secondary" onClick={restart}>
            Retake quiz
          </Button>
        </div>
      </Card>
    );
  }

  const mult = comboMultiplier(combo);
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-muted">
          Question {index + 1} of {lesson.quiz.length}
        </div>
        <div className="flex items-center gap-2">
          {combo >= 2 && <Pill tone="warn">🔥 {combo} in a row{mult > 1 ? ` · ×${mult} XP` : ""}</Pill>}
          <Pill tone="accent">+{earned} XP</Pill>
        </div>
      </div>
      <ProgressBar value={(index + (answered ? 1 : 0)) / lesson.quiz.length} />
      <h3 className="mt-5 text-lg font-semibold">{question.q}</h3>
      <div className="mt-4 grid gap-2">
        {question.options.map((opt, i) => {
          let style = "border-line bg-surface hover:border-accent";
          if (answered && i === question.answer) style = "border-gain bg-gain-soft";
          else if (answered && i === picked) style = "border-loss bg-loss-soft";
          else if (answered) style = "border-line bg-surface opacity-60";
          return (
            <button key={i} onClick={() => choose(i)} disabled={answered} className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${style}`}>
              <span className="mr-2 font-bold text-muted">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`animate-pop mt-4 rounded-xl p-4 text-sm ${isRight ? "bg-gain-soft" : "bg-loss-soft"}`}>
          <div className={`font-bold ${isRight ? "text-gain" : "text-loss"}`}>{isRight ? "Correct! 🎯" : "Not quite."}</div>
          <p className="mt-1">{question.explain}</p>
        </div>
      )}
      {answered && (
        <div className="mt-4 text-right">
          <Button onClick={next}>{index + 1 < lesson.quiz.length ? "Next question →" : "See results"}</Button>
        </div>
      )}
    </Card>
  );
}
