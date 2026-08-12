import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEOElements({ title, description, image, url }: SEOProps) {
  const siteTitle = title ? `${title} | TradeVault` : "TradeVault — Secure Digital Goods Marketplace";
  const siteDesc = description || "Buy and sell digital goods with escrow protection. Game keys, accounts, software, and more on TradeVault.";
  const siteUrl = url || "https://tradevault.app";
  const siteImage = image || "https://tradevault.app/og-image.png";

  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={siteImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={siteImage} />
    </>
  );
}

export function SEO({ title, description, image, url }: SEOProps) {
  const siteTitle = title ? `${title} | TradeVault` : "TradeVault — Secure Digital Goods Marketplace";
  const siteDesc = description || "Buy and sell digital goods with escrow protection. Game keys, accounts, software, and more on TradeVault.";
  const siteUrl = url || "https://tradevault.app";
  const siteImage = image || "https://tradevault.app/og-image.png";

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={siteImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={siteImage} />
    </Head>
  );
}