/**
 * SEO Structured Data Component
 * Provides JSON-LD structured data for better search engine understanding
 */

interface FAQItem {
  question: string;
  answer: string;
}

export function OrganizationStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigortacuzdani.net';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sigorta Cüzdanı',
    alternateName: 'Sigorta Cuzdani',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Türkiye\'nin en gelişmiş kurumsal sigorta ve poliçe yönetim platformu',
    foundingDate: '2026',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'destek@sigortacuzdani.net',
      contactType: 'Customer Service',
      areaServed: 'TR',
      availableLanguage: ['Turkish'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'İstanbul',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigortacuzdani.net';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sigorta Cüzdanı',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQStructuredData({ items }: { items: FAQItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SoftwareApplicationStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigortacuzdani.net';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sigorta Cüzdanı',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      description: 'Demo talep edilerek kullanılabilir',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '12',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'AI destekli kurumsal sigorta ve poliçe yönetim platformu. Otomatik vade takibi, risk yönetimi ve nakit akış optimizasyonu.',
    url: siteUrl,
    screenshot: `${siteUrl}/screenshot.png`,
    featureList: [
      'AI destekli poliçe analizi',
      'Otomatik vade takibi',
      'Risk yönetimi dashboard',
      'Nakit akış optimizasyonu',
      'KVKK uyumlu veri güvenliği',
      'Çoklu şirket yönetimi',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
