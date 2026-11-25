// Gamification rules: XP, levels, streaks, badges and flashcard spacing. Pure functions.
import type { Portfolio } from "./portfolio";
import { daysBetween, todayKey } from "../lib/format";

export interface Progress {
  xp: number;
  lessons: Record<string, { best: number; total: number; perfect: boolean }>;
  badges: string[];
  streak: { count: number; best: number; last: string | null };
  viewedTerms: string[];
  cards: Record<string, { box: number; due: string }>;
  reviewed: number;
  missed: string[]; // quiz question ids answered wrong (fed into flashcards)
  challenges: string[];
  timeMachine: Record<string, "sell" | "hold" | "buy">;
  playgrounds: string[];
  tutorQuestions: number;
}

export const emptyProgress = (): Progress => ({
  xp: 0,
  lessons: {},
  badges: [],
  streak: { count: 0, best: 0, last: null },
  viewedTerms: [],
  cards: {},
  reviewed: 0,
  missed: [],
  challenges: [],
  timeMachine: {},
  playgrounds: [],
  tutorQuestions: 0,
});

// ---------- XP rules ----------
export const XP = {
  correctAnswer: 10,
  lessonComplete: 50,
  perfectQuiz: 25,
  firstTermView: 2,
  flashcardCorrect: 3,
  playground: 15,
  timeMachine: 30,
  dailyStreak: 5,
};

/** Answer streaks inside one quiz multiply XP: 3 in a row ×1.5, 5 in a row ×2. */
export function comboMultiplier(combo: number): number {
  if (combo >= 5) return 2;
  if (combo >= 3) return 1.5;
  return 1;
}

export function xpForAnswer(correct: boolean, comboBefore: number): { xp: number; combo: number } {
  if (!correct) return { xp: 0, combo: 0 };
  const combo = comboBefore + 1;
  return { xp: Math.round(XP.correctAnswer * comboMultiplier(combo)), combo };
}

// ---------- Levels ----------
export const LEVELS = [
  { min: 0, name: "Rookie", emoji: "🌱" },
  { min: 150, name: "Saver", emoji: "🐷" },
  { min: 400, name: "Investor-in-Training", emoji: "📘" },
  { min: 800, name: "Analyst", emoji: "🔍" },
  { min: 1400, name: "Portfolio Pro", emoji: "💼" },
  { min: 2200, name: "Market Strategist", emoji: "♟️" },
  { min: 3200, name: "Wall Street Wizard", emoji: "🧙" },
];

export function levelFor(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++;
  const current = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return { index: i, ...current, next, progress };
}

// ---------- Streaks ----------
export function touchStreak(streak: Progress["streak"], today: string): { streak: Progress["streak"]; extended: boolean } {
  if (streak.last === today) return { streak, extended: false };
  const gap = streak.last ? daysBetween(streak.last, today) : Infinity;
  const count = gap === 1 ? streak.count + 1 : 1;
  return { streak: { count, best: Math.max(streak.best, count), last: today }, extended: true };
}

// ---------- Flashcards (Leitner boxes) ----------
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

export function reviewCard(card: { box: number; due: string } | undefined, correct: boolean, today: string) {
  const box = correct ? Math.min((card?.box ?? 0) + 1, BOX_INTERVAL_DAYS.length - 1) : 1;
  return { box, due: addDays(today, correct ? BOX_INTERVAL_DAYS[box] : 0) };
}

export const isDue = (card: { due: string } | undefined, today: string) => !card || card.due <= today;

// ---------- Badges ----------
export interface BadgeContext {
  progress: Progress;
  portfolio: Portfolio;
  totalLessons: number;
  totalScenarios: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned: (c: BadgeContext) => boolean;
}

const sectorsHeld = (p: Portfolio) => new Set(Object.values(p.holdings).map((h) => h.sector)).size;

export const BADGES: Badge[] = [
  { id: "first-lesson", name: "First Steps", emoji: "👣", description: "Finish your first lesson.", earned: (c) => Object.keys(c.progress.lessons).length >= 1 },
  { id: "perfect-score", name: "Perfect Score", emoji: "💯", description: "Ace a quiz with no mistakes.", earned: (c) => Object.values(c.progress.lessons).some((l) => l.perfect) },
  { id: "all-lessons", name: "Graduate", emoji: "🎓", description: "Finish every lesson.", earned: (c) => Object.keys(c.progress.lessons).length >= c.totalLessons },
  { id: "first-trade", name: "First Trade", emoji: "🛒", description: "Buy your first stock in the practice portfolio.", earned: (c) => c.portfolio.trades.length > 0 },
  { id: "diversified", name: "Diversified", emoji: "🧺", description: "Hold stocks from 3+ different sectors.", earned: (c) => sectorsHeld(c.portfolio) >= 3 },
  {
    id: "diamond-hands",
    name: "Diamond Hands",
    emoji: "💎",
    description: "Hold a position for 7+ days.",
    earned: (c) => Object.values(c.portfolio.holdings).some((h) => daysBetween(h.firstBought, todayKey()) >= 7),
  },
  { id: "glossary-explorer", name: "Word Nerd", emoji: "📖", description: "Open 20 glossary terms.", earned: (c) => c.progress.viewedTerms.length >= 20 },
  { id: "time-traveler", name: "Time Traveler", emoji: "⏳", description: "Survive every Time Machine crash.", earned: (c) => Object.keys(c.progress.timeMachine).length >= c.totalScenarios },
  { id: "flashcard-fan", name: "Memory Master", emoji: "🧠", description: "Review 25 flashcards.", earned: (c) => c.progress.reviewed >= 25 },
  { id: "streak-7", name: "On Fire", emoji: "🔥", description: "Learn 7 days in a row.", earned: (c) => c.progress.streak.best >= 7 },
  { id: "scam-spotter", name: "Scam Spotter", emoji: "🕵️", description: "Finish the Scams & Hype lesson.", earned: (c) => Boolean(c.progress.lessons["scams-hype"]) },
  { id: "tinkerer", name: "Tinkerer", emoji: "🧪", description: "Try all three playgrounds.", earned: (c) => c.progress.playgrounds.length >= 3 },
  { id: "curious", name: "Curious Mind", emoji: "💬", description: "Ask the AI tutor 5 questions.", earned: (c) => c.progress.tutorQuestions >= 5 },
];

export function newlyEarnedBadges(c: BadgeContext): Badge[] {
  return BADGES.filter((b) => !c.progress.badges.includes(b.id) && b.earned(c));
}
