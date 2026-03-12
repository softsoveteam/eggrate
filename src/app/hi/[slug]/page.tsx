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

export const dynamic = "force-dynamic";

// ——— Hindi copy ———
const H = {
  home: "होम",
  date: "तारीख",
  city: "शहर",
  piece: "पीस",
  tray: "ट्रे",
  hundred: "100 पीस",
  peti: "पेटी",
  loadMore: (n: number) => `और लोड करें (${n} और)`,
  loadMoreTemplate: "और लोड करें (%d और)",
  last30Report: "पिछले 30 दिन का रिपोर्ट",
  priceUpDown: "रेट ऊपर/नीचे",
  percentage: "प्रतिशत",
  todayRate: "आज का रेट",
  monthRate: "30 दिन पहले का रेट",
  marketTitle: "आज बाजार में अंडे का रेट",
  market: "बाजार",
  necc: "NECC अंडा रेट",
  wholesale: "थोक रेट",
  retail: "खुदरा रेट",
  supermarket: "सुपर मार्केट रेट",
  neccLink: "National Egg Coordination Committee",
  toc: "विषय सूची",
  summaryAnchor: "आज अंडा रेट (NECC अंडा रेट)",
  rateSummary: "अंडे का रेट सारांश",
  priceChart: "अंडे का रेट चार्ट",
  lowHighChart: "कम और ज्यादा कीमत चार्ट",
  nearbyCities: "नजदीकी शहरों में अंडे का रेट",
  differentStates: "विभिन्न राज्यों में अंडे का रेट",
  popularCityRates: "लोकप्रिय शहर अंडा रेट",
  faq: "अक्सर पूछे जाने वाले प्रश्न",
  faqIntro: "के बारे में सामान्य प्रश्न",
  low: "कम",
  high: "ज्यादा",
};

