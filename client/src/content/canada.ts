// Canadian accounts, tax rules and ETF references for the Adult section.
// Rules change. Each item links to the CRA so readers can confirm current figures.
import type { RiskProfile, Sector } from "../../../shared/types";

export const LAST_REVIEWED = "November 2026";

export interface AccountInfo {
  id: string;
  name: string;
  emoji: string;
  bestFor: string;
  points: string[];
  link: string;
}

export const ACCOUNTS: AccountInfo[] = [
  {
    id: "tfsa",
    name: "TFSA: Tax-Free Savings Account",
    emoji: "🌱",
    bestFor: "Most investors' first account; flexible, long-term growth.",
    points: [
      "Contributions aren't deductible, but all growth and withdrawals are tax-free.",
      "Room accrues from the year you turn 18 (if you're a resident), even before you open an account. The annual limit has recently been $7,000; unused room carries forward.",
      "Withdrawals are added back to your room on January 1 of the following year. Re-contributing in the same year can cause over-contribution penalties (1% per month).",
      "US dividends: the 15% US withholding tax is NOT recoverable in a TFSA. Canadian dividends and growth stocks are often a better fit.",
      "Frequent trading can lead the CRA to treat gains as business income, taxable even inside a TFSA.",
    ],
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account.html",
  },
  {
    id: "rrsp",
    name: "RRSP: Registered Retirement Savings Plan",
    emoji: "🏖️",
    bestFor: "Higher earners who expect a lower tax rate in retirement.",
    points: [
      "Contributions are deductible; growth is tax-deferred; withdrawals are taxed as income.",
      "Room = 18% of last year's earned income up to the annual maximum, plus unused room. Check your Notice of Assessment or CRA My Account.",
      "US dividends are exempt from the 15% US withholding tax inside an RRSP (treaty benefit), making it the most efficient home for US dividend payers and US-listed ETFs.",
      "Home Buyers' Plan and Lifelong Learning Plan allow tax-free withdrawals that must be repaid.",
      "Must be converted to a RRIF (or annuity) by the end of the year you turn 71.",
    ],
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans.html",
  },
  {
    id: "fhsa",
    name: "FHSA: First Home Savings Account",
    emoji: "🏠",
    bestFor: "First-time home buyers (18+).",
    points: [
      "$8,000 per year, $40,000 lifetime. Up to $8,000 of unused room carries forward one year.",
      "Contributions are deductible AND qualifying withdrawals for a first home are tax-free.",
      "Can stay open up to 15 years (or until age 71). Unused funds can be transferred to an RRSP without using RRSP room.",
      "Room only starts accruing once the account is opened, so open one early even with a small deposit.",
    ],
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html",
  },
  {
    id: "resp",
    name: "RESP: Registered Education Savings Plan",
    emoji: "🎓",
    bestFor: "Parents and guardians saving for a child's education.",
    points: [
      "The government's Canada Education Savings Grant adds 20% on the first $2,500 contributed per child per year (up to $500/year, $7,200 lifetime).",
      "Lower-income families may qualify for the Canada Learning Bond, with no contribution required.",
      "Growth and grants are taxed in the student's hands when withdrawn, usually at a very low rate.",
    ],
    link: "https://www.canada.ca/en/services/benefits/education/education-savings.html",
  },
  {
    id: "non-registered",
    name: "Non-registered (taxable) account",
    emoji: "📂",
    bestFor: "After registered room is used up.",
    points: [
      "Only 50% of capital gains is taxable (the inclusion rate). Capital losses can offset gains.",
      "Eligible Canadian dividends are grossed up and receive the dividend tax credit, which is very efficient at lower incomes.",
      "Interest income is fully taxed at your marginal rate.",
      "Track your adjusted cost base (ACB): Canada uses the average cost of identical shares across all your non-registered accounts.",
    ],
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains.html",
  },
];

export interface TaxRule {
  title: string;
  body: string;
  link: string;
}

