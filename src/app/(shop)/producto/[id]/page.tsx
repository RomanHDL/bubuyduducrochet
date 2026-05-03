// Server component — busca el producto por id en Mongo antes de renderizar
// y lo manda al client component como prop. Beneficios:
//   * El HTML inicial ya trae el producto pintado → sin spinner.
//   * Los links al detalle (shared, WhatsApp, etc.) abren al instante.
//   * Si no existe el id, muestra el 404 nativo de Next.js.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductReview from '@/models/ProductReview';
import ProductDetailClient from './ProductDetailClient';
import RelatedProducts from '@/components/RelatedProducts';
import {
  productJsonLd,
  breadcrumbJsonLd,
  jsonLdScriptProps,
} from '@/lib/jsonld';
import { SITE_NAME, SITE_URL, abs } from '@/lib/seo';

export const revalidate = 5;

async function getProduct(id: string) {
  try {
    await connectDB();
    const doc = await Product.findById(id).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (err) {
    console.error('[producto/:id SSR]', err);
    return null;
  }
}

async function getReviewStats(productId: string) {
  try {
    await connectDB();
    const reviews = await ProductReview.find(
      { productId, isApproved: true },
      { rating: 1 },
    ).lean<Array<{ rating: number }>>();
    if (reviews.length === 0) return { reviewCount: 0, avgRating: 0 };
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return { reviewCount: reviews.length, avgRating: sum / reviews.length };
  } catch {
    return { reviewCount: 0, avgRating: 0 };
  }
}

// Metadata SEO específica de cada producto: title, description, OG con la
// imagen real del producto. Cuando alguien comparte el link en WhatsApp/redes,
// se ve la foto del producto en lugar del logo genérico.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return {
      title: 'Producto no encontrado',
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/producto/${product._id}`;
  const image = product.images?.[0] || undefined;
  const description = (product.description || '').slice(0, 160);
  const priceLabel = `$${(product.price || 0).toFixed(2)} MXN`;
  const title = product.title;

  return {
    title,
    description: description || `${title} — Crochet artesanal hecho a mano. ${priceLabel}.`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${title} — ${priceLabel} | ${SITE_NAME}`,
      description,
      images: image ? [{ url: image, width: 1200, height: 1200, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${priceLabel}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const initialProduct = await getProduct(params.id);
  if (!initialProduct) notFound();

  const { reviewCount, avgRating } = await getReviewStats(params.id);

  // JSON-LD enriquecido del producto: rich snippet con precio, stock, estrellas
  const productLd = productJsonLd({
    id: initialProduct._id,
    title: initialProduct.title,
    description: initialProduct.description,
    price: initialProduct.price,
    images: initialProduct.images || [],
    category: initialProduct.category,
    availability: initialProduct.availability,
    stock: initialProduct.stock || 0,
    reviewCount,
    avgRating,
  });

  // Breadcrumbs: Inicio > Catálogo > [categoría] > Producto
  const crumbs: { name: string; path: string }[] = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
  ];
  if (initialProduct.category) {
    crumbs.push({
      name: String(initialProduct.category).charAt(0).toUpperCase() + String(initialProduct.category).slice(1),
      path: `/catalogo?category=${initialProduct.category}`,
    });
  }
  crumbs.push({ name: initialProduct.title, path: `/producto/${initialProduct._id}` });
  const breadcrumbLd = breadcrumbJsonLd(crumbs);

  return (
    <>
      <script {...jsonLdScriptProps(productLd)} />
      <script {...jsonLdScriptProps(breadcrumbLd)} />
      <ProductDetailClient initialProduct={initialProduct} />
      <RelatedProducts currentId={initialProduct._id} category={initialProduct.category} />
    </>
  );
}
