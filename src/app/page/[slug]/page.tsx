import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteDomain } from "@/lib/utils";

// Force SSR: render on server every request for full HTML and best SEO
export const dynamic = "force-dynamic";

function getSiteUrl() {
  return `https://${getSiteDomain()}`;
}

const DOMAIN = getSiteDomain();
const SITE_URL = getSiteUrl();

const PAGES: Record<
  string,
  { title: string; description: string; content: React.ReactNode }
> = {
  "about-us": {
    title: "About Us",
    description: `About EggRate.net - Your source for daily egg rates in India.`,
    content: (
      <>
        <h1>About Us - EggRate.net</h1>
        <p>
          EggRate.net is your trusted source for daily egg rates across India. We track NECC (National Egg Coordination Committee) prices and present them in an easy-to-use format so that consumers, retailers, and businesses can stay informed about current egg prices.
        </p>
        <p>
          Our mission is to make egg rate information accessible and up to date. Whether you are checking today&apos;s rate for your city, comparing prices across states, or looking at trends over time, we aim to provide clear and reliable data.
        </p>
        <h2>What we offer</h2>
        <p>
          We provide daily egg rates by city and state, including price per piece, per tray, per 100 pieces, and per peti. Our data is updated regularly based on NECC reports, and we offer both list and chart views to help you understand market trends.
        </p>
        <p>
          If you have questions or feedback about our service, please visit our Contact Us page. We are here to help you stay informed about egg prices in India.
        </p>
      </>
    ),
  },
  "contact-us": {
    title: "Contact Us",
    description: `Contact EggRate.net for queries, suggestions, or feedback about egg rates.`,
    content: (
      <>
        <h1>Contact Us</h1>
        <p>
          Have a question about egg rates, a suggestion to improve our site, or feedback to share? We would love to hear from you.
        </p>
        <p>
          For queries about egg prices, data accuracy, advertising, or general feedback, please email us at{" "}
          <a href="mailto:eggratenet@protonmail.com" className="text-indigo-600 hover:underline dark:text-indigo-400">
            eggratenet@protonmail.com
          </a>
          . We do our best to respond in a timely manner.
        </p>
        <p>
          EggRate.net is built to help you track daily egg rates across India. If you notice any issue with the data or the site, please let us know so we can improve your experience.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    description: `Privacy Policy for ${DOMAIN}.`,
    content: (
      <>
        <h1>Privacy Policy for {DOMAIN}</h1>
        <p>
          At {DOMAIN}, accessible from {SITE_URL}, one of our main priorities is the
          privacy of our visitors. This Privacy Policy document contains types of
          information that is collected and recorded by {DOMAIN} and how we use it.
        </p>
        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
        </p>
        <h2>Consent</h2>
        <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
        <h2>Information we collect</h2>
        <p>
          The personal information that you are asked to provide, and the reasons why
          you are asked to provide it, will be made clear to you at the point we ask
          for your personal information. If you contact us directly, we may receive
          additional information about you such as your name, email address, phone
          number, the contents of the message and/or attachments you may send us, and
          any other information you may choose to provide.
        </p>
        <h2>How we use your information</h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>Communicate with you for customer service and updates</li>
          <li>Find and prevent fraud</li>
        </ul>
        <h2>Log Files</h2>
        <p>
          {DOMAIN} follows a standard procedure of using log files. The information
          collected by log files include internet protocol (IP) addresses, browser
          type, Internet Service Provider (ISP), date and time stamp, referring/exit
          pages, and possibly the number of clicks. These are not linked to any
          information that is personally identifiable.
        </p>
        <h2>Third Party Privacy Policies</h2>
        <p>
          {DOMAIN}&apos;s Privacy Policy does not apply to other advertisers or websites.
          You can choose to disable cookies through your individual browser options.
        </p>
        <h2>Children&apos;s Information</h2>
        <p>
          {DOMAIN} does not knowingly collect any Personal Identifiable Information
          from children under the age of 13. If you think that your child provided
          this kind of information on our website, please contact us immediately.
        </p>
      </>
    ),
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    description: `Terms and Conditions for ${DOMAIN}.`,
    content: (
      <>
        <h1>Terms and Conditions for {DOMAIN}</h1>
        <p>
          Welcome to {DOMAIN}! These terms and conditions outline the rules and
          regulations for the use of {DOMAIN}&apos;s Website, located at {SITE_URL}.
        </p>
        <p>
          By accessing this website we assume you accept these terms and conditions.
          Do not continue to use {DOMAIN} if you do not agree to take all of the
          terms and conditions stated on this page.
        </p>
        <h3>Cookies</h3>
        <p>
          We employ the use of cookies. By accessing {DOMAIN}, you agreed to use
          cookies in agreement with the {DOMAIN}&apos;s Privacy Policy.
        </p>
        <h3>License</h3>
        <p>
          Unless otherwise stated, {DOMAIN} and/or its licensors own the intellectual
          property rights for all material on {DOMAIN}. All intellectual property
          rights are reserved. You may access this from {DOMAIN} for your own
          personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul>
          <li>Republish material from {DOMAIN}</li>
          <li>Sell, rent or sub-license material from {DOMAIN}</li>
          <li>Reproduce, duplicate or copy material from {DOMAIN}</li>
          <li>Redistribute content from {DOMAIN}</li>
        </ul>
        <h3>Your Privacy</h3>
        <p>Please read our Privacy Policy.</p>
        <h3>Disclaimer</h3>
        <p>
          To the maximum extent permitted by applicable law, we exclude all
          representations, warranties and conditions relating to our website and the
          use of this website. As long as the website and the information and
          services on the website are provided free of charge, we will not be liable
          for any loss or damage of any nature.
        </p>
      </>
    ),
  },
  dmca: {
    title: "DMCA",
    description: `DMCA Policy for ${DOMAIN}.`,
    content: (
      <>
        <h1>DMCA Policy</h1>
        <p>
          &quot;{SITE_URL}/&quot; is an online service provider as defined in the Digital
          Millennium Copyright Act. We provide legal copyright owners with the
          ability to self-publish on the Internet by uploading, storing, and displaying
          various types of media. We do not actively monitor, screen, or otherwise
          review the media which is uploaded to our servers by users of the service.
        </p>
        <p>
          We take copyright violations very seriously and will vigorously protect the
          rights of legal copyright owners. If you are the copyright owner of content
          which appears on the {DOMAIN} website and you did not authorize the use of
          the content you must notify us in writing in order for us to identify the
          allegedly infringing content and take action.
        </p>
        <p>
          Your written notice must include: Specific identification of the copyrighted
          work which you are alleging to have been infringed; Specific identification
          of the location and description of the material that is claimed to be
          infringing; Information reasonably sufficient to allow us to contact you; A
          statement that the complaining party has a good faith belief that use of
          the material in the manner complained of is not authorized by the copyright
          owner; A statement that the information in the notification is accurate.
        </p>
        <p>
          Written notice should be sent to:{" "}
          <a href={`mailto:${DOMAIN.replace(".", "")}@protonmail.com`}>
            {DOMAIN.replace(".", "")}@protonmail.com
          </a>
        </p>
      </>
    ),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return {};
  const canonicalUrl = `${getSiteUrl()}/page/${slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      siteName: "EggRate.net",
      images: [{ url: `${getSiteUrl()}/og.png`, width: 1200, height: 630, alt: `${page.title} | EggRate.net` }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      site: "@eggrate",
      creator: "@eggrate",
    },
  };
}

export default async function PagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  const baseUrl = getSiteUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: page.title, item: `${baseUrl}/page/${slug}` },
    ],
  };

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 text-sm">
        <Link href="/" className="font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
          Home
        </Link>
        <span className="text-zinc-500 dark:text-zinc-400" aria-hidden>&gt;</span>
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{page.title}</span>
      </nav>
      <div className="prose prose-zinc max-w-none rounded-xl border border-zinc-200 bg-white p-6 shadow dark:prose-invert dark:border-zinc-700 dark:bg-zinc-900">
        {page.content}
      </div>
    </section>
  );
}
