import { Link } from "react-router-dom";
import { PageHeader, Pill } from "../components/ui";
import { LESSONS } from "../content/lessons";
import { useStore } from "../store";

export default function LessonList() {
  const { progress } = useStore();
  return (
    <div>
      <PageHeader emoji="📚" title="Lessons" subtitle="Ten short lessons, from 'what is a stock?' to TFSAs. Each ends with a quiz worth XP. Answer streaks multiply your points!" />
      <div className="grid gap-4 md:grid-cols-2">
        {LESSONS.map((l, i) => {
          const r = progress.lessons[l.id];
          return (
            <Link key={l.id} to={`/student/lessons/${l.id}`} className="flex gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-3xl">{l.emoji}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>Lesson {i + 1}</span>·<span>{l.minutes} min</span>
                  {r && <Pill tone="gain">{r.perfect ? "💯 Perfect" : `✓ ${r.best}/${r.total}`}</Pill>}
                </div>
                <div className="mt-0.5 font-semibold">{l.title}</div>
                <p className="text-sm text-muted">{l.summary}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
