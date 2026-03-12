import Link from "next/link";
import { getPreDay } from "@/lib/utils";

const DOMAIN = "eggrate.net";

// Same trending cities as in Header
const POPULAR_TOP = [
  { name: "Barwala", slug: "barwala" },
  { name: "Namakkal", slug: "namakkal" },
  { name: "Delhi", slug: "delhi" },
];
const TRENDING_CITIES = [
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Bangalore", slug: "bengaluru" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "West Bengal", slug: "west-bengal" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Pune", slug: "pune" },
];
const cityHref = (slug: string) => `/${slug}-egg-rate-today`;

export function Footer() {
  const preDay = getPreDay();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-900 px-4 py-10 text-zinc-300 dark:border-zinc-800">
      <div className="container mx-auto">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">About</h3>
            <p className="max-w-sm text-sm leading-relaxed opacity-90">
              Do you want to know today&apos;s egg rate? You&apos;ve come to the right place.
              Here you&apos;ll find information about egg prices and other related topics.
              Eggs are a popular and affordable source of protein. Stay informed about
              market conditions and prices—bookmark {DOMAIN} for the latest egg rates.
            </p>
          </div>

          {/* Column 2: Useful Links */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href={`/${preDay}-egg-rate`} className="text-sm hover:text-white hover:underline">
                  Yesterday
                </Link>
              </li>
              <li>
                <Link href="/location" className="text-sm hover:text-white hover:underline">
                  Location
                </Link>
              </li>
              <li>
                <Link href="/page/about-us" className="text-sm hover:text-white hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/page/contact-us" className="text-sm hover:text-white hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/page/privacy" className="text-sm hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/page/terms-and-conditions" className="text-sm hover:text-white hover:underline">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trending (same as header) */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Trending</h3>
            <ul className="space-y-2">
              {POPULAR_TOP.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={cityHref(city.slug)}
                    className="text-sm hover:text-white hover:underline"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
              {TRENDING_CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={cityHref(city.slug)}
                    className="text-sm hover:text-white hover:underline"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Author & Contact */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Author & Contact</h3>
            <p className="mb-3 max-w-sm text-sm leading-relaxed opacity-90">
              {DOMAIN} is built to help you track daily egg rates across India. For
              feedback, queries, or to report an issue, please get in touch.
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/page/contact-us"
                  className="text-sm hover:text-white hover:underline"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/page/about-us"
                  className="text-sm hover:text-white hover:underline"
                >
                  About the Site
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-700 pt-6 text-sm">
          <span>© {new Date().getFullYear()} {DOMAIN}. All rights reserved.</span>
          <span>Made with care for egg lovers</span>
        </div>
      </div>
    </footer>
  );
}
