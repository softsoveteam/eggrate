import Link from "next/link";
import { PopularCityEggRates } from "@/components/PopularCityEggRates";
import { getSiteDomain } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const domain = getSiteDomain();
  const pageUrl = `https://${domain}/hi`;
  const enUrl = `https://${domain}`;
  const title = "आज अंडे का रेट - भारत में लाइव बाजार कीमतें और रुझान | EggRate.net";
  const description =
    "भारत में आज का अंडे का रेट और NECC दर देखें। शहर और राज्य के अनुसार रोज़ अंडे का रेट। पीस, ट्रे और पेटी की लाइव बाजार कीमतें।";
  const keywords = "अंडे का रेट, आज अंडे का रेट, necc अंडे का रेट, अंडे का रेट भारत, पेटी अंडे का रेट, रोज़ अंडे का रेट";
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

export default function HiHomePage() {
  const domain = getSiteDomain();
  const baseUrl = `https://${domain}`;
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EggRate.net",
    url: baseUrl,
    description: "भारत में आज का अंडे का रेट। NECC अंडा दर, पेटी रेट, शहर और राज्य के अनुसार रोज़ कीमतें।",
    inLanguage: "hi-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
          आज अंडे का रेट - लाइव बाजार कीमतें और रुझान
        </h1>
        <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
          भारत में आज का अंडे का रेट और NECC दर देखने के लिए नीचे शहर चुनें। रोज़ अपडेट होने वाली लाइव कीमतें।
        </p>
        <PopularCityEggRates
          className="mt-6"
          localePrefix="hi"
          title="लोकप्रिय शहर अंडे का रेट"
          linkSuffix=" आज अंडे का रेट"
        />
        <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
            English में देखें
          </Link>
        </p>
      </div>
    </section>
  );
}
