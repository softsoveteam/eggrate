import type { EggApiResponse } from "@/types/egg";

const API_BASE = "https://panelbot.in/egg/index.php";

// Use eggrate.net when your domain is whitelisted with the API provider.
// Until then we fall back to a domain that returns data so the site works.
const PRIMARY_DOMAIN = process.env.EGG_API_DOMAIN || "eggrate.net";
const FALLBACK_DOMAIN = "demo59.codehap.in";

async function fetchEggApi(
  type: number,
  query: string,
  domain: string
): Promise<EggApiResponse | null> {
  const url = `${API_BASE}?type=${type}&query=${encodeURIComponent(query)}&d=${domain}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EggRate/1.0)",
        Referer: `https://${domain}/`,
      },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim().length === 0) return null;
    const data = JSON.parse(text) as EggApiResponse;
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

async function fetchWithFallback(
  type: number,
  query: string
): Promise<EggApiResponse | null> {
  let data = await fetchEggApi(type, query, PRIMARY_DOMAIN);
  if (!data && PRIMARY_DOMAIN !== FALLBACK_DOMAIN) {
    data = await fetchEggApi(type, query, FALLBACK_DOMAIN);
  }
  return data;
}

export async function fetchHomeData(): Promise<EggApiResponse | null> {
  return fetchWithFallback(2, "");
}

export async function fetchLocationData(slug: string): Promise<EggApiResponse | null> {
  return fetchWithFallback(1, slug);
}

export async function fetchDateData(dateSlug: string): Promise<EggApiResponse | null> {
  return fetchWithFallback(2, dateSlug);
}
