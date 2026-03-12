"use client";

import dynamic from "next/dynamic";

// Charts stay client-only (Recharts needs DOM). Chart data is also output as SSR HTML via ChartDataSSR on the page.
const PriceChart = dynamic(
  () => import("@/components/PriceChart").then((m) => ({ default: m.PriceChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
    ),
  }
);

const LowHighChart = dynamic(
  () => import("@/components/LowHighChart").then((m) => ({ default: m.LowHighChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
    ),
  }
);

type ChartOne = { labels: string[]; data: number[]; min: number; max: number };
type ChartTwo = ChartOne;

type DetailPageChartsProps = {
  displayName: string;
  chartOne: ChartOne | null;
  chartTwo: ChartTwo | null;
  /** Override for price chart title (e.g. locale). Default: "{displayName} Egg Price Chart" */
  priceChartTitle?: string;
  /** Override for low/high chart title. Default: "{displayName} Low & High Price Chart" */
  lowHighChartTitle?: string;
};

export function DetailPageCharts({
  displayName,
  chartOne,
  chartTwo,
  priceChartTitle,
  lowHighChartTitle,
}: DetailPageChartsProps) {
  const priceTitle = priceChartTitle ?? `${displayName} Egg Price Chart`;
  const lowHighTitle = lowHighChartTitle ?? `${displayName} Low & High Price Chart`;
  return (
    <>
      {chartOne && (
        <div id="price-chart">
          <PriceChart
            title={priceTitle}
            labels={chartOne.labels}
            data={chartOne.data}
            min={chartOne.min}
            max={chartOne.max}
          />
        </div>
      )}
      {chartTwo && (
        <div id="low-high-chart">
          <LowHighChart
            title={lowHighTitle}
            labels={chartTwo.labels}
            data={chartTwo.data}
            min={chartTwo.min}
            max={chartTwo.max}
          />
        </div>
      )}
    </>
  );
}
