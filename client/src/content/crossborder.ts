// Moving from Canada to Hong Kong: residency, tax filing, the Canada–Hong Kong
// tax treaty, moving money, and common pitfalls. General information only.
// Rules change; every section links to an official source.

export const CROSSBORDER_LAST_REVIEWED = "November 2026";

export const LINKS = {
  craEmigrants: "https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/leaving-canada-emigrants.html",
  craResidency: "https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/determining-your-residency-status.html",
  craNonResidents: "https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents.html",
  ird: "https://www.ird.gov.hk/eng/",
  immd: "https://www.immd.gov.hk/eng/",
  mpfa: "https://www.mpfa.org.hk/en",
  hkCustoms: "https://www.customs.gov.hk/en/",
  cbsa: "https://www.cbsa-asfc.gc.ca/",
  oas: "https://www.canada.ca/en/services/benefits/publicpensions.html",
};

export interface TreatyRow {
  item: string;
  withoutTreaty: string;
  withTreaty: string;
  note: string;
}

/** Canada–Hong Kong Comprehensive Double Taxation Agreement: key points for individuals. */
export const TREATY = {
  summary:
    "Canada and Hong Kong signed a comprehensive double taxation agreement (DTA) in 2012. It took effect in 2014 (from January 1 in Canada and from the 2014/15 year of assessment in Hong Kong). It decides which place may tax which income, caps the tax Canada can withhold on some payments to Hong Kong residents, and includes a 'tie-breaker' for people both places could treat as resident.",
  rows: [
    {
      item: "Dividends from Canadian companies",
      withoutTreaty: "25% Canadian withholding",
      withTreaty: "15% (5% for a company owning 10%+ of the payer)",
      note: "Hong Kong doesn't tax dividends you receive, so the Canadian withholding is the only tax.",
    },
    {
      item: "Interest from Canada",
      withoutTreaty: "Usually 0% for ordinary arm's-length interest (e.g. bank deposits, most bonds)",
      withTreaty: "Capped at 10% where Canada would otherwise tax it",
      note: "Hong Kong generally doesn't tax interest earned by individuals.",
    },
    {
      item: "Royalties from Canada",
      withoutTreaty: "25%",
      withTreaty: "10%",
      note: "Mostly relevant to creators and business owners.",
    },
    {
      item: "Gains on Canadian real estate",
      withoutTreaty: "Taxable in Canada",
      withTreaty: "Still taxable in Canada",
      note: "The treaty lets Canada keep taxing gains on property located in Canada.",
    },
    {
      item: "Gains on shares and most other investments",
      withoutTreaty: "Generally not taxed by Canada once you're non-resident (except 'taxable Canadian property')",
      withTreaty: "Generally taxable only where you live",
      note: "Hong Kong doesn't tax capital gains, but you may owe Canada's departure tax when you leave (see below).",
    },
    {
      item: "RRSP/RRIF withdrawals and Canadian pensions",
      withoutTreaty: "25% Canadian withholding (lump sums)",
      withTreaty: "Canada may still tax; some periodic pension payments may qualify for relief",
      note: "Confirm the rate for your situation with the CRA or your plan administrator before withdrawing.",
    },
    {
      item: "Salary for work done in Hong Kong",
      withoutTreaty: "Taxed by Hong Kong; also by Canada if you're still Canadian-resident",
      withTreaty: "Taxed in Hong Kong; if you're still Canadian-resident, Canada gives a foreign tax credit",
      note: "This is why properly becoming a non-resident of Canada matters.",
    },
  ] as TreatyRow[],
  tieBreaker: [
    "Where do you have a permanent home available to you?",
    "If both (or neither): where are your personal and economic relations closer (your 'centre of vital interests')?",
    "If still unclear: where do you habitually live?",
    "If still unclear: the two tax authorities decide together (Hong Kong looks at right of abode / permanent residence).",
  ],
  link: LINKS.ird,
};

export interface Step {
  title: string;
  detail: string;
  forms?: string;
}

export interface Phase {
  id: string;
  emoji: string;
  title: string;
  when: string;
  steps: Step[];
  link: { label: string; href: string };
}

