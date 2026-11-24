// Market Time Machine scenarios. Prices are approximate S&P 500 month-end closes,
// rounded, for teaching purposes (not exact historical data).

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  years: string;
  intro: string;
  /** Points up to and including `decisionIndex` are shown before the student decides. */
  points: { date: string; price: number }[];
  decisionIndex: number;
  headline: string; // the scary news at the decision point
  whatHappened: string;
  lesson: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "dotcom",
    title: "The Dot-Com Crash",
    emoji: "💻",
    years: "2000–2007",
    intro: "It's March 2000. Internet companies are the hottest thing ever, and some with no profits are worth billions. You invest $1,000 in the S&P 500.",
    points: [
      { date: "2000-03", price: 1499 },
      { date: "2000-09", price: 1436 },
      { date: "2000-12", price: 1320 },
      { date: "2001-03", price: 1160 },
      { date: "2001-06", price: 1224 },
      { date: "2001-09", price: 1041 },
      { date: "2001-12", price: 1148 },
      { date: "2002-03", price: 1147 },
      { date: "2002-06", price: 990 },
      { date: "2002-09", price: 815 },
      { date: "2002-12", price: 880 },
      { date: "2003-06", price: 975 },
      { date: "2003-12", price: 1112 },
      { date: "2004-12", price: 1212 },
      { date: "2005-12", price: 1248 },
      { date: "2006-12", price: 1418 },
      { date: "2007-06", price: 1503 },
    ],
    decisionIndex: 9,
    headline: "September 2002: the market is down 46% from its peak. Tech stocks have lost nearly 80%. Experts on TV say the internet was a fad.",
    whatHappened: "The market bottomed around October 2002 and then climbed for five years, getting back to its 2000 level by 2007. Many unprofitable dot-com companies vanished forever, but the broad market recovered.",
    lesson: "Hype without profits is dangerous for single stocks, but a diversified index survived. Selling near the bottom locked in the loss.",
  },
  {
    id: "gfc",
    title: "The 2008 Financial Crisis",
    emoji: "🏦",
    years: "2007–2013",
    intro: "It's October 2007. Stocks are at an all-time high. You invest $1,000 in the S&P 500.",
    points: [
      { date: "2007-10", price: 1549 },
      { date: "2007-12", price: 1468 },
      { date: "2008-03", price: 1323 },
      { date: "2008-06", price: 1280 },
      { date: "2008-09", price: 1166 },
      { date: "2008-10", price: 969 },
      { date: "2008-11", price: 896 },
      { date: "2009-02", price: 735 },
      { date: "2009-06", price: 919 },
      { date: "2009-12", price: 1115 },
      { date: "2010-06", price: 1031 },
      { date: "2010-12", price: 1258 },
      { date: "2011-12", price: 1258 },
      { date: "2012-12", price: 1426 },
      { date: "2013-03", price: 1569 },
    ],
    decisionIndex: 7,
    headline: "February 2009: the market is down 53%. Giant banks have collapsed, millions are losing jobs and homes, and headlines warn of a second Great Depression.",
    whatHappened: "March 2009 turned out to be the bottom. The market roughly doubled from there in four years and passed its old high in early 2013, then kept climbing for years after.",
    lesson: "The scariest headlines often arrive near the bottom. Investors who bought during the panic were rewarded; those who sold missed the recovery.",
  },
  {
    id: "covid",
    title: "The COVID Crash",
    emoji: "🦠",
    years: "2020–2021",
    intro: "It's January 2020. The economy looks strong. You invest $1,000 in the S&P 500.",
    points: [
      { date: "2020-01", price: 3226 },
      { date: "2020-02", price: 2954 },
      { date: "2020-03-23", price: 2237 },
      { date: "2020-04", price: 2912 },
      { date: "2020-05", price: 3044 },
      { date: "2020-06", price: 3100 },
      { date: "2020-08", price: 3500 },
      { date: "2020-10", price: 3270 },
      { date: "2020-12", price: 3756 },
      { date: "2021-03", price: 3973 },
      { date: "2021-06", price: 4298 },
    ],
    decisionIndex: 2,
    headline: "March 23, 2020: a global pandemic has shut down the world. The market fell 34% in just one month, the fastest crash in history.",
    whatHappened: "The market bottomed that very week. It recovered its losses by August 2020 and was up over 90% from the bottom by mid-2021.",
    lesson: "Nobody can predict the bottom. Recoveries can be shockingly fast, and missing just a few of the best days hurts long-term returns.",
  },
  {
    id: "bear2022",
    title: "The 2022 Inflation Bear Market",
    emoji: "📈",
    years: "2022–2024",
    intro: "It's January 2022. Stocks just had a huge run. You invest $1,000 in the S&P 500.",
    points: [
      { date: "2022-01", price: 4516 },
      { date: "2022-03", price: 4530 },
      { date: "2022-06", price: 3785 },
      { date: "2022-09", price: 3586 },
      { date: "2022-12", price: 3840 },
      { date: "2023-03", price: 4109 },
      { date: "2023-06", price: 4450 },
      { date: "2023-12", price: 4770 },
      { date: "2024-03", price: 5254 },
      { date: "2024-06", price: 5460 },
    ],
    decisionIndex: 3,
    headline: "September 2022: inflation is the highest in 40 years and interest rates are rising fast. The market is down 25% and many tech stocks are down 50%+.",
    whatHappened: "The market bottomed in October 2022 and hit new all-time highs in early 2024.",
    lesson: "Bear markets feel endless while you're in one, but historically they've been temporary for a diversified portfolio.",
  },
];

export type Choice = "sell" | "hold" | "buy";

/** Ending value of a $1,000 investment for each choice (buy = add $500 at the decision point). */
export function outcome(s: Scenario, choice: Choice) {
  const start = s.points[0].price;
  const atDecision = s.points[s.decisionIndex].price;
  const end = s.points[s.points.length - 1].price;
  const valueAtDecision = (1000 * atDecision) / start;
  if (choice === "sell") return { invested: 1000, final: valueAtDecision };
  if (choice === "hold") return { invested: 1000, final: (1000 * end) / start };
  return { invested: 1500, final: (1000 * end) / start + (500 * end) / atDecision };
}
