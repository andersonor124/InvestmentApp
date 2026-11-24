import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Landing from "./Landing";

const AdultHome = lazy(() => import("./adult/AdultHome"));
const Alerts = lazy(() => import("./adult/Alerts"));
const MarketDashboard = lazy(() => import("./adult/MarketDashboard"));
const Profile = lazy(() => import("./adult/Profile"));
const Screener = lazy(() => import("./adult/Screener"));
const StockDetail = lazy(() => import("./adult/StockDetail"));
const TaxAccounts = lazy(() => import("./adult/TaxAccounts"));
const CompanyCheckup = lazy(() => import("./student/CompanyCheckup"));
const Flashcards = lazy(() => import("./student/Flashcards"));
const Glossary = lazy(() => import("./student/Glossary"));
const Lesson = lazy(() => import("./student/Lesson"));
const LessonList = lazy(() => import("./student/LessonList"));
const Playgrounds = lazy(() => import("./student/Playgrounds"));
const PortfolioPage = lazy(() => import("./student/Portfolio"));
const StudentHome = lazy(() => import("./student/StudentHome"));
const TimeMachine = lazy(() => import("./student/TimeMachine"));
const Tutor = lazy(() => import("./student/Tutor"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="student">
          <Route index element={<StudentHome />} />
          <Route path="lessons" element={<LessonList />} />
          <Route path="lessons/:id" element={<Lesson />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="playgrounds" element={<Playgrounds />} />
          <Route path="time-machine" element={<TimeMachine />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="checkup" element={<CompanyCheckup />} />
          <Route path="review" element={<Flashcards />} />
          <Route path="tutor" element={<Tutor />} />
        </Route>
        <Route path="adult">
          <Route index element={<AdultHome />} />
          <Route path="picks" element={<Screener />} />
          <Route path="stock/:symbol" element={<StockDetail />} />
          <Route path="market" element={<MarketDashboard />} />
          <Route path="watchlist" element={<Alerts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="canada" element={<TaxAccounts />} />
        </Route>
        <Route path="*" element={<Landing />} />
      </Route>
    </Routes>
  );
}
