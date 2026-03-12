# SEO Audit Report – EggRate.net

**Audit date:** March 2025  
**Scope:** Detail pages, static pages, layout, robots, sitemap, hreflang, structured data, and anything that could prevent or hurt indexing.

---

## Critical (can prevent or hurt indexing)

### 1. **Wrong canonical on all static pages (About, Contact, Privacy, Terms, DMCA)**

- **Where:** `src/app/page/[slug]/page.tsx` – `generateMetadata()` returns only `title`, `description`, `openGraph`. No `alternates.canonical`.
- **Effect:** Next.js falls back to root layout canonical: `https://eggrate.net`. So every URL under `/page/*` (about-us, contact-us, privacy, terms-and-conditions, dmca) sends **canonical = homepage**.
- **Risk:** Google may treat these as duplicates of the home page or ignore their real URLs; indexing and link equity for these pages can be wrong.
- **Fix:** Add `alternates: { canonical: `${SITE_URL}/page/${slug}` }` (and full URL) in `generateMetadata` for each static page.

---

### 2. **Hindi pages served with `lang="en"`**

- **Where:** Root `src/app/layout.tsx` has `<html lang="en">`. All routes, including `/hi` and `/hi/[slug]`, use this layout.
- **Effect:** Hindi content is marked as English. Google’s guidance is to set `lang` to the content language.
- **Risk:** Wrong language signal, possible mis-targeting in search, and hreflang (hi) not fully aligned with document language.
- **Fix:** Use a layout under `app/hi/layout.tsx` that sets `<html lang="hi">`, or set `lang` dynamically (e.g. middleware or segment-based layout) so `/hi` and `/hi/*` get `lang="hi"`.

---

### 3. **Duplicate H1 on date-based detail pages**

- **Where:**  
  - Header (hero): when path is not a “city” page (e.g. date slug), it shows **H1**: “Check the Latest Egg Rate Today”.  
  - English detail page for **date** slugs (e.g. `/11-03-2026-egg-rate-today`): main content uses **H1**: “Egg Rate on {date}”.
- **Effect:** Two H1s per date detail page.
- **Risk:** Google recommends one main H1 per page. Multiple H1s can dilute topical focus and make it unclear which is the primary title.
- **Fix:** Either use **H2** for the content heading on date detail pages (e.g. “Egg Rate on {date}”) and keep a single H1 in the hero, or remove the hero H1 on date pages and keep only the content H1. Prefer one clear H1 per page.

---

### 4. **Location page has no canonical**

- **Where:** `src/app/location/page.tsx` – `metadata` has `title`, `description`, `openGraph` but no `alternates.canonical`.
- **Effect:** Canonical is inherited from layout → `https://eggrate.net`.
- **Risk:** Location page can be seen as duplicate of home or not properly canonicalised.
- **Fix:** Add `alternates: { canonical: `${SITE_URL}/location` }` to location page metadata.

---

## High (bad for SEO, not necessarily “blocking”)

### 5. **Static pages missing robust meta**

