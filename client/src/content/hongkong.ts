// Hong Kong accounts, tax rules and ETF references for the Adult section.
// Rules and rates change. Each item links to an official source to confirm current figures.
import type { AccountInfo, TaxRule } from "./canada";

export const HK_LAST_REVIEWED = "November 2026";

export const HK_ACCOUNTS: AccountInfo[] = [
  {
    id: "mpf",
    name: "MPF: Mandatory Provident Fund",
    emoji: "🏦",
    bestFor: "Every employee's core retirement savings.",
    points: [
      "Employers and employees each contribute 5% of relevant income, capped at HK$1,500 a month each (on income of HK$30,000+). Employees earning under HK$7,100 a month don't contribute, but their employer still does.",
      "Your own mandatory contributions are tax-deductible up to HK$18,000 a year.",
      "Money is locked in until age 65 (with limited exceptions such as early retirement at 60, permanent departure from HK, or terminal illness).",
      "You choose funds within your scheme. Fees vary a lot, so compare fund expense ratios (FER). The 'Default Investment Strategy' (DIS) caps management fees at 0.75% a year.",
      "The eMPF platform lets you see and consolidate all your MPF accounts in one place.",
    ],
    link: "https://www.mpfa.org.hk/en",
  },
  {
    id: "tvc",
    name: "TVC: Tax-Deductible Voluntary Contributions",
    emoji: "➕",
    bestFor: "Employees who want extra tax-deductible retirement savings.",
    points: [
      "Extra contributions into a special MPF account, deductible from salaries tax.",
      "TVC and qualifying deferred annuity (QDAP) premiums share a combined deduction cap of HK$60,000 a year.",
      "Like the MPF, the money is locked until age 65.",
      "Most useful for people paying salaries tax at higher progressive rates.",
    ],
    link: "https://www.mpfa.org.hk/en",
  },
  {
    id: "brokerage",
    name: "Regular brokerage (securities) account",
    emoji: "📂",
    bestFor: "Investing in HK, Mainland and overseas stocks and ETFs.",
    points: [
      "Usually requires you to be 18 or over. Many banks and online brokers offer HK, US and China A-share (via Stock Connect) trading.",
      "There's no tax-sheltered account like a Canadian TFSA because Hong Kong doesn't tax investment gains or dividends for most individual investors. A normal account is already very tax-efficient.",
      "HK stocks trade in board lots (e.g. 100 or 500 shares), so the minimum purchase can be larger than you expect.",
      "Check that your broker is licensed by the SFC (sfc.hk public register).",
    ],
    link: "https://www.sfc.hk/en/",
  },
];

export const HK_TAX_RULES: TaxRule[] = [
  {
    title: "No capital gains tax",
    body: "Hong Kong doesn't tax capital gains for individuals who invest. Selling shares at a profit isn't taxed, and losses aren't deductible either.",
    link: "https://www.gov.hk/en/residents/taxes/salaries/salariestax/index.htm",
  },
  {
    title: "Frequent trading can become 'business' profits",
    body: "If your buying and selling looks like a trading business (very frequent, short-term trades, borrowed money, organised like a business), the Inland Revenue Department can charge profits tax on the gains.",
    link: "https://www.ird.gov.hk/eng/",
  },
  {
    title: "No tax on dividends received",
    body: "Hong Kong doesn't tax dividends received by individuals, and HK companies don't withhold tax on dividends. Overseas countries may withhold tax before the dividend reaches you (see below).",
    link: "https://www.gov.hk/en/residents/taxes/salaries/salariestax/index.htm",
  },
  {
    title: "US stocks: 30% dividend withholding",
    body: "Hong Kong has no tax treaty with the US, so US dividends paid to HK residents are usually taxed at 30% at source (file a W-8BEN with your broker). Some HK investors use Ireland-domiciled US-stock ETFs, which suffer 15% inside the fund instead.",
    link: "https://www.irs.gov/individuals/international-taxpayers/nra-withholding",
  },
  {
    title: "Mainland China dividends",
    body: "Dividends from H-shares and from A-shares bought through Stock Connect generally have 10% withheld for individual investors. Some red-chip companies may also withhold.",
    link: "https://www.hkex.com.hk/",
  },
  {
    title: "Stamp duty and trading levies",
    body: "Buying or selling HK stocks costs 0.1% stamp duty on each side (rounded up to the nearest dollar). Small exchange and regulator fees apply too: SFC levy 0.0027%, AFRC levy 0.00015% and HKEX trading fee 0.00565%. Transfers of ETFs listed in HK are exempt from stamp duty.",
    link: "https://www.ird.gov.hk/eng/",
  },
  {
    title: "Currency: the USD peg",
    body: "The Hong Kong dollar is pegged to the US dollar (HK$7.75–7.85 per US$1), so US-dollar investments carry little currency risk for HKD savers. Investments in RMB, EUR or other currencies do carry FX risk.",
    link: "https://www.hkma.gov.hk/eng/",
  },
  {
    title: "Salaries tax deductions for savers",
    body: "Mandatory MPF contributions (up to HK$18,000) and TVC/QDAP contributions (up to HK$60,000 combined) are deductible from salaries tax, which is charged at progressive rates of 2–17% or a standard rate, whichever is lower.",
    link: "https://www.ird.gov.hk/eng/",
  },
];

export const HK_PLACEMENT = [
  { what: "HK-listed stocks and ETFs (e.g. Tracker Fund 2800)", where: "Brokerage account: no tax on gains or dividends; ETFs avoid stamp duty" },
  { what: "US stocks paying dividends", where: "Expect 30% withholding; consider growth stocks or Ireland-domiciled ETFs" },
  { what: "Long-term retirement savings", where: "MPF (mandatory) + TVC for an extra tax deduction" },
  { what: "Active short-term trading", where: "Be careful: it can be taxed as business profits" },
];

export const HK_CORE_ETFS = [
  { symbol: "2800", name: "Tracker Fund of Hong Kong (Hang Seng Index)", mer: "~0.1%" },
  { symbol: "2828", name: "Hang Seng China Enterprises Index ETF (H-shares)", mer: "~0.6%" },
  { symbol: "3033", name: "Hang Seng TECH Index ETF", mer: "~1%" },
  { symbol: "CSPX / VUAA", name: "S&P 500, Ireland-domiciled, USD (London-listed)", mer: "~0.07%" },
  { symbol: "VWRA", name: "FTSE All-World, Ireland-domiciled, USD (London-listed)", mer: "~0.19–0.22%" },
];
