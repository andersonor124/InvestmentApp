export const money = (n: number | null | undefined, digits = 2) =>
  n === null || n === undefined
    ? "—"
    : n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const num = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const pct = (n: number | null | undefined, digits = 1, signed = false) =>
  n === null || n === undefined ? "—" : `${signed && n > 0 ? "+" : ""}${n.toFixed(digits)}%`;

/** Market cap given in USD millions. */
export const bigMoney = (millions: number | null | undefined) => {
  if (millions === null || millions === undefined) return "—";
  if (millions >= 1_000_000) return `$${(millions / 1_000_000).toFixed(2)}T`;
  if (millions >= 1_000) return `$${(millions / 1_000).toFixed(1)}B`;
  return `$${millions.toFixed(0)}M`;
};

export const changeClass = (n: number | null | undefined) =>
  n === null || n === undefined ? "text-muted" : n >= 0 ? "text-gain" : "text-loss";

/** Local calendar day as YYYY-MM-DD. */
export const todayKey = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86_400_000);