export const MOVE_PHASES: Phase[] = [
  {
    id: "residency",
    emoji: "🧭",
    title: "Become a non-resident of Canada (properly)",
    when: "Before and around your move",
    steps: [
      {
        title: "Understand how Canada decides residency",
        detail:
          "Canada looks at your residential ties, not your passport. Significant ties: a home in Canada, a spouse or common-law partner, or dependants who stay in Canada. Secondary ties: a car, Canadian bank accounts and credit cards, provincial health coverage, a driver's licence, club memberships. Keeping significant ties can mean you're still a Canadian resident, taxable on your worldwide income.",
      },
      {
        title: "Cut or reduce ties",
        detail:
          "Sell or rent out your home on a long-term lease (renting it out keeps it from being a 'home available to you', but the rental income stays taxable in Canada). Have your family move with you if possible. Cancel provincial health coverage, sell or store your car, and close accounts you don't need.",
      },
      {
        title: "Know your departure date",
        detail:
          "Usually the latest of: the day you leave Canada, the day your spouse/partner and dependants leave, or the day you become a resident of Hong Kong.",
      },
      {
        title: "Optional: ask the CRA for an opinion",
        detail: "If your situation is unclear, you can ask the CRA to determine your residency status.",
        forms: "Form NR73 (Determination of Residency Status – Leaving Canada)",
      },
    ],
    link: { label: "CRA: determining your residency status", href: LINKS.craResidency },
  },
  {
    id: "departure-return",
    emoji: "📄",
    title: "File your final Canadian tax return (departure year)",
    when: "By April 30 of the year after you leave",
    steps: [
      {
        title: "Report worldwide income up to your departure date",
        detail:
          "Write your departure date on the return. Income from January 1 to that date is taxed as a resident; after it, only Canadian-source income (if any) is reported. Some credits are prorated.",
      },
      {
        title: "Departure tax (deemed disposition)",
        detail:
          "On leaving, Canada treats you as having sold most of your property at its fair market value, so unrealized gains in a non-registered investment account become taxable even though you didn't sell. Exceptions include Canadian real estate, RRSPs, RRIFs, TFSAs, FHSAs and pensions. You can elect to post security and pay the tax later, when you actually sell.",
        forms: "Form T1243 (deemed disposition), T1244 (election to defer payment), T1161 (list of properties if worth over CA$25,000)",
      },
      {
        title: "Stop benefits and tell the CRA",
        detail:
          "Payments like the Canada Child Benefit and the GST/HST credit stop when you become non-resident. Update your address in CRA My Account and keep access to it.",
      },
    ],
    link: { label: "CRA: leaving Canada (emigrants)", href: LINKS.craEmigrants },
  },
  {
    id: "accounts",
    emoji: "🏦",
    title: "Decide what to do with Canadian accounts",
    when: "Before you leave",
    steps: [
      {
        title: "Tell your bank and broker you're becoming non-resident",
        detail:
          "They must apply non-resident withholding tax. Some brokers restrict or close accounts for people living abroad, or block new trades, so ask before you go.",
      },
      {
        title: "TFSA",
        detail:
          "You can keep it and it stays tax-free in Canada (Hong Kong doesn't tax it either), but you earn no new room while non-resident. Contributing as a non-resident triggers a 1%-per-month penalty tax.",
      },
      {
        title: "RRSP / RRIF",
        detail:
          "Can stay invested and keep growing tax-deferred. Withdrawals as a non-resident have Canadian tax withheld (25% for lump sums under domestic law). Planning withdrawals carefully can save tax.",
      },
      {
        title: "FHSA and RESP",
        detail:
          "You can't contribute to an FHSA as a non-resident, and tax-free qualifying home withdrawals require you to be a Canadian resident. RESP government grants aren't paid while the student beneficiary is a non-resident. Review both before leaving.",
      },
      {
        title: "Canadian rental property",
        detail:
          "Your tenant or property manager must withhold 25% of gross rent for the CRA, unless you file to have tax withheld on net rent and then file a return for the rental income. Selling Canadian property as a non-resident requires a clearance certificate.",
        forms: "Form NR6 (net-rent withholding), section 216 return, T2062 (clearance certificate on sale)",
      },
    ],
    link: { label: "CRA: non-residents of Canada", href: LINKS.craNonResidents },
  },
  {
    id: "arrive-hk",
    emoji: "🛬",
    title: "Settle in Hong Kong",
    when: "First weeks after arriving",
    steps: [
      {
        title: "Visa and HKID",
        detail:
          "Unless you hold Hong Kong right of abode, you need a visa that allows you to live and work (e.g. employment, talent or dependant visa). If you'll stay over 180 days, apply for an HKID card within 30 days of arrival.",
      },
      {
        title: "MPF",
        detail:
          "Your employer must enrol you in an MPF scheme within the first 60 days of employment. Some people are exempt, for example if employed in Hong Kong for under 13 months or covered by an overseas retirement scheme.",
      },
      {
        title: "Hong Kong salaries tax",
        detail:
          "Hong Kong taxes income from Hong Kong employment (it's territorial: foreign investment income isn't taxed). The tax year runs April 1 to March 31. Your employer reports your start date to the IRD, which sends you a tax return (BIR60), usually in May. You may have to pay provisional tax for the next year.",
        forms: "IR56E (filed by employer when you start), BIR60 (your individual tax return)",
      },
      {
        title: "Proving you're a Hong Kong tax resident",
        detail:
          "To claim treaty rates (e.g. 15% instead of 25% on Canadian dividends), you may need a Certificate of Resident Status from the IRD. You generally qualify if you ordinarily reside in Hong Kong, or stay more than 180 days in a year (or more than 300 days over two consecutive years).",
      },
    ],
    link: { label: "Inland Revenue Department (IRD)", href: LINKS.ird },
  },
  {
    id: "ongoing",
    emoji: "🔁",
    title: "Every year while living in Hong Kong",
    when: "Ongoing",
    steps: [
      {
        title: "Hong Kong: file your BIR60",
        detail: "Report Hong Kong employment income and claim deductions (MPF, TVC, etc.). There's no tax on investment gains, dividends or most interest.",
      },
      {
        title: "Canada: usually no return needed, with exceptions",
        detail:
          "Most non-residents with only passive income (dividends, interest) just have tax withheld and don't file. You do need to file if you sold taxable Canadian property, elected to report Canadian rental or pension income, or want a refund of over-withheld tax.",
      },
      {
        title: "Expect automatic information sharing",
        detail:
          "Canada and Hong Kong both take part in the Common Reporting Standard (CRS). Banks report foreign account holders to their tax authority, which shares the data. Make sure your residency is up to date everywhere.",
      },
      {
        title: "Canadian pensions",
        detail:
          "CPP can be paid abroad. Old Age Security is only paid outside Canada if you lived in Canada for at least 20 years after age 18; otherwise it stops after six months abroad.",
      },
    ],
    link: { label: "Canada: public pensions", href: LINKS.oas },
  },
  {
    id: "return",
    emoji: "🔙",
    title: "If you move back to Canada later",
    when: "When you return",
    steps: [
      {
        title: "You become a resident again",
        detail:
          "You're taxed on worldwide income from the day you re-establish residency. Most property gets a 'step-up': its cost for Canadian tax becomes its market value on the day you arrive, so gains made while living in Hong Kong aren't taxed by Canada.",
      },
      {
        title: "TFSA room",
        detail: "Room accumulates again from the year you return (no room for the years you were away).",
      },
      {
        title: "Leaving Hong Kong",
        detail:
          "Your employer must notify the IRD at least one month before you leave and may hold back your final pay until your tax is settled. You can usually withdraw your MPF early if you leave Hong Kong permanently (with a statutory declaration).",
        forms: "IR56G (filed by employer before departure)",
      },
    ],
    link: { label: "CRA: international and non-residents", href: LINKS.craNonResidents },
  },
];

