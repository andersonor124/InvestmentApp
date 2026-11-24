import { Card, PageHeader } from "../components/ui";
import { ACCOUNTS, LAST_REVIEWED, TAX_RULES } from "../content/canada";

const PLACEMENT = [
  { what: "Canadian dividend stocks (banks, pipelines, utilities)", where: "TFSA or non-registered (dividend tax credit)" },
  { what: "US dividend stocks / US-listed ETFs", where: "RRSP (no 15% US withholding tax)" },
  { what: "High-growth stocks", where: "TFSA (gains never taxed)" },
  { what: "Bonds / GICs (interest income)", where: "RRSP or TFSA (interest is fully taxed elsewhere)" },
  { what: "Saving for a first home", where: "FHSA first, then TFSA" },
];

export default function TaxAccounts() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="🍁 Canadian accounts & tax"
        subtitle={`Where you hold an investment can matter as much as what you buy. General information only. Last reviewed ${LAST_REVIEWED}; limits and rules change, so confirm with the CRA or a tax professional.`}
      />

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

      <div className="grid gap-4 md:grid-cols-2">
        {ACCOUNTS.map((a) => (
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
              CRA details ↗
            </a>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <h2 className="text-lg font-bold">Asset location cheat sheet</h2>
        <table className="mt-3 w-full min-w-[28rem] text-sm">
          <thead className="text-left text-xs uppercase text-muted">
            <tr>
              <th className="py-2">Investment</th>
              <th>Often best held in</th>
            </tr>
          </thead>
          <tbody>
            {PLACEMENT.map((p) => (
              <tr key={p.what} className="border-t border-line">
                <td className="py-2 pr-4">{p.what}</td>
                <td className="py-2 font-semibold">{p.where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold">Tax rules every Canadian investor should know</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TAX_RULES.map((r) => (
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
    </div>
  );
}
