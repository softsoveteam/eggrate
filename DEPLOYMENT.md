# Vercel deployment checklist

## If you see "To get started, edit the page.tsx file" in production

That message is **not** in this repo. It appears when:

1. **Wrong branch or code not pushed** – Deploy the branch that contains `src/app/page.tsx` with the real home page (egg rate content). Ensure all changes are committed and pushed.
2. **Wrong root directory** – In Vercel: Project Settings → General → Root Directory must be **empty** or **`.`** so the app is built from the repo root (where `package.json` and `src/` live).
3. **Build failure** – In Vercel: Deployments → select a deployment → check the Build logs. Fix any errors so `npm run build` succeeds.

## Git

- Commit and push all files under `src/`, `public/`, `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vercel.json`.
- Do **not** commit `.env` if it has secrets; use Vercel Environment Variables instead.
- `.gitignore` already excludes `.next/`, `node_modules/`, `.env*`, `.vercel` – that’s correct.

## Vercel project setup

1. **Import** – Import the Git repository. Vercel will detect Next.js.
2. **Root Directory** – Leave blank (build from repo root).
3. **Build Command** – `npm run build` (default).
4. **Output Directory** – leave default (Next.js sets this).
5. **Install Command** – `npm install` (default).
6. **Node.js Version** – 18.x or 20.x (set in Vercel → Settings → General, or use `engines.node` in `package.json`).
7. **Environment variables** – Add any needed vars (e.g. `EGG_API_DOMAIN`) in Vercel → Settings → Environment Variables.

## Verify locally before deploy

```bash
npm install
npm run build
npm run start
```

Then open http://localhost:3000 – you should see the egg rate home page, not the default Next.js welcome page.

## Files that must be in the repo for production

- `src/app/page.tsx` – home page
- `src/app/layout.tsx` – root layout
- `src/app/[slug]/page.tsx` – city/date detail pages
- `src/app/page/[slug]/page.tsx` – about, contact, etc.
- `src/app/location/page.tsx`
- `src/components/*` – Header, Footer, etc.
- `src/lib/*` – api, utils, popularCities
- `public/*` – icons, search.json, sw.js
- `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vercel.json`
