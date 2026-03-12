import Link from "next/link";
import { fetchHomeData } from "@/lib/api";
import { makeSlug, getSiteDomain } from "@/lib/utils";
import { PriceChart } from "@/components/PriceChart";
import { LowHighChart } from "@/components/LowHighChart";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PopularCityEggRates } from "@/components/PopularCityEggRates";
import type { EggDataBlock } from "@/types/egg";
import type { Metadata } from "next";

// Force SSR: render on server every request for full HTML and best SEO
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const domain = getSiteDomain();
  const SITE_URL = `https://${domain}`;
  const title = "Latest Egg Rate Today: NECC Egg Price & Peti Egg Rate | EggRate.net";
  const description =
    "Get the latest egg rate today in India with NECC egg price and 1 Peti egg rate. Check daily egg prices by state and city. Stay informed about egg prices across India.";
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
    "egg rate today India",
    "live egg rate",
    "egg wholesale price",
    "egg tray rate",
  ].join(", ");
  return {
    title,
    description,
    keywords,
    authors: [{ name: "EggRate.net", url: SITE_URL }],
    creator: "EggRate.net",
    publisher: "EggRate.net",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: SITE_URL, languages: { en: SITE_URL, hi: `${SITE_URL}/hi` } },
    category: "Finance",
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: SITE_URL,
      siteName: "EggRate.net",
      title: "Latest Egg Rate Today | EggRate.net",
      description,
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "EggRate.net - Egg Rate Today India" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Latest Egg Rate Today | EggRate.net",
      description,
      site: "@eggrate",
      creator: "@eggrate",
    },
    other: {
      "geo.region": "IN",
      "revisit-after": "1 day",
    },
  };
}

function parseChartOne(block: EggDataBlock) {
  const raw = block.chart_one;
  const c = Array.isArray(raw) ? raw[0] : raw;
  if (!c) return null;
  const labelsStr = c.chart_labels;
  const dataStr = c.chart_data;
  const labels =
    typeof labelsStr === "string"
      ? labelsStr.split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean)
      : [];
  const data =
    typeof dataStr === "string"
      ? dataStr.split(",").map((s) => parseFloat(String(s).trim().replace(/[₹\s]/g, "")) || 0)
      : [];
  if (labels.length === 0 && data.length === 0) return null;
  const values = data.filter((n) => !Number.isNaN(n) && n > 0);
  const min = typeof c.min === "number" ? c.min : (values.length ? Math.floor(Math.min(...values)) - 1 : 0);
  const max = typeof c.max === "number" ? c.max : (values.length ? Math.ceil(Math.max(...values)) + 1 : 10);
  return { labels, data, min: Math.max(0, min), max };
}

