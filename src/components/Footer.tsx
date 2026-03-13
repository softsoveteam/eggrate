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

function cityHref(slug: string, locale: string) {
  return locale === "hi" ? `/hi/${slug}-egg-rate-today` : `/${slug}-egg-rate-today`;
}

const F = {
  en: {
    about: "About",
    aboutDesc: "Do you want to know today's egg rate? You've come to the right place. Here you'll find information about egg prices and other related topics. Eggs are a popular and affordable source of protein. Stay informed about market conditions and prices—bookmark",
    usefulLinks: "Useful Links",
    home: "Home",
    yesterday: "Yesterday",
    location: "Location",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    termsAndConditions: "Terms & Conditions",
    trending: "Trending",
    authorContact: "Author & Contact",
    authorDesc: "is built to help you track daily egg rates across India. For feedback, queries, or to report an issue, please get in touch.",
    aboutTheSite: "About the Site",
    rightsReserved: "All rights reserved.",
    madeWith: "Made with care for egg lovers",
  },
  hi: {
    about: "जानकारी",
    aboutDesc: "आज का अंडा रेट जानना चाहते हैं? आप सही जगह आए हैं। यहाँ अंडे की कीमतों और संबंधित जानकारी मिलेगी। अंडा प्रोटीन का लोकप्रिय और किफायती स्रोत है। बाजार और कीमतों की जानकारी के लिए",
    usefulLinks: "उपयोगी लिंक",
    home: "होम",
    yesterday: "कल",
    location: "लोकेशन",
    aboutUs: "हमारे बारे में",
    contactUs: "संपर्क करें",
    privacyPolicy: "गोपनीयता नीति",
    termsAndConditions: "नियम और शर्तें",
    trending: "ट्रेंडिंग",
    authorContact: "लेखक और संपर्क",
    authorDesc: "भारत भर में रोज़ अंडा रेट देखने के लिए बनाया गया है। सुझाव, सवाल या समस्या के लिए संपर्क करें।",
    aboutTheSite: "साइट के बारे में",
    rightsReserved: "सर्वाधिकार सुरक्षित।",
    madeWith: "अंडा प्रेमियों के लिए बनाया गया",
  },
};

export function Footer({ locale = "en" }: { locale?: string }) {
  const preDay = getPreDay();
  const t = locale === "hi" ? F.hi : F.en;
  const isHi = locale === "hi";

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-100 px-4 py-10 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
      <div className="container mx-auto">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">{t.about}</h3>
            <p className="max-w-sm text-sm leading-relaxed opacity-90">
              {t.aboutDesc} {DOMAIN} {isHi ? "बुकमार्क करें।" : "for the latest egg rates."}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">{t.usefulLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={isHi ? "/hi" : "/"} className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.home}</Link>
              </li>
              <li>
                <Link href={isHi ? `/hi/${preDay}-egg-rate` : `/${preDay}-egg-rate`} className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.yesterday}</Link>
              </li>
              <li>
                <Link href="/location" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.location}</Link>
              </li>
              <li>
                <Link href="/page/about-us" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.aboutUs}</Link>
              </li>
              <li>
                <Link href="/page/contact-us" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.contactUs}</Link>
              </li>
              <li>
                <Link href="/page/privacy" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.privacyPolicy}</Link>
              </li>
              <li>
                <Link href="/page/terms-and-conditions" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.termsAndConditions}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">{t.trending}</h3>
            <ul className="space-y-2">
              {POPULAR_TOP.map((city) => (
                <li key={city.slug}>
                  <Link href={cityHref(city.slug, locale)} className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">
                    {city.name}
                  </Link>
                </li>
              ))}
              {TRENDING_CITIES.map((city) => (
                <li key={city.slug}>
                  <Link href={cityHref(city.slug, locale)} className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">{t.authorContact}</h3>
            <p className="mb-3 max-w-sm text-sm leading-relaxed opacity-90">
              {DOMAIN} {t.authorDesc}
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/page/contact-us" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.contactUs}</Link>
              </li>
              <li>
                <Link href="/page/about-us" className="text-sm hover:text-indigo-600 hover:underline dark:hover:text-white">{t.aboutTheSite}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-300 pt-6 text-sm dark:border-zinc-700">
          <span>© {new Date().getFullYear()} {DOMAIN}. {t.rightsReserved}</span>
          <span>{t.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}
