import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";
import { makeSlug, getSiteDomain } from "@/lib/utils";

const SITE_URL = `https://${getSiteDomain()}`;

// Force SSR: render on server every request for full HTML and best SEO
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check NECC Egg Price & Peti Egg Rate by Location",
  description:
    "NECC Egg Rate Today by Location. Check out daily egg price updated by NECC. Browse egg rates by state and city across India.",
  alternates: { canonical: `${SITE_URL}/location` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "NECC Egg Rate Today by Location | EggRate.net",
    description: "Check daily egg price by state and city. NECC egg rate today.",
    url: `${SITE_URL}/location`,
    siteName: "EggRate.net",
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "EggRate.net - Egg Rate by Location" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NECC Egg Rate Today by Location | EggRate.net",
    description: "Check daily egg price by state and city. NECC egg rate today.",
    site: "@eggrate",
    creator: "@eggrate",
  },
};

function getPlaces(): { place: string }[] {
  try {
    const filePath = path.join(process.cwd(), "public", "search.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { place: string }[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function LocationPage() {
  const places = getPlaces();

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
          NECC Egg Rate Today by Location
        </h1>
        <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
          Check out daily egg price updated by NECC. Select your state or city below to see
          today&apos;s egg rate.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {places.map((item, i) => {
            const slug = makeSlug(item?.place);
            if (!slug) return null;
            return (
              <Link
                key={`${slug}-${i}`}
                href={`/${slug}-egg-rate-today`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
              >
                {item?.place ?? ""}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
