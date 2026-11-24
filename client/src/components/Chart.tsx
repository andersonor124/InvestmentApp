import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface Series {
  key: string;
  label: string;
  color: string; // CSS color, e.g. var(--series-1)
  dashed?: boolean;
}

/** Simple line chart: thin 2px lines, recessive grid, crosshair tooltip, legend for 2+ series. */
export function LineChartBox({
  data,
  xKey,
  series,
  yFormat = (v) => String(v),
  xFormat = (v) => String(v),
  height = 260,
  referenceX,
  referenceLabel,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: Series[];
  yFormat?: (v: number) => string;
  xFormat?: (v: string | number) => string;
  height?: number;
  referenceX?: string | number;
  referenceLabel?: string;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey={xKey} tickFormatter={xFormat} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} minTickGap={24} />
          <YAxis tickFormatter={yFormat} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={64} domain={["auto", "auto"]} />
          <Tooltip
            formatter={(v, name) => [yFormat(Number(v)), name]}
            labelFormatter={(l) => xFormat(l as string)}
            contentStyle={{ color: "var(--text)", fontSize: 13 }}
            cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 13, color: "var(--muted)" }} iconType="plainline" />}
          {referenceX !== undefined && (
            <ReferenceLine x={referenceX} stroke="var(--muted)" strokeDasharray="4 4" label={{ value: referenceLabel, fill: "var(--muted)", fontSize: 12, position: "insideTopLeft" }} />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "6 4" : undefined}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
