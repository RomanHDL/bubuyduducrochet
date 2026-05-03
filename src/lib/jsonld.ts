// Generadores de JSON-LD para enriquecer SEO y rich snippets de Google.
// Schema.org spec: https://schema.org/
//
// Cada función retorna un objeto que se inyecta como <script type="application/ld+json">.

import {
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SITE_DESCRIPTION,
  SITE_LOGO,
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_WHATSAPP,
  BUSINESS_CITY,
  BUSINESS_REGION,
  BUSINESS_COUNTRY,
  BUSINESS_FOUNDED,
  BUSINESS_HOURS,
  abs,
} from './seo';

// ─── Organization ──────────────────────────────────────────────────────────
// Identidad de la empresa. Aparece en knowledge panel de Google si tiene match.
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO,
      width: 512,
      height: 512,
    },
    description: SITE_DESCRIPTION,
    foundingDate: BUSINESS_FOUNDED,
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    sameAs: [BUSINESS_WHATSAPP],
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS_CITY,
      addressRegion: BUSINESS_REGION,
      addressCountry: BUSINESS_COUNTRY,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_PHONE,
      contactType: 'customer service',
      availableLanguage: ['Spanish'],
      areaServed: 'MX',
    },
  };
}

// ─── LocalBusiness ─────────────────────────────────────────────────────────
// Más específico que Organization. Aparece en Google Maps + búsquedas locales.
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${SITE_URL}#store`,
    name: SITE_NAME,
    image: SITE_LOGO,
    url: SITE_URL,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS_CITY,
      addressRegion: BUSINESS_REGION,
      addressCountry: BUSINESS_COUNTRY,
    },
    openingHoursSpecification: BUSINESS_HOURS.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [BUSINESS_WHATSAPP],
  };
}

// ─── WebSite (con SearchAction) ────────────────────────────────────────────
// Habilita el "sitelinks search box" que Google muestra en resultados.
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'es-MX',
    publisher: { '@id': `${SITE_URL}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/catalogo?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ─── Product ───────────────────────────────────────────────────────────────
// Ficha de producto con precio, stock, calificación y disponibilidad.
// Habilita rich snippets con estrellas y precio en SERP.
export interface ProductLdInput {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  availability: 'disponible' | 'por_pedido';
  stock: number;
  reviewCount?: number;
  avgRating?: number;
}
export function productJsonLd(p: ProductLdInput) {
  const productUrl = abs(`/producto/${p.id}`);
  const availability =
    p.availability === 'disponible' && p.stock > 0
      ? 'https://schema.org/InStock'
      : p.availability === 'por_pedido'
      ? 'https://schema.org/PreOrder'
      : 'https://schema.org/OutOfStock';

  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: p.title,
    description: p.description,
    image: p.images.length > 0 ? p.images : [SITE_LOGO],
    sku: p.id,
    mpn: p.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: p.category || 'Crochet artesanal',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'MXN',
      price: p.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}#organization` },
    },
  };

  if (p.reviewCount && p.reviewCount > 0 && p.avgRating) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(p.avgRating.toFixed(1)),
      reviewCount: p.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
}

// ─── BreadcrumbList ────────────────────────────────────────────────────────
// Migas de pan en SERP (Inicio > Catálogo > Producto). Mejora CTR.
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

// ─── FAQPage ───────────────────────────────────────────────────────────────
// Las preguntas/respuestas aparecen expandidas en SERP. Gran ganancia visual.
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  };
}

// ─── Helper para inyectar el JSON-LD en la página ──────────────────────────
// Usar como: <script {...jsonLdScriptProps(organizationJsonLd())} />
export function jsonLdScriptProps(data: object) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
