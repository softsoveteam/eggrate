import { notFound } from "next/navigation";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { fetchLocationData, fetchDateData } from "@/lib/api";
import { isDateSlug, makeSlug, getSiteDomain, getBaseSlug } from "@/lib/utils";
import { FaqAccordion } from "@/components/FaqAccordion";
import { RateTableWithLoadMore } from "@/components/RateTableWithLoadMore";
import { PopularCityEggRates } from "@/components/PopularCityEggRates";
import type { EggDataBlock, ChartOne, ChartTwo } from "@/types/egg";
import type { Metadata } from "next";

const PriceChart = nextDynamic(
  () => import("@/components/PriceChart").then((m) => ({ default: m.PriceChart })),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" /> }
);
const LowHighChart = nextDynamic(
  () => import("@/components/LowHighChart").then((m) => ({ default: m.LowHighChart })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" /> }
);

// Force SSR: render on server every request for full HTML and best SEO
export const dynamic = "force-dynamic";

function parseChartOne(block: EggDataBlock) {
  const raw = block.chart_one;
  const c = Array.isArray(raw) ? raw[0] : raw ? (raw as unknown as ChartOne) : null;
  if (!c || typeof c !== "object") return null;
  const labelsStr = (c as ChartOne).chart_labels;
  const dataStr = (c as ChartOne).chart_data;
  const labels =
    typeof labelsStr === "string"
      ? labelsStr
          .split(",")
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean)
      : [];
  const data =
    typeof dataStr === "string"
      ? dataStr
          .split(",")
          .map((s) => parseFloat(String(s).trim().replace(/[₹\s]/g, "")) || 0)
      : [];
  if (labels.length === 0 && data.length === 0) return null;
  const values = data.filter((n) => !Number.isNaN(n) && n > 0);
  const min = typeof (c as ChartOne).min === "number" ? (c as ChartOne).min : (values.length ? Math.floor(Math.min(...values)) - 1 : 0);
  const max = typeof (c as ChartOne).max === "number" ? (c as ChartOne).max : (values.length ? Math.ceil(Math.max(...values)) + 1 : 10);
  return { labels, data, min: Math.max(0, min), max };
}

