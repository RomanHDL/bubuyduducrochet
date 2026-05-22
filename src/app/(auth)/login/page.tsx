import LoginCard from '@/components/auth/LoginCard';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión · Mundo a Crochet',
  description:
    'Inicia sesión con tu cuenta de Google para continuar con tu pedido en Mundo a Crochet.',
};

// Sin cache — el callbackUrl + producto destino cambian por request
export const dynamic = 'force-dynamic';

type SearchParams = {
  callbackUrl?: string;
  intent?: string;
};

// Extrae el id si callbackUrl matchea /producto/[id] (con o sin
// query/hash). Devuelve null si no es una ruta de producto.
function extractProductId(callbackUrl?: string): string | null {
  if (!callbackUrl) return null;
  // Decodificamos en caso de que venga url-encoded (router.push lo encoda)
  let url = callbackUrl;
  try {
    url = decodeURIComponent(callbackUrl);
  } catch {
    return null;
  }
  const match = url.match(/^\/producto\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl, intent } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/';

  const productId = extractProductId(callbackUrl);
  let product: {
    _id: string;
    title: string;
    price: number;
    image: string | null;
  } | null = null;

  if (productId) {
    try {
      await connectDB();
      const doc = await Product.findById(productId)
        .select('title price images')
        .lean<{ title: string; price: number; images?: string[] } | null>();
      if (doc) {
        product = {
          _id: productId,
          title: doc.title,
          price: doc.price,
          image: doc.images?.[0] ?? null,
        };
      }
    } catch {
      // Si la DB falla, simplemente no mostramos el preview — el flow sigue
      product = null;
    }
  }

  const validIntent =
    intent === 'buy' || intent === 'order' ? intent : undefined;

  return (
    <LoginCard
      callbackUrl={safeCallback}
      intent={validIntent}
      product={product}
    />
  );
}
