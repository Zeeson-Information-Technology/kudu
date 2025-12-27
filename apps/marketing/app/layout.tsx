import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { site } from "../content/site";
import { brand } from "../brand";

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default: site.name,
    template: `%s | ${site.name}`
  },
  description: site.description,
  keywords: site.keywords,
  openGraph: {
    type: "website",
    title: site.name,
    description: site.description,
    url: site.baseUrl,
    siteName: site.name,
    images: ["/brand/og.png"],
  },
  icons: {
  icon: ["/brand/favicon.ico", "/brand/favicon-32x32.png"],
  apple: ["/brand/favicon-180x180.png"],
  shortcut: ["/brand/favicon.ico"]
},

  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description
  },
  alternates: {
    canonical: site.baseUrl
  }
};

export const viewport = {
  themeColor: brand.primary
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          {site.skipLinkLabel}
        </a>
        <Header />
        <main id="main" className="page-shell">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