function parseChartTwo(block: EggDataBlock) {
  const raw = block.chart_two;
  const c = Array.isArray(raw) ? raw[0] : raw ? (raw as unknown as ChartTwo) : null;
  if (!c || typeof c !== "object") return null;
  const labelsRaw = String((c as ChartTwo).chart_labels_two ?? "").replace(/'/g, "");
  const labels = labelsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const dataStr = (c as ChartTwo).chart_data_two;
  const data =
    typeof dataStr === "string"
      ? dataStr.split(",").map((s) => parseFloat(String(s).trim().replace(/[₹\s]/g, "")) || 0)
      : [];
  if (labels.length === 0 && data.length === 0) return null;
  const values = data.filter((n) => !Number.isNaN(n) && n > 0);
  const min = typeof (c as ChartTwo).min === "number" ? (c as ChartTwo).min : (values.length ? Math.floor(Math.min(...values)) - 1 : 0);
  const max = typeof (c as ChartTwo).max === "number" ? (c as ChartTwo).max : (values.length ? Math.ceil(Math.max(...values)) + 1 : 10);
  return { labels, data, min: Math.max(0, min), max };
}

/** Build chart one from rate table when API chart_one is missing or empty */
function buildChartOneFromTable(rateList: { date?: string; piece: string }[], isDateView: boolean): { labels: string[]; data: number[]; min: number; max: number } | null {
  if (!rateList?.length) return null;
  const labels = rateList.map((r) => (r.date ?? "").trim()).filter(Boolean);
  const data = rateList.map((r) => parseFloat(String(r.piece).replace(/[₹\s]/g, "")) || 0);
  if (labels.length === 0 || data.every((d) => d === 0)) return null;
  const values = data.filter((n) => n > 0);
  const min = Math.max(0, Math.floor(Math.min(...values)) - 1);
  const max = Math.ceil(Math.max(...values)) + 1;
  return { labels, data, min, max };
}

/** Build low/high chart from rate table when API chart_two is missing */
function buildChartTwoFromTable(rateList: { date?: string; piece: string }[]): { labels: string[]; data: number[]; min: number; max: number } | null {
  if (!rateList?.length) return null;
  const prices = rateList.map((r) => parseFloat(String(r.piece).replace(/[₹\s]/g, "")) || 0).filter((n) => n > 0);
  if (prices.length === 0) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return {
    labels: ["Low", "High"],
    data: [low, high],
    min: Math.max(0, Math.floor(low) - 1),
    max: Math.ceil(high) + 1,
  };
}

/** Capitalize first letter of each word for city/state name */
function capitalizePlace(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format date as "11th March 2026" */
function formatUpdateDate(date: Date): string {
  const day = date.getDate();
  const ord = day % 10 === 1 && day % 100 !== 11 ? "st" : day % 10 === 2 && day % 100 !== 12 ? "nd" : day % 10 === 3 && day % 100 !== 13 ? "rd" : "th";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${day}${ord} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Start of today 00:00 UTC in ISO string - for dateModified (prices update daily at 12 AM) */
function getDateModifiedISO(): string {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  return start.toISOString();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const base = getBaseSlug(slug);
  const name = base.replace(/-/g, " ");
  const cityName = capitalizePlace(name);
  const domain = getSiteDomain();
  const pageUrl = `https://${domain}/${slug}`;
  const title = isDateSlug(base)
    ? `Egg Price on ${base} - Egg Rate ${base}`
    : `Today Egg Rate in ${cityName}: Live NECC Egg Price`;
  const description = isDateSlug(base)
    ? `Looking for egg rate on ${base}? Get the egg prices on ${base} with our comprehensive list, and graphical chart.`
    : `Check today's egg rate in ${cityName} with live NECC prices updated daily. Get egg price per piece, tray & peti across all major markets in ${cityName} realtime.`;
  const dateModified = getDateModifiedISO();
  const hiPageUrl = `https://${domain}/hi/${slug}`;
  const keywords = [
    "egg rate",
    "today egg rate",
    "necc egg rate today",
    "egg price today",
    "egg price",
    "necc egg rate",
    "peti egg rate",
    "egg price India",
    "daily egg rate",
    "egg rate by city",
    "egg rate by state",
    "egg rate India",
    "NECC egg price",
    "live egg rate",
    ...(isDateSlug(base) ? [] : [`${cityName} egg rate`, `egg rate ${cityName}`, `${cityName} egg price today`]),
  ];
  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "EggRate.net", url: `https://${domain}` }],
    creator: "EggRate.net",
    publisher: "EggRate.net",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: pageUrl, languages: { en: pageUrl, hi: hiPageUrl, "x-default": pageUrl } },
    category: "Finance",
    openGraph: {
      title,
      description,
      type: "article",
      url: pageUrl,
      siteName: "EggRate.net",
      locale: "en_IN",
      modifiedTime: dateModified,
      publishedTime: dateModified,
      section: "Egg Rate",
      images: [{ url: pageUrl + "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@eggrate",
      creator: "@eggrate",
    },
    other: {
      "article:modified_time": dateModified,
      "article:published_time": dateModified,
      "article:section": "Egg Rate",
      "article:tag": keywords.slice(0, 5).join(", "),
      "geo.region": "IN",
      "revisit-after": "1 day",
    },
  };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseSlug = getBaseSlug(slug);
  const isDate = isDateSlug(baseSlug);

  const response = isDate
    ? await fetchDateData(baseSlug)
    : await fetchLocationData(baseSlug);

  const block = response?.[0];
  if (!block?.table?.length) notFound();

  const market = block.market ?? [];
  if (!market[0]?.piece?.trim()) notFound();

  const rateList = block.table;
  const stateList = block.states ?? [];
  const cityList = block.citys ?? [];
  const report = block.report?.[0];
  const chartOne = parseChartOne(block) ?? buildChartOneFromTable(rateList, isDate);
  const chartTwo = parseChartTwo(block) ?? buildChartTwoFromTable(rateList);
  const chartTwoLowHigh = chartTwo?.labels ?? [];
  const domain = getSiteDomain();
  const displayName = capitalizePlace(baseSlug.replace(/-/g, " "));

  const firstRow = rateList[0];
  const isLocationView = !isDate && (cityList?.length > 0 || report);

  // Google-style breadcrumb: domain > path (e.g. eggrate.net > barwala-egg-rate-today)
  const breadcrumbPath = slug;
  const breadcrumbLabel = isDate ? `Egg Rate on ${displayName}` : `${displayName} Egg Rate Today`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: domain, item: `https://${domain}/` },
      { "@type": "ListItem", position: 2, name: breadcrumbPath, item: `https://${domain}/${breadcrumbPath}` },
    ],
  };

  const pageUrl = `https://${domain}/${slug}`;
  const dateModified = getDateModifiedISO();
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: pageUrl,
    name: breadcrumbLabel,
    description: isDate
      ? `Egg rate on ${displayName}. Daily NECC egg prices.`
      : `Today egg rate in ${displayName}. Live NECC egg price, piece, tray, peti.`,
    dateModified,
    datePublished: dateModified,
    inLanguage: "en-IN",
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 text-sm">
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Home
          </Link>
          <span className="text-zinc-500 dark:text-zinc-400" aria-hidden>
            &gt;
          </span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {breadcrumbLabel}
          </span>
        </nav>
        {isDate ? (
          <h2 className="mb-4 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
            Egg Rate on {displayName}
          </h2>
        ) : (
          <h2 className="mb-4 text-center text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">
            Today Egg Rate in {displayName}
          </h2>
        )}
        <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
          {isDate
            ? `Looking for the egg prices on ${displayName}? Check out our website for trusted information on the market price.`
            : `Looking for the latest egg prices in ${displayName}? Check out our website for up-to-date information on the best deals in the market.`}
        </p>

        <p className="mb-6 text-zinc-600 dark:text-zinc-400" id="summary">
          <strong className="text-zinc-800 dark:text-zinc-200">Updated: {formatUpdateDate(new Date())}:</strong>{" "}
          As of the latest update, the {displayName} Egg Rate Today stands at {firstRow?.piece ?? "—"} (NECC rate). One tray of 30 eggs is priced at {firstRow?.tray ?? "—"} while 100 eggs cost {firstRow?.hundred_pcs ?? "—"} and 1 peti costs {firstRow?.peti ?? "—"}. This rate serves as the cornerstone for pricing across local markets and mandi.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div>
            <div id="rate-summary">
              <RateTableWithLoadMore
                rateList={rateList}
                isDate={isDate}
                dateLabel="Date"
                cityLabel="City"
              />
            </div>

            {isLocationView && report && (
              <div id="report" className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="mb-3 text-center text-lg font-semibold">Last 30 Day Report</h2>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">Price Up / Down</td>
                      <td className={`py-2 font-medium ${report.up_down_status === "success" ? "text-green-600" : "text-red-600"}`}>
                        {report.up_down}
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">Percentage</td>
                      <td className={`py-2 font-medium ${report.percentage_status === "success" ? "text-green-600" : "text-red-600"}`}>
                        {report.percentage}
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">Today Rate</td>
                      <td className="py-2">{report.today_rate}</td>
                    </tr>
                    <tr>
                      <td className="py-2">30 Days Ago Rate</td>
                      <td className="py-2">{report.month_rate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div id="market" className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-3 text-center text-lg font-semibold">Today Egg Price on Market</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 text-left font-medium">Market</th>
                    <th className="py-2 text-left font-medium">Piece</th>
                    <th className="py-2 text-left font-medium">Tray</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["NECC Egg Price", market[0]],
                      ["Whole Sale Rate", market[1]],
                      ["Retail Rate", market[2]],
                      ["Super Market Rate", market[3]],
                    ] as const
                  ).map(([label, row]) =>
                    row ? (
                      <tr key={label} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2">{label}</td>
                        <td className="py-2">{row.piece}</td>
                        <td className="py-2">{row.tray}</td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
              <p className="mt-3 text-center text-sm text-zinc-500">
                <a
                  href="https://en.wikipedia.org/wiki/National_Egg_Coordination_Committee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  National Egg Coordination Committee
                </a>
              </p>
            </div>

            {chartOne && (
              <div id="price-chart">
                <PriceChart
                title={`${displayName} Egg Price Chart`}
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
                title={`${displayName} Low & High Price Chart`}
                labels={chartTwo.labels}
                data={chartTwo.data}
                min={chartTwo.min}
                max={chartTwo.max}
              />
              </div>
            )}
          </div>
        </div>

        <nav id="table-of-contents" className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 shadow dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-zinc-800 dark:text-zinc-100">Table of Contents</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><a href="#summary" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} Egg Rate Today (NECC Egg Price)</a></li>
            <li><a href="#rate-summary" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} Egg Rate Summary</a></li>
            <li><a href="#market" className="text-indigo-600 hover:underline dark:text-indigo-400">Today Egg Price on Market</a></li>
            {chartOne && <li><a href="#price-chart" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} Egg Price Chart</a></li>}
            {chartTwo && <li><a href="#low-high-chart" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} Low & High Price Chart</a></li>}
            {isLocationView && report && <li><a href="#report" className="text-indigo-600 hover:underline dark:text-indigo-400">Last 30 Day Report</a></li>}
            {cityList.length > 0 && <li><a href="#nearby-cities" className="text-indigo-600 hover:underline dark:text-indigo-400">Egg Prices in Nearest Cities</a></li>}
            <li><a href="#popular-city-egg-rates" className="text-indigo-600 hover:underline dark:text-indigo-400">Popular City Egg Rates</a></li>
            {stateList.length > 0 && <li><a href="#states" className="text-indigo-600 hover:underline dark:text-indigo-400">Egg Prices in Different States</a></li>}
            <li><a href="#faq" className="text-indigo-600 hover:underline dark:text-indigo-400">Frequently Asked Questions</a></li>
          </ol>
        </nav>

        {(stateList.length > 0 || cityList.length > 0) && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {cityList.length > 0 && (
              <div id="nearby-cities" className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-3 text-center font-semibold">Egg Prices in Nearest Cities</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {cityList.map((c, i) => {
                    const slug = makeSlug(c?.city);
                    if (!slug) return null;
                    return (
                      <Link
                        key={i}
                        href={`/${slug}-egg-rate-today`}
                        className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                      >
                        {(c?.city ?? "").replace(/\b\w/g, (x) => x.toUpperCase())}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {stateList.length > 0 && (
              <div id="states" className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-3 text-center font-semibold">Egg Prices in Different States</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {stateList.map((s, i) => {
                    const slug = makeSlug(s?.state);
                    if (!slug) return null;
                    return (
                      <Link
                        key={i}
                        href={`/${slug}-egg-rate-today`}
                        className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                      >
                        {(s?.state ?? "").replace(/\b\w/g, (x) => x.toUpperCase())}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <PopularCityEggRates className="mt-10" id="popular-city-egg-rates" />

        {isLocationView && (
          <div id="faq" className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-6 dark:border-zinc-700 dark:bg-zinc-900/50 sm:px-6 sm:py-8">
            <h2 className="mb-2 text-center text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">
              Frequently Asked Questions
            </h2>
            <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Common questions about egg rates in {displayName}
            </p>
            <FaqAccordion
              defaultOpenIndex={0}
              allowMultiple
              className="mx-auto max-w-3xl"
              items={[
                {
                  question: `What is the latest egg rate in ${displayName}?`,
                  answer: (
                    <>
                      As of today, the egg rate in {displayName} is {firstRow?.piece} per piece,{" "}
                      {firstRow?.tray} per tray, {firstRow?.hundred_pcs} for 100 pieces, and{" "}
                      {firstRow?.peti} for a peti. Prices are updated daily based on NECC data.
                    </>
                  ),
                },
                {
                  question: `What is the egg market situation in ${displayName}?`,
                  answer: (
                    <>
                      The egg market in {displayName} is subject to fluctuations. According to our
                      data, the average price is {firstRow?.piece} per piece, {firstRow?.tray} for a
                      tray, {firstRow?.hundred_pcs} for 100 pieces, and {firstRow?.peti} for PETI.
                      Eggs are a staple for many residents; staying updated helps with informed
                      purchasing.
                    </>
                  ),
                },
                {
                  question: `What is NECC egg rate today in ${displayName}?`,
                  answer: (
                    <>
                      The National Egg Coordination Committee (NECC) sets egg prices across India. The
                      current NECC egg rate in {displayName} today is {firstRow?.piece} per egg.
                    </>
                  ),
                },
                {
                  question: `What is the egg wholesale price in ${displayName} today?`,
                  answer: (
                    <>
                      As per the latest data, the egg wholesale price in {displayName} today is{" "}
                      {firstRow?.piece} per egg and {firstRow?.tray} per tray.
                    </>
                  ),
                },
                {
                  question: `How can I check the latest egg rate in ${displayName}?`,
                  answer: (
                    <>
                      You can check daily egg rates for {displayName} on{" "}
                      <a
                        href={`https://${domain}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {domain}
                      </a>
                      . We update prices according to the NECC report. Bookmark the page for quick
                      access.
                    </>
                  ),
                },
                {
                  question: `What are the low and high egg rates in ${displayName}?`,
                  answer: (
                    <>
                      The lowest egg rate in {displayName} over the past 30 days was{" "}
                      {chartTwoLowHigh[0] ?? "N/A"} per egg. The highest rate in the last 30 days was{" "}
                      {chartTwoLowHigh[1] ?? "N/A"} per egg. Monitoring these changes helps consumers
                      and retailers alike.
                    </>
                  ),
                },
              ]}
            />
          </div>
        )}

        {!isLocationView && (
          <div id="faq" className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-6 dark:border-zinc-700 dark:bg-zinc-900/50 sm:px-6 sm:py-8">
            <h2 className="mb-2 text-center text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">
              Frequently Asked Questions
            </h2>
            <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Common questions about egg rates on {displayName}
            </p>
            <FaqAccordion
              defaultOpenIndex={0}
              allowMultiple
              className="mx-auto max-w-3xl"
              items={[
                {
                  question: `What is the egg rate on ${displayName}?`,
                  answer: (
                    <>
                      The egg rate on {displayName} varies by city. Use the table above to see rates
                      by city. Our data is updated daily from NECC.
                    </>
                  ),
                },
                {
                  question: "How often are egg rates updated?",
                  answer: (
                    <>
                      Egg rates are updated daily. Bookmark {domain} to check the latest egg prices
                      for any date or city.
                    </>
                  ),
                },
                {
                  question: "What do Piece, Tray, and Peti mean?",
                  answer: (
                    <>
                      Piece is per egg; tray is typically 30 eggs; peti is 210 eggs. Prices in the
                      table are as reported by NECC for {displayName}.
                    </>
                  ),
                },
                {
                  question: "Where can I check egg rates for other dates or cities?",
                  answer: (
                    <>
                      Visit{" "}
                      <a
                        href={`https://${domain}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {domain}
                      </a>{" "}
                      and use the search or navigation to find egg rates by city or date.
                    </>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </section>
  );
}
