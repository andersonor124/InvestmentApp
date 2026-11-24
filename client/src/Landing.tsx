import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Learn to invest. Then invest smarter.</h1>
        <p className="mt-4 text-lg text-muted">
          StockSmart turns confusing finance jargon into plain English, lets students practise with pretend money, and gives adults a transparent,
          explainable way to find stocks worth a closer look.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        <Link to="/student" className="group rounded-3xl border border-line bg-surface p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-4xl">🎒</div>
          <h2 className="mt-3 text-2xl font-bold">Student mode</h2>
          <p className="mt-1 text-sm font-semibold text-[#5b4bdb] dark:text-[#8f82ff]">For high school students</p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            <li>📚 10 bite-size lessons with quizzes, XP & badges</li>
            <li>📖 Every term (like P/E) explained like you're 15</li>
            <li>💼 $10,000 practice portfolio with challenges</li>
            <li>⏳ Relive real crashes in the Market Time Machine</li>
            <li>🧪 Interactive playgrounds & an AI tutor</li>
          </ul>
          <span className="mt-6 inline-block font-semibold text-[#5b4bdb] group-hover:underline dark:text-[#8f82ff]">Start learning →</span>
        </Link>
        <Link to="/adult" className="group rounded-3xl border border-line bg-surface p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-4xl">💼</div>
          <h2 className="mt-3 text-2xl font-bold">Adult mode</h2>
          <p className="mt-1 text-sm font-semibold text-[#1f5fbf] dark:text-[#6ea8ff]">For investors</p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            <li>🎯 Ranked picks: Consider Buying / Watch / Pass</li>
            <li>🔍 Every score explained, with red-flag warnings</li>
            <li>📊 Market dashboard, analyst & insider context</li>
            <li>🔔 Watchlist with price alerts & diversification check</li>
            <li>🍁 Canadian accounts & tax guide (TFSA, RRSP, FHSA)</li>
          </ul>
          <span className="mt-6 inline-block font-semibold text-[#1f5fbf] group-hover:underline dark:text-[#6ea8ff]">See today's picks →</span>
        </Link>
      </div>
    </div>
  );
}
