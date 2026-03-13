import Link from "next/link";
import { fetchHomeData } from "@/lib/api";
import { makeSlug, getSiteDomain } from "@/lib/utils";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PopularCityEggRates } from "@/components/PopularCityEggRates";
import { DetailPageCharts } from "@/components/DetailPageCharts";
import { ChartDataSSR } from "@/components/ChartDataSSR";
import { RateTableWithLoadMore } from "@/components/RateTableWithLoadMore";
import type { EggDataBlock } from "@/types/egg";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const H = {
  title: "आज NECC अंडा रेट और पेटी रेट देखें",
  intro1: "क्या आप आज का ताज़ा अंडा रेट जानना चाहते हैं? आप सही जगह आए हैं। यहाँ आपको अंडे की कीमतों और संबंधित जानकारी मिलेगी।",
  intro2: "अंडा सबके लिए लोकप्रिय और किफायती भोजन है और प्रोटीन का अच्छा स्रोत है। अंडा रेट हर किसी के लिए ज़रूरी है, खासकर खाद्य व्यवसाय (रेस्तरां, अंडा दुकानें, परिवार, फास्ट-फूड स्टॉल आदि) से जुड़े लोगों के लिए।",
  intro3: "आज के अंडा रेट से जुड़े अक्सर पूछे जाने वाले सवाल:",
  city: "शहर",
  piece: "पीस",
  tray: "ट्रे",
  hundred: "100 पीस",
  peti: "पेटी",
  marketTitle: "आज बाजार में अंडे की कीमत",
  market: "बाजार",
  necc: "NECC अंडा रेट",
  wholesale: "थोक रेट",
  retail: "खुदरा रेट",
  supermarket: "सुपर मार्केट रेट",
  neccLink: "National Egg Coordination Committee",
  statesTitle: "विभिन्न राज्यों में अंडे की कीमत",
  popularTitle: "लोकप्रिय शहर अंडा रेट",
  faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
  conclusionTitle: "निष्कर्ष",
  conclusion: "अंडा प्रेमियों, विक्रेताओं और किराना दुकान मालिकों के लिए ताज़ा अंडा रेट जानना ज़रूरी है। इस जानकारी को दोस्तों, परिवार और सोशल मीडिया पर शेयर कर सकते हैं। नवीनतम कीमतों के लिए",
  bookmark: "बुकमार्क करें।",
  dataUnavailable: "अंडा रेट डेटा अभी उपलब्ध नहीं है। बाद में पुनः प्रयास करें।",
  viewEnglish: "English में देखें",
  loadMoreText: "और लोड करें (%d और)",
};

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
  return { labels: ["कम", "ज्यादा"], data: [low, high], min: Math.max(0, Math.floor(low) - 1), max: Math.ceil(high) + 1 };
}