function parseChartOne(block: EggDataBlock) {
  const raw = block.chart_one;
  const c = Array.isArray(raw) ? raw[0] : raw ? (raw as unknown as ChartOne) : null;
  if (!c || typeof c !== "object") return null;
  const labelsStr = (c as ChartOne).chart_labels;
  const dataStr = (c as ChartOne).chart_data;
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

function buildChartOneFromTable(rateList: { date?: string; piece: string }[], _isDateView: boolean) {
  if (!rateList?.length) return null;
  const labels = rateList.map((r) => (r.date ?? "").trim()).filter(Boolean);
  const data = rateList.map((r) => parseFloat(String(r.piece).replace(/[₹\s]/g, "")) || 0);
  if (labels.length === 0 || data.every((d) => d === 0)) return null;
  const values = data.filter((n) => n > 0);
  const min = Math.max(0, Math.floor(Math.min(...values)) - 1);
  const max = Math.ceil(Math.max(...values)) + 1;
  return { labels, data, min, max };
}

function buildChartTwoFromTable(rateList: { date?: string; piece: string }[]) {
  if (!rateList?.length) return null;
  const prices = rateList.map((r) => parseFloat(String(r.piece).replace(/[₹\s]/g, "")) || 0).filter((n) => n > 0);
  if (prices.length === 0) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return {
    labels: [H.low, H.high],
    data: [low, high],
    min: Math.max(0, Math.floor(low) - 1),
    max: Math.ceil(high) + 1,
  };
}

function capitalizePlace(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

const HINDI_MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
function formatUpdateDateHi(date: Date): string {
  const day = date.getDate();
  const month = HINDI_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getDateModifiedISO(): string {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  return start.toISOString();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const base = getBaseSlug(slug);
  const name = base.replace(/-/g, " ");
  const cityName = capitalizePlace(name);
  const domain = getSiteDomain();
  const pageUrl = `https://${domain}/hi/${slug}`;
  const enPageUrl = `https://${domain}/${slug}`;
  const title = isDateSlug(base)
    ? `${base} पर अंडा रेट - लाइव बाजार कीमतें और रुझान`
    : `आज ${cityName} में अंडा रेट - लाइव बाजार कीमतें और रुझान`;
  const description = isDateSlug(base)
    ? `${base} पर अंडे का रेट ढूंढ रहे हैं? हमारी सूची और चार्ट के साथ ${base} पर अंडे का रेट देखें।`
    : `${cityName} में आज का अंडा रेट देखें। रोज़ अपडेट होने वाली NECC दर। पीस, ट्रे और पेटी की लाइव बाजार कीमतें।`;
  const dateModified = getDateModifiedISO();
  const keywords = [
    "अंडे का रेट",
    "आज अंडा रेट",
    "necc अंडा रेट",
    "अंडा रेट आज",
    "अंडा रेट",
    "necc अंडा रेट",
    "पेटी अंडा रेट",
    "भारत अंडा रेट",
    "रोज़ अंडा रेट",
    "शहर के अनुसार अंडा रेट",
    "राज्य के अनुसार अंडा रेट",
    ...(isDateSlug(base) ? [] : [`${cityName} अंडा रेट`, `अंडा रेट ${cityName}`]),
  ];
  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "EggRate.net", url: `https://${domain}` }],
    creator: "EggRate.net",
    publisher: "EggRate.net",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: pageUrl, languages: { en: enPageUrl, hi: pageUrl, "x-default": enPageUrl } },
    category: "Finance",
    openGraph: {
      title,
      description,
      type: "article",
      url: pageUrl,
      siteName: "EggRate.net",
      locale: "hi_IN",
      modifiedTime: dateModified,
      publishedTime: dateModified,
      section: "अंडे का रेट",
      images: [{ url: pageUrl + "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, site: "@eggrate", creator: "@eggrate" },
    other: {
      "article:modified_time": dateModified,
      "article:published_time": dateModified,
      "article:section": "अंडे का रेट",
      "article:tag": keywords.slice(0, 5).join(", "),
      "geo.region": "IN",
      "revisit-after": "1 day",
    },
  };
}

export default async function HiSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseSlug = getBaseSlug(slug);
  const isDate = isDateSlug(baseSlug);

  const response = isDate ? await fetchDateData(baseSlug) : await fetchLocationData(baseSlug);
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

  const breadcrumbLabel = isDate ? `${displayName} पर अंडा रेट` : `आज ${displayName} में अंडा रेट`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: domain, item: `https://${domain}/hi` },
      { "@type": "ListItem", position: 2, name: slug, item: `https://${domain}/hi/${slug}` },
    ],
  };
  const pageUrl = `https://${domain}/hi/${slug}`;
  const dateModified = getDateModifiedISO();
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: pageUrl,
    name: breadcrumbLabel,
    description: isDate ? `${displayName} पर अंडे का रेट। रोज़ NECC दर।` : `आज ${displayName} में अंडा रेट। पीस, ट्रे, पेटी की लाइव कीमतें।`,
    dateModified,
    datePublished: dateModified,
    inLanguage: "hi-IN",
  };

  const marketRows: [string, (typeof market)[0]][] = [
    [H.necc, market[0]],
    [H.wholesale, market[1]],
    [H.retail, market[2]],
    [H.supermarket, market[3]],
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 text-sm">
          <Link href="/hi" className="font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            {H.home}
          </Link>
          <span className="text-zinc-500 dark:text-zinc-400" aria-hidden>&gt;</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{breadcrumbLabel}</span>
        </nav>
        {isDate ? (
          <h1 className="mb-4 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
            {displayName} पर अंडा रेट
          </h1>
        ) : (
          <h2 className="mb-4 text-center text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">
            आज {displayName} में अंडा रेट
          </h2>
        )}
        <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
          {isDate
            ? `${displayName} पर अंडे का रेट देख रहे हैं? लाइव बाजार कीमतें और रुझान के लिए यहां देखें।`
            : `${displayName} में ताज़ा अंडा रेट देख रहे हैं? लाइव बाजार कीमतें और सही दाम जानने के लिए यहां देखें।`}
        </p>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400" id="summary">
          <strong className="text-zinc-800 dark:text-zinc-200">अपडेट: {formatUpdateDateHi(new Date())}:</strong>{" "}
          नवीनतम अपडेट के अनुसार आज {displayName} में अंडा रेट {firstRow?.piece ?? "—"} (NECC दर) है। 30 अंडों की एक ट्रे {firstRow?.tray ?? "—"}, 100 अंडे {firstRow?.hundred_pcs ?? "—"} और एक पेटी {firstRow?.peti ?? "—"} है। यह दर स्थानीय बाजार और मंडी में कीमतों का आधार है।
        </p>
        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div>
            <div id="rate-summary">
              <RateTableWithLoadMore
                rateList={rateList}
                isDate={isDate}
                dateLabel={H.date}
                cityLabel={H.city}
                basePath="hi"
                tableHeaders={{ piece: H.piece, tray: H.tray, hundred: H.hundred, peti: H.peti }}
                loadMoreText={H.loadMoreTemplate}
              />
            </div>
            {isLocationView && report && (
              <div id="report" className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="mb-3 text-center text-lg font-semibold">{H.last30Report}</h2>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">{H.priceUpDown}</td>
                      <td className={`py-2 font-medium ${report.up_down_status === "success" ? "text-green-600" : "text-red-600"}`}>{report.up_down}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">{H.percentage}</td>
                      <td className={`py-2 font-medium ${report.percentage_status === "success" ? "text-green-600" : "text-red-600"}`}>{report.percentage}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">{H.todayRate}</td>
                      <td className="py-2">{report.today_rate}</td>
                    </tr>
                    <tr>
                      <td className="py-2">{H.monthRate}</td>
                      <td className="py-2">{report.month_rate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div id="market" className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-3 text-center text-lg font-semibold">{H.marketTitle}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 text-left font-medium">{H.market}</th>
                    <th className="py-2 text-left font-medium">{H.piece}</th>
                    <th className="py-2 text-left font-medium">{H.tray}</th>
                  </tr>
                </thead>
                <tbody>
                  {marketRows.map(([label, row]) =>
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
                <a href="https://en.wikipedia.org/wiki/National_Egg_Coordination_Committee" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  {H.neccLink}
                </a>
              </p>
            </div>
            {chartOne && (
              <div id="price-chart">
                <PriceChart title={`${displayName} ${H.priceChart}`} labels={chartOne.labels} data={chartOne.data} min={chartOne.min} max={chartOne.max} />
              </div>
            )}
            {chartTwo && (
              <div id="low-high-chart">
                <LowHighChart title={`${displayName} ${H.lowHighChart}`} labels={chartTwo.labels} data={chartTwo.data} min={chartTwo.min} max={chartTwo.max} />
              </div>
            )}
          </div>
        </div>
        <nav id="table-of-contents" className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 shadow dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-zinc-800 dark:text-zinc-100">{H.toc}</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><a href="#summary" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} {H.summaryAnchor}</a></li>
            <li><a href="#rate-summary" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} {H.rateSummary}</a></li>
            <li><a href="#market" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.marketTitle}</a></li>
            {chartOne && <li><a href="#price-chart" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} {H.priceChart}</a></li>}
            {chartTwo && <li><a href="#low-high-chart" className="text-indigo-600 hover:underline dark:text-indigo-400">{displayName} {H.lowHighChart}</a></li>}
            {isLocationView && report && <li><a href="#report" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.last30Report}</a></li>}
            {cityList.length > 0 && <li><a href="#nearby-cities" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.nearbyCities}</a></li>}
            <li><a href="#popular-city-egg-rates" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.popularCityRates}</a></li>
            {stateList.length > 0 && <li><a href="#states" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.differentStates}</a></li>}
            <li><a href="#faq" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.faq}</a></li>
          </ol>
        </nav>
        {(stateList.length > 0 || cityList.length > 0) && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {cityList.length > 0 && (
              <div id="nearby-cities" className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-3 text-center font-semibold">{H.nearbyCities}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {cityList.map((c, i) => {
                    const citySlug = makeSlug(c?.city);
                    if (!citySlug) return null;
                    return (
                      <Link
                        key={i}
                        href={`/hi/${citySlug}-egg-rate-today`}
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
                <h3 className="mb-3 text-center font-semibold">{H.differentStates}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {stateList.map((s, i) => {
                    const stateSlug = makeSlug(s?.state);
                    if (!stateSlug) return null;
                    return (
                      <Link
                        key={i}
                        href={`/hi/${stateSlug}-egg-rate-today`}
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
        <PopularCityEggRates className="mt-10" id="popular-city-egg-rates" localePrefix="hi" title={H.popularCityRates} linkSuffix=" आज अंडा रेट" />
        {isLocationView && (
          <div id="faq" className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-6 dark:border-zinc-700 dark:bg-zinc-900/50 sm:px-6 sm:py-8">
            <h2 className="mb-2 text-center text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">{H.faq}</h2>
            <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">{displayName} {H.faqIntro}</p>
            <FaqAccordion
              defaultOpenIndex={0}
              allowMultiple
              className="mx-auto max-w-3xl"
              items={[
                {
                  question: `${displayName} में नवीनतम अंडा रेट क्या है?`,
                  answer: (
                    <>आज के अनुसार {displayName} में अंडा रेट पीस {firstRow?.piece}, ट्रे {firstRow?.tray}, 100 पीस {firstRow?.hundred_pcs} और पेटी {firstRow?.peti} है। NECC डेटा के अनुसार रोज़ अपडेट होता है।</>
                  ),
                },
                {
                  question: `${displayName} में अंडा बाजार की स्थिति क्या है?`,
                  answer: (
                    <>{displayName} में अंडा बाजार उतार-चढ़ाव के अधीन है। हमारे डेटा के अनुसार औसत रेट पीस {firstRow?.piece}, ट्रे {firstRow?.tray}, 100 पीस {firstRow?.hundred_pcs} और पेटी {firstRow?.peti} है।</>
                  ),
                },
                {
                  question: `आज ${displayName} में NECC अंडा रेट क्या है?`,
                  answer: <>राष्ट्रीय अंडा समन्वय समिति (NECC) भारत में अंडा रेट तय करती है। आज {displayName} में NECC अंडा रेट {firstRow?.piece} प्रति अंडा है।</>,
                },
                {
                  question: `आज ${displayName} में अंडा थोक रेट क्या है?`,
                  answer: <>नवीनतम डेटा के अनुसार आज {displayName} में अंडा थोक रेट प्रति अंडा {firstRow?.piece} और प्रति ट्रे {firstRow?.tray} है।</>,
                },
                {
                  question: `${displayName} में नवीनतम अंडा रेट कैसे देखें?`,
                  answer: (
                    <>
                      आप <a href={`https://${domain}`} target="_blank" rel="noreferrer noopener" className="text-indigo-600 hover:underline dark:text-indigo-400">{domain}</a> पर {displayName} के रोज़ अंडा रेट देख सकते हैं। हम NECC रिपोर्ट के अनुसार अपडेट करते हैं।
                    </>
                  ),
                },
                {
                  question: `${displayName} में अंडा रेट कम और ज्यादा क्या है?`,
                  answer: <>पिछले 30 दिनों में {displayName} में सबसे कम अंडा रेट {chartTwoLowHigh[0] ?? "N/A"} प्रति अंडा था। सबसे ज्यादा रेट {chartTwoLowHigh[1] ?? "N/A"} प्रति अंडा था।</>,
                },
              ]}
            />
          </div>
        )}
        {!isLocationView && (
          <div id="faq" className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-6 dark:border-zinc-700 dark:bg-zinc-900/50 sm:px-6 sm:py-8">
            <h2 className="mb-2 text-center text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">{H.faq}</h2>
            <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">{displayName} {H.faqIntro}</p>
            <FaqAccordion
              defaultOpenIndex={0}
              allowMultiple
              className="mx-auto max-w-3xl"
              items={[
                { question: `${displayName} पर अंडा रेट क्या है?`, answer: <>अंडा रेट शहर के अनुसार बदलता है। ऊपर की तालिका में शहरवार रेट देखें। डेटा NECC से रोज़ अपडेट होता है।</> },
                { question: "अंडा रेट कितनी बार अपडेट होता है?", answer: <>अंडा रेट रोज़ अपडेट होता है। किसी भी तारीख या शहर का रेट देखने के लिए {domain} बुकमार्क करें।</> },
                { question: "पीस, ट्रे और पेटी का मतलब क्या है?", answer: <>पीस = एक अंडा; ट्रे = आमतौर पर 30 अंडे; पेटी = 210 अंडे। तालिका में रेट NECC द्वारा {displayName} के लिए रिपोर्ट किए गए हैं।</> },
                {
                  question: "दूसरी तारीख या शहरों के अंडा रेट कहां देखें?",
                  answer: (
                    <> <a href={`https://${domain}`} target="_blank" rel="noreferrer noopener" className="text-indigo-600 hover:underline dark:text-indigo-400">{domain}</a> पर जाएं और खोज या नेविगेशन से शहर या तारीख के अनुसार अंडा रेट देखें।</>
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