- **Where:** `src/app/page/[slug]/page.tsx` – static pages (about-us, contact-us, privacy, terms, dmca).
- **Missing:**  
  - Canonical (see #1).  
  - Explicit `robots` (they inherit index from layout; OK but explicit is clearer).  
  - `twitter` card.  
  - `keywords` (optional).  
  - Full absolute `openGraph.url` and optional `openGraph.images`.
- **Fix:** Add canonical (critical). Optionally add `robots`, `openGraph.url`, `openGraph.images`, and `twitter` for consistency with detail/home.

---

### 6. **About Us page has wrong content (Privacy text)**

- **Where:** `src/app/page/[slug]/page.tsx` – `about-us` content.
- **Issue:** First two paragraphs talk about “privacy of our visitors”, “Privacy Policy document”, “Privacy Policy” – i.e. Privacy page text on About Us.
- **Risk:** Confusing and duplicate-looking content; weak relevance for “About Us” queries.
- **Fix:** Replace with real About Us copy (who you are, what the site does, mission, etc.).

---

### 7. **Contact Us page has off-topic placeholder text**

- **Where:** `src/app/page/[slug]/page.tsx` – `contact-us` content.
- **Issue:** “If our site gave you a virus or crashed your computer…” and “We simply link to sites that host the videos…” – looks like placeholder from another project (video site).
- **Risk:** Unprofessional, wrong relevance, possible quality/trust signals.
- **Fix:** Replace with proper Contact Us text (how to reach you for egg-rate queries, feedback, etc.).

---

### 8. **No `x-default` hreflang**

- **Where:** All pages that set `alternates.languages` (home, English detail, Hindi detail, Hindi home).
- **Current:** Only `en` and `hi` are set.
- **Effect:** No explicit “default” for users whose language doesn’t match.
- **Risk:** Minor; Google can still pick a default, but `x-default` is best practice for multi-language sites.
- **Fix:** Add `xDefault: SITE_URL` (or the English homepage/detail URL) in `alternates.languages` where you define en/hi.

---

## Medium (good to fix)

### 9. **Sitemap: date-based “yesterday” URLs not included**

- **Where:** `src/app/sitemap.ts` – only URLs ending with `-egg-rate-today` (and `/hi/…-egg-rate-today`) are added. No `-egg-rate` (e.g. yesterday’s date).
- **Effect:** Links like `/10-03-2026-egg-rate` exist in the UI but are not in the sitemap.
- **Risk:** These pages are still indexable (not blocked), but discovery is slower. Optional to include if you want them indexed equally.
- **Fix:** If you want them fully discoverable, add logic to include past date slugs (e.g. last 7–30 days) with `-egg-rate` in the sitemap.

---

### 10. **Structured data: static pages have no Organization / WebPage**

- **Where:** About, Contact, Privacy, Terms, DMCA.
- **Current:** No JSON-LD (BreadcrumbList, Organization, or WebPage).
- **Effect:** Missed chance for rich results and clearer entity signals.
- **Fix:** Add BreadcrumbList (e.g. Home > About Us). Optionally add Organization (for About/Contact) and WebPage where useful.

---

### 11. **Layout default canonical may override child canonicals**

- **Where:** `src/app/layout.tsx` – `alternates: { canonical: SITE_URL }`.
- **Effect:** In Next.js App Router, child segment metadata usually overrides; detail and home pages correctly set their own canonical. Static and location pages do not, so they get the default (see #1 and #4).
- **Fix:** As above: set canonical on every page that has its own URL (static pages + location).

---

### 12. **Hardcoded domain in layout and static pages**

- **Where:** `layout.tsx`: `const SITE_URL = "https://eggrate.net"`. `page/[slug]/page.tsx`: `const DOMAIN = "eggrate.net"; const SITE_URL = "https://eggrate.net";`. `location/page.tsx`: `const SITE_URL = "https://eggrate.net";`
- **Effect:** If you ever change domain or use staging, these stay tied to eggrate.net.
- **Risk:** Wrong canonicals/OG URLs in non-production. Less critical if you only ever run one domain.
- **Fix:** Prefer a single source (e.g. `getSiteDomain()` from `@/lib/utils`) and build full URLs from that everywhere.

---

## Low / Informational

### 13. **robots.txt**

- **Where:** `src/app/robots.ts`.
- **Current:** `allow: "/"`, `disallow: ["/api/"]`, `sitemap` and `host` set. No accidental block of important URLs.
- **Status:** OK; no change required for indexing of main content.

---

### 14. **Detail pages (English & Hindi)**

- **Present:** Unique title/description, canonical, hreflang (en/hi), Open Graph, Twitter, article meta, BreadcrumbList + WebPage JSON-LD, `robots: { index: true, follow: true }`.
- **Issue:** Only the duplicate H1 on date pages (see #3) and missing `x-default` (see #8).

---

### 15. **Home page**

- **Present:** Canonical, en/hi alternates, OG, Twitter, WebSite JSON-LD. Good.
- **Minor:** Add `x-default` in alternates if you add it site-wide.

---

### 16. **External links (NECC Wikipedia)**

- **Where:** Detail pages link to Wikipedia with `rel="noopener noreferrer"`.
- **Status:** Correct and safe; no change needed.

---

### 17. **Skip link and main landmark**

- **Where:** `layout.tsx` – “Skip to main content” and `<main id="main-content" role="main">`.
- **Status:** Good for accessibility and crawlability; no change needed.

---

## Summary checklist

| # | Severity   | Issue | Can block / hurt indexing? |
|---|------------|--------|-----------------------------|
| 1 | Critical   | Static pages canonical = homepage | Yes – wrong canonical |
| 2 | Critical   | Hindi pages with `lang="en"`       | Can hurt targeting/clarity |
| 3 | Critical   | Two H1s on date detail pages        | Can dilute relevance |
| 4 | Critical   | Location page no canonical          | Yes – wrong canonical |
| 5 | High       | Static pages missing full meta      | Indirect |
| 6 | High       | About Us shows Privacy text        | Quality/relevance |
| 7 | High       | Contact Us placeholder text        | Quality/relevance |
| 8 | High       | No hreflang x-default               | Minor |
| 9 | Medium     | Sitemap omits -egg-rate URLs        | Slower discovery |
| 10| Medium     | No structured data on static pages  | Missed rich results |
| 11| Medium     | Relying on default canonical        | Only where not overridden |
| 12| Medium     | Hardcoded domain in several files   | Staging/multi-domain |
| 13–17 | Low/OK | robots, detail/home meta, links, a11y | No |

---

## Recommended fix order

1. **Canonicals:** Add correct `alternates.canonical` for all static pages and for the location page (#1, #4, #11).
2. **Hindi `lang`:** Set `lang="hi"` for `/hi` and `/hi/*` via layout or dynamic `lang` (#2).
3. **Single H1 on date pages:** Use H2 for “Egg Rate on {date}” in content, or remove hero H1 on date routes (#3).
4. **Content:** Replace About Us and Contact Us body text (#6, #7).
5. **Meta and hreflang:** Add full meta (and optionally `x-default`) for static pages (#5, #8).
6. **Optional:** Sitemap for `-egg-rate` dates, structured data on static pages, centralise domain (#9, #10, #12).

Once these are done, the main blockers and high-impact SEO issues for indexing and relevance should be addressed. If you want, next step can be concrete code edits (e.g. for canonicals, `lang`, and H1) file-by-file.
