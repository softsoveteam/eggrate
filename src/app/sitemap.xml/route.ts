import { NextResponse } from "next/server";
import { SITE_URL, toSitemapIndexXml } from "@/lib/sitemapData";

export function GET() {
  const indexXml = toSitemapIndexXml(
    `${SITE_URL}/sitemap/english.xml`,
    `${SITE_URL}/sitemap/hindi.xml`
  );
  return new NextResponse(indexXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
