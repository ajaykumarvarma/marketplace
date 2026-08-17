import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

export function SEOElements({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
  noIndex,
}: SEOProps) {
  const siteTitle = title
    ? `${title} | TradeVault`
    : "TradeVault — Secure Digital Goods Marketplace";
  const siteDesc =
    description ||
    "Buy and sell digital goods with escrow protection. Game keys, accounts, software, and more on TradeVault.";
  const siteUrl = url || "https://tradevault.app";
  const siteImage = image || "https://tradevault.app/og-image.png";

  const jsonLdScripts = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd.map((ld, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
          />
        ))
      : [
          <script
            key="ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />,
        ]
    : null;

  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={siteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TradeVault" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@tradevault" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={siteImage} />
      {jsonLdScripts}
    </>
  );
}

export function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
  noIndex,
}: SEOProps) {
  const siteTitle = title
    ? `${title} | TradeVault`
    : "TradeVault — Secure Digital Goods Marketplace";
  const siteDesc =
    description ||
    "Buy and sell digital goods with escrow protection. Game keys, accounts, software, and more on TradeVault.";
  const siteUrl = url || "https://tradevault.app";
  const siteImage = image || "https://tradevault.app/og-image.png";

  const jsonLdScripts = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd.map((ld, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
          />
        ))
      : [
          <script
            key="ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />,
        ]
    : null;

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={siteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="TradeVault" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@tradevault" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={siteImage} />
      {jsonLdScripts}
    </Head>
  );
}