export const MONEY_MOVES: Step[] = [
  {
    title: "No limits on moving your own money",
    detail:
      "Neither Canada nor Hong Kong has capital controls, and transferring your own savings between countries isn't taxable income. What's taxable is the income those savings earn.",
  },
  {
    title: "Ways to send money",
    detail:
      "Bank wire (SWIFT): simple but can cost CA$15–50 in fees plus 1–3% in the exchange rate. Multi-currency providers and some brokers offer close-to-market exchange rates for larger amounts. Compare the total cost (fee + rate), not just the fee.",
  },
  {
    title: "Currency risk",
    detail:
      "The HKD is pegged to the USD, so CAD/HKD moves roughly like CAD/USD and can swing 5–10% in a year. Consider keeping some CAD for Canadian expenses (property, family, a future return) instead of converting everything at once.",
  },
  {
    title: "Expect source-of-funds questions",
    detail:
      "Banks in both places must follow anti-money-laundering rules. For large transfers, have documents ready: pay slips, sale agreements, account statements. Canadian banks report international transfers of CA$10,000 or more to FINTRAC; that's routine reporting, not a tax.",
  },
  {
    title: "Carrying cash or cheques",
    detail:
      "Declare CA$10,000 or more in currency or monetary instruments when leaving or entering Canada (CBSA). Hong Kong requires a declaration for HK$120,000 or more when arriving or leaving.",
  },
  {
    title: "Gifts and inheritances",
    detail:
      "Neither Canada nor Hong Kong has a gift tax, and Hong Kong abolished estate duty in 2006. In Canada, a person who dies is generally treated as having sold their assets, so the estate may owe tax on gains before money is passed on.",
  },
];

export const WATCH_OUTS: string[] = [
  "Keeping a Canadian home, spouse or dependants in Canada can make you a Canadian resident, taxed on worldwide income, even while working in Hong Kong.",
  "Departure tax can create a bill on non-registered investments you haven't sold. Plan for the cash or elect to defer with security.",
  "Don't contribute to a TFSA, FHSA or RRSP (beyond earned room) after you leave. Penalties add up monthly.",
  "Some Canadian brokers and robo-advisors will restrict or close non-resident accounts, and some Hong Kong banks ask Canadian-resident status questions. Sort out accounts before you go.",
  "Hong Kong banks will report your accounts to the CRA via CRS if you're still listed as Canadian-resident. Update your residency with every institution.",
  "Rental income from Canadian property is still taxed in Canada. Arrange NR6/section 216 or 25% gross withholding applies.",
  "Your credit history doesn't transfer. Keep one Canadian credit card active if you may return, and expect to build credit from scratch in Hong Kong.",
  "Health coverage: provincial health insurance ends after you leave. Arrange Hong Kong cover (employer plan or private) from day one.",
  "US citizens and green-card holders have extra US tax rules wherever they live. This guide doesn't cover them.",
  "Rules, rates and forms change. Confirm with the CRA and IRD, and consider a cross-border tax professional for large or complex moves.",
];
