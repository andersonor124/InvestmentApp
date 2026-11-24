// Lessons. In section text, [[term-id]] or [[term-id|label]] links to the glossary.

export interface QuizQuestion {
  id: string;
  q: string;
  options: string[];
  answer: number; // index into options
  explain: string;
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  summary: string;
  sections: { heading: string; body: string }[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  tryIt?: { label: string; to: string };
}

const q = (lesson: string, n: number, question: Omit<QuizQuestion, "id">): QuizQuestion => ({ id: `${lesson}-${n}`, ...question });

export const LESSONS: Lesson[] = [
  {
    id: "what-is-stock",
    title: "What is a stock?",
    emoji: "🧩",
    minutes: 5,
    summary: "Owning a piece of a real business, and why companies sell shares at all.",
    sections: [
      {
        heading: "You can own a piece of a company",
        body: "A [[stock]] is a small slice of ownership in a company. Companies like Apple, Royal Bank or Shopify are split into millions or billions of shares. If you own one, you're a part-owner: a tiny slice of the company's profits belongs to you.",
      },
      {
        heading: "Why companies sell shares",
        body: "Growing costs money: new factories, stores, employees. Instead of borrowing, a company can sell pieces of itself to investors. The first time a company does this publicly is called an [[ipo|IPO]]. After that, shares trade between investors on the [[stock-market|stock market]].",
      },
      {
        heading: "How you make money",
        body: "Two ways: (1) the share price goes up and you sell for more than you paid, a [[capital-gain|capital gain]]; (2) the company shares its profits with you as a [[dividend]]. Neither is guaranteed. Prices can fall and companies can go bankrupt.",
      },
      {
        heading: "Price isn't size",
        body: "A $500 share isn't 'better' than a $20 share. What matters is the company's total value, its [[market-cap|market capitalization]] (share price × number of shares), and whether its price is fair compared with its profits.",
      },
    ],
    keyTakeaways: [
      "A share = partial ownership of a real business.",
      "You earn through price growth and/or dividends.",
      "Share price alone tells you nothing about how big or how good a company is.",
    ],
    quiz: [
      q("what-is-stock", 1, { q: "If you own 1 share of a company, you…", options: ["Lent the company money", "Own a small piece of the company", "Work for the company", "Get a fixed interest payment"], answer: 1, explain: "A share is ownership. Lending money to a company would be a bond." }),
      q("what-is-stock", 2, { q: "Why do companies sell shares?", options: ["To raise money to grow", "Because the government requires it", "To pay their employees' taxes", "To lower their prices"], answer: 0, explain: "Selling shares raises cash for growth without taking on debt." }),
      q("what-is-stock", 3, { q: "Company A's shares cost $500; Company B's cost $20. Which company is bigger?", options: ["Company A", "Company B", "You can't tell without knowing the number of shares", "They're the same size"], answer: 2, explain: "Size = market cap = price × number of shares. B might have far more shares." }),
      q("what-is-stock", 4, { q: "Which is a way stock investors can earn money?", options: ["Dividends", "Selling for more than they paid", "Both of these", "Neither: only the company earns money"], answer: 2, explain: "Investors earn from capital gains and dividends." }),
      q("what-is-stock", 5, { q: "What is an IPO?", options: ["A type of tax", "A company's first sale of shares to the public", "When a company goes bankrupt", "A stock that pays dividends"], answer: 1, explain: "Initial Public Offering: the company's stock-market debut." }),
    ],
  },
  {
    id: "why-prices-move",
    title: "Why do prices move?",
    emoji: "🎢",
    minutes: 5,
    summary: "Supply, demand, expectations and why short-term moves are mostly noise.",
    sections: [
      {
        heading: "Buyers vs sellers",
        body: "A stock's price is simply the last price a buyer and a seller agreed on. If more people want to buy than sell, the price rises until enough sellers appear. It works just like resale sneakers or concert tickets.",
      },
      {
        heading: "It's all about the future",
        body: "Investors buy based on what they think a company will earn in the future. Good news (a hit product, strong [[net-income|profits]]) raises expectations and the price. Bad news lowers it. Interest rates, the economy and even fear or excitement move prices too.",
      },
      {
        heading: "Short term: a voting machine. Long term: a weighing machine.",
        body: "Day to day, prices bounce around on news and emotions. That's [[volatility]]. Over many years, prices tend to follow a company's actual earnings. That's why long-term investors focus on business quality instead of daily wiggles.",
      },
      {
        heading: "Markets go through seasons",
        body: "Long stretches of rising prices are called [[bull-bear|bull markets]]; drops of 20%+ are bear markets. Smaller 10% dips are [[correction|corrections]] and happen often. In the past, the overall market has always recovered eventually, though individual companies sometimes never do.",
      },
    ],
    keyTakeaways: [
      "Price = what buyers and sellers agree on right now.",
      "Prices reflect expectations about future profits.",
      "Short-term moves are noisy; long-term prices tend to follow earnings.",
    ],
    quiz: [
      q("why-prices-move", 1, { q: "A company announces a hugely popular new product. What usually happens to its stock?", options: ["Price rises as expectations go up", "Price falls", "Nothing: prices only change once a year", "Trading stops"], answer: 0, explain: "Better expected future profits make more people want to buy." }),
      q("why-prices-move", 2, { q: "What's a 'bear market'?", options: ["Prices rising quickly", "A drop of 20% or more from a recent high", "A market for commodities", "A day with no trading"], answer: 1, explain: "Bears swipe down; a bear market is a 20%+ decline." }),
      q("why-prices-move", 3, { q: "Over many years, what do stock prices tend to follow?", options: ["Social media posts", "The company's earnings", "The weather", "The CEO's age"], answer: 1, explain: "The 'weighing machine': long-run prices track profits." }),
      q("why-prices-move", 4, { q: "A stock drops 3% in a day with no news. A long-term investor should…", options: ["Panic and sell", "Remember daily moves are often just noise", "Buy 10x more immediately", "Call the company"], answer: 1, explain: "Short-term moves are frequently random. Focus on the business." }),
      q("why-prices-move", 5, { q: "How often do 10% 'corrections' happen?", options: ["Never", "Once a century", "Fairly often: roughly every year or two historically", "Every week"], answer: 2, explain: "Corrections are a normal part of investing." }),
    ],
  },
  {
    id: "reading-company",
    title: "Reading a company's health",
    emoji: "🩺",
    minutes: 7,
    summary: "Revenue, profit, margins and debt: the check-up every investor should do.",
    sections: [
      {
        heading: "Revenue: is the business growing?",
        body: "[[revenue|Revenue]] is all the money coming in from customers. Look for revenue that grows year after year. It means more customers or more pricing power.",
      },
      {
        heading: "Profit: does it actually make money?",
        body: "[[net-income|Net income]] is what's left after every cost. Some exciting companies have big revenue but no profit yet; that's riskier. Divide profit by revenue to get the [[profit-margin|profit margin]], which shows how much of each sale the company keeps.",
      },
      {
        heading: "Efficiency: ROE",
        body: "[[roe|Return on equity]] shows how much profit a company squeezes out of the money shareholders have put in. Consistently high ROE (15%+) often signals a strong business with a competitive advantage, sometimes called a 'moat'.",
      },
      {
        heading: "Debt: can it survive a bad year?",
        body: "Companies borrow money too. The [[debt-to-equity|debt-to-equity ratio]] compares what a company owes with what owners have invested. The [[current-ratio|current ratio]] checks whether it can pay this year's bills. Heavy debt makes a company fragile when times get tough.",
      },
      {
        heading: "A simple checklist",
        body: "1) Is revenue growing? 2) Is it profitable, with steady or rising margins? 3) Is debt manageable? 4) Do you understand how it makes money? 5) Is the price reasonable? (That's the next lesson.) Try this on a real company in the Company Checkup tool.",
      },
    ],
    keyTakeaways: [
      "Growing revenue + healthy profit margins = a business with momentum.",
      "High ROE suggests a strong competitive position.",
      "Too much debt is a common reason companies fail.",
    ],
    quiz: [
      q("reading-company", 1, { q: "A company had $1,000 in revenue and $150 in profit. What's its profit margin?", options: ["1.5%", "15%", "150%", "85%"], answer: 1, explain: "$150 ÷ $1,000 = 0.15 = 15%." }),
      q("reading-company", 2, { q: "Which is a warning sign?", options: ["Revenue growing every year", "Profit margin rising", "Debt-to-equity of 5 and climbing", "ROE of 20%"], answer: 2, explain: "Very high and rising debt makes a company fragile." }),
      q("reading-company", 3, { q: "What does revenue measure?", options: ["Profit after taxes", "All money coming in from sales", "Cash in the bank", "The share price"], answer: 1, explain: "Revenue is the 'top line', before any costs." }),
      q("reading-company", 4, { q: "ROE tells you…", options: ["How efficiently a company turns owners' money into profit", "The dividend amount", "How many shares exist", "The CEO's salary"], answer: 0, explain: "ROE = profit ÷ shareholders' equity." }),
      q("reading-company", 5, { q: "A current ratio of 0.5 means…", options: ["The company has twice the cash it needs", "Bills due this year are about double its short-term assets", "The stock is cheap", "It pays a 0.5% dividend"], answer: 1, explain: "Current ratio = current assets ÷ current liabilities; below 1 means a possible cash squeeze." }),
    ],
    tryIt: { label: "Give a real company a check-up", to: "/student/checkup" },
  },
  {
    id: "valuation",
    title: "Is the price right? P/E and friends",
    emoji: "🏷️",
    minutes: 8,
    summary: "EPS, P/E, P/S and PEG explained with lemonade.",
    sections: [
      {
        heading: "Great company ≠ great investment",
        body: "Even the best company can be a bad investment if you overpay. [[valuation|Valuation]] means comparing the price you pay with what you get.",
      },
      {
        heading: "EPS: your slice of the profit",
        body: "[[eps|Earnings per share]] = total profit ÷ number of shares. If a company earns $1 billion and has 500 million shares, EPS is $2.",
      },
      {
        heading: "P/E: the most famous ratio",
        body: "The [[pe|P/E ratio]] = share price ÷ EPS. A $40 stock with $2 EPS has a P/E of 20: you pay $20 for every $1 of yearly profit. Think of it as 'how many years of today's profit am I paying for?'. Lower can mean cheaper; higher usually means investors expect fast growth. Always compare P/Es within the same industry.",
      },
      {
        heading: "When P/E doesn't work: P/S",
        body: "Companies with no profit don't have a meaningful P/E. Then investors use the [[ps|price-to-sales ratio]], which compares market cap with revenue.",
      },
      {
        heading: "Adding growth: PEG",
        body: "A P/E of 40 might be a bargain if earnings double each year, and a P/E of 10 might be expensive if earnings are shrinking. The [[peg|PEG ratio]] divides P/E by the growth rate. Around 1 is often seen as fair.",
      },
      {
        heading: "Low P/E traps",
        body: "A super-low P/E can mean the market expects profits to fall. Always ask why a stock looks cheap before buying it.",
      },
    ],
    keyTakeaways: [
      "P/E = price ÷ earnings per share = dollars paid per $1 of profit.",
      "Compare P/E with similar companies and with growth (PEG).",
      "Cheap can be a trap; expensive can be justified. Find out why.",
    ],
    quiz: [
      q("valuation", 1, { q: "A stock costs $60 and has EPS of $3. What's the P/E?", options: ["3", "20", "63", "180"], answer: 1, explain: "60 ÷ 3 = 20." }),
      q("valuation", 2, { q: "A high P/E usually means investors…", options: ["Expect strong future growth", "Think the company is going bankrupt", "Get a bigger dividend", "Own more shares"], answer: 0, explain: "People pay more per dollar of profit when they expect profits to grow." }),
      q("valuation", 3, { q: "Which ratio is useful for a company that isn't profitable yet?", options: ["P/E", "P/S", "Dividend yield", "Payout ratio"], answer: 1, explain: "No profit means no meaningful P/E, but you can still compare price with sales." }),
      q("valuation", 4, { q: "Stock A: P/E 30, earnings growing 30%/yr. Stock B: P/E 30, growing 5%/yr. Which has the better PEG?", options: ["A (PEG 1)", "B (PEG 6)", "They're equal", "PEG can't be calculated"], answer: 0, explain: "PEG = P/E ÷ growth. A: 30/30 = 1. B: 30/5 = 6." }),
      q("valuation", 5, { q: "A stock has a P/E of 4, way below its peers. The smart first step is to…", options: ["Buy as much as possible", "Find out why it's so cheap", "Short it immediately", "Ignore P/E entirely"], answer: 1, explain: "Very low P/Es can signal expected trouble: a 'value trap'." }),
    ],
    tryIt: { label: "Play with P/E in the playground", to: "/student/playgrounds" },
  },
  {
    id: "dividends",
    title: "Dividends: getting paid to own",
    emoji: "💵",
    minutes: 5,
    summary: "Dividend yield, payout ratio and the magic of reinvesting.",
    sections: [
      {
        heading: "What's a dividend?",
        body: "A [[dividend]] is cash a company pays its owners, often every three months. Mature, profitable companies like Canadian banks, pipelines and utilities are famous for them.",
      },
      {
        heading: "Dividend yield",
        body: "[[dividend-yield|Dividend yield]] = yearly dividends ÷ share price. A $50 stock paying $2 a year yields 4%. Watch out: a super-high yield can mean the price crashed because investors expect the dividend to be cut.",
      },
      {
        heading: "Is it sustainable?",
        body: "The [[payout-ratio|payout ratio]] shows what share of profit is paid out. If a company pays out more than it earns for long, something has to give.",
      },
      {
        heading: "Reinvesting = turbo compounding",
        body: "Many brokers let you automatically use dividends to buy more shares (a 'DRIP'). More shares produce more dividends, which buy more shares… Over decades, reinvested dividends have made up a large part of the stock market's total return.",
      },
    ],
    keyTakeaways: [
      "Dividends are cash payments to shareholders, but they aren't guaranteed.",
      "Yield = dividends ÷ price; very high yields can be warning signs.",
      "Reinvesting dividends accelerates compounding.",
    ],
    quiz: [
      q("dividends", 1, { q: "A $100 stock pays $3 per year in dividends. The yield is…", options: ["0.3%", "3%", "30%", "$3%"], answer: 1, explain: "$3 ÷ $100 = 3%." }),
      q("dividends", 2, { q: "A stock suddenly has a 12% dividend yield. What might it signal?", options: ["A guaranteed great deal", "The price fell sharply and a dividend cut may be coming", "The company is growing fastest", "Nothing at all"], answer: 1, explain: "Yields spike when prices crash. Investigate first." }),
      q("dividends", 3, { q: "A company earns $4 per share and pays $5 per share in dividends. Its payout ratio is…", options: ["80%: sustainable", "125%: possibly unsustainable", "20%", "0%"], answer: 1, explain: "$5 ÷ $4 = 125%; paying out more than it earns can't last forever." }),
      q("dividends", 4, { q: "What does reinvesting dividends do?", options: ["Buys more shares, which earn more dividends", "Lowers your taxes to zero", "Doubles the share price", "Nothing useful"], answer: 0, explain: "That's compounding in action." }),
      q("dividends", 5, { q: "Which kind of company is most likely to pay a steady dividend?", options: ["A brand-new startup", "A mature, profitable bank or utility", "A company losing money", "A company that just did its IPO"], answer: 1, explain: "Mature, steady businesses have extra cash to share." }),
    ],
  },
  {
    id: "risk-diversification",
    title: "Risk & diversification",
    emoji: "🧺",
    minutes: 6,
    summary: "Why owning lots of different things protects you.",
    sections: [
      {
        heading: "Every investment has risk",
        body: "Stocks can fall, sometimes a lot. A single company can even go to zero. Risk and reward are linked: investments that can grow more usually bounce around more ([[volatility]]).",
      },
      {
        heading: "Measuring bumpiness: beta",
        body: "[[beta|Beta]] compares a stock's swings with the overall market. A beta of 2 means it has tended to move about twice as much as the market, in both directions.",
      },
      {
        heading: "Don't put all your eggs in one basket",
        body: "[[diversification|Diversification]] means owning many investments across different industries (sectors) and countries. When one stumbles, others may hold steady. It lowers risk without giving up much expected return.",
      },
      {
        heading: "Your time horizon matters",
        body: "Your [[time-horizon|time horizon]] is when you'll need the money. Money for next year belongs in savings; money for decades from now can handle stock-market ups and downs. That's a big advantage for teens!",
      },
    ],
    keyTakeaways: [
      "Higher potential return usually comes with bigger swings.",
      "Spread money across many companies, sectors and countries.",
      "Only invest money you won't need for several years.",
    ],
    quiz: [
      q("risk-diversification", 1, { q: "Which portfolio is most diversified?", options: ["1 tech stock", "3 tech stocks", "An ETF holding 500 companies across many industries", "Cash under your mattress"], answer: 2, explain: "Hundreds of companies across sectors = broad diversification." }),
      q("risk-diversification", 2, { q: "A stock with beta 1.8 tends to…", options: ["Move less than the market", "Move about 1.8× as much as the market", "Never move", "Always go up"], answer: 1, explain: "Higher beta = bigger swings both up and down." }),
      q("risk-diversification", 3, { q: "You'll need money for a car in 8 months. Where should it be?", options: ["A single volatile stock", "A savings account", "Crypto", "Options"], answer: 1, explain: "Short time horizon = keep it safe." }),
      q("risk-diversification", 4, { q: "Diversification helps by…", options: ["Guaranteeing profits", "Reducing the damage if one investment fails", "Increasing fees", "Making stocks less liquid"], answer: 1, explain: "It spreads risk; nothing guarantees profits." }),
      q("risk-diversification", 5, { q: "Generally, investments with higher potential returns…", options: ["Have lower risk", "Have higher risk", "Have no risk", "Are only for banks"], answer: 1, explain: "Risk and reward travel together." }),
    ],
    tryIt: { label: "Build a diversified practice portfolio", to: "/student/portfolio" },
  },
  {
    id: "compounding-time",
    title: "Compounding: time is your superpower",
    emoji: "❄️",
    minutes: 5,
    summary: "Why starting at 16 beats starting at 26, and dollar-cost averaging.",
    sections: [
      {
        heading: "Growth on top of growth",
        body: "[[compound-interest|Compounding]] means your returns start earning returns too. $1,000 growing 7% a year becomes about $2,000 in 10 years, $4,000 in 20, $7,600 in 30 and $15,000 in 40, without adding a cent.",
      },
      {
        heading: "Why starting early is huge",
        body: "Someone who invests $100 a month from age 16 to 65 at 7% could end up with roughly twice as much as someone who starts at 26, even though they only invested about $12,000 more. Those extra early years have the most time to compound.",
      },
      {
        heading: "The rule of 72",
        body: "Divide 72 by the yearly return to estimate how many years it takes to double. At 8%, money doubles in about 9 years. At 4%, about 18.",
      },
      {
        heading: "Dollar-cost averaging",
        body: "Instead of trying to guess the perfect moment, [[dca|dollar-cost averaging]] means investing the same amount regularly. You automatically buy more shares when prices are low and fewer when they're high.",
      },
    ],
    keyTakeaways: [
      "Compounding snowballs over decades. Start early, even with small amounts.",
      "Rule of 72: 72 ÷ return % ≈ years to double.",
      "Regular investing beats trying to time the market.",
    ],
    quiz: [
      q("compounding-time", 1, { q: "Using the rule of 72, how long does money take to double at 6% a year?", options: ["6 years", "12 years", "72 years", "20 years"], answer: 1, explain: "72 ÷ 6 = 12 years." }),
      q("compounding-time", 2, { q: "Why does starting at 16 instead of 26 matter so much?", options: ["Teens get higher returns", "Early money has more years to compound", "Stocks are cheaper for teens", "It doesn't matter"], answer: 1, explain: "Time is the engine of compounding." }),
      q("compounding-time", 3, { q: "Dollar-cost averaging means…", options: ["Investing a fixed amount on a regular schedule", "Only buying when prices hit a low", "Converting dollars to another currency", "Selling everything each month"], answer: 0, explain: "Same amount, regular schedule, no guessing." }),
      q("compounding-time", 4, { q: "With DCA, when prices drop your fixed $50 buys…", options: ["Fewer shares", "More shares", "The same number of shares", "No shares"], answer: 1, explain: "Lower price = more shares for the same money." }),
      q("compounding-time", 5, { q: "Compounding works best when you…", options: ["Withdraw gains every month", "Leave money invested and reinvest returns for a long time", "Trade daily", "Keep money in cash"], answer: 1, explain: "Time + reinvesting = snowball." }),
    ],
    tryIt: { label: "Try the compounding calculator", to: "/student/playgrounds" },
  },
  {
    id: "index-funds",
    title: "Index funds & ETFs vs stock picking",
    emoji: "🌎",
    minutes: 6,
    summary: "Why most people (and most pros) are better off owning the whole market.",
    sections: [
      {
        heading: "Buy the haystack",
        body: "Instead of searching for the needle (the one winning stock), you can buy the whole haystack. An [[index-fund|index fund]] owns every company in an index like the S&P 500 or the S&P/TSX Composite.",
      },
      {
        heading: "ETFs make it easy",
        body: "An [[etf|ETF]] trades like a stock but holds a basket of investments. Canadian all-in-one ETFs (like XEQT, VEQT, VBAL or XBAL) hold thousands of companies worldwide in one purchase.",
      },
      {
        heading: "Fees are the silent killer",
        body: "Funds charge a yearly fee called the [[mer|MER]]. Index ETFs often charge 0.05%–0.25%; many mutual funds charge 1.5%–2.5%. Over decades, that difference can cost a third or more of your final balance.",
      },
      {
        heading: "Why not just pick winners?",
        body: "Research has repeatedly found that most professional fund managers trail their index over 10–15 years, especially after fees. Picking individual stocks can be fun and educational, but many investors keep most of their money in index funds and only a small 'learning' portion in single stocks.",
      },
    ],
    keyTakeaways: [
      "Index funds = own the whole market cheaply.",
      "Low fees matter enormously over time.",
      "Most professional stock pickers don't beat the index long term.",
    ],
    quiz: [
      q("index-funds", 1, { q: "An S&P 500 index fund owns…", options: ["The 500 best-performing stocks this year", "Roughly 500 large US companies in the index", "Only tech stocks", "500 Canadian banks"], answer: 1, explain: "It simply holds the companies in the index." }),
      q("index-funds", 2, { q: "Fund A charges 0.2% a year, Fund B 2%. Both hold similar stocks. Over 30 years…", options: ["They'll end about the same", "Fund A will likely leave you with much more", "Fund B will win because it costs more", "Fees don't compound"], answer: 1, explain: "Fees compound against you. Low cost usually wins." }),
      q("index-funds", 3, { q: "What's an ETF?", options: ["A single company's stock", "A basket of investments that trades like a stock", "A type of bank account", "A government bond"], answer: 1, explain: "Exchange-traded fund: one ticker, many holdings." }),
      q("index-funds", 4, { q: "Over 10–15 years, most professional fund managers…", options: ["Beat their index easily", "Fail to beat their index after fees", "Never lose money", "Only buy ETFs"], answer: 1, explain: "That's a big reason indexing is so popular." }),
      q("index-funds", 5, { q: "MER stands for…", options: ["Management expense ratio: the yearly fund fee", "Market earnings rate", "Monthly equity return", "Maximum exchange risk"], answer: 0, explain: "It's the percentage of your money charged each year." }),
    ],
  },
  {
    id: "scams-hype",
    title: "Scams, hype & get-rich-quick traps",
    emoji: "🕵️",
    minutes: 7,
    summary: "Meme stocks, pump-and-dumps, finfluencers, options and day trading.",
    sections: [
      {
        heading: "If it sounds too good to be true…",
        body: "Guaranteed returns, '10× in a week', secret systems, pressure to act NOW, or requests to send money to a stranger are classic scam signs. Real investing is slow and boring, and that's a feature.",
      },
      {
        heading: "Pump-and-dump schemes",
        body: "Promoters hype a tiny stock or coin on social media, the price soars as people pile in, and the promoters sell at the top. Late buyers are left holding a collapsing investment. Tiny 'penny stocks' and new coins are favourite targets.",
      },
      {
        heading: "Finfluencers",
        body: "Many people posting money advice online get paid to promote products or profit when you buy what they own. Ask: How do they make money? Do they show their losses? Are they registered? In Canada you can check registration at aretheyregistered.ca.",
      },
      {
        heading: "Meme stocks & FOMO",
        body: "Fear Of Missing Out makes people buy stocks only because they're going up. Meme stocks can rise hundreds of percent and fall just as fast. If you can't explain how the business makes money, you're gambling on other people's emotions.",
      },
      {
        heading: "Day trading, options & leverage",
        body: "Studies of day traders consistently find that the large majority lose money. Options and borrowed money (leverage) magnify both gains and losses, and you can lose more than you put in. In Canada, frequent trading can also cause the CRA to tax gains as business income, even inside a TFSA.",
      },
      {
        heading: "Your scam-spotting checklist",
        body: "✅ Is it registered and regulated? ✅ Can I explain how it makes money? ✅ Am I being rushed? ✅ Are returns promised or guaranteed? ✅ Would I be okay losing this money? When in doubt, talk to a trusted adult.",
      },
    ],
    keyTakeaways: [
      "Guaranteed or super-fast returns are red flags.",
      "Promoters often profit when you buy.",
      "Day trading and options are closer to gambling than investing for most people.",
    ],
    quiz: [
      q("scams-hype", 1, { q: "A stranger DMs you about a coin that's 'guaranteed to 20× this month'. This is most likely…", options: ["A great opportunity", "A scam or pump-and-dump", "Regulated by the government", "A type of index fund"], answer: 1, explain: "Guaranteed huge returns + unsolicited messages = scam." }),
      q("scams-hype", 2, { q: "In a pump-and-dump, who usually makes money?", options: ["Everyone who buys", "The promoters who bought early and sold at the top", "The company's customers", "Late buyers"], answer: 1, explain: "Late buyers usually lose." }),
      q("scams-hype", 3, { q: "What has research found about most day traders?", options: ["Most become rich", "The large majority lose money", "They always beat index funds", "They pay no taxes"], answer: 1, explain: "Consistently, most day traders lose money over time." }),
      q("scams-hype", 4, { q: "A good question to ask about a finfluencer is…", options: ["How many followers do they have?", "How do they make money from my decision?", "Is their car expensive?", "Do they post every day?"], answer: 1, explain: "Follow the incentives." }),
      q("scams-hype", 5, { q: "Why are options and leverage risky for beginners?", options: ["They magnify losses and can wipe out your money", "They're illegal", "They only go up", "They have no fees"], answer: 0, explain: "Magnified gains come with magnified losses." }),
    ],
  },
  {
    id: "money-foundations",
    title: "Money foundations (Canada)",
    emoji: "🍁",
    minutes: 8,
    summary: "Emergency funds, TFSA, RRSP, FHSA, in-trust accounts, fees and taxes.",
    sections: [
      {
        heading: "Before you invest: build the base",
        body: "Investing comes after the basics: have some savings for emergencies (even a few hundred dollars as a teen), avoid high-interest debt (credit cards charge ~20%+, so no investment reliably beats paying that off), and only invest money you won't need for several years.",
      },
      {
        heading: "Investing as a teen in Canada",
        body: "You generally need to be the age of majority (18 or 19, depending on your province) to open your own brokerage account. Before then, a parent or guardian can open an 'in-trust-for' (ITF) account or invest with you in their account. Many brokers now offer commission-free ETF trades and fractional shares.",
      },
      {
        heading: "The TFSA: your best friend",
        body: "In a [[tfsa|TFSA]], gains, dividends and withdrawals are tax-free. Contribution room starts accumulating the year you turn 18, even if you open the account later. The yearly limit has recently been $7,000 (check the CRA for the current number). Withdrawals are added back to your room the following year.",
      },
      {
        heading: "RRSP and FHSA",
        body: "An [[rrsp|RRSP]] gives you a tax deduction now; withdrawals are taxed later. Room is 18% of last year's earned income (up to a yearly max), so filing a tax return for your part-time job builds room for the future. An [[fhsa|FHSA]] (18+) lets first-time home buyers save $8,000/year ($40,000 lifetime) with a deduction AND tax-free withdrawal for a home.",
      },
      {
        heading: "Taxes on investments (outside TFSA/RRSP)",
        body: "In a regular (non-registered) account: only 50% of a [[capital-gain|capital gain]] is taxable, Canadian dividends get a dividend tax credit, and interest is fully taxed. US dividends usually have 15% withheld by the US government.",
      },
      {
        heading: "Fees and accounts to watch",
        body: "Compare trading commissions, account fees and fund MERs. A 2% fee might sound small, but over decades it can take a huge bite. A low-cost all-in-one ETF in a TFSA is a common, simple starting point for young Canadians.",
      },
    ],
    keyTakeaways: [
      "Emergency fund and no high-interest debt first.",
      "TFSA room starts at 18. It's usually the first account to use.",
      "File a tax return for job income to build RRSP room.",
    ],
    quiz: [
      q("money-foundations", 1, { q: "When does TFSA contribution room start building?", options: ["At birth", "The year you turn 18", "When you get your first job", "At 25"], answer: 1, explain: "Room starts at 18, even if you open the account later." }),
      q("money-foundations", 2, { q: "Inside a TFSA, investment gains are…", options: ["Taxed at 50%", "Tax-free, even when withdrawn", "Taxed only on withdrawal", "Taxed every year"], answer: 1, explain: "That's the TFSA's superpower." }),
      q("money-foundations", 3, { q: "You have $500 of credit card debt at 21% interest and $500 in savings. Best move?", options: ["Invest the $500 in stocks", "Pay off the credit card", "Buy crypto", "Do nothing"], answer: 1, explain: "Paying off 21% debt is a guaranteed 21% 'return'." }),
      q("money-foundations", 4, { q: "Why should a teen with a part-time job file a tax return?", options: ["It's never useful", "It builds RRSP room and may get a refund", "To pay more tax", "It lets you skip school"], answer: 1, explain: "Earned income creates RRSP room for later." }),
      q("money-foundations", 5, { q: "How can a 15-year-old in Canada usually start investing?", options: ["Open their own brokerage account", "Through an in-trust-for account with a parent/guardian", "They can't learn about investing", "Only by buying crypto"], answer: 1, explain: "A parent or guardian opens and controls an ITF account." }),
    ],
  },
];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const ALL_QUESTIONS: QuizQuestion[] = LESSONS.flatMap((l) => l.quiz);
