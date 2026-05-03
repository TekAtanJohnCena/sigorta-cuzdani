import type { Metadata } from "next";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import "./globals.css";
import "../styles/components.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sigortacuzdani.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sigorta Cüzdanı — Kurumsal Sigorta ve Poliçe Yönetim Platformu",
    template: "%s | Sigorta Cüzdanı",
  },
  description:
    "Türkiye'nin en gelişmiş kurumsal sigorta yönetim platformu. AI destekli poliçe analizi, otomatik vade takibi, risk yönetimi ve nakit akış optimizasyonu. KVKK uyumlu, ISO 27001 sertifikalı altyapı.",
  keywords: [
    "sigorta yönetimi",
    "poliçe takibi",
    "kurumsal sigorta",
    "B2B sigorta platformu",
    "sigorta cüzdanı",
    "AI poliçe analizi",
    "vade takip sistemi",
    "kurumsal risk yönetimi",
    "sigorta yazılımı",
    "poliçe yönetim sistemi",
    "şirket sigortaları",
    "otomatik poliçe takibi",
    "sigorta dashboard",
    "işletme sigorta yönetimi",
  ],
  authors: [{ name: "Sigorta Cüzdanı" }],
  creator: "Sigorta Cüzdanı A.Ş.",
  publisher: "Sigorta Cüzdanı A.Ş.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Sigorta Cüzdanı",
    title: "Sigorta Cüzdanı — Kurumsal Sigorta ve Poliçe Yönetim Platformu",
    description:
      "AI destekli kurumsal sigorta yönetimi. Poliçelerinizi otomatik analiz edin, vade takibi yapın, risklerinizi yönetin. KVKK uyumlu, güvenli altyapı.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Sigorta Cüzdanı Dashboard Önizleme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigorta Cüzdanı — Kurumsal Sigorta Yönetim Platformu",
    description:
      "AI destekli poliçe analizi, otomatik vade takibi ve risk yönetimi. Şirketinizin tüm sigortalarını tek panelde yönetin.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@sigortacuzdani",
  },
  verification: {
    google: "google-site-verification-code", // Google Search Console'dan alınacak
    yandex: "yandex-verification-code", // Yandex Webmaster'dan alınacak
  },
  category: "Business Software",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#4f46e5" />

        {/* JSON-LD Structured Data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Sigorta Cüzdanı",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "TRY",
                "description": "Demo talep edilerek kullanılabilir"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "12"
              },
              "description": "Kurumsal sigorta ve poliçe yönetim platformu. AI destekli otomatik analiz, vade takibi ve risk yönetimi.",
              "url": siteUrl,
              "author": {
                "@type": "Organization",
                "name": "Sigorta Cüzdanı A.Ş.",
                "url": siteUrl
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sigorta Cüzdanı",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "description": "Türkiye'nin en gelişmiş kurumsal sigorta yönetim platformu",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "destek@sigortacuzdani.net",
                "contactType": "Customer Service",
                "areaServed": "TR",
                "availableLanguage": "Turkish"
              },
              "sameAs": [
                "https://www.linkedin.com/company/sigortacuzdani",
                "https://twitter.com/sigortacuzdani"
              ]
            })
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
