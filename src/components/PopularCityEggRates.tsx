import Link from "next/link";
import { POPULAR_CITY_EGG_RATES } from "@/lib/popularCities";

function cityHref(slug: string, localePrefix?: string) {
  return localePrefix ? `/${localePrefix}/${slug}-egg-rate-today` : `/${slug}-egg-rate-today`;
}

export function PopularCityEggRates({
  className = "",
  id,
  localePrefix,
  title = "Popular City Egg Rates",
  linkSuffix = " Egg Rate Today",
}: {
  className?: string;
  id?: string;
  localePrefix?: string;
  title?: string;
  linkSuffix?: string;
}) {
  return (
    <section id={id} className={className}>
      <h2 className="mb-4 text-xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-2xl">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {POPULAR_CITY_EGG_RATES.map(({ name, slug }) => (
          <Link
            key={slug}
            href={cityHref(slug, localePrefix)}
            className="rounded-lg bg-sky-100 px-3 py-2.5 text-center text-sm font-medium text-blue-700 underline transition hover:bg-sky-200 dark:bg-sky-900/40 dark:text-blue-300 dark:hover:bg-sky-900/60"
          >
            {name}{linkSuffix}
          </Link>
        ))}
      </div>
    </section>
  );
}
