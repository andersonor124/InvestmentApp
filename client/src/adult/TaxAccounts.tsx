import { Card, PageHeader } from "../components/ui";
import { ACCOUNTS, LAST_REVIEWED, TAX_RULES, type AccountInfo, type TaxRule } from "../content/canada";
import { HK_ACCOUNTS, HK_LAST_REVIEWED, HK_PLACEMENT, HK_TAX_RULES } from "../content/hongkong";
import { useStore, type Region } from "../store";

const CA_PLACEMENT = [
  { what: "Canadian dividend stocks (banks, pipelines, utilities)", where: "TFSA or non-registered (dividend tax credit)" },
  { what: "US dividend stocks / US-listed ETFs", where: "RRSP (no 15% US withholding tax)" },
  { what: "High-growth stocks", where: "TFSA (gains never taxed)" },
  { what: "Bonds / GICs (interest income)", where: "RRSP or TFSA (interest is fully taxed elsewhere)" },
  { what: "Saving for a first home", where: "FHSA first, then TFSA" },
];

export const REGIONS: { id: Region; label: string }[] = [
  { id: "CA", label: "🍁 Canada" },
  { id: "HK", label: "🇭🇰 Hong Kong" },
];

export function RegionSwitch() {
  const { investor, setInvestor } = useStore();
  return (
    <div className="flex rounded-xl border border-line p-0.5 text-sm font-semibold" role="group" aria-label="Choose your country">
      {REGIONS.map((r) => (
        <button
          key={r.id}
          onClick={() => setInvestor({ ...investor, region: r.id })}
          aria-pressed={investor.region === r.id}
          className={`rounded-lg px-3 py-1.5 ${investor.region === r.id ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export default function TaxAccounts() {
  const { investor } = useStore();
  const hk = investor.region === "HK";

  return (
    <div className="space-y-6">
      <PageHeader
        title={hk ? "🇭🇰 Hong Kong accounts & tax" : "🍁 Canadian accounts & tax"}
        subtitle={`Where you hold an investment can matter as much as what you buy. General information only. Last reviewed ${hk ? HK_LAST_REVIEWED : LAST_REVIEWED}; limits and rules change, so confirm with ${hk ? "the IRD, MPFA" : "the CRA"} or a tax professional.`}
      >
        <RegionSwitch />
      </PageHeader>

      {hk ? <HongKong /> : <Canada />}
    </div>
  );
}

function Canada() {
  return (
    <>
      <Card>
        <h2 className="text-lg font-bold">Which account first? A common order</h2>
        <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm">
          <li>Emergency fund (3–6 months of expenses) in a high-interest savings account, and pay off high-interest debt.</li>
          <li>Employer RRSP/pension match, if offered. It's an instant return.</li>
          <li><strong>FHSA</strong> if you may buy a first home (deductible + tax-free).</li>
          <li><strong>TFSA</strong> for flexible, tax-free long-term growth.</li>
          <li><strong>RRSP</strong>, especially valuable at higher incomes (deduct at a high rate, withdraw at a lower one).</li>
          <li>Non-registered account once registered room is used up.</li>
        </ol>
        <p className="mt-2 text-xs text-muted">Higher earners often put the RRSP before the TFSA. The right order depends on your income now vs in retirement.</p>
      </Card>
      <AccountGrid accounts={ACCOUNTS} source="CRA details" />
      <Placement rows={CA_PLACEMENT} />
      <Rules title="Tax rules every Canadian investor should know" rules={TAX_RULES} />
    </>
  );
}

function HongKong() {
  return (
    <>
      <Card>
        <h2 className="text-lg font-bold">How investing works in Hong Kong: the big picture</h2>
        <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm">
          <li>Emergency fund (3–6 months of expenses) and no high-interest credit card debt.</li>
          <li>
            <strong>MPF</strong>: mandatory for employees. Check your fund choices and fees; small fee differences compound over decades.
          </li>
          <li>
            <strong>TVC</strong>: optional extra retirement savings with a salaries tax deduction (up to HK$60,000 a year combined with QDAP).
          </li>
          <li>
            <strong>Brokerage account</strong>: for everything else. No capital gains or dividend tax for most investors, so a normal account is already tax-efficient.
          </li>
        </ol>
        <p className="mt-2 text-xs text-muted">
          The big costs to watch in HK are fees, stamp duty on HK stocks, and foreign withholding tax (30% on US dividends), not local income tax.
        </p>
      </Card>
      <AccountGrid accounts={HK_ACCOUNTS} source="Official details" />
      <Placement rows={HK_PLACEMENT} />
      <Rules title="Tax rules every Hong Kong investor should know" rules={HK_TAX_RULES} />
      <Card className="bg-accent-soft">
        <h2 className="font-bold">📌 Note on this app's picks</h2>
        <p className="mt-1 text-sm">
          The stock list is mostly US and Canadian companies, priced in USD. Because the HKD is pegged to the USD, currency swings matter little for HK investors, but US dividends lose 30% to withholding, so growth-focused US stocks are often more tax-efficient than high-yield ones.
        </p>
      </Card>
    </>
  );
}

function AccountGrid({ accounts, source }: { accounts: AccountInfo[]; source: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {accounts.map((a) => (
        <Card key={a.id}>
          <h2 className="text-lg font-bold">
            {a.emoji} {a.name}
          </h2>
          <p className="mt-1 text-sm text-accent">Best for: {a.bestFor}</p>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm">
            {a.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <a href={a.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-accent">
            {source} ↗
          </a>
        </Card>
      ))}
    </div>
  );
}

function Placement({ rows }: { rows: { what: string; where: string }[] }) {
  return (
    <Card className="overflow-x-auto">
      <h2 className="text-lg font-bold">Asset location cheat sheet</h2>
      <table className="mt-3 w-full min-w-[28rem] text-sm">
        <thead className="text-left text-xs uppercase text-muted">
          <tr>
            <th className="py-2">Investment</th>
            <th>Often best held in / watch out for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.what} className="border-t border-line">
              <td className="py-2 pr-4">{p.what}</td>
              <td className="py-2 font-semibold">{p.where}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Rules({ title, rules }: { title: string; rules: TaxRule[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <Card key={r.title}>
            <h3 className="font-bold">{r.title}</h3>
            <p className="mt-1 text-sm">{r.body}</p>
            <a href={r.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-accent">
              Learn more ↗
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
