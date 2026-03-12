import { readFileSync } from "fs";
import path from "path";
import type { MetadataRoute } from "next";

const SITE_URL = "https://eggrate.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/location`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/page/about-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/contact-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/terms-and-conditions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/page/dmca`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  let placeUrls: MetadataRoute.Sitemap = [];
  try {
    const filePath = path.join(process.cwd(), "public", "search.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { place: string }[];
    if (Array.isArray(data)) {
      const slug = (p: string) =>
        p
          .trim()
          .replace(/[^a-zA-Z0-9/\s.-]+/g, "-")
          .replace(/\s+/g, "-")
          .toLowerCase();
      placeUrls = data.map((item) => ({
        url: `${SITE_URL}/${slug(item.place)}-egg-rate-today`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // ignore
  }

  return [...staticUrls, ...placeUrls];
}
