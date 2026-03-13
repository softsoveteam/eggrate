import { readFileSync } from "fs";
import path from "path";
import { getSiteDomain, getStartOfTodayUTC } from "@/lib/utils";

export const SITE_URL = `https://${getSiteDomain()}`;

export function getLastMod(): Date {
  return getStartOfTodayUTC();
}

export function getLast7DateSlugs(): string[] {
  const slugs: string[] = [];
  const d = new Date();
  for (let i = 1; i <= 7; i++) {
    const past = new Date(d);
    past.setDate(past.getDate() - i);
    const day = String(past.getDate()).padStart(2, "0");
    const month = String(past.getMonth() + 1).padStart(2, "0");
    const year = past.getFullYear();
    slugs.push(`${day}-${month}-${year}`);
  }
  return slugs;
}

function toSlug(p: string): string {
  return p
    .trim()
    .replace(/[^a-zA-Z0-9/\s.-]+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export type SitemapEntry = { url: string; lastModified: Date; changeFrequency: string; priority: number };

export function getEnglishUrls(lastMod: Date): SitemapEntry[] {
  const staticUrls: SitemapEntry[] = [
    { url: SITE_URL, lastModified: lastMod, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/location`, lastModified: lastMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/page/about-us`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/contact-us`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/privacy`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/terms-and-conditions`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/dmca`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.3 },
  ];

  let placeUrls: SitemapEntry[] = [];
  try {
    const filePath = path.join(process.cwd(), "public", "search.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { place: string }[];
    if (Array.isArray(data)) {
      placeUrls = data.map((item) => ({
        url: `${SITE_URL}/${toSlug(item.place)}-egg-rate-today`,
        lastModified: lastMod,
        changeFrequency: "daily",
        priority: 0.8,
      }));
    }
  } catch {
    // ignore
  }

  const dateSlugs = getLast7DateSlugs();
  const dateUrls: SitemapEntry[] = dateSlugs.map((dateSlug) => ({
    url: `${SITE_URL}/${dateSlug}-egg-rate`,
    lastModified: lastMod,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticUrls, ...placeUrls, ...dateUrls];
}

export function getHindiUrls(lastMod: Date): SitemapEntry[] {
  const staticUrls: SitemapEntry[] = [
    { url: `${SITE_URL}/hi`, lastModified: lastMod, changeFrequency: "daily", priority: 0.95 },
  ];

  let placeUrls: SitemapEntry[] = [];
  try {
    const filePath = path.join(process.cwd(), "public", "search.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { place: string }[];
    if (Array.isArray(data)) {
      placeUrls = data.map((item) => ({
        url: `${SITE_URL}/hi/${toSlug(item.place)}-egg-rate-today`,
        lastModified: lastMod,
        changeFrequency: "daily",
        priority: 0.8,
      }));
    }
  } catch {
    // ignore
  }

  const dateSlugs = getLast7DateSlugs();
  const dateUrls: SitemapEntry[] = dateSlugs.map((dateSlug) => ({
    url: `${SITE_URL}/hi/${dateSlug}-egg-rate`,
    lastModified: lastMod,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticUrls, ...placeUrls, ...dateUrls];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function toSitemapXml(entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.url)}</loc>\n    <lastmod>${e.lastModified.toISOString().slice(0, 10)}</lastmod>\n    <changefreq>${e.changeFrequency}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>`;
}

export function toSitemapIndexXml(englishUrl: string, hindiUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${escapeXml(englishUrl)}</loc>\n  </sitemap>\n  <sitemap>\n    <loc>${escapeXml(hindiUrl)}</loc>\n  </sitemap>\n</sitemapindex>`;
}
