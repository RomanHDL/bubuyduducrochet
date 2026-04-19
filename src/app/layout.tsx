import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewOrderNotifier from "@/components/NewOrderNotifier";

const logoUrl = "https://i.pinimg.com/originals/f7/97/e0/f797e0d435f74e1b41a49ba08f908d25.png";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
