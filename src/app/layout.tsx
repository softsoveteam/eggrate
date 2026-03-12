import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PWAProvider } from "@/components/PWAProvider";
import "./globals.css";

const SITE_URL = "https://eggrate.net";
const SITE_NAME = "EggRate.net";
const DEFAULT_DESC =
  "Get the latest egg rate today in India with NECC egg price and 1 Peti egg rate. Check daily egg prices by state and city. Stay informed about egg prices across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Latest Egg Rate Today: NECC Egg Price & Peti Egg Rate | EggRate.net",
    template: "%s | EggRate.net",
  },
  description: DEFAULT_DESC,
  keywords: [
    "egg rate today",
    "NECC egg price",
    "peti egg rate",
    "egg price India",
    "daily egg rate",
    "egg rate by city",
    "egg rate by state",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Latest Egg Rate Today | EggRate.net",
    description: DEFAULT_DESC,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "EggRate.net" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Egg Rate Today | EggRate.net",
    description: DEFAULT_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  verification: {
    // google: 'your-google-verification',
    // yandex: 'your-yandex-verification',
  },
  category: "Finance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EggRate",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EggRate" />
      </head>
      <body className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        <PWAProvider />
        <Header />
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
