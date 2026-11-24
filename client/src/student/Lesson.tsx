import { Link, useParams } from "react-router-dom";
import { Button, Card, PageHeader, TermText } from "../components/ui";
import { LESSON_BY_ID, LESSONS } from "../content/lessons";
import { STORY } from "../content/story";
import { Quiz } from "./Quiz";

export default function Lesson() {
  const { id = "" } = useParams();
  const lesson = LESSON_BY_ID[id];
  if (!lesson) {
    return (
      <Card>
        Lesson not found. <Link to="/student/lessons" className="font-semibold text-accent">Back to lessons</Link>
      </Card>
    );
  }
  const idx = LESSONS.indexOf(lesson);
  const next = LESSONS[idx + 1];
  const story = STORY[lesson.id];

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/student/lessons" className="text-sm font-semibold text-accent">
        ← All lessons
      </Link>
      <div className="mt-3">
        <PageHeader emoji={lesson.emoji} title={lesson.title} subtitle={`Lesson ${idx + 1} · ${lesson.minutes} min read · Tap underlined words for quick definitions.`} />
      </div>

      {story && (
        <Card className="mb-6 border-warn/30 bg-warn-soft">
          <div className="text-xs font-bold uppercase tracking-wide text-warn">🍋 Maya's Lemonade Co.</div>
          <h2 className="mt-1 font-bold">{story.title}</h2>
          <p className="mt-2 text-sm leading-relaxed">{story.body}</p>
          {story.numbers && (
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {story.numbers.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 rounded-lg bg-surface/70 px-3 py-1.5 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      )}

      <div className="space-y-6">
        {lesson.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            <p className="mt-2 leading-relaxed">
              <TermText text={s.body} />
            </p>
          </section>
        ))}
      </div>

      <Card className="my-8 bg-accent-soft">
        <h2 className="font-bold">🔑 Key takeaways</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          {lesson.keyTakeaways.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
        {lesson.tryIt && (
          <Link to={lesson.tryIt.to} className="mt-3 inline-block text-sm font-semibold text-accent">
            🧪 {lesson.tryIt.label} →
          </Link>
        )}
      </Card>

      <h2 className="mb-3 text-xl font-bold">🎯 Quiz time</h2>
      <Quiz key={lesson.id} lesson={lesson} />

      <div className="mt-8 flex justify-between">
        {idx > 0 ? (
          <Link to={`/student/lessons/${LESSONS[idx - 1].id}`}>
            <Button variant="secondary">← Previous</Button>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/student/lessons/${next.id}`}>
            <Button variant="secondary">Next: {next.title} →</Button>
          </Link>
        )}
      </div>
    </article>
  );
}
