// "Maya's Lemonade Co.": a running case study that grows one chapter per lesson,
// so every new term attaches to the same concrete little business.

export interface StoryChapter {
  title: string;
  body: string;
  numbers?: [label: string, value: string][];
}

export const STORY: Record<string, StoryChapter> = {
  "what-is-stock": {
    title: "Chapter 1: Maya needs $500",
    body: "Maya runs a lemonade stand and wants a bigger cart with a fridge. It costs $500, which she doesn't have. So she splits her business into 100 shares and sells them to friends and family for $5 each. You buy 10 shares for $50. You now own 10% of Maya's Lemonade Co., and 10% of its future profits.",
    numbers: [
      ["Shares created", "100"],
      ["Price per share", "$5"],
      ["Your shares", "10 (10% ownership)"],
    ],
  },
  "why-prices-move": {
    title: "Chapter 2: Heat wave!",
    body: "A heat wave is forecast. Everyone expects Maya to sell tons of lemonade, so people start offering $8 for a share. Then a rumour spreads that it will rain all July and offers drop to $4. Maya's stand is exactly the same both days. Only people's expectations about the future changed.",
    numbers: [
      ["Price before forecast", "$5"],
      ["During the hype", "$8"],
      ["After the rain rumour", "$4"],
    ],
  },
  "reading-company": {
    title: "Chapter 3: Year one results",
    body: "Maya sold 1,000 cups at $2 = $2,000 of revenue. Lemons, sugar, cups and paying her helper cost $1,500, leaving $500 of profit. She also borrowed $300 from her uncle for a juicer, while the shareholders' money in the business (equity) is $600.",
    numbers: [
      ["Revenue", "$2,000"],
      ["Costs", "$1,500"],
      ["Net income (profit)", "$500"],
      ["Profit margin", "25%"],
      ["Debt-to-equity", "$300 ÷ $600 = 0.5"],
    ],
  },
  valuation: {
    title: "Chapter 4: Is $60 a fair price?",
    body: "Maya's $500 profit ÷ 100 shares = $5 of earnings per share (EPS). Shares now trade at $60, so the P/E is 60 ÷ 5 = 12: buyers pay 12 years of today's profit. Across the street, Jay's Smoothie Shack trades at a P/E of 40, but its profits are doubling every year. Which is the better deal? It depends on growth, which is why investors also check the PEG ratio.",
    numbers: [
      ["EPS", "$500 ÷ 100 = $5"],
      ["Share price", "$60"],
      ["P/E", "60 ÷ 5 = 12"],
      ["Jay's P/E (growing 100%/yr)", "40 → PEG 0.4"],
    ],
  },
  dividends: {
    title: "Chapter 5: Payday for owners",
    body: "Maya decides to pay a $2-per-share dividend from her $5 of EPS and keep the other $3 per share to open a second stand. Your 10 shares earn you $20 in cash just for owning them.",
    numbers: [
      ["Dividend per share", "$2"],
      ["Payout ratio", "$2 ÷ $5 = 40%"],
      ["Dividend yield", "$2 ÷ $60 = 3.3%"],
      ["Your cash", "10 × $2 = $20"],
    ],
  },
  "risk-diversification": {
    title: "Chapter 6: The lemon shortage",
    body: "A frost destroys the lemon harvest. Lemon prices triple and Maya's profit disappears for a summer. Your friend Sam, who owns shares in Maya's stand, an ice-cream truck, an umbrella shop and a bike repair business, barely notices. You, holding only Maya, watch your shares fall 40%.",
    numbers: [
      ["Your portfolio (1 business)", "−40%"],
      ["Sam's portfolio (4 businesses)", "−8%"],
    ],
  },
  "compounding-time": {
    title: "Chapter 7: The snowball",
    body: "Maya keeps reinvesting her profits into new stands. One stand becomes 2, then 4, then 8. Because each new stand also earns money that gets reinvested, profits grow faster and faster. Five years later, Maya's Lemonade Co. earns $8,000 a year and your early shares are worth far more than the $50 you paid.",
    numbers: [
      ["Year 1 profit", "$500"],
      ["Year 5 profit", "$8,000"],
      ["Growth", "~100% per year (very lucky!)"],
    ],
  },
  "index-funds": {
    title: "Chapter 8: The Neighbourhood Index",
    body: "A clever neighbour creates the 'Neighbourhood Index Fund' that owns a small piece of all 20 businesses on your street. For $10 you get a slice of everything, from Maya's lemonade to the corner bakery, for a tiny yearly fee of 0.1%. You don't have to guess which stand will win.",
    numbers: [
      ["Businesses owned", "20"],
      ["Yearly fee (MER)", "0.1% ($0.10 per $100)"],
    ],
  },
  "scams-hype": {
    title: "Chapter 9: 'MayaCoin to the moon! 🚀'",
    body: "A stranger online launches 'MayaCoin', claiming it's linked to Maya's stand and will '100× by Friday'. Hundreds of people pile in, the price soars and the stranger quietly sells everything. The price collapses 95%. Maya had nothing to do with it. Real businesses earn money by selling things, not by hype.",
    numbers: [
      ["Promised", "100× in a week"],
      ["What happened", "−95%"],
    ],
  },
  "money-foundations": {
    title: "Chapter 10: Your first paycheque",
    body: "Maya hires you for the summer and you earn $1,200. First you set aside $300 as an emergency fund. You file a tax return (which builds RRSP room and may get you a refund). Your parent opens an 'in-trust-for' account with you, and you invest $50 a month in a low-fee index ETF. When you turn 18 (or 19), you'll open your own TFSA, which will already have contribution room waiting.",
    numbers: [
      ["Paycheque", "$1,200"],
      ["Emergency fund", "$300"],
      ["Monthly investing", "$50 in an index ETF"],
    ],
  },
};
