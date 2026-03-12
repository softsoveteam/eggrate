import { ImageResponse } from "next/og";
import { getBaseSlug, isDateSlug } from "@/lib/utils";

function capitalizePlace(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = getBaseSlug(slug);
  const name = base.replace(/-/g, " ");
  const cityName = capitalizePlace(name);
  const isDate = isDateSlug(base);
  const centerTitle = isDate ? base : cityName;
  const subtitle = isDate ? "Egg Price & Rate" : "Egg Rate Today";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#faf8f5",
          padding: "48px 64px",
        }}
      >
        {/* Top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fff 50%, #c2410c 50%)",
              border: "2px solid #1e293b",
            }}
          />
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1e293b",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            EggRate.net
          </span>
        </div>

        {/* Center: dynamic title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: centerTitle.length > 20 ? 56 : 72,
              fontWeight: 800,
              color: "#1e293b",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.1,
              maxWidth: "90%",
            }}
          >
            {centerTitle}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#c2410c",
              fontFamily: "system-ui, sans-serif",
              marginTop: 16,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom: CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#c2410c",
            color: "#fff",
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            padding: "14px 32px",
            borderRadius: 12,
          }}
        >
          eggrate.net
        </div>
      </div>
    ),
    { ...size }
  );
}