export const TAX_RULES: TaxRule[] = [
  {
    title: "Capital gains inclusion rate: 50%",
    body: "In a taxable account, half of a capital gain is added to your income. A proposed increase to two-thirds was cancelled in 2025. Gains inside a TFSA, RRSP or FHSA aren't reported.",
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains.html",
  },
  {
    title: "Superficial loss rule (Canada's 'wash sale')",
    body: "If you sell at a loss and you (or an affiliated person such as your spouse, or your TFSA/RRSP) buy the identical property within 30 days before or after, and still hold it 30 days after the sale, the loss is denied. It's added to the ACB of the repurchased shares instead.",
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains/capital-losses-deductions/what-a-superficial-loss.html",
  },
  {
    title: "Dividend tax credit",
    body: "Eligible dividends from Canadian corporations are grossed up (38%) and then receive federal and provincial credits, so they're taxed less than interest or foreign dividends in a taxable account.",
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-40425-federal-dividend-tax-credit.html",
  },
  {
    title: "US dividends & withholding tax",
    body: "The US withholds 15% of dividends paid to Canadians (after you file a W-8BEN with your broker). It's exempt in an RRSP/RRIF, lost in a TFSA/FHSA, and claimable as a foreign tax credit in a taxable account.",
    link: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-40500-federal-foreign-tax-credit.html",
  },
  {
    title: "Foreign property reporting (T1135)",
    body: "If the total cost of specified foreign property (such as US stocks held in a non-registered account) exceeds $100,000 CAD at any time in the year, you must file Form T1135. Registered accounts are excluded.",
    link: "https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/questions-answers-about-form-t1135.html",
  },
  {
    title: "Currency: the hidden cost of US stocks",
    body: "Prices here are in USD. Converting CAD→USD at a bank can cost 1.5–2.5% each way. Some brokers offer USD accounts or Norbert's Gambit (journaling an interlisted security) to cut the cost. Canadian-listed ETFs avoid it entirely.",
    link: "https://www.canada.ca/en/financial-consumer-agency.html",
  },
];

// ETF alternatives: lower-risk ways to own a sector instead of one stock.
export const SECTOR_ETF_ALTERNATIVES: Record<Exclude<Sector, "Index ETF">, { us: string; usName: string; ca?: string; caName?: string }> = {
  Technology: { us: "XLK", usName: "Technology Select Sector SPDR", ca: "XIT", caName: "iShares S&P/TSX Capped Info Tech" },
  Communication: { us: "XLC", usName: "Communication Services Select Sector SPDR" },
  "Consumer Discretionary": { us: "XLY", usName: "Consumer Discretionary Select Sector SPDR" },
  "Consumer Staples": { us: "XLP", usName: "Consumer Staples Select Sector SPDR" },
  Financials: { us: "XLF", usName: "Financial Select Sector SPDR", ca: "ZEB", caName: "BMO Equal Weight Banks" },
  "Health Care": { us: "XLV", usName: "Health Care Select Sector SPDR" },
  Energy: { us: "XLE", usName: "Energy Select Sector SPDR", ca: "XEG", caName: "iShares S&P/TSX Capped Energy" },
  Industrials: { us: "XLI", usName: "Industrial Select Sector SPDR" },
  Materials: { us: "XLB", usName: "Materials Select Sector SPDR", ca: "XMA", caName: "iShares S&P/TSX Capped Materials" },
  Utilities: { us: "XLU", usName: "Utilities Select Sector SPDR", ca: "ZUT", caName: "BMO Equal Weight Utilities" },
  "Real Estate": { us: "XLRE", usName: "Real Estate Select Sector SPDR", ca: "XRE", caName: "iShares S&P/TSX Capped REIT" },
};

export const CORE_CANADIAN_ETFS = [
  { symbol: "XEQT / VEQT", name: "All-equity global portfolio (~100% stocks)", mer: "~0.20–0.24%" },
  { symbol: "XGRO / VGRO", name: "Growth portfolio (~80% stocks / 20% bonds)", mer: "~0.20–0.24%" },
  { symbol: "XBAL / VBAL", name: "Balanced portfolio (~60% stocks / 40% bonds)", mer: "~0.20–0.24%" },
  { symbol: "XCNS / VCNS", name: "Conservative portfolio (~40% stocks / 60% bonds)", mer: "~0.20–0.24%" },
  { symbol: "XIC", name: "S&P/TSX Capped Composite (Canada)", mer: "~0.06%" },
  { symbol: "VFV", name: "S&P 500 in CAD", mer: "~0.09%" },
  { symbol: "ZAG", name: "Canadian aggregate bonds", mer: "~0.09%" },
];

export interface AllocationSuggestion {
  stocks: number;
  bonds: number;
  cash: number;
  example: string;
  singleStockCap: number; // max % of portfolio in individual stocks
  note: string;
}

export const ALLOCATIONS: Record<RiskProfile, AllocationSuggestion> = {
  conservative: {
    stocks: 40,
    bonds: 50,
    cash: 10,
    example: "XCNS / VCNS",
    singleStockCap: 5,
    note: "Prioritizes stability. Expect smaller drops in bad years and slower growth.",
  },
  balanced: {
    stocks: 60,
    bonds: 35,
    cash: 5,
    example: "XBAL / VBAL",
    singleStockCap: 10,
    note: "A middle path: meaningful growth with a cushion of bonds.",
  },
  aggressive: {
    stocks: 90,
    bonds: 10,
    cash: 0,
    example: "XGRO / VGRO or XEQT / VEQT",
    singleStockCap: 15,
    note: "Maximizes long-term growth. Expect drops of 30%+ in bad years.",
  },
};
