import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewOrderNotifier from "@/components/NewOrderNotifier";
import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { suggestThemeByDate, type ThemeId } from "@/lib/themes";

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
  title: "Bubu & Dudu Crochet | Creaciones hechas con amor",
  description: "Tienda de crochet artesanal. Amigurumis, accesorios y creaciones hechas a mano con amor y ternura.",
  icons: {
    icon: logoUrl,
    apple: logoUrl,
  },
  openGraph: {
    images: [logoUrl],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeClass = await getActiveThemeClass();
  return (
    <html lang="es" className={themeClass}>
      <body className="min-h-screen flex flex-col">
        <Providers>
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