export async function generateMetadata(): Promise<Metadata> {
  const domain = getSiteDomain();
  const pageUrl = `https://${domain}/hi`;
  const enUrl = `https://${domain}`;
  const title = "आज अंडा रेट - भारत में लाइव बाजार कीमतें और रुझान | EggRate.net";
  const description =
    "भारत में आज का अंडा रेट और NECC दर देखें। शहर और राज्य के अनुसार रोज़ अंडे का रेट। पीस, ट्रे और पेटी की लाइव बाजार कीमतें।";
  const keywords = "अंडे का रेट, आज अंडा रेट, necc अंडा रेट, अंडा रेट भारत, पेटी अंडा रेट, रोज़ अंडा रेट";
  return {
    title,
    description,
    keywords,
    authors: [{ name: "EggRate.net", url: enUrl }],
    creator: "EggRate.net",
    publisher: "EggRate.net",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: pageUrl, languages: { en: enUrl, hi: pageUrl, "x-default": enUrl } },
    category: "Finance",
    openGraph: {
      type: "website",
      locale: "hi_IN",
      url: pageUrl,
      siteName: "EggRate.net",
      title,
      description,
      images: [{ url: `https://${domain}/og.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
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

export default async function HiHomePage() {
  const domain = getSiteDomain();
  const response = await fetchHomeData();
  const block = response?.[0];

  if (!block?.table?.length) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-zinc-700 dark:text-zinc-300">{H.dataUnavailable}</p>
          </div>
          <p className="mt-6 text-center">
            <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">{H.viewEnglish}</Link>
          </p>
        </div>
      </section>
    );
  }

  const rateList = block.table;
  const stateList = block.states ?? [];
  const market = block.market ?? [];
  const parsedChartOne = parseChartOne(block);
  const tableChartOne = buildChartOneFromTable(rateList);
  const hasValidData = (c: { data: number[] } | null) => c && c.data.some((d) => d > 0);
  const chartOne = hasValidData(tableChartOne) ? tableChartOne : (hasValidData(parsedChartOne) ? parsedChartOne : tableChartOne ?? parsedChartOne);
  const chartTwo = parseChartTwo(block) ?? buildChartTwoFromTable(rateList);
  const chartTwoLowHigh = chartTwo?.labels ?? [];
  const singlePiece = market[0]?.piece?.replace(/[₹\s]/g, "") || "0";
  const singlePieceNum = parseFloat(singlePiece) || 0;
  const per100 = singlePieceNum * 100;
  const perPeti = singlePieceNum * 210;

  const marketRows: [string, (typeof market)[0] | undefined][] = [
    [H.necc, market[0]],
    [H.wholesale, market[1]],
    [H.retail, market[2]],
    [H.supermarket, market[3]],
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EggRate.net",
              url: `https://${domain}/hi`,
              description: "भारत में आज का अंडा रेट। NECC अंडा दर, पेटी रेट, शहर और राज्य के अनुसार रोज़ कीमतें।",
              inLanguage: "hi-IN",
              potentialAction: {
                "@type": "SearchAction",
                target: `https://${domain}/hi?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
          {H.title}
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">{H.intro1}</p>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">{H.intro2}</p>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">{H.intro3}</p>

        <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
          <div>
            <RateTableWithLoadMore
              rateList={rateList}
              isDate={false}
              dateLabel={H.city}
              cityLabel={H.city}
              basePath="hi"
              tableHeaders={{ piece: H.piece, tray: H.tray, hundred: H.hundred, peti: H.peti }}
              loadMoreText={H.loadMoreText}
              cityLinkSuffix="-egg-rate-today"
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="mb-3 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {H.marketTitle}
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">{H.market}</th>
                    <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">{H.piece}</th>
                    <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">{H.tray}</th>
                  </tr>
                </thead>
                <tbody>
                  {marketRows.map(([label, row]) =>
                    row ? (
                      <tr key={label} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 text-zinc-800 dark:text-zinc-200">{label}</td>
                        <td className="py-2 text-zinc-800 dark:text-zinc-200">{row.piece}</td>
                        <td className="py-2 text-zinc-800 dark:text-zinc-200">{row.tray}</td>
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
                  {H.neccLink}
                </a>
              </p>
            </div>

            <ChartDataSSR
              displayName="आज"
              chartOne={chartOne}
              chartTwo={chartTwo}
              chartOneLabel="कीमत रुझान"
              chartTwoLabel="कम और ज्यादा कीमत"
            />
            <DetailPageCharts
              displayName="आज"
              chartOne={chartOne}
              chartTwo={chartTwo}
              priceChartTitle="आज अंडे की कीमत चार्ट"
              lowHighChartTitle="कम और ज्यादा कीमत चार्ट"
            />
          </div>
        </div>

        <div className="mt-10">
          <h3 className="mb-4 text-center text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            {H.statesTitle}
          </h3>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex flex-wrap justify-center gap-2">
              {stateList.map((s, i) => {
                const slug = makeSlug(s?.state);
                if (!slug) return null;
                return (
                  <Link
                    key={i}
                    href={`/hi/${slug}-egg-rate-today`}
                    className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                  >
                    {(s?.state ?? "").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <PopularCityEggRates
          className="mt-10"
          localePrefix="hi"
          title={H.popularTitle}
          linkSuffix=" आज अंडा रेट"
        />

        <div className="mt-12">
          <h2 className="mb-4 text-center text-xl font-semibold text-zinc-800 dark:text-zinc-200 sm:text-2xl">
            {H.faqTitle}
          </h2>
          <FaqAccordion
            defaultOpenIndex={0}
            items={[
              {
                question: "आज NECC अंडा रेट क्या है?",
                answer: "NECC (National Egg Coordination Committee) भारत में रोज़ अंडा रेट तय करता है। वर्तमान NECC अंडा रेट हमारी साइट पर देख सकते हैं।",
              },
              {
                question: "ताज़ा अंडा रेट कैसे देखें?",
                answer: `Google पर ${domain} खोजें। हमारी साइट से सभी जानकारी मिल सकती है।`,
              },
              {
                question: "आज अंडा रेट क्या है?",
                answer: (
                  <>
                    अंडा रेट इलाके, राज्य और शहर के हिसाब से अलग हो सकता है। आज के मुताबिक बड़े शहरों में लगभग {market[0]?.piece} प्रति अंडा, ट्रे {market[0]?.tray}, 100 पीस पर ₹{per100}।
                  </>
                ),
              },
              {
                question: "आज 1 पेटी अंडा रेट क्या है?",
                answer: <>1 पेटी में 210 अंडे होते हैं। आज 1 पेटी का रेट ₹{perPeti}।</>,
              },
              {
                question: "भारत में सबसे कम अंडा रेट क्या है?",
                answer: (
                  <>
                    सबसे कम कीमत {chartTwoLowHigh[0] ?? "N/A"} और सबसे ज्यादा {chartTwoLowHigh[1] ?? "N/A"}। यह मांग और आपूर्ति पर निर्भर करता है।
                  </>
                ),
              },
              {
                question: "क्या रोज़ ताज़ा अंडा रेट देख सकते हैं?",
                answer: "हाँ। हमारी साइट 24 घंटे उपलब्ध है और NECC रिपोर्ट के अनुसार कीमतें अपडेट करते हैं।",
              },
            ]}
          />
          <div className="prose prose-zinc mt-10 max-w-none dark:prose-invert">
            <h3 className="text-lg font-semibold">{H.conclusionTitle}</h3>
            <p>
              {H.conclusion} {domain} {H.bookmark}
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
            {H.viewEnglish}
          </Link>
        </p>
      </div>
    </section>
  );
}
