import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEOElements({
  title = "TradeVault — Secure Digital Goods Marketplace",
  description = "Buy and sell digital goods with escrow protection, fraud detection, and instant delivery. The trusted marketplace for game keys, accounts, software, and services.",
  image = "/og-image.png",
  url = "https://tradevault.app",
}: SEOProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TradeVault" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}

export function SEO({
  title = "TradeVault — Secure Digital Goods Marketplace",
  description = "Buy and sell digital goods with escrow protection, fraud detection, and instant delivery. The trusted marketplace for game keys, accounts, software, and services.",
  image = "/og-image.png",
  url = "https://tradevault.app",
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TradeVault" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Head>
  );
}