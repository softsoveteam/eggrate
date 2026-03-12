"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { getPreDay, isDateSlug, getSiteDomain } from "@/lib/utils";

// Top-level popular city links (shown in nav bar)
const POPULAR_TOP = [
  { name: "Barwala", slug: "barwala" },
  { name: "Namakkal", slug: "namakkal" },
  { name: "Delhi", slug: "delhi" },
];

// Cities in "Trending" dropdown (5–6 cities)
const TRENDING_CITIES = [
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Bangalore", slug: "bengaluru" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "West Bengal", slug: "west-bengal" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Pune", slug: "pune" },
];

const cityHref = (slug: string) => `/${slug}-egg-rate-today`;

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ place: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trendingOpen, setTrendingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trendingMobileOpen, setTrendingMobileOpen] = useState(false);
  const trendingRefDesktop = useRef<HTMLDivElement>(null);
  const trendingRefMobile = useRef<HTMLDivElement>(null);
  const preDay = getPreDay();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        trendingRefDesktop.current?.contains(target) ||
        trendingRefMobile.current?.contains(target)
      )
        return;
      setTrendingOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setTrendingMobileOpen(false);
  }, []);

  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (!q.trim()) {
        setResults([]);
        setSearchOpen(false);
        return;
      }
      try {
        const res = await fetch("/search.json");
        const data = (await res.json()) as { place: string }[];
        const filtered = data.filter((item) =>
          item.place.toLowerCase().includes(q.toLowerCase())
        );
        setResults(filtered.slice(0, 12));
        setSearchOpen(true);
      } catch {
        setResults([]);
      }
    },
    []
  );

  const slug = (place: string) =>
    place
      .trim()
      .replace(/[^a-zA-Z0-9/\s.-]+/g, "-")
      .replace(/\s+/g, "-")
      .toLowerCase();

  const pathname = usePathname();
  const isCityPage = pathname?.endsWith("-egg-rate-today") && pathname !== "/" && pathname.length > 1;
  const citySlug = isCityPage && pathname
    ? pathname.slice(1).replace(/-egg-rate-today$/, "").trim()
    : "";
  const isCity = isCityPage && citySlug.length > 0 && !isDateSlug(citySlug);
  const cityName = isCity ? citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const siteDomain = getSiteDomain();
  const breadcrumbPath = pathname && pathname.length > 1 ? pathname.slice(1) : null;
  const isHome = pathname === "/";

  const breadcrumbJsonLd =
    isHome && breadcrumbPath === null
      ? {
          "@context": "https://schema.org" as const,
          "@type": "BreadcrumbList" as const,
          itemListElement: [{ "@type": "ListItem" as const, position: 1, name: siteDomain, item: `https://${siteDomain}/` }],
        }
      : !isHome && breadcrumbPath !== null
        ? {
            "@context": "https://schema.org" as const,
            "@type": "BreadcrumbList" as const,
            itemListElement: [
              { "@type": "ListItem" as const, position: 1, name: siteDomain, item: `https://${siteDomain}/` },
              { "@type": "ListItem" as const, position: 2, name: breadcrumbPath, item: `https://${siteDomain}${pathname}` },
            ],
          }
        : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-indigo-400"
          >
            <span className="text-2xl">🥚</span>
            EggRate
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-4 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Home
            </Link>
            {POPULAR_TOP.map((city) => (
              <Link
                key={city.slug}
                href={cityHref(city.slug)}
                className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              >
                {city.name}
              </Link>
            ))}
            <div className="relative" ref={trendingRefDesktop}>
              <button
                type="button"
                onClick={() => setTrendingOpen((o) => !o)}
                className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                aria-expanded={trendingOpen}
                aria-haspopup="true"
              >
                Trending
                <span className={`inline-block transition-transform ${trendingOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {trendingOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  {TRENDING_CITIES.map((city) => (
                    <Link
                      key={city.slug}
                      href={cityHref(city.slug)}
                      onClick={() => setTrendingOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={`/${preDay}-egg-rate`}
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Yesterday
            </Link>
            <Link
              href="/location"
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Location
            </Link>
            <Link
              href="/page/contact-us"
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu - always in DOM for crawlers/SEO */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        aria-hidden={!mobileMenuOpen}
        style={{ visibility: mobileMenuOpen ? "visible" : "hidden", transition: "visibility 0.2s" }}
      >
        <div
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          onClick={closeMobileMenu}
          style={{ opacity: mobileMenuOpen ? 1 : 0, transition: "opacity 0.2s ease" }}
        />
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-1 overflow-y-auto bg-white p-6 shadow-xl dark:bg-zinc-900"
          style={{
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.25s ease-out",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Menu</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Link href="/" onClick={closeMobileMenu} className="rounded-lg px-4 py-3 text-base font-medium text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300">
            Home
          </Link>
          {POPULAR_TOP.map((city) => (
            <Link
              key={city.slug}
              href={cityHref(city.slug)}
              onClick={closeMobileMenu}
              className="rounded-lg px-4 py-3 text-base font-medium text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
            >
              {city.name}
            </Link>
          ))}
          <div ref={trendingRefMobile}>
            <button
              type="button"
              onClick={() => setTrendingMobileOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
              aria-expanded={trendingMobileOpen}
            >
              Trending
              <span className={`inline-block transition-transform ${trendingMobileOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {trendingMobileOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                {TRENDING_CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    href={cityHref(city.slug)}
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-2 py-2 text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href={`/${preDay}-egg-rate`} onClick={closeMobileMenu} className="rounded-lg px-4 py-3 text-base font-medium text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300">
            Yesterday
          </Link>
          <Link href="/location" onClick={closeMobileMenu} className="rounded-lg px-4 py-3 text-base font-medium text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300">
            Location
          </Link>
          <Link href="/page/contact-us" onClick={closeMobileMenu} className="rounded-lg px-4 py-3 text-base font-medium text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300">
            Contact
          </Link>
        </nav>
      </div>

      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-zinc-900 pt-24 pb-12 text-white shadow-lg">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          {isHome && (
            <>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
              />
              <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center justify-center gap-x-2 text-sm text-indigo-100">
                <Link
                  href="/"
                  className="hover:text-white hover:underline focus:text-white focus:underline"
                >
                  {siteDomain}
                </Link>
                {breadcrumbPath && (
                  <>
                    <span aria-hidden className="text-indigo-300">&gt;</span>
                    <span className="text-white/95">{breadcrumbPath}</span>
                  </>
                )}
              </nav>
            </>
          )}
          {isCity ? (
            <>
              <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {cityName} Egg Rate Today - Live NECC Egg Price
              </h1>
              <h2 className="mb-6 text-lg font-medium text-indigo-100 sm:text-xl">
                Today Egg Rate in {cityName}
              </h2>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Check the Latest Egg Rate Today
              </h1>
              <p className="mb-6 text-indigo-100">
                Keeping up to date with the latest egg rates is easy with this tool
              </p>
            </>
          )}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setSearchOpen(true)}
              placeholder="Search places..."
              className="w-full rounded-full border-0 bg-white/95 py-3 pl-5 pr-12 text-zinc-800 shadow-lg outline-none ring-2 ring-indigo-500/30 placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-400"
              aria-label="Search places"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
              🔍
            </span>
            {searchOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {results.map((item) => (
                  <Link
                    key={item.place}
                    href={`/${slug(item.place)}-egg-rate-today`}
                    onClick={() => setSearchOpen(false)}
                    className="block px-4 py-2 text-left text-zinc-700 hover:bg-indigo-50 dark:text-zinc-300 dark:hover:bg-indigo-900/30"
                  >
                    {item.place}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
