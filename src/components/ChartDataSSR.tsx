/**
 * Renders chart data as plain HTML so crawlers (Google) and assistive tech see it.
 * Use alongside the client-rendered charts. No "use client" = SSR only.
 */
type ChartData = { labels: string[]; data: number[]; min: number; max: number } | null;

type ChartDataSSRProps = {
  chartOne: ChartData;
  chartTwo: ChartData;
  displayName: string;
  /** e.g. "Price trend" / "Egg price by date" */
  chartOneLabel?: string;
  /** e.g. "Low and high price" */
  chartTwoLabel?: string;
};

export function ChartDataSSR({
  chartOne,
  chartTwo,
  displayName,
  chartOneLabel = "Date / period",
  chartTwoLabel = "Low and high price",
}: ChartDataSSRProps) {
  const hasAny = chartOne || chartTwo;
  if (!hasAny) return null;

  return (
    <div
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900"
      data-chart-data="ssr"
    >
      <h3 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
        {displayName} egg price trend
      </h3>
      <div className="space-y-4 text-sm">
        {chartOne && chartOne.labels.length > 0 && (
          <section aria-label={chartOneLabel}>
            <h4 className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">
              {chartOneLabel}
            </h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-1 text-left font-medium text-zinc-700 dark:text-zinc-300">Date / City</th>
                  <th className="py-1 text-right font-medium text-zinc-700 dark:text-zinc-300">Egg price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {chartOne.labels.map((label, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-1 text-zinc-800 dark:text-zinc-200">{label}</td>
                    <td className="py-1 text-right text-zinc-800 dark:text-zinc-200">₹{chartOne.data[i] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {chartTwo && chartTwo.labels.length > 0 && (
          <section aria-label={chartTwoLabel}>
            <h4 className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">
              {chartTwoLabel}
            </h4>
            <p className="text-zinc-800 dark:text-zinc-200">
              {chartTwo.labels[0]}: ₹{chartTwo.data[0] ?? "—"} · {chartTwo.labels[1]}: ₹
              {chartTwo.data[1] ?? "—"}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
