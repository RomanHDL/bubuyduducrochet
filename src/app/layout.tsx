import type { Metadata, Viewport } from "next";
import { unstable_cache } from "next/cache";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewOrderNotifier from "@/components/NewOrderNotifier";
import PromoBar from "@/components/PromoBar";
import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { suggestThemeByDate, type ThemeId } from "@/lib/themes";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_LOCALE, SITE_LANG, BRAND_COLOR, BRAND_BG } from "@/lib/seo";
import { organizationJsonLd, localBusinessJsonLd, websiteJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

const logoUrl = "https://i.pinimg.com/originals/f7/97/e0/f797e0d435f74e1b41a49ba08f908d25.png";

// Lectura cacheada del tema almacenado en DB (60s + invalidación por tag al guardar)
const getStoredTheme = unstable_cache(
  async (): Promise<{ themeId: ThemeId; themeMode: 'manual' | 'auto' }> => {
    try {
      await connectDB();
      const doc: any = await SiteSettings.findOne({ key: 'global' }).lean();
      return {
        themeId: (doc?.themeId as ThemeId) || 'none',
        themeMode: (doc?.themeMode as 'manual' | 'auto') || 'manual',
      };
    } catch (err) {
      console.error('[RootLayout] error leyendo tema activo:', err);
      return { themeId: 'none', themeMode: 'manual' };
    }
  },
  ['site-theme-stored'],
  { revalidate: 60, tags: ['site-theme'] },
);

async function getActiveThemeClass(): Promise<string> {
  const stored = await getStoredTheme();
  const effective: ThemeId = stored.themeMode === 'auto'
    ? suggestThemeByDate()
    : stored.themeId;
  return effective && effective !== 'none' ? `theme-${effective}` : '';
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Crochet artesanal hecho a mano en México`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'crochet artesanal',
    'amigurumis México',
    'crochet Monterrey',
    'tejidos a mano',
    'amigurumi personalizado',
    'regalos hechos a mano',
    'crochet baby shower',
    'accesorios crochet',
    'decoración crochet',
    'mundo a crochet',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Crochet artesanal hecho a mano`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Crochet artesanal`,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
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
  category: 'shopping',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND_BG },
    { media: '(prefers-color-scheme: dark)', color: BRAND_COLOR },
  ],
};

// Script inline que aplica la clase page-<ruta> al <html> ANTES de que React
// hidrate, para que los overrides CSS por página estén activos antes del
// primer paint. Esto elimina el flash de "diseño base sin tema" al navegar
// al home desde otra página.
//
// IMPORTANTE: en rutas /admin se REMUEVE cualquier clase theme-* para que
// el panel admin siempre use el diseño base original (no se aplican los
// temas festivos que el admin activa para el sitio publico).
const pageClassBootstrap = `(function(){try{var h=document.documentElement;var p=location.pathname;var c;if(p==='/')c='page-home';else if(p==='/catalogo')c='page-catalogo';else if(p==='/preguntas')c='page-faq';else if(p==='/contacto')c='page-nosotros';else if(p==='/carrito')c='page-carrito';else if(p==='/favoritos')c='page-favoritos';else if(p==='/mi-cuenta')c='page-cuenta';else if(p==='/pedidos')c='page-pedidos';else if(p==='/login'||p==='/registro')c='page-login';else if(p.indexOf('/producto/')===0)c='page-producto';else if(p.indexOf('/admin')===0)c='page-admin';else c='page-other';h.classList.add(c);if(c==='page-admin'){Array.prototype.slice.call(h.classList).forEach(function(x){if(x.indexOf('theme-')===0)h.classList.remove(x);});}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeClass = await getActiveThemeClass();
  return (
    <html lang={SITE_LANG} className={themeClass}>
      <head>
        {/* Performance: precarga DNS para CDNs externos usados (logo + Cloudinary uploads) */}
        <link rel="preconnect" href="https://i.pinimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* JSON-LD: identidad, tienda local, sitio web con search action */}
        <script {...jsonLdScriptProps(organizationJsonLd())} />
        <script {...jsonLdScriptProps(localBusinessJsonLd())} />
        <script {...jsonLdScriptProps(websiteJsonLd())} />

        {/* Bootstrap inline: aplica page-X al <html> antes de hidratar (evita flash entre rutas) */}
        <script dangerouslySetInnerHTML={{ __html: pageClassBootstrap }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <PromoBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Notificador global de pedidos nuevos — se auto-activa solo para admins,
              así reciben el aviso estén donde estén del sitio */}
          <NewOrderNotifier />
        </Providers>
      </body>
    </html>
  );
}
