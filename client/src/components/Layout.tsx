import { Suspense, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { levelFor } from "../game/xp";
import { useStore } from "../store";
import { Disclaimer, Loading } from "./ui";

const STUDENT_NAV = [
  { to: "/student", label: "Home", end: true },
  { to: "/student/lessons", label: "Lessons" },
  { to: "/student/glossary", label: "Glossary" },
  { to: "/student/playgrounds", label: "Playgrounds" },
  { to: "/student/time-machine", label: "Time Machine" },
  { to: "/student/portfolio", label: "Portfolio" },
  { to: "/student/checkup", label: "Company Checkup" },
  { to: "/student/review", label: "Flashcards" },
  { to: "/student/tutor", label: "Ask Penny" },
];

const ADULT_NAV = [
  { to: "/adult", label: "Overview", end: true },
  { to: "/adult/picks", label: "Stock Picks" },
  { to: "/adult/market", label: "Market" },
  { to: "/adult/watchlist", label: "Watchlist" },
  { to: "/adult/profile", label: "My Profile" },
  { to: "/adult/canada", label: "Tax & Accounts 🍁🇭🇰" },
  { to: "/adult/moving", label: "Moving CA → HK" },
];

export function Layout() {
  const { pathname } = useLocation();
  const mode = pathname.startsWith("/adult") ? "adult" : pathname.startsWith("/student") ? "student" : "home";
  const nav = mode === "adult" ? ADULT_NAV : mode === "student" ? STUDENT_NAV : [];
  const { progress, toasts, dismissToast } = useStore();
  const level = levelFor(progress.xp);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span aria-hidden>📈</span> StockSmart
          </Link>
          <div className="flex items-center gap-2">
            {mode === "student" && (
              <Link to="/student" className="hidden items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent sm:flex" title="Your level and XP">
                <span>{level.emoji}</span>
                <span>{level.name}</span>
                <span className="tabular-nums opacity-80">· {progress.xp} XP</span>
                {progress.streak.count > 1 && <span>· 🔥{progress.streak.count}</span>}
              </Link>
            )}
            <div className="flex rounded-xl border border-line p-0.5 text-sm font-semibold" role="group" aria-label="Choose mode">
              <NavLink to="/student" className={({ isActive }) => `rounded-lg px-3 py-1.5 ${isActive || mode === "student" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"}`}>
                Student
              </NavLink>
              <NavLink to="/adult" className={({ isActive }) => `rounded-lg px-3 py-1.5 ${isActive || mode === "adult" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"}`}>
                Adult
              </NavLink>
            </div>
          </div>
        </div>
        {nav.length > 0 && (
          <nav className="mx-auto max-w-6xl overflow-x-auto px-2" aria-label={`${mode} navigation`}>
            <ul className="flex gap-1 pb-2">
              {nav.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink"}`
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-line px-4 py-6">
        <Disclaimer compact />
      </footer>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="animate-pop pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-surface p-3 text-left shadow-lg"
          >
            <span className="text-2xl" aria-hidden>
              {t.emoji}
            </span>
            <span>
              <span className="block font-semibold">{t.title}</span>
              {t.body && <span className="block text-sm text-muted">{t.body}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
