import { NextResponse } from "next/server";
import { getHindiUrls, getLastMod, toSitemapXml } from "@/lib/sitemapData";

export function GET() {
  const lastMod = getLastMod();
  const entries = getHindiUrls(lastMod);
  const xml = toSitemapXml(entries);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
