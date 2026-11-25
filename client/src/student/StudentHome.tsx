import { Link } from "react-router-dom";
import { Button, Card, ProgressBar } from "../components/ui";
import { GLOSSARY } from "../content/glossary";
import { LESSONS } from "../content/lessons";
import { BADGES, isDue, levelFor } from "../game/xp";
import { todayKey } from "../lib/format";
import { useStore } from "../store";

const TOOLS = [
  { to: "/student/playgrounds", emoji: "🧪", title: "Playgrounds", text: "Drag sliders: compounding, P/E and dollar-cost averaging." },
  { to: "/student/time-machine", emoji: "⏳", title: "Time Machine", text: "Live through real market crashes. Hold or sell?" },
  { to: "/student/portfolio", emoji: "💼", title: "Practice Portfolio", text: "$10,000 of pretend money and challenges to beat." },
  { to: "/student/checkup", emoji: "🩺", title: "Company Checkup", text: "Look up any company and read its vital signs." },
  { to: "/student/review", emoji: "🧠", title: "Flashcards", text: "Quick reviews that bring back what you missed." },
  { to: "/student/tutor", emoji: "💬", title: "Ask Penny", text: "An AI tutor that explains anything, step by step." },
];

export default function StudentHome() {
  const { progress, resetStudent } = useStore();
  const level = levelFor(progress.xp);
  const done = Object.keys(progress.lessons).length;
  const nextLesson = LESSONS.find((l) => !progress.lessons[l.id]);
  const today = todayKey();
  const dueCards = GLOSSARY.filter((t) => progress.cards[`term:${t.id}`] && isDue(progress.cards[`term:${t.id}`], today)).length +
    progress.missed.filter((id) => isDue(progress.cards[`q:${id}`], today)).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-4xl">{level.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted">Level {level.index + 1}</div>
              <div className="text-2xl font-bold">{level.name}</div>
              <ProgressBar value={level.progress} className="mt-2" />
              <div className="mt-1 text-xs text-muted">
                {progress.xp} XP{level.next ? ` · ${level.next.min - progress.xp} XP to ${level.next.name}` : " · max level!"}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">🔥 {progress.streak.count}</div>
                <div className="text-xs text-muted">day streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{done}/{LESSONS.length}</div>
                <div className="text-xs text-muted">lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{progress.badges.length}</div>
                <div className="text-xs text-muted">badges</div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          {nextLesson ? (
            <>
              <div>
                <div className="text-sm font-semibold text-accent">Up next</div>
                <div className="mt-1 text-xl font-bold">
                  {nextLesson.emoji} {nextLesson.title}
                </div>
                <p className="mt-1 text-sm text-muted">{nextLesson.summary}</p>
              </div>
              <Link to={`/student/lessons/${nextLesson.id}`} className="mt-4">
                <Button className="w-full">Start lesson · {nextLesson.minutes} min</Button>
              </Link>
            </>
          ) : (
            <div>
              <div className="text-xl font-bold">🎓 All lessons complete!</div>
              <p className="mt-1 text-sm text-muted">Keep your streak alive with flashcards, and try to beat the market in your portfolio.</p>
            </div>
          )}
          {dueCards > 0 && (
            <Link to="/student/review" className="mt-3 text-sm font-semibold text-accent">
              🧠 {dueCards} flashcard{dueCards > 1 ? "s" : ""} due for review →
            </Link>
          )}
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Your learning path</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LESSONS.map((l, i) => {
            const result = progress.lessons[l.id];
            return (
              <li key={l.id}>
                <Link
                  to={`/student/lessons/${l.id}`}
                  className={`block h-full rounded-2xl border p-4 transition hover:-translate-y-0.5 ${result ? "border-gain/40 bg-gain-soft" : "border-line bg-surface"}`}
                >
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Lesson {i + 1}</span>
                    {result && <span className="font-semibold text-gain">{result.perfect ? "💯" : "✓"} {result.best}/{result.total}</span>}
                  </div>
                  <div className="mt-1 text-2xl">{l.emoji}</div>
                  <div className="mt-1 text-sm font-semibold leading-snug">{l.title}</div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Tools & games</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="text-2xl">{t.emoji}</div>
              <div className="mt-1 font-semibold">{t.title}</div>
              <p className="text-sm text-muted">{t.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const earned = progress.badges.includes(b.id);
            return (
              <div key={b.id} className={`rounded-2xl border p-3 text-center ${earned ? "border-accent/40 bg-accent-soft" : "border-line bg-surface opacity-60"}`} title={b.description}>
                <div className={`text-3xl ${earned ? "" : "grayscale"}`}>{earned ? b.emoji : "🔒"}</div>
                <div className="mt-1 text-sm font-semibold">{b.name}</div>
                <div className="text-xs text-muted">{b.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("Reset all your XP, lessons, badges and practice portfolio? This can't be undone.")) resetStudent();
          }}
          className="text-xs text-muted"
        >
          Reset my progress
        </Button>
      </div>
    </div>
  );
}