function parseChartTwo(block: EggDataBlock) {
  const c = block.chart_two?.[0];
  if (!c) return null;
  const labelsRaw = String(c.chart_labels_two ?? "").replace(/'/g, "");
  const labels = labelsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const data =
    typeof c.chart_data_two === "string"
      ? c.chart_data_two.split(",").map((s) => parseFloat(String(s).trim().replace(/[₹\s]/g, "")) || 0)
      : [];
  if (labels.length === 0 && data.length === 0) return null;
  const values = data.filter((n) => !Number.isNaN(n) && n > 0);
  const min = typeof c.min === "number" ? c.min : (values.length ? Math.floor(Math.min(...values)) - 1 : 0);
  const max = typeof c.max === "number" ? c.max : (values.length ? Math.ceil(Math.max(...values)) + 1 : 10);
  return { labels, data, min: Math.max(0, min), max };
}

function buildChartOneFromTable(rateList: { date?: string; city?: string; piece: string }[]) {
  if (!rateList?.length) return null;
  const labels = rateList.map((r) => (r.date ?? r.city ?? "").trim()).filter(Boolean);
  const data = rateList.map((r) => parseFloat(String(r.piece).replace(/[₹\s]/g, "")) || 0);
  if (labels.length === 0 || data.every((d) => d === 0)) return null;
  const values = data.filter((n) => n > 0);
  return { labels, data, min: Math.max(0, Math.floor(Math.min(...values)) - 1), max: Math.ceil(Math.max(...values)) + 1 };
}

function buildChartTwoFromTable(rateList: { piece: string }[]) {
  if (!rateList?.length) return null;
  const prices = rateList.map((r) => parseFloat(String(r.piece).replace(/[₹\s]/g, "")) || 0).filter((n) => n > 0);
  if (prices.length === 0) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return { labels: ["Low", "High"], data: [low, high], min: Math.max(0, Math.floor(low) - 1), max: Math.ceil(high) + 1 };
}

export default async function HomePage() {
  const response = await fetchHomeData();
  const block = response?.[0];
  if (!block?.table?.length) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-zinc-700 dark:text-zinc-300">
            Egg rate data is temporarily unavailable. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  const rateList = block.table;
  const stateList = block.states ?? [];
  const market = block.market ?? [];
  const chartOne = parseChartOne(block) ?? buildChartOneFromTable(rateList);
  const chartTwo = parseChartTwo(block) ?? buildChartTwoFromTable(rateList);
  const chartTwoLowHigh = chartTwo?.labels ?? [];
  const domain = getSiteDomain();

  const singlePiece = market[0]?.piece?.replace(/[₹\s]/g, "") || "0";
  const singlePieceNum = parseFloat(singlePiece) || 0;
  const per100 = singlePieceNum * 100;
  const perPeti = singlePieceNum * 210;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
          Check NECC Egg Price & Peti Egg Rate Today
        </h1>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EggRate.net",
              url: "https://eggrate.net",
              description: "Latest egg rate today in India. NECC egg price, peti egg rate, and daily egg prices by state and city.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://eggrate.net/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Are you looking for the latest egg rate today? If yes, you have come to the
          right place. In this blog post, we will provide you with the latest
          information about egg prices and other related information.
        </p>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Eggs are a popular and affordable food for everyone, and it is the best source
          of protein. The egg rate is a new concept for every person, especially for
          those who are doing business in the food industry including consumers
          (restaurants, local egg stores, egg lovers, families, fast-food stalls, etc.).
        </p>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Let&apos;s dive into the frequently asked questions related to the latest egg rate:
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow dark:border-zinc-700 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                    <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                      City
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                      Piece
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                      Tray
                    </th>
                    <th className="w-16 px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                      100 pcs
                    </th>
                    <th className="px-4 py-3 text-left font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                      Peti
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rateList.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <th className="px-4 py-3 font-medium">
                        <Link
                          href={`/${makeSlug(row.date ?? row.city ?? "")}-egg-rate-today`}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {(row.date ?? row.city ?? "").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Link>
                      </th>
                      <td className="px-4 py-3">{row.piece}</td>
                      <td className="px-4 py-3">{row.tray}</td>
                      <td className="px-4 py-3">{row.hundred_pcs}</td>
                      <td className="px-4 py-3">{row.peti}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-3 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Today Egg Price on Market
              </h2>
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
                More about{" "}
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
              <PriceChart
                title="Today Egg Price Chart"
                labels={chartOne.labels}
                data={chartOne.data}
                min={chartOne.min}
                max={chartOne.max}
              />
            )}
            {chartTwo && (
              <LowHighChart
                title="Today Low & High Price Chart"
                labels={chartTwo.labels}
                data={chartTwo.data}
                min={chartTwo.min}
                max={chartTwo.max}
              />
            )}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="mb-4 text-center text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            Egg Prices in Different States
          </h3>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex flex-wrap justify-center gap-2">
              {stateList.map((s, i) => {
                const slug = makeSlug(s?.state);
                if (!slug) return null;
                return (
                  <Link
                    key={i}
                    href={`/${slug}-egg-rate-today`}
                    className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                  >
                    {(s?.state ?? "").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <PopularCityEggRates className="mt-10" />

        <div className="mt-12">
          <h2 className="mb-4 text-center text-xl font-semibold text-zinc-800 dark:text-zinc-200 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <FaqAccordion
            defaultOpenIndex={0}
            items={[
              {
                question: "What is the NECC Egg rate today?",
                answer: (
                  <>
                    The NECC (National Egg Coordination Committee) sets the egg rate every day in
                    India. The current NECC egg rate today can be found on our website.
                  </>
                ),
              },
              {
                question: "How can I check the latest egg rate?",
                answer: (
                  <>
                    You can check the latest egg rate easily by searching for {domain} on Google. Our
                    website is designed to provide a user-friendly experience, and you can get all
                    information from this site.
                  </>
                ),
              },
              {
                question: "What is today's egg rate?",
                answer: (
                  <>
                    The egg rate can differ according to region, state, and city, and it changes
                    frequently. As of today, the egg rate in major cities in India is around{" "}
                    {market[0]?.piece} per egg, Per Tray {market[0]?.tray}, and per 100 Pieces ₹
                    {per100}.
                  </>
                ),
              },
              {
                question: "What is the 1 Peti egg rate today?",
                answer: (
                  <>
                    As 1 Peti egg has 210 eggs, the current rate for 1 Peti egg today is ₹{perPeti}.
                  </>
                ),
              },
              {
                question: "What is the lowest egg rate in India?",
                answer: (
                  <>
                    The lowest price of the egg is {chartTwoLowHigh[0] ?? "N/A"}, and the highest
                    price is {chartTwoLowHigh[1] ?? "N/A"}. However, it depends on the demand and
                    supply of the eggs.
                  </>
                ),
              },
              {
                question: "Can we check the latest egg rate daily?",
                answer: (
                  <>
                    Yes, you can check the latest egg rate daily. Our website is available 24 hours,
                    and we are frequently updating the prices according to the NECC report.
                  </>
                ),
              },
            ]}
          />
          <div className="prose prose-zinc mt-10 max-w-none dark:prose-invert">
            <h3 className="text-lg font-semibold">Conclusion</h3>
            <p>
              In conclusion, knowing the latest egg rate is crucial for every egg lover, egg seller,
              and grocery owner to be informed about the market condition and price. You can share
              this information with your friends, family, and on social media. Bookmark {domain} to
              stay updated on the latest egg prices and other related information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
