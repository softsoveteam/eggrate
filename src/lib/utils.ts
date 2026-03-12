const SITE_DOMAIN = "eggrate.net";

export function makeSlug(str: string | undefined | null): string {
  if (str == null || typeof str !== "string") return "";
  return str
    .trim()
    .replace(/[^a-zA-Z0-9/\s.-]+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function getPreDay(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function isDateSlug(slug: string): boolean {
  const match = slug.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match;
  const day = parseInt(d!, 10);
  const month = parseInt(m!, 10);
  const year = parseInt(y!, 10);
  if (month < 1 || month > 12) return false;
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

export function getSiteDomain() {
  return SITE_DOMAIN;
}

/** Start of today at 00:00:00 UTC - for sitemap lastmod and "updated" meta (prices refresh daily at midnight) */
export function getStartOfTodayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
